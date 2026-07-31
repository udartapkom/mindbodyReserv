import { execFile } from 'child_process';
import { accessSync, constants, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { StorageService } from '../storage/storage.service';

const execFileAsync = promisify(execFile);

const PM2_CANDIDATES = [
  '/usr/bin/pm2',
  '/usr/local/bin/pm2',
  '/usr/lib/node_modules/pm2/bin/pm2',
] as const;

export type SystemHealthDto = {
  status: 'ok' | 'degraded';
  storage: 'ok' | 'error';
  database: 'ok' | 'error';
};

export type AppReleaseInfo = {
  name: string | null;
  version: string | null;
  deployVersion: string | null;
  gitSha: string | null;
  builtAt: string | null;
  source: string | null;
};

export type DeployInfoDto = {
  appVersion: string;
  nodeEnv: string;
  nodeVersion: string;
  deployVersion: string | null;
  gitSha: string | null;
  processStartedAt: string;
  uptimeSec: number;
  api: AppReleaseInfo;
  admin: AppReleaseInfo;
  front: AppReleaseInfo;
};

export type Pm2ProcessDto = {
  name: string;
  status: string;
  pid: number | null;
  uptimeMs: number | null;
  restarts: number | null;
  memoryMb: number | null;
  cpu: number | null;
};

export type Pm2StatusDto = {
  available: boolean;
  error: string | null;
  processes: Pm2ProcessDto[];
};

export type SystemOverviewDto = {
  health: SystemHealthDto;
  deploy: DeployInfoDto;
  pm2: Pm2StatusDto;
  fetchedAt: string;
};

export type SystemLogsDto = {
  process: string;
  linesRequested: number;
  available: boolean;
  error: string | null;
  lines: string[];
  fetchedAt: string;
};

export type DbTableCountDto = {
  table: string;
  label: string;
  count: number;
};

export type DbStatusDto = {
  connected: boolean;
  database: string;
  sizePretty: string | null;
  sizeBytes: number | null;
  tables: DbTableCountDto[];
  error: string | null;
  fetchedAt: string;
};

const PM2_PROCESS_NAMES = ['mbh-api', 'mbh-front'] as const;

const TABLE_METRICS: { table: string; label: string }[] = [
  { table: 'users', label: 'Пользователи' },
  { table: 'materials', label: 'Материалы' },
  { table: 'knowledge_articles', label: 'База знаний' },
  { table: 'quotes', label: 'Цитаты' },
  { table: 'tickets', label: 'Обращения' },
  { table: 'ticket_messages', label: 'Сообщения тикетов' },
  { table: 'payments', label: 'Платежи' },
  { table: 'tariffs', label: 'Тарифы' },
  { table: 'refresh_tokens', label: 'Refresh-токены' },
];

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly processStartedAt = new Date();

  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly config: ConfigService,
  ) {}

  async getOverview(): Promise<SystemOverviewDto> {
    const [health, pm2] = await Promise.all([
      this.getHealth(),
      this.getPm2Status(),
    ]);

    return {
      health,
      deploy: this.getDeployInfo(),
      pm2,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getHealth(): Promise<SystemHealthDto> {
    let storage: 'ok' | 'error' = 'ok';
    let database: 'ok' | 'error' = 'ok';

    try {
      await this.storageService.checkBuckets(
        this.storageService.getAvatarsBucket(),
        this.storageService.getMaterialsBucket(),
      );
    } catch {
      storage = 'error';
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'error';
    }

    return {
      status: storage === 'ok' && database === 'ok' ? 'ok' : 'degraded',
      storage,
      database,
    };
  }

  getDeployInfo(): DeployInfoDto {
    const appVersion = this.readPackageVersion();
    const gitSha =
      this.config.get<string>('GIT_SHA')?.trim() ||
      this.config.get<string>('DEPLOY_GIT_SHA')?.trim() ||
      this.readGitSha() ||
      null;
    const deployVersion =
      this.config.get<string>('DEPLOY_VERSION')?.trim() ||
      gitSha ||
      null;

    const api: AppReleaseInfo = {
      name: 'mindbodyhub-back',
      version: appVersion,
      deployVersion,
      gitSha,
      builtAt: null,
      source: 'api-process',
    };

    const admin = this.readReleaseFile(
      this.config.get<string>('ADMIN_VERSION_FILE')?.trim() || '',
      '/var/www/admin/version.json',
      join(process.cwd(), '../mindbodyhub-admin/dist/version.json'),
    );
    const front = this.readReleaseFile(
      this.config.get<string>('FRONT_VERSION_FILE')?.trim() || '',
      '/opt/mindbodyhub/front/public/version.json',
      join(process.cwd(), '../mindbodyhub-front/public/version.json'),
      join(process.cwd(), '../mindbodyhub-front/.next/standalone/public/version.json'),
    );

    return {
      appVersion,
      nodeEnv: this.config.get<string>('NODE_ENV', 'development'),
      nodeVersion: process.version,
      deployVersion,
      gitSha,
      processStartedAt: this.processStartedAt.toISOString(),
      uptimeSec: Math.floor(process.uptime()),
      api,
      admin,
      front,
    };
  }

  async getPm2Status(): Promise<Pm2StatusDto> {
    const pm2Bin = this.resolvePm2Bin();
    if (!pm2Bin) {
      return {
        available: false,
        error:
          'pm2 не найден (локально/в Docker его обычно нет — на проде под PM2 появится)',
        processes: [],
      };
    }

    try {
      const { stdout } = await execFileAsync(pm2Bin, ['jlist'], {
        timeout: 8_000,
        maxBuffer: 2 * 1024 * 1024,
        env: process.env,
      });
      const list = JSON.parse(stdout) as Array<{
        name?: string;
        pm2_env?: {
          status?: string;
          pm_uptime?: number;
          restart_time?: number;
        };
        pid?: number;
        monit?: { memory?: number; cpu?: number };
      }>;

      const wanted = new Set<string>(PM2_PROCESS_NAMES);
      const processes = list
        .filter((item) => item.name && wanted.has(item.name))
        .map((item) => {
          const uptimeStart = item.pm2_env?.pm_uptime;
          return {
            name: item.name as string,
            status: item.pm2_env?.status ?? 'unknown',
            pid: item.pid ?? null,
            uptimeMs:
              typeof uptimeStart === 'number'
                ? Math.max(0, Date.now() - uptimeStart)
                : null,
            restarts: item.pm2_env?.restart_time ?? null,
            memoryMb:
              typeof item.monit?.memory === 'number'
                ? Math.round((item.monit.memory / (1024 * 1024)) * 10) / 10
                : null,
            cpu: item.monit?.cpu ?? null,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      return { available: true, error: null, processes };
    } catch (error) {
      const message = this.formatExecError(error, 'PM2 недоступен');
      this.logger.warn(`PM2 status failed: ${message}`);
      return { available: false, error: message, processes: [] };
    }
  }

  async getApiLogs(lines = 100): Promise<SystemLogsDto> {
    const linesRequested = Math.min(Math.max(Math.floor(lines) || 100, 1), 500);
    const pm2Bin = this.resolvePm2Bin();

    if (!pm2Bin) {
      return {
        process: 'mbh-api',
        linesRequested,
        available: false,
        error:
          'pm2 не найден (локально/в Docker логов PM2 нет — на проде появятся)',
        lines: [],
        fetchedAt: new Date().toISOString(),
      };
    }

    try {
      const { stdout, stderr } = await execFileAsync(
        pm2Bin,
        ['logs', 'mbh-api', '--lines', String(linesRequested), '--nostream', '--raw'],
        {
          timeout: 12_000,
          maxBuffer: 4 * 1024 * 1024,
          env: process.env,
        },
      );

      const combined = `${stdout}\n${stderr}`
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      const tail = combined.slice(-linesRequested);

      return {
        process: 'mbh-api',
        linesRequested,
        available: true,
        error: null,
        lines: tail,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      const message = this.formatExecError(error, 'Не удалось прочитать логи');
      this.logger.warn(`PM2 logs failed: ${message}`);
      return {
        process: 'mbh-api',
        linesRequested,
        available: false,
        error: message,
        lines: [],
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  async getDbStatus(): Promise<DbStatusDto> {
    const dbName = this.config.get<string>('DB_NAME', 'mindbodyhub');

    try {
      await this.dataSource.query('SELECT 1');

      const sizeRows = (await this.dataSource.query(
        `SELECT pg_database_size(current_database())::bigint AS size_bytes,
                pg_size_pretty(pg_database_size(current_database())) AS size_pretty`,
      )) as Array<{ size_bytes: string | number; size_pretty: string }>;

      const sizeBytesRaw = sizeRows[0]?.size_bytes;
      const sizeBytes =
        typeof sizeBytesRaw === 'number'
          ? sizeBytesRaw
          : sizeBytesRaw
            ? Number(sizeBytesRaw)
            : null;

      const tables: DbTableCountDto[] = [];
      for (const item of TABLE_METRICS) {
        const rows = (await this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM ${item.table}`,
        )) as Array<{ count: number }>;
        tables.push({
          table: item.table,
          label: item.label,
          count: rows[0]?.count ?? 0,
        });
      }

      return {
        connected: true,
        database: dbName,
        sizePretty: sizeRows[0]?.size_pretty ?? null,
        sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : null,
        tables,
        error: null,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка подключения к БД';
      return {
        connected: false,
        database: dbName,
        sizePretty: null,
        sizeBytes: null,
        tables: [],
        error: message,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  private readReleaseFile(...filePaths: string[]): AppReleaseInfo {
    const empty: AppReleaseInfo = {
      name: null,
      version: null,
      deployVersion: null,
      gitSha: null,
      builtAt: null,
      source: null,
    };

    for (const filePath of filePaths) {
      if (!filePath) continue;
      try {
        if (!existsSync(filePath)) continue;
        const raw = readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw) as {
          name?: string;
          version?: string;
          deployVersion?: string;
          gitSha?: string | null;
          builtAt?: string;
        };
        return {
          name: data.name?.trim() || null,
          version: data.version?.trim() || null,
          deployVersion: data.deployVersion?.trim() || null,
          gitSha: data.gitSha?.trim() || null,
          builtAt: data.builtAt?.trim() || null,
          source: filePath,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'failed to read version.json';
        this.logger.warn(`version file ${filePath}: ${message}`);
      }
    }

    return empty;
  }

  private readPackageVersion(): string {
    try {
      const pkgPath = join(process.cwd(), 'package.json');
      const raw = readFileSync(pkgPath, 'utf8');
      const pkg = JSON.parse(raw) as { version?: string };
      return pkg.version ?? '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private resolvePm2Bin(): string | null {
    const fromEnv = this.config.get<string>('PM2_BIN')?.trim();
    const candidates = [
      ...(fromEnv ? [fromEnv] : []),
      ...PM2_CANDIDATES,
    ];

    for (const candidate of candidates) {
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        // try next
      }
    }

    return null;
  }

  private readGitSha(): string | null {
    try {
      const headPath = join(process.cwd(), '.git', 'HEAD');
      if (!existsSync(headPath)) return null;
      const head = readFileSync(headPath, 'utf8').trim();
      if (head.startsWith('ref:')) {
        const ref = head.slice(4).trim();
        const refPath = join(process.cwd(), '.git', ref);
        if (!existsSync(refPath)) return null;
        return readFileSync(refPath, 'utf8').trim().slice(0, 12);
      }
      return head.slice(0, 12);
    } catch {
      return null;
    }
  }

  private formatExecError(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object') return fallback;
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return 'pm2 не найден в PATH процесса (типично для локального/dev запуска)';
    }
    return err.message || fallback;
  }
}
