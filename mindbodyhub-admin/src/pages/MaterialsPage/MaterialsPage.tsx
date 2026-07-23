import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialsApi } from '@/api/materials';
import type { Material } from '@/types/material';
import { MaterialStatus } from '@/types/material';
import { formatDate, getErrorMessage } from '@/utils/adminHelpers';
import { FREE_ACCESS_TYPE, REGISTERED_ACCESS_TYPE } from '@/types/material';
import styles from './MaterialsPage.module.scss';

type DrawerMode = 'view' | null;

function tariffLabel(tariffType: string) {
  if (!tariffType || tariffType === FREE_ACCESS_TYPE) {
    return 'Free (общедоступный)';
  }
  if (tariffType === REGISTERED_ACCESS_TYPE) {
    return 'Registered (для зарегистрированных)';
  }
  if (tariffType === 'trial') return 'Пробный (trial)';
  if (tariffType === 'popular') return 'Популярный (popular)';
  if (tariffType === 'vip') return 'VIP';
  return tariffType;
}

function MaterialsPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selected, setSelected] = useState<Material | null>(null);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadMaterials = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await materialsApi.getAll();
      setMaterials(data);
    } catch {
      setListError('Не удалось загрузить список материалов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMaterials();
  }, []);

  const openView = (material: Material) => {
    setSelected(material);
    setMode('view');
  };

  const closeDrawer = () => {
    setSelected(null);
    setMode(null);
  };

  const updateInList = (updated: Material) => {
    setMaterials((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleCreate = async () => {
    const title = window.prompt('Название нового материала');
    if (!title?.trim()) return;

    setIsCreating(true);
    setListError('');

    try {
      const created = await materialsApi.create({ title: title.trim(), blocks: [] });
      navigate(`/materials/${created.id}/edit`);
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось создать материал'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (material: Material) => {
    const isPublished = material.status === MaterialStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? `Снять с публикации «${material.title}»?`
        : `Опубликовать «${material.title}»?`,
    );
    if (!confirmed) return;

    setActionId(material.id);
    setListError('');

    try {
      const updated = isPublished
        ? await materialsApi.unpublish(material.id)
        : await materialsApi.publish(material.id);
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

  const handleDelete = async (material: Material) => {
    const confirmed = window.confirm(
      `Удалить материал «${material.title}»?\nЭто действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setActionId(material.id);
    setListError('');

    try {
      await materialsApi.remove(material.id);
      setMaterials((prev) => prev.filter((item) => item.id !== material.id));
      if (selected?.id === material.id) closeDrawer();
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить материал'));
    } finally {
      setActionId(null);
    }
  };

  const renderRowActions = (material: Material) => {
    const isBusy = actionId === material.id;
    const isPublished = material.status === MaterialStatus.PUBLISHED;

    return (
      <div className={styles.materialsPage__actions}>
        <button
          type="button"
          className={styles.materialsPage__actionBtn}
          onClick={() => openView(material)}
        >
          Просмотр
        </button>
        <button
          type="button"
          className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_primary}`}
          onClick={() => navigate(`/materials/${material.id}/edit`)}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_warning}`}
          onClick={() => void handleTogglePublish(material)}
          disabled={isBusy}
        >
          {isBusy ? '...' : isPublished ? 'Снять с публикации' : 'Опубликовать'}
        </button>
        <button
          type="button"
          className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_danger}`}
          onClick={() => void handleDelete(material)}
          disabled={isBusy}
        >
          {isBusy ? '...' : 'Удалить'}
        </button>
      </div>
    );
  };

  return (
    <section className={styles.materialsPage}>
      <header className={styles.materialsPage__header}>
        <div>
          <h1 className={styles.materialsPage__title}>Материалы</h1>
          <p className={styles.materialsPage__subtitle}>
            {isLoading ? 'Загрузка...' : `${materials.length} материалов`}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_primary}`}
          onClick={() => void handleCreate()}
          disabled={isCreating}
        >
          {isCreating ? 'Создание...' : 'Добавить материал'}
        </button>
      </header>

      {listError ? <p className={styles.materialsPage__error}>{listError}</p> : null}

      <div className={styles.materialsPage__tableCard}>
        <table className={styles.materialsPage__table}>
          <thead>
            <tr>
              <th>Материал</th>
              <th>Slug</th>
              <th>Тариф</th>
              <th>Блоков</th>
              <th>Статус</th>
              <th>Обновлён</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && materials.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.materialsPage__empty}>
                  Материалов пока нет
                </td>
              </tr>
            ) : null}

            {materials.map((material) => (
              <tr key={material.id}>
                <td>
                  <div className={styles.materialsPage__materialCell}>
                    <div className={styles.materialsPage__preview}>
                      {material.coverUrl ? (
                        <img src={material.coverUrl} alt={material.title} />
                      ) : (
                        <span />
                      )}
                    </div>
                    <div>
                      <span>{material.title}</span>
                      {material.summary ? (
                        <div className={styles.materialsPage__meta}>{material.summary}</div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>
                  <code>{material.slug}</code>
                </td>
                <td>
                  <code>{tariffLabel(material.tariffType)}</code>
                </td>
                <td>{material.blocks?.length ?? 0}</td>
                <td>
                  <span
                    className={`${styles.materialsPage__badge} ${
                      material.status === MaterialStatus.PUBLISHED
                        ? styles.materialsPage__badge_active
                        : styles.materialsPage__badge_inactive
                    }`}
                  >
                    {material.status === MaterialStatus.PUBLISHED
                      ? 'Опубликован'
                      : 'Черновик'}
                  </span>
                </td>
                <td>{formatDate(material.updatedAt)}</td>
                <td>{renderRowActions(material)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === 'view' && selected ? (
        <>
          <button
            type="button"
            className={styles.materialsPage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.materialsPage__drawer}>
            <div className={styles.materialsPage__drawerHeader}>
              <h2 className={styles.materialsPage__drawerTitle}>Просмотр материала</h2>
              <button
                type="button"
                className={styles.materialsPage__close}
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <div className={styles.materialsPage__drawerBody}>
              {selected.coverUrl ? (
                <div className={styles.materialsPage__drawerPreview}>
                  <img src={selected.coverUrl} alt={selected.title} />
                </div>
              ) : null}

              <div className={styles.materialsPage__fields}>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Название</span>
                  <p className={styles.materialsPage__fieldValue}>{selected.title}</p>
                </div>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Slug</span>
                  <p className={styles.materialsPage__fieldValue}>{selected.slug}</p>
                </div>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Тариф доступа</span>
                  <p className={styles.materialsPage__fieldValue}>
                    {tariffLabel(selected.tariffType)}
                  </p>
                </div>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Статус</span>
                  <p className={styles.materialsPage__fieldValue}>
                    {selected.status === MaterialStatus.PUBLISHED
                      ? 'Опубликован'
                      : 'Черновик'}
                  </p>
                </div>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Краткое описание</span>
                  <p className={styles.materialsPage__fieldValue}>
                    {selected.summary || '—'}
                  </p>
                </div>
                <div className={styles.materialsPage__field}>
                  <span className={styles.materialsPage__fieldLabel}>Блоки</span>
                  <p className={styles.materialsPage__fieldValue}>
                    {selected.blocks.length === 0
                      ? 'Пусто'
                      : selected.blocks.map((block) => (
                          <span key={block.id} className={styles.materialsPage__listItem}>
                            • {block.type}
                            {'text' in block && block.text
                              ? `: ${block.text.slice(0, 60)}${block.text.length > 60 ? '…' : ''}`
                              : ''}
                            {block.type === 'image' ? `: ${block.alt || block.url}` : ''}
                          </span>
                        ))}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.materialsPage__drawerFooter}>
              <button
                type="button"
                className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_warning}`}
                onClick={() => void handleTogglePublish(selected)}
                disabled={actionId === selected.id}
              >
                {selected.status === MaterialStatus.PUBLISHED
                  ? 'Снять с публикации'
                  : 'Опубликовать'}
              </button>
              <button
                type="button"
                className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_danger}`}
                onClick={() => void handleDelete(selected)}
                disabled={actionId === selected.id}
              >
                Удалить
              </button>
              <button
                type="button"
                className={`${styles.materialsPage__actionBtn} ${styles.materialsPage__actionBtn_primary}`}
                onClick={() => navigate(`/materials/${selected.id}/edit`)}
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

export default MaterialsPage;
