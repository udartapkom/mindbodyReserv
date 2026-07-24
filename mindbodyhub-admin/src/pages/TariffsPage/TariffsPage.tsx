import { useEffect, useState, type FormEvent } from 'react';
import { tariffsApi } from '@/api/tariffs';
import type {
  CreateTariffPayload,
  Tariff,
  TariffComparisonRow,
  UpdateTariffPayload,
} from '@/types/tariff';
import { createBlockId, getErrorMessage } from '@/utils/adminHelpers';
import styles from './TariffsPage.module.scss';

type DrawerMode = 'view' | 'edit' | 'create' | null;

type ComparisonDraftRow = {
  key: string;
  feature: string;
  included: Record<string, boolean>;
};

const emptyForm: CreateTariffPayload = {
  type: '',
  title: '',
  titleColor: '',
  price: '',
  priceAmount: null,
  period: '',
  durationDays: 30,
  subTitle: '',
  description: [],
  image: '',
  imageAlt: '',
  sortOrder: 0,
  isActive: true,
};

function descriptionToText(items: string[]) {
  return items.join('\n');
}

function textToDescription(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function toComparisonDraft(
  rows: TariffComparisonRow[],
  tariffTypes: string[],
): ComparisonDraftRow[] {
  return rows.map((row) => {
    const included: Record<string, boolean> = {};
    for (const type of tariffTypes) {
      included[type] = row.included[type] === true;
    }
    return {
      key: row.id || createBlockId(),
      feature: row.feature,
      included,
    };
  });
}

function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [form, setForm] = useState<CreateTariffPayload>(emptyForm);
  const [descriptionText, setDescriptionText] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [comparisonRows, setComparisonRows] = useState<ComparisonDraftRow[]>([]);
  const [comparisonError, setComparisonError] = useState('');
  const [comparisonSuccess, setComparisonSuccess] = useState('');
  const [isComparisonLoading, setIsComparisonLoading] = useState(true);
  const [isComparisonSaving, setIsComparisonSaving] = useState(false);

  const activeTariffs = tariffs.filter((tariff) => tariff.isActive);
  const comparisonColumns =
    activeTariffs.length > 0 ? activeTariffs : tariffs;

  const loadComparison = async (tariffList: Tariff[]) => {
    setIsComparisonLoading(true);
    setComparisonError('');
    try {
      const data = await tariffsApi.getComparison();
      const types = tariffList.map((t) => t.type);
      setComparisonRows(toComparisonDraft(data.rows, types));
    } catch (error) {
      setComparisonError(
        getErrorMessage(error, 'Не удалось загрузить сравнение тарифов'),
      );
    } finally {
      setIsComparisonLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setListError('');
      try {
        const data = await tariffsApi.getAll();
        setTariffs(data);
        await loadComparison(data);
      } catch {
        setListError('Не удалось загрузить список тарифов');
        setIsComparisonLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  // Keep comparison checkboxes in sync when tariffs list changes
  useEffect(() => {
    const types = tariffs.map((t) => t.type);
    setComparisonRows((prev) =>
      prev.map((row) => {
        const included: Record<string, boolean> = {};
        for (const type of types) {
          included[type] = row.included[type] === true;
        }
        return { ...row, included };
      }),
    );
  }, [tariffs]);
  const fillForm = (tariff: Tariff) => {
    setForm({
      type: tariff.type,
      title: tariff.title,
      titleColor: tariff.titleColor ?? '',
      price: tariff.price,
      priceAmount: tariff.priceAmount ?? null,
      period: tariff.period,
      durationDays: tariff.durationDays ?? 30,
      subTitle: tariff.subTitle,
      description: tariff.description,
      image: tariff.image,
      imageAlt: tariff.imageAlt,
      sortOrder: tariff.sortOrder,
      isActive: tariff.isActive,
    });
    setDescriptionText(descriptionToText(tariff.description));
  };

  const openDrawer = (tariff: Tariff, nextMode: 'view' | 'edit') => {
    setSelectedTariff(tariff);
    setMode(nextMode);
    setSaveError('');
    fillForm(tariff);
  };

  const openCreate = () => {
    setSelectedTariff(null);
    setMode('create');
    setSaveError('');
    setForm({
      ...emptyForm,
      sortOrder: tariffs.length,
    });
    setDescriptionText('');
  };

  const closeDrawer = () => {
    setSelectedTariff(null);
    setMode(null);
    setSaveError('');
  };

  const updateTariffInList = (updated: Tariff) => {
    setTariffs((prev) =>
      prev
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
    setSelectedTariff((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const buildPayload = (): CreateTariffPayload => ({
    type: form.type.trim(),
    title: form.title.trim(),
    titleColor: form.titleColor?.toString().trim() || null,
    price: form.price.trim(),
    priceAmount:
      form.priceAmount === null || form.priceAmount === undefined
        ? null
        : Number(form.priceAmount) || null,
    period: form.period.trim(),
    durationDays: Number(form.durationDays) || 30,
    subTitle: form.subTitle.trim(),
    description: textToDescription(descriptionText),
    image: form.image.trim(),
    imageAlt: form.imageAlt.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive ?? true,
  });

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');

    try {
      const payload = buildPayload();

      if (mode === 'create') {
        const created = await tariffsApi.create(payload);
        setTariffs((prev) =>
          [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder),
        );
        setSelectedTariff(created);
        fillForm(created);
        setMode('view');
        return;
      }

      if (!selectedTariff) return;

      const updatePayload: UpdateTariffPayload = payload;
      const updated = await tariffsApi.update(selectedTariff.id, updatePayload);
      updateTariffInList(updated);
      fillForm(updated);
      setMode('view');
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Не удалось сохранить тариф'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (tariff: Tariff) => {
    const willActivate = !tariff.isActive;
    const confirmed = window.confirm(
      willActivate
        ? `Активировать тариф «${tariff.title}»?`
        : `Деактивировать тариф «${tariff.title}»? Он скрывается с публичной страницы.`,
    );

    if (!confirmed) return;

    setActionId(tariff.id);
    setListError('');

    try {
      const updated = willActivate
        ? await tariffsApi.activate(tariff.id)
        : await tariffsApi.deactivate(tariff.id);
      updateTariffInList(updated);
    } catch (error) {
      setListError(
        getErrorMessage(
          error,
          willActivate ? 'Не удалось активировать' : 'Не удалось деактивировать',
        ),
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (tariff: Tariff) => {
    const confirmed = window.confirm(
      `Удалить тариф «${tariff.title}» (${tariff.type})?\nЭто действие нельзя отменить.`,
    );

    if (!confirmed) return;

    setActionId(tariff.id);
    setListError('');

    try {
      await tariffsApi.remove(tariff.id);
      setTariffs((prev) => prev.filter((item) => item.id !== tariff.id));
      if (selectedTariff?.id === tariff.id) {
        closeDrawer();
      }
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить тариф'));
    } finally {
      setActionId(null);
    }
  };

  const addComparisonRow = () => {
    const included: Record<string, boolean> = {};
    for (const tariff of tariffs) {
      included[tariff.type] = false;
    }
    setComparisonRows((prev) => [
      ...prev,
      { key: createBlockId(), feature: '', included },
    ]);
    setComparisonSuccess('');
  };

  const updateComparisonFeature = (key: string, feature: string) => {
    setComparisonRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, feature } : row)),
    );
    setComparisonSuccess('');
  };

  const toggleComparisonIncluded = (key: string, tariffType: string) => {
    setComparisonRows((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        return {
          ...row,
          included: {
            ...row.included,
            [tariffType]: !row.included[tariffType],
          },
        };
      }),
    );
    setComparisonSuccess('');
  };

  const moveComparisonRow = (index: number, direction: -1 | 1) => {
    setComparisonRows((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
    setComparisonSuccess('');
  };

  const removeComparisonRow = (key: string) => {
    setComparisonRows((prev) => prev.filter((row) => row.key !== key));
    setComparisonSuccess('');
  };

  const handleSaveComparison = async () => {
    setIsComparisonSaving(true);
    setComparisonError('');
    setComparisonSuccess('');

    const payloadRows = comparisonRows
      .map((row, index) => ({
        feature: row.feature.trim(),
        included: row.included,
        sortOrder: index,
      }))
      .filter((row) => row.feature.length > 0);

    try {
      const updated = await tariffsApi.updateComparison({ rows: payloadRows });
      setComparisonRows(
        toComparisonDraft(
          updated.rows,
          tariffs.map((t) => t.type),
        ),
      );
      setComparisonSuccess('Сравнение сохранено');
    } catch (error) {
      setComparisonError(
        getErrorMessage(error, 'Не удалось сохранить сравнение тарифов'),
      );
    } finally {
      setIsComparisonSaving(false);
    }
  };

  const renderRowActions = (tariff: Tariff) => {
    const isBusy = actionId === tariff.id;

    return (
      <div className={styles.tariffsPage__actions}>
        <button
          type="button"
          className={styles.tariffsPage__actionBtn}
          onClick={() => openDrawer(tariff, 'view')}
        >
          Просмотр
        </button>
        <button
          type="button"
          className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_primary}`}
          onClick={() => openDrawer(tariff, 'edit')}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_warning}`}
          onClick={() => void handleToggleActive(tariff)}
          disabled={isBusy}
        >
          {isBusy ? '...' : tariff.isActive ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          type="button"
          className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_danger}`}
          onClick={() => void handleDelete(tariff)}
          disabled={isBusy}
        >
          {isBusy ? '...' : 'Удалить'}
        </button>
      </div>
    );
  };

  const drawerTitle =
    mode === 'create'
      ? 'Новый тариф'
      : mode === 'edit'
        ? 'Редактирование тарифа'
        : 'Просмотр тарифа';

  return (
    <section className={styles.tariffsPage}>
      <header className={styles.tariffsPage__header}>
        <div>
          <h1 className={styles.tariffsPage__title}>Тарифы</h1>
          <p className={styles.tariffsPage__subtitle}>
            {isLoading ? 'Загрузка...' : `${tariffs.length} тарифов`}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_primary}`}
          onClick={openCreate}
        >
          Добавить тариф
        </button>
      </header>

      {listError ? <p className={styles.tariffsPage__error}>{listError}</p> : null}

      <div className={styles.tariffsPage__tableCard}>
        <table className={styles.tariffsPage__table}>
          <thead>
            <tr>
              <th>Тариф</th>
              <th>Type</th>
              <th>Цена</th>
              <th>Период</th>
              <th>Порядок</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && tariffs.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tariffsPage__empty}>
                  Тарифов пока нет
                </td>
              </tr>
            ) : null}

            {tariffs.map((tariff) => (
              <tr key={tariff.id}>
                <td>
                  <div className={styles.tariffsPage__tariffCell}>
                    <div className={styles.tariffsPage__preview}>
                      {tariff.image ? (
                        <img src={tariff.image} alt={tariff.imageAlt || tariff.title} />
                      ) : (
                        <span />
                      )}
                    </div>
                    <div>
                      {tariff.titleColor ? (
                        <span
                          className={styles.tariffsPage__colorDot}
                          style={{ backgroundColor: tariff.titleColor }}
                        />
                      ) : null}
                      <span>{tariff.title}</span>
                      <div className={styles.tariffsPage__meta}>{tariff.subTitle}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <code>{tariff.type}</code>
                </td>
                <td>{tariff.price}</td>
                <td>{tariff.period}</td>
                <td>{tariff.sortOrder}</td>
                <td>
                  <span
                    className={`${styles.tariffsPage__badge} ${
                      tariff.isActive
                        ? styles.tariffsPage__badge_active
                        : styles.tariffsPage__badge_inactive
                    }`}
                  >
                    {tariff.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>{renderRowActions(tariff)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tariffsPage__tableCard}>
        <div className={styles.tariffsPage__sectionHeader}>
          <div>
            <h2 className={styles.tariffsPage__sectionTitle}>Сравнение тарифов</h2>
            <p className={styles.tariffsPage__sectionHint}>
              Строки таблицы на странице «Тарифы». Колонки — активные тарифы
              (по порядку). Отметьте, что входит в каждый тариф.
            </p>
          </div>
          <div className={styles.tariffsPage__sectionActions}>
            <button
              type="button"
              className={styles.tariffsPage__actionBtn}
              onClick={addComparisonRow}
              disabled={isComparisonLoading || isComparisonSaving}
            >
              Добавить строку
            </button>
            <button
              type="button"
              className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_primary}`}
              onClick={() => void handleSaveComparison()}
              disabled={isComparisonLoading || isComparisonSaving}
            >
              {isComparisonSaving ? 'Сохранение…' : 'Сохранить сравнение'}
            </button>
          </div>
        </div>

        {comparisonError ? (
          <p className={styles.tariffsPage__error}>{comparisonError}</p>
        ) : null}
        {comparisonSuccess ? (
          <p className={styles.tariffsPage__success}>{comparisonSuccess}</p>
        ) : null}

        {isComparisonLoading ? (
          <p className={styles.tariffsPage__sectionHint}>Загрузка сравнения…</p>
        ) : (
          <div className={styles.tariffsPage__comparisonScroll}>
            <table className={styles.tariffsPage__comparisonTable}>
              <thead>
                <tr>
                  <th>Возможность</th>
                  {comparisonColumns.map((tariff) => (
                    <th key={tariff.id}>
                      {tariff.title}
                      <span className={styles.tariffsPage__meta}>
                        {' '}
                        ({tariff.type})
                      </span>
                    </th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={comparisonColumns.length + 2}
                      className={styles.tariffsPage__empty}
                    >
                      Строк пока нет — добавьте возможность
                    </td>
                  </tr>
                ) : null}
                {comparisonRows.map((row, index) => (
                  <tr key={row.key}>
                    <td>
                      <input
                        className={styles.tariffsPage__comparisonInput}
                        value={row.feature}
                        onChange={(e) =>
                          updateComparisonFeature(row.key, e.target.value)
                        }
                        placeholder="Название возможности"
                      />
                    </td>
                    {comparisonColumns.map((tariff) => (
                      <td key={tariff.id} className={styles.tariffsPage__checkCell}>
                        <input
                          type="checkbox"
                          checked={row.included[tariff.type] === true}
                          onChange={() =>
                            toggleComparisonIncluded(row.key, tariff.type)
                          }
                          aria-label={`${row.feature || 'Возможность'} — ${tariff.title}`}
                        />
                      </td>
                    ))}
                    <td>
                      <div className={styles.tariffsPage__actions}>
                        <button
                          type="button"
                          className={styles.tariffsPage__actionBtn}
                          onClick={() => moveComparisonRow(index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={styles.tariffsPage__actionBtn}
                          onClick={() => moveComparisonRow(index, 1)}
                          disabled={index === comparisonRows.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_danger}`}
                          onClick={() => removeComparisonRow(row.key)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mode ? (
        <>
          <button
            type="button"
            className={styles.tariffsPage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.tariffsPage__drawer}>
            <div className={styles.tariffsPage__drawerHeader}>
              <h2 className={styles.tariffsPage__drawerTitle}>{drawerTitle}</h2>
              <button
                type="button"
                className={styles.tariffsPage__close}
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <div className={styles.tariffsPage__drawerBody}>
              {(mode === 'view' || mode === 'edit') && selectedTariff ? (
                <div className={styles.tariffsPage__drawerPreview}>
                  {selectedTariff.image ? (
                    <img
                      src={selectedTariff.image}
                      alt={selectedTariff.imageAlt || selectedTariff.title}
                    />
                  ) : (
                    <span />
                  )}
                </div>
              ) : null}

              {mode === 'view' && selectedTariff ? (
                <div className={styles.tariffsPage__fields}>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Название</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.title}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Type</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.type}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Цена</span>
                    <p className={styles.tariffsPage__fieldValue}>
                      {selectedTariff.price} {selectedTariff.period}
                      {selectedTariff.priceAmount != null
                        ? ` · оплата ${selectedTariff.priceAmount} ₽`
                        : ''}
                      {` · ${selectedTariff.durationDays ?? 30} дн.`}
                    </p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Подзаголовок</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.subTitle}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Цвет</span>
                    <p className={styles.tariffsPage__fieldValue}>
                      {selectedTariff.titleColor || '—'}
                    </p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Описание</span>
                    <p className={styles.tariffsPage__fieldValue}>
                      {selectedTariff.description.length
                        ? selectedTariff.description.map((item) => (
                            <span key={item} className={styles.tariffsPage__listItem}>
                              • {item}
                            </span>
                          ))
                        : '—'}
                    </p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Изображение</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.image}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Alt изображения</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.imageAlt}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Порядок</span>
                    <p className={styles.tariffsPage__fieldValue}>{selectedTariff.sortOrder}</p>
                  </div>
                  <div className={styles.tariffsPage__field}>
                    <span className={styles.tariffsPage__fieldLabel}>Статус</span>
                    <p className={styles.tariffsPage__fieldValue}>
                      {selectedTariff.isActive ? 'Активен' : 'Неактивен'}
                    </p>
                  </div>
                </div>
              ) : (
                <form className={styles.tariffsPage__form} onSubmit={(e) => void handleSave(e)}>
                  <label className={styles.tariffsPage__fieldLabel} htmlFor="title">
                    Название
                  </label>
                  <input
                    id="title"
                    className={styles.tariffsPage__input}
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="type">
                    Type (английский slug)
                  </label>
                  <input
                    id="type"
                    className={styles.tariffsPage__input}
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    placeholder="trial"
                    required
                    pattern="[a-z][a-z0-9_-]*"
                    title="Строчные латинские буквы, цифры, _ и -"
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="price">
                    Цена (отображение)
                  </label>
                  <input
                    id="price"
                    className={styles.tariffsPage__input}
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="999₽"
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="priceAmount">
                    Цена для оплаты (₽)
                  </label>
                  <input
                    id="priceAmount"
                    className={styles.tariffsPage__input}
                    type="number"
                    min={1}
                    step={1}
                    value={form.priceAmount ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        priceAmount: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    placeholder="999"
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="period">
                    Период (отображение)
                  </label>
                  <input
                    id="period"
                    className={styles.tariffsPage__input}
                    value={form.period}
                    onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                    placeholder="/ месяц"
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="durationDays">
                    Срок доступа (дней)
                  </label>
                  <input
                    id="durationDays"
                    className={styles.tariffsPage__input}
                    type="number"
                    min={1}
                    step={1}
                    value={form.durationDays ?? 30}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        durationDays: Number(e.target.value) || 30,
                      }))
                    }
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="subTitle">
                    Подзаголовок
                  </label>
                  <input
                    id="subTitle"
                    className={styles.tariffsPage__input}
                    value={form.subTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, subTitle: e.target.value }))}
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="titleColor">
                    Цвет акцента
                  </label>
                  <input
                    id="titleColor"
                    className={styles.tariffsPage__input}
                    value={form.titleColor?.toString() ?? ''}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, titleColor: e.target.value }))
                    }
                    placeholder="#3b82f6"
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="description">
                    Описание (по одному пункту на строку)
                  </label>
                  <textarea
                    id="description"
                    className={styles.tariffsPage__textarea}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="image">
                    URL / путь изображения
                  </label>
                  <input
                    id="image"
                    className={styles.tariffsPage__input}
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="/images/brain.png"
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="imageAlt">
                    Alt изображения
                  </label>
                  <input
                    id="imageAlt"
                    className={styles.tariffsPage__input}
                    value={form.imageAlt}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
                    required
                  />

                  <label className={styles.tariffsPage__fieldLabel} htmlFor="sortOrder">
                    Порядок сортировки
                  </label>
                  <input
                    id="sortOrder"
                    type="number"
                    min={0}
                    className={styles.tariffsPage__input}
                    value={form.sortOrder ?? 0}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: Number(e.target.value) || 0,
                      }))
                    }
                  />

                  <label className={styles.tariffsPage__checkbox}>
                    <input
                      type="checkbox"
                      checked={form.isActive ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                    />
                    Активен
                  </label>

                  {saveError ? <p className={styles.tariffsPage__error}>{saveError}</p> : null}

                  <div className={styles.tariffsPage__formActions}>
                    <button
                      type="button"
                      className={styles.tariffsPage__actionBtn}
                      onClick={() => {
                        if (mode === 'create') {
                          closeDrawer();
                          return;
                        }
                        setMode('view');
                      }}
                      disabled={isSaving}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_primary}`}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {mode === 'view' && selectedTariff ? (
              <div className={styles.tariffsPage__drawerFooter}>
                <button
                  type="button"
                  className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_warning}`}
                  onClick={() => void handleToggleActive(selectedTariff)}
                  disabled={actionId === selectedTariff.id}
                >
                  {selectedTariff.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                <button
                  type="button"
                  className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_danger}`}
                  onClick={() => void handleDelete(selectedTariff)}
                  disabled={actionId === selectedTariff.id}
                >
                  Удалить
                </button>
                <button
                  type="button"
                  className={`${styles.tariffsPage__actionBtn} ${styles.tariffsPage__actionBtn_primary}`}
                  onClick={() => setMode('edit')}
                >
                  Редактировать
                </button>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </section>
  );
}

export default TariffsPage;
