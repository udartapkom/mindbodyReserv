import { useCallback, useEffect, useState } from 'react';
import { systemApi } from '@/api/system';
import type { SystemLogs, SystemOverview } from '@/types/system';
import { getErrorMessage } from '@/utils/adminHelpers';
import styles from './SystemPage.module.scss';

function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}ч ${m}м ${s}с`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
}

function formatMs(ms: number | null): string {
  if (ms == null) return '—';
  return formatUptime(Math.floor(ms / 1000));
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU');
}

function SystemPage() {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [logs, setLogs] = useState<SystemLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [error, setError] = useState('');
  const [logsError, setLogsError] = useState('');

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setOverview(await systemApi.getOverview());
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить статус системы'));
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    setLogsError('');
    try {
      setLogs(await systemApi.getLogs(100));
    } catch (err) {
      setLogsError(getErrorMessage(err, 'Не удалось загрузить логи'));
      setLogs(null);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Система</h1>
          <p className={styles.page__lead}>
            Health, версия деплоя, PM2 и хвост логов API.
          </p>
        </div>
        <button
          type="button"
          className={styles.page__button}
          onClick={() => void loadOverview()}
          disabled={isLoading}
        >
          {isLoading ? 'Обновление…' : 'Обновить'}
        </button>
      </header>

      {error ? <p className={styles.page__error}>{error}</p> : null}

      {isLoading && !overview ? (
        <p className={styles.page__hint}>Загрузка…</p>
      ) : null}

      {overview ? (
        <>
          <div className={styles.page__section}>
            <h2 className={styles.page__sectionTitle}>Health</h2>
            <dl className={styles.page__grid}>
              <div>
                <dt>Статус</dt>
                <dd>
                  <span
                    className={
                      overview.health.status === 'ok'
                        ? styles.page__badgeOk
                        : styles.page__badgeWarn
                    }
                  >
                    {overview.health.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>{overview.health.storage}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{overview.health.database}</dd>
              </div>
              <div>
                <dt>Снято</dt>
                <dd>{formatDateTime(overview.fetchedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.page__section}>
            <h2 className={styles.page__sectionTitle}>Версия деплоя</h2>
            <dl className={styles.page__grid}>
              <div>
                <dt>API package</dt>
                <dd>{overview.deploy.api?.version ?? overview.deploy.appVersion}</dd>
              </div>
              <div>
                <dt>API deploy</dt>
                <dd>{overview.deploy.api?.deployVersion ?? overview.deploy.deployVersion ?? '—'}</dd>
              </div>
              <div>
                <dt>API git</dt>
                <dd className={styles.page__mono}>
                  {overview.deploy.api?.gitSha ?? overview.deploy.gitSha ?? '—'}
                </dd>
              </div>
              <div>
                <dt>Admin package</dt>
                <dd>{overview.deploy.admin?.version ?? '—'}</dd>
              </div>
              <div>
                <dt>Admin deploy</dt>
                <dd>{overview.deploy.admin?.deployVersion ?? '—'}</dd>
              </div>
              <div>
                <dt>Admin git</dt>
                <dd className={styles.page__mono}>
                  {overview.deploy.admin?.gitSha ?? '—'}
                </dd>
              </div>
              <div>
                <dt>Admin builtAt</dt>
                <dd>{formatDateTime(overview.deploy.admin?.builtAt)}</dd>
              </div>
              <div>
                <dt>Front package</dt>
                <dd>{overview.deploy.front?.version ?? '—'}</dd>
              </div>
              <div>
                <dt>Front deploy</dt>
                <dd>{overview.deploy.front?.deployVersion ?? '—'}</dd>
              </div>
              <div>
                <dt>Front git</dt>
                <dd className={styles.page__mono}>
                  {overview.deploy.front?.gitSha ?? '—'}
                </dd>
              </div>
              <div>
                <dt>Front builtAt</dt>
                <dd>{formatDateTime(overview.deploy.front?.builtAt)}</dd>
              </div>
              <div>
                <dt>NODE_ENV</dt>
                <dd>{overview.deploy.nodeEnv}</dd>
              </div>
              <div>
                <dt>Node</dt>
                <dd>{overview.deploy.nodeVersion}</dd>
              </div>
              <div>
                <dt>Процесс с</dt>
                <dd>{formatDateTime(overview.deploy.processStartedAt)}</dd>
              </div>
              <div>
                <dt>Uptime API</dt>
                <dd>{formatUptime(overview.deploy.uptimeSec)}</dd>
              </div>
            </dl>
            <p className={styles.page__hint}>
              Admin/Front читаются из version.json на диске сервера (пишется при
              деплое). API — из process env (DEPLOY_VERSION / GIT_SHA) и
              package.json. Локально PM2 обычно недоступен.
            </p>
          </div>

          <div className={styles.page__section}>
            <h2 className={styles.page__sectionTitle}>PM2</h2>
            {!overview.pm2.available ? (
              <p className={styles.page__hint}>
                PM2 недоступен: {overview.pm2.error ?? 'нет данных'}
              </p>
            ) : overview.pm2.processes.length === 0 ? (
              <p className={styles.page__hint}>Процессы mbh-api / mbh-front не найдены.</p>
            ) : (
              <div className={styles.page__tableWrap}>
                <table className={styles.page__table}>
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Статус</th>
                      <th>PID</th>
                      <th>Uptime</th>
                      <th>Restarts</th>
                      <th>RAM</th>
                      <th>CPU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.pm2.processes.map((proc) => (
                      <tr key={proc.name}>
                        <td>{proc.name}</td>
                        <td>
                          <span
                            className={
                              proc.status === 'online'
                                ? styles.page__badgeOk
                                : styles.page__badgeWarn
                            }
                          >
                            {proc.status}
                          </span>
                        </td>
                        <td>{proc.pid ?? '—'}</td>
                        <td>{formatMs(proc.uptimeMs)}</td>
                        <td>{proc.restarts ?? '—'}</td>
                        <td>
                          {proc.memoryMb != null ? `${proc.memoryMb} MB` : '—'}
                        </td>
                        <td>{proc.cpu != null ? `${proc.cpu}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      <div className={styles.page__section}>
        <div className={styles.page__sectionHead}>
          <h2 className={styles.page__sectionTitle}>Логи API</h2>
          <button
            type="button"
            className={styles.page__button}
            onClick={() => void loadLogs()}
            disabled={isLoadingLogs}
          >
            {isLoadingLogs ? 'Загрузка…' : 'Последние 100 строк логов API'}
          </button>
        </div>
        {logsError ? <p className={styles.page__error}>{logsError}</p> : null}
        {logs && !logs.available ? (
          <p className={styles.page__hint}>
            Логи недоступны: {logs.error ?? 'нет данных'}
          </p>
        ) : null}
        {logs?.available ? (
          <>
            <p className={styles.page__hint}>
              {logs.process} · {logs.lines.length} строк ·{' '}
              {formatDateTime(logs.fetchedAt)}
            </p>
            <pre className={styles.page__logs}>
              {logs.lines.length ? logs.lines.join('\n') : '(пусто)'}
            </pre>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default SystemPage;
