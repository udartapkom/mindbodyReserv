import { useCallback, useEffect, useState } from 'react';
import { systemApi } from '@/api/system';
import type { DbStatus } from '@/types/system';
import { getErrorMessage } from '@/utils/adminHelpers';
import styles from './DbStatusPage.module.scss';

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU');
}

function DbStatusPage() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setStatus(await systemApi.getDbStatus());
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить статус БД'));
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className={styles.page}>
      <header className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Статус БД</h1>
          <p className={styles.page__lead}>
            Подключение, размер базы и количество записей по таблицам.
          </p>
        </div>
        <button
          type="button"
          className={styles.page__button}
          onClick={() => void load()}
          disabled={isLoading}
        >
          {isLoading ? 'Обновление…' : 'Обновить'}
        </button>
      </header>

      {error ? <p className={styles.page__error}>{error}</p> : null}

      {isLoading && !status ? (
        <p className={styles.page__hint}>Загрузка…</p>
      ) : null}

      {status ? (
        <>
          <div className={styles.page__section}>
            <h2 className={styles.page__sectionTitle}>Подключение</h2>
            <dl className={styles.page__grid}>
              <div>
                <dt>Статус</dt>
                <dd>
                  <span
                    className={
                      status.connected
                        ? styles.page__badgeOk
                        : styles.page__badgeWarn
                    }
                  >
                    {status.connected ? 'connected' : 'error'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd>{status.database}</dd>
              </div>
              <div>
                <dt>Размер</dt>
                <dd>{status.sizePretty ?? '—'}</dd>
              </div>
              <div>
                <dt>Снято</dt>
                <dd>{formatDateTime(status.fetchedAt)}</dd>
              </div>
            </dl>
            {status.error ? (
              <p className={styles.page__error}>{status.error}</p>
            ) : null}
          </div>

          <div className={styles.page__section}>
            <h2 className={styles.page__sectionTitle}>Таблицы</h2>
            {status.tables.length === 0 ? (
              <p className={styles.page__hint}>Нет данных по таблицам.</p>
            ) : (
              <div className={styles.page__tableWrap}>
                <table className={styles.page__table}>
                  <thead>
                    <tr>
                      <th>Таблица</th>
                      <th>Название</th>
                      <th>Записей</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.tables.map((row) => (
                      <tr key={row.table}>
                        <td className={styles.page__mono}>{row.table}</td>
                        <td>{row.label}</td>
                        <td>{row.count.toLocaleString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default DbStatusPage;
