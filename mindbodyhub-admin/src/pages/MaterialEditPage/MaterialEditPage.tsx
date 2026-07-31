import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { materialsApi } from '@/api/materials';
import { tariffsApi } from '@/api/tariffs';
import type { Material, MaterialBlock } from '@/types/material';
import { FREE_ACCESS_TYPE, MaterialStatus, REGISTERED_ACCESS_TYPE } from '@/types/material';
import type { Tariff } from '@/types/tariff';
import { createBlockId, getErrorMessage } from '@/utils/adminHelpers';
import styles from './MaterialEditPage.module.scss';

function insertMarkdownLink(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  label: string,
  url: string,
) {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const linkLabel = selected || label;
  const markdown = `[${linkLabel}](${url})`;
  return {
    text: `${before}${markdown}${after}`,
    cursor: before.length + markdown.length,
  };
}

function MaterialEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdRef = useRef<string | null>(null);
  const paragraphRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [material, setMaterial] = useState<Material | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [showMetadata, setShowMetadata] = useState(true);
  const [coverUrl, setCoverUrl] = useState('');
  const [tariffType, setTariffType] = useState(FREE_ACCESS_TYPE);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [blocks, setBlocks] = useState<MaterialBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [data, tariffList] = await Promise.all([
          materialsApi.getById(id),
          tariffsApi.getAll(),
        ]);
        setMaterial(data);
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary ?? '');
        setShowMetadata(data.showMetadata !== false);
        setCoverUrl(data.coverUrl ?? '');
        setTariffType(data.tariffType || FREE_ACCESS_TYPE);
        setTariffs(tariffList);
        setBlocks(data.blocks ?? []);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить материал'));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const scrollToBlock = (blockId: string) => {
    window.setTimeout(() => {
      document.getElementById(`editor-block-${blockId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);
  };

  const addBlock = (type: MaterialBlock['type']) => {
    const blockId = createBlockId();

    if (type === 'image') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'image', key: '', url: '', alt: '', showAlt: true },
      ]);
    } else if (type === 'link') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'link', text: '', url: '' },
      ]);
    } else if (type === 'list') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'list', style: 'ul', items: [''] },
      ]);
    } else if (type === 'quote') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'quote', text: '', variant: 'quote' },
      ]);
    } else if (type === 'subheading') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'subheading', text: '', level: 3 },
      ]);
    } else {
      setBlocks((prev) => [...prev, { id: blockId, type, text: '' }]);
    }

    scrollToBlock(blockId);
  };

  const renderAddBlockToolbar = (className: string) => (
    <div className={className}>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('heading')}
      >
        + Заголовок
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('subheading')}
      >
        + Подзаголовок
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('paragraph')}
      >
        + Абзац
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('list')}
      >
        + Список
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('quote')}
      >
        + Цитата
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('link')}
      >
        + Ссылка
      </button>
      <button
        type="button"
        className={styles.materialEditPage__btn}
        onClick={() => addBlock('image')}
      >
        + Изображение
      </button>
    </div>
  );

  const updateBlock = (blockId: string, patch: Partial<MaterialBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return { ...block, ...patch } as MaterialBlock;
      }),
    );
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const insertLinkIntoParagraph = (blockId: string) => {
    const textarea = paragraphRefs.current[blockId];
    const block = blocks.find((item) => item.id === blockId);
    if (!block || block.type !== 'paragraph') return;

    const selected =
      textarea && textarea.selectionStart !== textarea.selectionEnd
        ? block.text.slice(textarea.selectionStart, textarea.selectionEnd)
        : '';

    const label =
      selected ||
      window.prompt('Текст ссылки', 'ссылка') ||
      '';
    if (!label.trim() && !selected) return;

    const url = window.prompt('URL ссылки', 'https://');
    if (!url?.trim()) return;

    const start = textarea?.selectionStart ?? block.text.length;
    const end = textarea?.selectionEnd ?? block.text.length;
    const result = insertMarkdownLink(
      block.text,
      start,
      end,
      label.trim() || 'ссылка',
      url.trim(),
    );

    updateBlock(blockId, { text: result.text });

    requestAnimationFrame(() => {
      const el = paragraphRefs.current[blockId];
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const startImageUpload = (blockId: string) => {
    uploadTargetIdRef.current = blockId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const blockId = uploadTargetIdRef.current;
    event.target.value = '';
    uploadTargetIdRef.current = null;

    if (!file || !blockId) return;

    setUploadingId(blockId);
    setError('');
    setSuccess('');

    try {
      const uploaded = await materialsApi.uploadImage(file);
      updateBlock(blockId, {
        key: uploaded.key,
        url: uploaded.url,
        alt: file.name.replace(/\.[^.]+$/, ''),
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить изображение'));
    } finally {
      setUploadingId(null);
    }
  };

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploadingCover(true);
    setError('');
    setSuccess('');

    try {
      const uploaded = await materialsApi.uploadImage(file);
      setCoverUrl(uploaded.url);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить обложку'));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = async (event?: FormEvent): Promise<boolean> => {
    event?.preventDefault();
    if (!id) return false;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await materialsApi.update(id, {
        title: title.trim(),
        slug: slug.trim(),
        tariffType,
        summary: summary.trim() || null,
        coverUrl: coverUrl.trim() || null,
        showMetadata,
        blocks,
      });
      setMaterial(updated);
      setTitle(updated.title);
      setSlug(updated.slug);
      setSummary(updated.summary ?? '');
      setShowMetadata(updated.showMetadata !== false);
      setCoverUrl(updated.coverUrl ?? '');
      setTariffType(updated.tariffType || FREE_ACCESS_TYPE);
      setBlocks(updated.blocks ?? []);
      setSuccess('Сохранено');
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось сохранить материал'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id || !material) return;

    const isPublished = material.status === MaterialStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? 'Снять материал с публикации?'
        : 'Опубликовать материал?',
    );
    if (!confirmed) return;

    setIsPublishing(true);
    setError('');
    setSuccess('');

    try {
      const saved = await handleSave();
      if (!saved) return;

      const updated = isPublished
        ? await materialsApi.unpublish(id)
        : await materialsApi.publish(id);
      setMaterial(updated);
      setSuccess(isPublished ? 'Снято с публикации' : 'Опубликовано');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          isPublished ? 'Не удалось снять с публикации' : 'Не удалось опубликовать',
        ),
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.materialEditPage}>
        <p className={styles.materialEditPage__subtitle}>Загрузка...</p>
      </section>
    );
  }

  if (!material) {
    return (
      <section className={styles.materialEditPage}>
        <p className={styles.materialEditPage__error}>{error || 'Материал не найден'}</p>
        <Link to="/materials" className={styles.materialEditPage__back}>
          ← К списку материалов
        </Link>
      </section>
    );
  }

  const isPublished = material.status === MaterialStatus.PUBLISHED;

  return (
    <section className={styles.materialEditPage}>
      <div className={styles.materialEditPage__top}>
        <button
          type="button"
          className={styles.materialEditPage__back}
          onClick={() => navigate('/materials')}
        >
          ← К списку материалов
        </button>
        <div className={styles.materialEditPage__actions}>
          <button
            type="button"
            className={`${styles.materialEditPage__btn} ${styles.materialEditPage__btn_warning}`}
            onClick={() => void handleTogglePublish()}
            disabled={isSaving || isPublishing}
          >
            {isPublishing
              ? '...'
              : isPublished
                ? 'Снять с публикации'
                : 'Опубликовать'}
          </button>
          <button
            type="button"
            className={`${styles.materialEditPage__btn} ${styles.materialEditPage__btn_primary}`}
            onClick={() => void handleSave()}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <header>
        <h1 className={styles.materialEditPage__title}>
          Редактирование
          <span
            className={`${styles.materialEditPage__badge} ${
              isPublished
                ? styles.materialEditPage__badge_published
                : styles.materialEditPage__badge_draft
            }`}
          >
            {isPublished ? 'Опубликован' : 'Черновик'}
          </span>
        </h1>
        <p className={styles.materialEditPage__subtitle}>{material.title}</p>
      </header>

      {error ? <p className={styles.materialEditPage__error}>{error}</p> : null}
      {success ? <p className={styles.materialEditPage__success}>{success}</p> : null}

      <form className={styles.materialEditPage__card} onSubmit={(e) => void handleSave(e)}>
        <h2 className={styles.materialEditPage__sectionTitle}>Метаданные</h2>

        <label className={styles.materialEditPage__fieldLabel} htmlFor="title">
          Название
        </label>
        <input
          id="title"
          className={styles.materialEditPage__input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className={styles.materialEditPage__fieldLabel} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className={styles.materialEditPage__input}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <label className={styles.materialEditPage__fieldLabel} htmlFor="tariffType">
          Тариф доступа
        </label>
        <select
          id="tariffType"
          className={styles.materialEditPage__input}
          value={tariffType}
          onChange={(e) => setTariffType(e.target.value)}
        >
          <option value={FREE_ACCESS_TYPE}>Free — общедоступный</option>
          <option value={REGISTERED_ACCESS_TYPE}>
            Registered — для зарегистрированных
          </option>
          {tariffs.map((tariff) => (
            <option key={tariff.id} value={tariff.type}>
              {tariff.title} ({tariff.type})
            </option>
          ))}
        </select>
        <p className={styles.materialEditPage__hint}>
          Free — всем. Registered — авторизованным. Trial / Popular / VIP —
          пользователям соответствующего тарифа (VIP включает уровни ниже).
        </p>

        <label className={styles.materialEditPage__fieldLabel} htmlFor="summary">
          Краткое описание
        </label>
        <textarea
          id="summary"
          className={styles.materialEditPage__textarea}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <label className={styles.materialEditPage__checkbox}>
          <input
            type="checkbox"
            checked={showMetadata}
            onChange={(e) => setShowMetadata(e.target.checked)}
          />
          Показывать метаданные на странице материала
        </label>
        <p className={styles.materialEditPage__hint}>
          Метка доступа и краткое описание. Заголовок и обложка всегда
          остаются.
        </p>

        <span className={styles.materialEditPage__fieldLabel}>
          Обложка (превью в списке)
        </span>
        {coverUrl ? (
          <img
            className={styles.materialEditPage__imagePreview}
            src={coverUrl}
            alt="Обложка"
          />
        ) : (
          <div className={styles.materialEditPage__imageEmpty}>Обложка не задана</div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.materialEditPage__fileInput}
          onChange={(e) => void handleCoverUpload(e)}
        />
        <div className={styles.materialEditPage__toolbar}>
          <button
            type="button"
            className={styles.materialEditPage__btn}
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
          >
            {isUploadingCover
              ? 'Загрузка...'
              : coverUrl
                ? 'Заменить обложку'
                : 'Загрузить обложку'}
          </button>
          {coverUrl ? (
            <button
              type="button"
              className={`${styles.materialEditPage__btn} ${styles.materialEditPage__btn_danger}`}
              onClick={() => setCoverUrl('')}
            >
              Убрать обложку
            </button>
          ) : null}
        </div>
      </form>

      <div className={styles.materialEditPage__card}>
        <h2 className={styles.materialEditPage__sectionTitle}>Контент</h2>

        {renderAddBlockToolbar(styles.materialEditPage__toolbar)}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.materialEditPage__fileInput}
          onChange={(e) => void handleFileChange(e)}
        />

        <div className={styles.materialEditPage__blocks}>
          {blocks.length === 0 ? (
            <p className={styles.materialEditPage__empty}>
              Добавьте заголовок, абзац, список, цитату, ссылку или изображение
            </p>
          ) : null}

          {blocks.map((block, index) => (
            <article
              key={block.id}
              id={`editor-block-${block.id}`}
              className={styles.materialEditPage__block}
            >              <div className={styles.materialEditPage__blockHeader}>
                <div className={styles.materialEditPage__blockTypeRow}>
                  <span className={styles.materialEditPage__blockType}>
                    {block.type === 'heading' && 'Заголовок'}
                    {block.type === 'subheading' && 'Подзаголовок'}
                    {block.type === 'paragraph' && 'Абзац'}
                    {block.type === 'list' && 'Список'}
                    {block.type === 'quote' && 'Цитата / callout'}
                    {block.type === 'link' && 'Ссылка'}
                    {block.type === 'image' && 'Изображение'}
                  </span>
                  {block.type === 'subheading' ? (
                    <label className={styles.materialEditPage__levelLabel}>
                      Уровень
                      <select
                        className={styles.materialEditPage__levelSelect}
                        value={block.level ?? 3}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            level: Number(e.target.value) === 2 ? 2 : 3,
                          })
                        }
                      >
                        <option value={2}>H2 — крупный</option>
                        <option value={3}>H3 — обычный</option>
                      </select>
                    </label>
                  ) : null}
                  {block.type === 'list' ? (
                    <label className={styles.materialEditPage__levelLabel}>
                      Вид
                      <select
                        className={styles.materialEditPage__levelSelect}
                        value={block.style}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            style: e.target.value === 'ol' ? 'ol' : 'ul',
                          })
                        }
                      >
                        <option value="ul">Маркированный</option>
                        <option value="ol">Нумерованный</option>
                      </select>
                    </label>
                  ) : null}
                  {block.type === 'quote' ? (
                    <label className={styles.materialEditPage__levelLabel}>
                      Вид
                      <select
                        className={styles.materialEditPage__levelSelect}
                        value={block.variant ?? 'quote'}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            variant:
                              e.target.value === 'callout' ? 'callout' : 'quote',
                          })
                        }
                      >
                        <option value="quote">Цитата</option>
                        <option value="callout">Callout / тезис</option>
                      </select>
                    </label>
                  ) : null}
                </div>
                <div className={styles.materialEditPage__blockActions}>
                  <button
                    type="button"
                    className={styles.materialEditPage__blockBtn}
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    title="Выше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.materialEditPage__blockBtn}
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    title="Ниже"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.materialEditPage__blockBtn} ${styles.materialEditPage__blockBtn_danger}`}
                    onClick={() => removeBlock(block.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>

              {block.type === 'heading' ? (
                <input
                  className={styles.materialEditPage__headingInput}
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Заголовок раздела"
                />
              ) : null}

              {block.type === 'subheading' ? (
                <input
                  className={
                    (block.level ?? 3) === 2
                      ? styles.materialEditPage__subheadingH2Input
                      : styles.materialEditPage__subheadingInput
                  }
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder={
                    (block.level ?? 3) === 2
                      ? 'Подзаголовок (H2)'
                      : 'Подзаголовок (H3)'
                  }
                />
              ) : null}

              {block.type === 'paragraph' ? (
                <>
                  <textarea
                    ref={(el) => {
                      paragraphRefs.current[block.id] = el;
                    }}
                    className={styles.materialEditPage__paragraphInput}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Текст абзаца. **жирный**, ссылки: [текст](https://...)"
                  />
                  <button
                    type="button"
                    className={styles.materialEditPage__btn}
                    onClick={() => insertLinkIntoParagraph(block.id)}
                  >
                    Вставить ссылку в текст
                  </button>
                  <p className={styles.materialEditPage__hint}>
                    Можно выделить фрагмент и вставить ссылку — или вручную:
                    **жирный**, [текст](https://example.com)
                  </p>
                </>
              ) : null}

              {block.type === 'list' ? (
                <>
                  <label
                    className={styles.materialEditPage__fieldLabel}
                    htmlFor={`list-${block.id}`}
                  >
                    Пункты (по одному на строку)
                  </label>
                  <textarea
                    id={`list-${block.id}`}
                    className={styles.materialEditPage__paragraphInput}
                    value={block.items.join('\n')}
                    onChange={(e) =>
                      updateBlock(block.id, {
                        items: e.target.value.split('\n'),
                      })
                    }
                    placeholder={'Первый пункт\nВторой пункт'}
                  />
                  <p className={styles.materialEditPage__hint}>
                    В пунктах тоже работают **жирный** и [ссылка](url)
                  </p>
                </>
              ) : null}

              {block.type === 'quote' ? (
                <textarea
                  className={styles.materialEditPage__paragraphInput}
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder={
                    (block.variant ?? 'quote') === 'callout'
                      ? 'Важный тезис или подсказка'
                      : 'Текст цитаты'
                  }
                />
              ) : null}

              {block.type === 'link' ? (
                <>
                  <label
                    className={styles.materialEditPage__fieldLabel}
                    htmlFor={`link-text-${block.id}`}
                  >
                    Текст ссылки
                  </label>
                  <input
                    id={`link-text-${block.id}`}
                    className={styles.materialEditPage__input}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Подробнее"
                  />
                  <label
                    className={styles.materialEditPage__fieldLabel}
                    htmlFor={`link-url-${block.id}`}
                  >
                    URL
                  </label>
                  <input
                    id={`link-url-${block.id}`}
                    className={styles.materialEditPage__input}
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    placeholder="https://... или /path"
                  />
                </>
              ) : null}

              {block.type === 'image' ? (
                <>
                  {block.url ? (
                    <img
                      className={styles.materialEditPage__imagePreview}
                      src={block.url}
                      alt={block.alt || 'Превью'}
                    />
                  ) : (
                    <div className={styles.materialEditPage__imageEmpty}>
                      {uploadingId === block.id
                        ? 'Загрузка...'
                        : 'Изображение ещё не загружено'}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.materialEditPage__btn}
                    onClick={() => startImageUpload(block.id)}
                    disabled={uploadingId === block.id}
                  >
                    {uploadingId === block.id
                      ? 'Загрузка...'
                      : block.url
                        ? 'Заменить изображение'
                        : 'Загрузить в MinIO'}
                  </button>

                  <label className={styles.materialEditPage__fieldLabel} htmlFor={`alt-${block.id}`}>
                    Alt текст
                  </label>
                  <input
                    id={`alt-${block.id}`}
                    className={styles.materialEditPage__input}
                    value={block.alt}
                    onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                    placeholder="Описание изображения"
                  />
                  <label className={styles.materialEditPage__checkbox}>
                    <input
                      type="checkbox"
                      checked={block.showAlt !== false}
                      onChange={(e) =>
                        updateBlock(block.id, { showAlt: e.target.checked })
                      }
                    />
                    Показывать alt как подпись под изображением
                  </label>
                </>
              ) : null}
            </article>
          ))}
        </div>

        {renderAddBlockToolbar(
          `${styles.materialEditPage__toolbar} ${styles.materialEditPage__toolbar_sticky}`,
        )}
      </div>
    </section>
  );
}

export default MaterialEditPage;
