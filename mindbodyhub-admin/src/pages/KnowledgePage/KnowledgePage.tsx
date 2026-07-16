import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeApi } from '@/api/knowledge';
import type { KnowledgeArticle } from '@/types/knowledge';
import { KnowledgeStatus } from '@/types/knowledge';
import { formatDate, getErrorMessage } from '@/utils/adminHelpers';
import styles from './KnowledgePage.module.scss';

type DrawerMode = 'view' | null;

function KnowledgePage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadArticles = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await knowledgeApi.getAll();
      setArticles(data);
    } catch {
      setListError('Не удалось загрузить базу знаний');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const openView = (article: KnowledgeArticle) => {
    setSelected(article);
    setMode('view');
  };

  const closeDrawer = () => {
    setSelected(null);
    setMode(null);
  };

  const updateInList = (updated: KnowledgeArticle) => {
    setArticles((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleCreate = async () => {
    const title = window.prompt('Название статьи');
    if (!title?.trim()) return;

    setIsCreating(true);
    setListError('');

    try {
      const created = await knowledgeApi.create({ title: title.trim(), blocks: [] });
      navigate(`/knowledge/${created.id}/edit`);
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось создать статью'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (article: KnowledgeArticle) => {
    const isPublished = article.status === KnowledgeStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? `Снять с публикации «${article.title}»?`
        : `Опубликовать «${article.title}»?`,
    );
    if (!confirmed) return;

    setActionId(article.id);
    setListError('');

    try {
      const updated = isPublished
        ? await knowledgeApi.unpublish(article.id)
        : await knowledgeApi.publish(article.id);
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

  const handleDelete = async (article: KnowledgeArticle) => {
    const confirmed = window.confirm(
      `Удалить статью «${article.title}»?\nЭто действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setActionId(article.id);
    setListError('');

    try {
      await knowledgeApi.remove(article.id);
      setArticles((prev) => prev.filter((item) => item.id !== article.id));
      if (selected?.id === article.id) closeDrawer();
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить статью'));
    } finally {
      setActionId(null);
    }
  };

  const renderRowActions = (article: KnowledgeArticle) => {
    const isBusy = actionId === article.id;
    const isPublished = article.status === KnowledgeStatus.PUBLISHED;

    return (
      <div className={styles.knowledgePage__actions}>
        <button
          type="button"
          className={styles.knowledgePage__actionBtn}
          onClick={() => openView(article)}
        >
          Просмотр
        </button>
        <button
          type="button"
          className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_primary}`}
          onClick={() => navigate(`/knowledge/${article.id}/edit`)}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_warning}`}
          onClick={() => void handleTogglePublish(article)}
          disabled={isBusy}
        >
          {isBusy ? '...' : isPublished ? 'Снять с публикации' : 'Опубликовать'}
        </button>
        <button
          type="button"
          className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_danger}`}
          onClick={() => void handleDelete(article)}
          disabled={isBusy}
        >
          {isBusy ? '...' : 'Удалить'}
        </button>
      </div>
    );
  };

  return (
    <section className={styles.knowledgePage}>
      <header className={styles.knowledgePage__header}>
        <div>
          <h1 className={styles.knowledgePage__title}>База знаний</h1>
          <p className={styles.knowledgePage__subtitle}>
            {isLoading
              ? 'Загрузка...'
              : `${articles.length} статей · всегда общедоступны`}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_primary}`}
          onClick={() => void handleCreate()}
          disabled={isCreating}
        >
          {isCreating ? 'Создание...' : 'Добавить статью'}
        </button>
      </header>

      {listError ? <p className={styles.knowledgePage__error}>{listError}</p> : null}

      <div className={styles.knowledgePage__tableCard}>
        <table className={styles.knowledgePage__table}>
          <thead>
            <tr>
              <th>Статья</th>
              <th>Slug</th>
              <th>Блоков</th>
              <th>Статус</th>
              <th>Обновлена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && articles.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.knowledgePage__empty}>
                  Статей пока нет
                </td>
              </tr>
            ) : null}

            {articles.map((article) => (
              <tr key={article.id}>
                <td>
                  <div className={styles.knowledgePage__articleCell}>
                    <div className={styles.knowledgePage__preview}>
                      {article.coverUrl ? (
                        <img src={article.coverUrl} alt={article.title} />
                      ) : (
                        <span />
                      )}
                    </div>
                    <div>
                      <span>{article.title}</span>
                      {article.summary ? (
                        <div className={styles.knowledgePage__meta}>{article.summary}</div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>
                  <code>{article.slug}</code>
                </td>
                <td>{article.blocks?.length ?? 0}</td>
                <td>
                  <span
                    className={`${styles.knowledgePage__badge} ${
                      article.status === KnowledgeStatus.PUBLISHED
                        ? styles.knowledgePage__badge_active
                        : styles.knowledgePage__badge_inactive
                    }`}
                  >
                    {article.status === KnowledgeStatus.PUBLISHED
                      ? 'Опубликована'
                      : 'Черновик'}
                  </span>
                </td>
                <td>{formatDate(article.updatedAt)}</td>
                <td>{renderRowActions(article)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === 'view' && selected ? (
        <>
          <button
            type="button"
            className={styles.knowledgePage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.knowledgePage__drawer}>
            <div className={styles.knowledgePage__drawerHeader}>
              <h2 className={styles.knowledgePage__drawerTitle}>Просмотр статьи</h2>
              <button
                type="button"
                className={styles.knowledgePage__close}
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <div className={styles.knowledgePage__drawerBody}>
              {selected.coverUrl ? (
                <div className={styles.knowledgePage__drawerPreview}>
                  <img src={selected.coverUrl} alt={selected.title} />
                </div>
              ) : null}

              <div className={styles.knowledgePage__fields}>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Название</span>
                  <p className={styles.knowledgePage__fieldValue}>{selected.title}</p>
                </div>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Slug</span>
                  <p className={styles.knowledgePage__fieldValue}>{selected.slug}</p>
                </div>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Доступ</span>
                  <p className={styles.knowledgePage__fieldValue}>Общедоступная</p>
                </div>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Статус</span>
                  <p className={styles.knowledgePage__fieldValue}>
                    {selected.status === KnowledgeStatus.PUBLISHED
                      ? 'Опубликована'
                      : 'Черновик'}
                  </p>
                </div>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Краткое описание</span>
                  <p className={styles.knowledgePage__fieldValue}>
                    {selected.summary || '—'}
                  </p>
                </div>
                <div className={styles.knowledgePage__field}>
                  <span className={styles.knowledgePage__fieldLabel}>Блоки</span>
                  <p className={styles.knowledgePage__fieldValue}>
                    {selected.blocks.length === 0
                      ? 'Пусто'
                      : selected.blocks.map((block) => (
                          <span key={block.id} className={styles.knowledgePage__listItem}>
                            • {block.type}
                            {'text' in block && block.text
                              ? `: ${block.text.slice(0, 60)}${block.text.length > 60 ? '…' : ''}`
                              : ''}
                            {block.type === 'image' ? `: ${block.alt || block.url}` : ''}
                            {block.type === 'link' ? `: ${block.url}` : ''}
                          </span>
                        ))}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.knowledgePage__drawerFooter}>
              <button
                type="button"
                className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_warning}`}
                onClick={() => void handleTogglePublish(selected)}
                disabled={actionId === selected.id}
              >
                {selected.status === KnowledgeStatus.PUBLISHED
                  ? 'Снять с публикации'
                  : 'Опубликовать'}
              </button>
              <button
                type="button"
                className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_danger}`}
                onClick={() => void handleDelete(selected)}
                disabled={actionId === selected.id}
              >
                Удалить
              </button>
              <button
                type="button"
                className={`${styles.knowledgePage__actionBtn} ${styles.knowledgePage__actionBtn_primary}`}
                onClick={() => navigate(`/knowledge/${selected.id}/edit`)}
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

export default KnowledgePage;
