import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { knowledgeApi } from '@/api/knowledge';
import type { KnowledgeArticle, KnowledgeBlock } from '@/types/knowledge';
import { KnowledgeStatus } from '@/types/knowledge';
import { createBlockId, getErrorMessage } from '@/utils/adminHelpers';
import styles from './KnowledgeEditPage.module.scss';

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

function KnowledgeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdRef = useRef<string | null>(null);
  const paragraphRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [showMetadata, setShowMetadata] = useState(true);
  const [coverUrl, setCoverUrl] = useState('');
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await knowledgeApi.getById(id);
        setArticle(data);
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary ?? '');
        setShowMetadata(data.showMetadata !== false);
        setCoverUrl(data.coverUrl ?? '');
        setBlocks(data.blocks ?? []);
      } catch (err) {
        setError(getErrorMessage(err, 'Не удалось загрузить статью'));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const addBlock = (type: KnowledgeBlock['type']) => {
    const blockId = createBlockId();

    if (type === 'image') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'image', key: '', url: '', alt: '', showAlt: true },
      ]);
      return;
    }

    if (type === 'link') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'link', text: '', url: '' },
      ]);
      return;
    }

    if (type === 'subheading') {
      setBlocks((prev) => [
        ...prev,
        { id: blockId, type: 'subheading', text: '', level: 3 },
      ]);
      return;
    }

    setBlocks((prev) => [...prev, { id: blockId, type, text: '' }]);
  };

  const updateBlock = (blockId: string, patch: Partial<KnowledgeBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return { ...block, ...patch } as KnowledgeBlock;
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
      const uploaded = await knowledgeApi.uploadImage(file);
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
      const uploaded = await knowledgeApi.uploadImage(file);
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
      const updated = await knowledgeApi.update(id, {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || null,
        coverUrl: coverUrl.trim() || null,
        showMetadata,
        blocks,
      });
      setArticle(updated);
      setTitle(updated.title);
      setSlug(updated.slug);
      setSummary(updated.summary ?? '');
      setShowMetadata(updated.showMetadata !== false);
      setCoverUrl(updated.coverUrl ?? '');
      setBlocks(updated.blocks ?? []);
      setSuccess('Сохранено');
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось сохранить статью'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id || !article) return;

    const isPublished = article.status === KnowledgeStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished
        ? 'Снять статью с публикации?'
        : 'Опубликовать статью? Она станет доступна всем на сайте.',
    );
    if (!confirmed) return;

    setIsPublishing(true);
    setError('');
    setSuccess('');

    try {
      const saved = await handleSave();
      if (!saved) return;

      const updated = isPublished
        ? await knowledgeApi.unpublish(id)
        : await knowledgeApi.publish(id);
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
      <section className={styles.knowledgeEditPage}>
        <p className={styles.knowledgeEditPage__subtitle}>Загрузка...</p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className={styles.knowledgeEditPage}>
        <p className={styles.knowledgeEditPage__error}>{error || 'Статья не найдена'}</p>
        <Link to="/knowledge" className={styles.knowledgeEditPage__back}>
          ← К базе знаний
        </Link>
      </section>
    );
  }

  const isPublished = article.status === KnowledgeStatus.PUBLISHED;

  return (
    <section className={styles.knowledgeEditPage}>
      <div className={styles.knowledgeEditPage__top}>
        <button
          type="button"
          className={styles.knowledgeEditPage__back}
          onClick={() => navigate('/knowledge')}
        >
          ← К базе знаний
        </button>
        <div className={styles.knowledgeEditPage__actions}>
          <button
            type="button"
            className={`${styles.knowledgeEditPage__btn} ${styles.knowledgeEditPage__btn_warning}`}
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
            className={`${styles.knowledgeEditPage__btn} ${styles.knowledgeEditPage__btn_primary}`}
            onClick={() => void handleSave()}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <header>
        <h1 className={styles.knowledgeEditPage__title}>
          Редактирование
          <span
            className={`${styles.knowledgeEditPage__badge} ${
              isPublished
                ? styles.knowledgeEditPage__badge_published
                : styles.knowledgeEditPage__badge_draft
            }`}
          >
            {isPublished ? 'Опубликована' : 'Черновик'}
          </span>
        </h1>
        <p className={styles.knowledgeEditPage__subtitle}>
          {article.title} · общедоступная статья
        </p>
      </header>

      {error ? <p className={styles.knowledgeEditPage__error}>{error}</p> : null}
      {success ? <p className={styles.knowledgeEditPage__success}>{success}</p> : null}

      <form
        className={styles.knowledgeEditPage__card}
        onSubmit={(e) => void handleSave(e)}
      >
        <h2 className={styles.knowledgeEditPage__sectionTitle}>Метаданные</h2>

        <label className={styles.knowledgeEditPage__fieldLabel} htmlFor="title">
          Название
        </label>
        <input
          id="title"
          className={styles.knowledgeEditPage__input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className={styles.knowledgeEditPage__fieldLabel} htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className={styles.knowledgeEditPage__input}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <label className={styles.knowledgeEditPage__fieldLabel} htmlFor="summary">
          Краткое описание
        </label>
        <textarea
          id="summary"
          className={styles.knowledgeEditPage__textarea}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <label className={styles.knowledgeEditPage__checkbox}>
          <input
            type="checkbox"
            checked={showMetadata}
            onChange={(e) => setShowMetadata(e.target.checked)}
          />
          Показывать метаданные на странице статьи
        </label>
        <p className={styles.knowledgeEditPage__hint}>
          Метка «Инструкция» и краткое описание. Заголовок и обложка всегда
          остаются.
        </p>

        <span className={styles.knowledgeEditPage__fieldLabel}>
          Обложка (превью в списке)
        </span>
        {coverUrl ? (
          <img
            className={styles.knowledgeEditPage__imagePreview}
            src={coverUrl}
            alt="Обложка"
          />
        ) : (
          <div className={styles.knowledgeEditPage__imageEmpty}>Обложка не задана</div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.knowledgeEditPage__fileInput}
          onChange={(e) => void handleCoverUpload(e)}
        />
        <div className={styles.knowledgeEditPage__toolbar}>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
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
              className={`${styles.knowledgeEditPage__btn} ${styles.knowledgeEditPage__btn_danger}`}
              onClick={() => setCoverUrl('')}
            >
              Убрать обложку
            </button>
          ) : null}
        </div>
      </form>

      <div className={styles.knowledgeEditPage__card}>
        <h2 className={styles.knowledgeEditPage__sectionTitle}>Контент</h2>

        <div className={styles.knowledgeEditPage__toolbar}>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
            onClick={() => addBlock('heading')}
          >
            + Заголовок
          </button>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
            onClick={() => addBlock('subheading')}
          >
            + Подзаголовок
          </button>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
            onClick={() => addBlock('paragraph')}
          >
            + Абзац
          </button>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
            onClick={() => addBlock('link')}
          >
            + Ссылка
          </button>
          <button
            type="button"
            className={styles.knowledgeEditPage__btn}
            onClick={() => addBlock('image')}
          >
            + Изображение
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.knowledgeEditPage__fileInput}
          onChange={(e) => void handleFileChange(e)}
        />

        <div className={styles.knowledgeEditPage__blocks}>
          {blocks.length === 0 ? (
            <p className={styles.knowledgeEditPage__empty}>
              Добавьте заголовок, абзац, ссылку или изображение
            </p>
          ) : null}

          {blocks.map((block, index) => (
            <article key={block.id} className={styles.knowledgeEditPage__block}>
              <div className={styles.knowledgeEditPage__blockHeader}>
                <div className={styles.knowledgeEditPage__blockTypeRow}>
                  <span className={styles.knowledgeEditPage__blockType}>
                    {block.type === 'heading' && 'Заголовок'}
                    {block.type === 'subheading' && 'Подзаголовок'}
                    {block.type === 'paragraph' && 'Абзац'}
                    {block.type === 'link' && 'Ссылка'}
                    {block.type === 'image' && 'Изображение'}
                  </span>
                  {block.type === 'subheading' ? (
                    <label className={styles.knowledgeEditPage__levelLabel}>
                      Уровень
                      <select
                        className={styles.knowledgeEditPage__levelSelect}
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
                </div>
                <div className={styles.knowledgeEditPage__blockActions}>
                  <button
                    type="button"
                    className={styles.knowledgeEditPage__blockBtn}
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    title="Выше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.knowledgeEditPage__blockBtn}
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    title="Ниже"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.knowledgeEditPage__blockBtn} ${styles.knowledgeEditPage__blockBtn_danger}`}
                    onClick={() => removeBlock(block.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>

              {block.type === 'heading' ? (
                <input
                  className={styles.knowledgeEditPage__headingInput}
                  value={block.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  placeholder="Заголовок раздела"
                />
              ) : null}

              {block.type === 'subheading' ? (
                <input
                  className={
                    (block.level ?? 3) === 2
                      ? styles.knowledgeEditPage__subheadingH2Input
                      : styles.knowledgeEditPage__subheadingInput
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
                    className={styles.knowledgeEditPage__paragraphInput}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Текст абзаца. Ссылки: [текст](https://...)"
                  />
                  <button
                    type="button"
                    className={styles.knowledgeEditPage__btn}
                    onClick={() => insertLinkIntoParagraph(block.id)}
                  >
                    Вставить ссылку в текст
                  </button>
                  <p className={styles.knowledgeEditPage__hint}>
                    Можно выделить фрагмент текста и нажать кнопку — или вписать вручную
                    в формате [текст](https://example.com)
                  </p>
                </>
              ) : null}

              {block.type === 'link' ? (
                <>
                  <label
                    className={styles.knowledgeEditPage__fieldLabel}
                    htmlFor={`link-text-${block.id}`}
                  >
                    Текст ссылки
                  </label>
                  <input
                    id={`link-text-${block.id}`}
                    className={styles.knowledgeEditPage__input}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Подробнее"
                  />
                  <label
                    className={styles.knowledgeEditPage__fieldLabel}
                    htmlFor={`link-url-${block.id}`}
                  >
                    URL
                  </label>
                  <input
                    id={`link-url-${block.id}`}
                    className={styles.knowledgeEditPage__input}
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
                      className={styles.knowledgeEditPage__imagePreview}
                      src={block.url}
                      alt={block.alt || 'Превью'}
                    />
                  ) : (
                    <div className={styles.knowledgeEditPage__imageEmpty}>
                      {uploadingId === block.id
                        ? 'Загрузка...'
                        : 'Изображение ещё не загружено'}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.knowledgeEditPage__btn}
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
                    className={styles.knowledgeEditPage__fieldLabel}
                    htmlFor={`alt-${block.id}`}
                  >
                    Alt текст
                  </label>
                  <input
                    id={`alt-${block.id}`}
                    className={styles.knowledgeEditPage__input}
                    value={block.alt}
                    onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                    placeholder="Описание изображения"
                  />
                  <label className={styles.knowledgeEditPage__checkbox}>
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
      </div>
    </section>
  );
}

export default KnowledgeEditPage;
