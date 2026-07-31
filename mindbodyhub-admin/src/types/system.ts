export type SystemHealth = {
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

export type DeployInfo = {
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

export type Pm2Process = {
  name: string;
  status: string;
  pid: number | null;
  uptimeMs: number | null;
  restarts: number | null;
  memoryMb: number | null;
  cpu: number | null;
};

export type Pm2Status = {
  available: boolean;
  error: string | null;
  processes: Pm2Process[];
};

export type SystemOverview = {
  health: SystemHealth;
  deploy: DeployInfo;
  pm2: Pm2Status;
  fetchedAt: string;
};

export type SystemLogs = {
  process: string;
  linesRequested: number;
  available: boolean;
  error: string | null;
  lines: string[];
  fetchedAt: string;
};

export type DbTableCount = {
  table: string;
  label: string;
  count: number;
};

export type DbStatus = {
  connected: boolean;
  database: string;
  sizePretty: string | null;
  sizeBytes: number | null;
  tables: DbTableCount[];
  error: string | null;
  fetchedAt: string;
};
