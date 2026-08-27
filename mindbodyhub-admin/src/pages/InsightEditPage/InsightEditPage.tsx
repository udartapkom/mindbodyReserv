import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { insightsApi } from '@/api/insights';
import type { Insight, InsightBlock } from '@/types/insight';
import { InsightStatus } from '@/types/insight';
import { createBlockId, getErrorMessage } from '@/utils/adminHelpers';
import styles from './InsightEditPage.module.scss';

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromDateInputValue(value: string): string | null {
  if (!value.trim()) return null;
  return `${value.trim()}T12:00:00.000+03:00`;
}

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

function InsightEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdRef = useRef<string | null>(null);
  const paragraphRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [article, setArticle] = useState<Insight | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [blocks, setBlocks] = useState<InsightBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await insightsApi.getById(id);
        setArticle(data);
        setTitle(data.title);
        setSlug(data.slug);
        setPublishedAt(toDateInputValue(data.publishedAt));
        setBlocks(data.blocks ?? []);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить инсайт'));
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

  const addBlock = (type: InsightBlock['type']) => {
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
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('heading')}
      >
        + Заголовок
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('subheading')}
      >
        + Подзаголовок
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('paragraph')}
      >
        + Абзац
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('list')}
      >
        + Список
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('quote')}
      >
        + Цитата
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('link')}
      >
        + Ссылка
      </button>
      <button
        type="button"
        className={styles.insightEditPage__btn}
        onClick={() => addBlock('image')}
      >
        + Изображение
      </button>
    </div>
  );

  const updateBlock = (blockId: string, patch: Partial<InsightBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return { ...block, ...patch } as InsightBlock;
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
      const uploaded = await insightsApi.uploadImage(file);
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

  const handleSave = async (event?: FormEvent): Promise<boolean> => {
    event?.preventDefault();
    if (!id) return false;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await insightsApi.update(id, {
        title: title.trim(),
        slug: slug.trim(),
        blocks,
        publishedAt: fromDateInputValue(publishedAt),
      });
      setArticle(updated);
      setTitle(updated.title);
      setSlug(updated.slug);
      setPublishedAt(toDateInputValue(updated.publishedAt));
      setBlocks(updated.blocks ?? []);
      setSuccess('Сохранено');
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось сохранить инсайт'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id || !article) return;

    const isPublished = article.status === InsightStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? 'Снять инсайт с публикации?'
        : 'Опубликовать инсайт? Он станет доступен в кабинете при любом тарифе (с учётом даты публикации).',
    );
    if (!confirmed) return;

    setIsPublishing(true);
    setError('');
    setSuccess('');

    try {
      const saved = await handleSave();
      if (!saved) return;

      const updated = isPublished
        ? await insightsApi.unpublish(id)
        : await insightsApi.publish(id);
      setArticle(updated);
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
      <section className={styles.insightEditPage}>
        <p className={styles.insightEditPage__subtitle}>Загрузка...</p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className={styles.insightEditPage}>
        <p className={styles.insightEditPage__error}>{error || 'Инсайт не найден'}</p>
        <Link to="/insights" className={styles.insightEditPage__back}>
          ← К инсайтам
        </Link>
      </section>
    );
  }

  const isPublished = article.status === InsightStatus.PUBLISHED;

  return (
    <section className={styles.insightEditPage}>
      <div className={styles.insightEditPage__top}>
        <button
          type="button"
          className={styles.insightEditPage__back}
          onClick={() => navigate('/insights')}
        >
          ← К инсайтам
        </button>
        <div className={styles.insightEditPage__actions}>
          <button
            type="button"
            className={`${styles.insightEditPage__btn} ${styles.insightEditPage__btn_warning}`}
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
            className={`${styles.insightEditPage__btn} ${styles.insightEditPage__btn_primary}`}
            onClick={() => void handleSave()}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <header>
        <h1 className={styles.insightEditPage__title}>
          Редактирование
          <span
            className={`${styles.insightEditPage__badge} ${
              isPublished
                ? styles.insightEditPage__badge_published
                : styles.insightEditPage__badge_draft
            }`}
          >
            {isPublished ? 'Опубликован' : 'Черновик'}
          </span>
        </h1>
        <p className={styles.insightEditPage__subtitle}>
          {article.title} · еженедельный инсайт
        </p>
      </header>

      {error ? <p className={styles.insightEditPage__error}>{error}</p> : null}
      {success ? <p className={styles.insightEditPage__success}>{success}</p> : null}

      <form
        className={styles.insightEditPage__card}
        onSubmit={(e) => void handleSave(e)}
      >
        <h2 className={styles.insightEditPage__sectionTitle}>Метаданные</h2>

        <label className={styles.insightEditPage__fieldLabel} htmlFor="title">
          Название
        </label>
        <input
          id="title"
          className={styles.insightEditPage__input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className={styles.insightEditPage__fieldLabel} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className={styles.insightEditPage__input}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <label className={styles.insightEditPage__fieldLabel} htmlFor="publishedAt">
          Дата публикации
        </label>
        <input
          id="publishedAt"
          type="date"
          className={styles.insightEditPage__input}
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />
        <p className={styles.insightEditPage__hint}>
          Инсайт появится в кабинете в этот день (по Москве), если статус
          „Опубликован“. Можно задать будущую дату.
        </p>
      </form>

      <div className={styles.insightEditPage__card}>
        <h2 className={styles.insightEditPage__sectionTitle}>Контент</h2>

        {renderAddBlockToolbar(styles.insightEditPage__toolbar)}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.insightEditPage__fileInput}
          onChange={(e) => void handleFileChange(e)}
        />

        <div className={styles.insightEditPage__blocks}>
          {blocks.length === 0 ? (
            <p className={styles.insightEditPage__empty}>
              Добавьте заголовок, абзац, список, цитату, ссылку или изображение
            </p>
          ) : null}

          {blocks.map((block, index) => (
            <article
              key={block.id}
              id={`editor-block-${block.id}`}
              className={styles.insightEditPage__block}
            >
              <div className={styles.insightEditPage__blockHeader}>
                <div className={styles.insightEditPage__blockTypeRow}>
                  <span className={styles.insightEditPage__blockType}>
                    {block.type === 'heading' && 'Заголовок'}
                    {block.type === 'subheading' && 'Подзаголовок'}
                    {block.type === 'paragraph' && 'Абзац'}
                    {block.type === 'list' && 'Список'}
                    {block.type === 'quote' && 'Цитата / callout'}
                    {block.type === 'link' && 'Ссылка'}
                    {block.type === 'image' && 'Изображение'}
                  </span>
                  {block.type === 'subheading' ? (
                    <label className={styles.insightEditPage__levelLabel}>
                      Уровень
                      <select
                        className={styles.insightEditPage__levelSelect}
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
                    <label className={styles.insightEditPage__levelLabel}>
                      Вид
                      <select
                        className={styles.insightEditPage__levelSelect}
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
                    <label className={styles.insightEditPage__levelLabel}>
                      Вид
                      <select
                        className={styles.insightEditPage__levelSelect}
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
                <div className={styles.insightEditPage__blockActions}>
                  <button
                    type="button"
                    className={styles.insightEditPage__blockBtn}
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    title="Выше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.insightEditPage__blockBtn}
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    title="Ниже"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.insightEditPage__blockBtn} ${styles.insightEditPage__blockBtn_danger}`}
                    onClick={() => removeBlock(block.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>

              {block.type === 'heading' ? (
                <input
                  className={styles.insightEditPage__headingInput}
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Заголовок раздела"
                />
              ) : null}

              {block.type === 'subheading' ? (
                <input
                  className={
                    (block.level ?? 3) === 2
                      ? styles.insightEditPage__subheadingH2Input
                      : styles.insightEditPage__subheadingInput
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
                    className={styles.insightEditPage__paragraphInput}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Текст абзаца. **жирный**, ссылки: [текст](https://...)"
                  />
                  <button
                    type="button"
                    className={styles.insightEditPage__btn}
                    onClick={() => insertLinkIntoParagraph(block.id)}
                  >
                    Вставить ссылку в текст
                  </button>
                  <p className={styles.insightEditPage__hint}>
                    Можно выделить фрагмент текста и нажать кнопку — или вписать вручную:
                    **жирный**, [текст](https://example.com)
                  </p>
                </>
              ) : null}

              {block.type === 'list' ? (
                <>
                  <label
                    className={styles.insightEditPage__fieldLabel}
                    htmlFor={`list-${block.id}`}
                  >
                    Пункты (по одному на строку)
                  </label>
                  <textarea
                    id={`list-${block.id}`}
                    className={styles.insightEditPage__paragraphInput}
                    value={block.items.join('\n')}
                    onChange={(e) =>
                      updateBlock(block.id, {
                        items: e.target.value.split('\n'),
                      })
                    }
                    placeholder={'Первый пункт\nВторой пункт'}
                  />
                  <p className={styles.insightEditPage__hint}>
                    В пунктах тоже работают **жирный** и [ссылка](url)
                  </p>
                </>
              ) : null}

              {block.type === 'quote' ? (
                <textarea
                  className={styles.insightEditPage__paragraphInput}
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
                    className={styles.insightEditPage__fieldLabel}
                    htmlFor={`link-text-${block.id}`}
                  >
                    Текст ссылки
                  </label>
                  <input
                    id={`link-text-${block.id}`}
                    className={styles.insightEditPage__input}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Подробнее"
                  />
                  <label
                    className={styles.insightEditPage__fieldLabel}
                    htmlFor={`link-url-${block.id}`}
                  >
                    URL
                  </label>
                  <input
                    id={`link-url-${block.id}`}
                    className={styles.insightEditPage__input}
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    placeholder="https://..."
                  />
                </>
              ) : null}

              {block.type === 'image' ? (
                <>
                  {block.url ? (
                    <img
                      className={styles.insightEditPage__imagePreview}
                      src={block.url}
                      alt={block.alt || 'Превью'}
                    />
                  ) : (
                    <div className={styles.insightEditPage__imageEmpty}>
                      {uploadingId === block.id
                        ? 'Загрузка...'
                        : 'Изображение ещё не загружено'}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.insightEditPage__btn}
                    onClick={() => startImageUpload(block.id)}
                    disabled={uploadingId === block.id}
                  >
                    {uploadingId === block.id
                      ? 'Загрузка...'
                      : block.url
                        ? 'Заменить изображение'
                        : 'Загрузить в MinIO'}
                  </button>

                  <label
                    className={styles.insightEditPage__fieldLabel}
                    htmlFor={`alt-${block.id}`}
                  >
                    Alt текст
                  </label>
                  <input
                    id={`alt-${block.id}`}
                    className={styles.insightEditPage__input}
                    value={block.alt}
                    onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                    placeholder="Описание изображения"
                  />
                  <label className={styles.insightEditPage__checkbox}>
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
          `${styles.insightEditPage__toolbar} ${styles.insightEditPage__toolbar_sticky}`,
        )}
      </div>
    </section>
  );
}

export default InsightEditPage;
