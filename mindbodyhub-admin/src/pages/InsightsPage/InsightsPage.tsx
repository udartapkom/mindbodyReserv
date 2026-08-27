import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insightsApi } from '@/api/insights';
import type { Insight } from '@/types/insight';
import { InsightStatus } from '@/types/insight';
import { formatDate, getErrorMessage } from '@/utils/adminHelpers';
import styles from './InsightsPage.module.scss';

type DrawerMode = 'view' | null;

function InsightsPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selected, setSelected] = useState<Insight | null>(null);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadInsights = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await insightsApi.getAll();
      setInsights(data);
    } catch {
      setListError('Не удалось загрузить инсайты');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
  }, []);

  const openView = (insight: Insight) => {
    setSelected(insight);
    setMode('view');
  };

  const closeDrawer = () => {
    setSelected(null);
    setMode(null);
  };

  const updateInList = (updated: Insight) => {
    setInsights((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleCreate = async () => {
    const title = window.prompt('Название инсайта');
    if (!title?.trim()) return;

    setIsCreating(true);
    setListError('');

    try {
      const created = await insightsApi.create({ title: title.trim(), blocks: [] });
      navigate(`/insights/${created.id}/edit`);
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось создать инсайт'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (insight: Insight) => {
    const isPublished = insight.status === InsightStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? `Снять с публикации «${insight.title}»?`
        : `Опубликовать «${insight.title}»? Инсайт станет доступен в кабинете при любом тарифе (с учётом даты публикации).`,
    );
    if (!confirmed) return;

    setActionId(insight.id);
    setListError('');

    try {
      const updated = isPublished
        ? await insightsApi.unpublish(insight.id)
        : await insightsApi.publish(insight.id);
      updateInList(updated);
    } catch (error) {
      setListError(
        getErrorMessage(
          error,
          isPublished ? 'Не удалось снять с публикации' : 'Не удалось опубликовать',
        ),
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (insight: Insight) => {
    const confirmed = window.confirm(
      `Удалить инсайт «${insight.title}»?\nЭто действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setActionId(insight.id);
    setListError('');

    try {
      await insightsApi.remove(insight.id);
      setInsights((prev) => prev.filter((item) => item.id !== insight.id));
      if (selected?.id === insight.id) closeDrawer();
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить инсайт'));
    } finally {
      setActionId(null);
    }
  };

  const renderRowActions = (insight: Insight) => {
    const isBusy = actionId === insight.id;
    const isPublished = insight.status === InsightStatus.PUBLISHED;

    return (
      <div className={styles.insightsPage__actions}>
        <button
          type="button"
          className={styles.insightsPage__actionBtn}
          onClick={() => openView(insight)}
        >
          Просмотр
        </button>
        <button
          type="button"
          className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_primary}`}
          onClick={() => navigate(`/insights/${insight.id}/edit`)}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_warning}`}
          onClick={() => void handleTogglePublish(insight)}
          disabled={isBusy}
        >
          {isBusy ? '...' : isPublished ? 'Снять с публикации' : 'Опубликовать'}
        </button>
        <button
          type="button"
          className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_danger}`}
          onClick={() => void handleDelete(insight)}
          disabled={isBusy}
        >
          {isBusy ? '...' : 'Удалить'}
        </button>
      </div>
    );
  };

  return (
    <section className={styles.insightsPage}>
      <header className={styles.insightsPage__header}>
        <div>
          <h1 className={styles.insightsPage__title}>Инсайты</h1>
          <p className={styles.insightsPage__subtitle}>
            {isLoading
              ? 'Загрузка...'
              : `${insights.length} инсайтов · отложенная публикация · любой тариф`}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_primary}`}
          onClick={() => void handleCreate()}
          disabled={isCreating}
        >
          {isCreating ? 'Создание...' : 'Добавить инсайт'}
        </button>
      </header>

      {listError ? <p className={styles.insightsPage__error}>{listError}</p> : null}

      <div className={styles.insightsPage__tableCard}>
        <table className={styles.insightsPage__table}>
          <thead>
            <tr>
              <th>Инсайт</th>
              <th>Slug</th>
              <th>Блоков</th>
              <th>Статус</th>
              <th>Дата публикации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && insights.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.insightsPage__empty}>
                  Инсайтов пока нет
                </td>
              </tr>
            ) : null}

            {insights.map((insight) => (
              <tr key={insight.id}>
                <td>
                  <span>{insight.title}</span>
                </td>
                <td>
                  <code>{insight.slug}</code>
                </td>
                <td>{insight.blocks?.length ?? 0}</td>
                <td>
                  <span
                    className={`${styles.insightsPage__badge} ${
                      insight.status === InsightStatus.PUBLISHED
                        ? styles.insightsPage__badge_active
                        : styles.insightsPage__badge_inactive
                    }`}
                  >
                    {insight.status === InsightStatus.PUBLISHED
                      ? 'Опубликован'
                      : 'Черновик'}
                  </span>
                </td>
                <td>{formatDate(insight.publishedAt)}</td>
                <td>{renderRowActions(insight)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === 'view' && selected ? (
        <>
          <button
            type="button"
            className={styles.insightsPage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.insightsPage__drawer}>
            <div className={styles.insightsPage__drawerHeader}>
              <h2 className={styles.insightsPage__drawerTitle}>Просмотр инсайта</h2>
              <button
                type="button"
                className={styles.insightsPage__close}
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <div className={styles.insightsPage__drawerBody}>
              <div className={styles.insightsPage__fields}>
                <div className={styles.insightsPage__field}>
                  <span className={styles.insightsPage__fieldLabel}>Название</span>
                  <p className={styles.insightsPage__fieldValue}>{selected.title}</p>
                </div>
                <div className={styles.insightsPage__field}>
                  <span className={styles.insightsPage__fieldLabel}>Slug</span>
                  <p className={styles.insightsPage__fieldValue}>{selected.slug}</p>
                </div>
                <div className={styles.insightsPage__field}>
                  <span className={styles.insightsPage__fieldLabel}>Статус</span>
                  <p className={styles.insightsPage__fieldValue}>
                    {selected.status === InsightStatus.PUBLISHED
                      ? 'Опубликован'
                      : 'Черновик'}
                  </p>
                </div>
                <div className={styles.insightsPage__field}>
                  <span className={styles.insightsPage__fieldLabel}>Дата публикации</span>
                  <p className={styles.insightsPage__fieldValue}>
                    {formatDate(selected.publishedAt)}
                  </p>
                </div>
                <div className={styles.insightsPage__field}>
                  <span className={styles.insightsPage__fieldLabel}>Блоки</span>
                  <p className={styles.insightsPage__fieldValue}>
                    {selected.blocks.length === 0
                      ? 'Пусто'
                      : selected.blocks.map((block) => (
                          <span key={block.id} className={styles.insightsPage__listItem}>
                            • {block.type}
                            {'text' in block && block.text
                              ? `: ${block.text.slice(0, 60)}${block.text.length > 60 ? '…' : ''}`
                              : ''}
                            {block.type === 'image' ? `: ${block.alt || block.url}` : ''}
                            {block.type === 'link' ? `: ${block.url}` : ''}
                            {block.type === 'list'
                              ? `: ${block.items.filter(Boolean).length} пункт(ов)`
                              : ''}
                          </span>
                        ))}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.insightsPage__drawerFooter}>
              <button
                type="button"
                className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_warning}`}
                onClick={() => void handleTogglePublish(selected)}
                disabled={actionId === selected.id}
              >
                {selected.status === InsightStatus.PUBLISHED
                  ? 'Снять с публикации'
                  : 'Опубликовать'}
              </button>
              <button
                type="button"
                className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_danger}`}
                onClick={() => void handleDelete(selected)}
                disabled={actionId === selected.id}
              >
                Удалить
              </button>
              <button
                type="button"
                className={`${styles.insightsPage__actionBtn} ${styles.insightsPage__actionBtn_primary}`}
                onClick={() => navigate(`/insights/${selected.id}/edit`)}
              >
                Редактировать
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </section>
  );
}

export default InsightsPage;
