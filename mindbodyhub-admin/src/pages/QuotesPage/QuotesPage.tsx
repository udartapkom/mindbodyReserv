import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { quotesApi } from '@/api/quotes';
import type { Quote } from '@/types/quote';
import { QuoteStatus } from '@/types/quote';
import { formatDate, getErrorMessage } from '@/utils/adminHelpers';
import styles from './QuotesPage.module.scss';

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

function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedAt, setPublishedAt] = useState(() =>
    toDateInputValue(new Date().toISOString()),
  );
  const [publishNow, setPublishNow] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [editing, setEditing] = useState<Quote | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editPublishedAt, setEditPublishedAt] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadQuotes = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await quotesApi.getAll();
      setQuotes(data);
    } catch {
      setListError('Не удалось загрузить цитаты');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQuotes();
  }, []);

  const updateInList = (updated: Quote) => {
    setQuotes((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setEditing((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;

    setIsCreating(true);
    setListError('');
    try {
      const created = await quotesApi.create({
        body: body.trim(),
        author: author.trim() || null,
        publishedAt: fromDateInputValue(publishedAt),
        publish: publishNow,
      });
      setQuotes((prev) => [created, ...prev]);
      setBody('');
      setAuthor('');
      setPublishedAt(toDateInputValue(new Date().toISOString()));
      setPublishNow(true);
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось создать цитату'));
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (quote: Quote) => {
    setEditing(quote);
    setEditBody(quote.body);
    setEditAuthor(quote.author ?? '');
    setEditPublishedAt(toDateInputValue(quote.publishedAt));
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || !editBody.trim()) return;

    setIsSavingEdit(true);
    setListError('');
    try {
      const updated = await quotesApi.update(editing.id, {
        body: editBody.trim(),
        author: editAuthor.trim() || null,
        publishedAt: fromDateInputValue(editPublishedAt),
      });
      updateInList(updated);
      closeEdit();
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось сохранить цитату'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleTogglePublish = async (quote: Quote) => {
    const isPublished = quote.status === QuoteStatus.PUBLISHED;
    const confirmed = window.confirm(
      isPublished ? 'Снять цитату с публикации?' : 'Опубликовать цитату?',
    );
    if (!confirmed) return;

    setActionId(quote.id);
    setListError('');
    try {
      const updated = isPublished
        ? await quotesApi.unpublish(quote.id)
        : await quotesApi.publish(quote.id);
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

  const handleDelete = async (quote: Quote) => {
    const confirmed = window.confirm('Удалить цитату безвозвратно?');
    if (!confirmed) return;

    setActionId(quote.id);
    setListError('');
    try {
      await quotesApi.remove(quote.id);
      setQuotes((prev) => prev.filter((item) => item.id !== quote.id));
      if (editing?.id === quote.id) closeEdit();
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить цитату'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className={styles.quotesPage}>
      <header className={styles.quotesPage__header}>
        <div>
          <h1 className={styles.quotesPage__title}>Цитаты</h1>
          <p className={styles.quotesPage__subtitle}>
            Ежедневные цитаты для кабинета (доступ на платных тарифах)
          </p>
        </div>
      </header>

      {listError ? <p className={styles.quotesPage__error}>{listError}</p> : null}

      <form className={styles.quotesPage__form} onSubmit={handleCreate}>
        <h2 className={styles.quotesPage__formTitle}>Новая цитата</h2>
        <label className={styles.quotesPage__label}>
          Текст
          <textarea
            className={styles.quotesPage__textarea}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            required
            maxLength={4000}
            placeholder="Текст цитаты"
          />
        </label>
        <div className={styles.quotesPage__row}>
          <label className={styles.quotesPage__label}>
            Автор
            <input
              className={styles.quotesPage__input}
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={255}
              placeholder="Необязательно"
            />
          </label>
          <label className={styles.quotesPage__label}>
            Дата
            <input
              className={styles.quotesPage__input}
              type="date"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
            />
          </label>
        </div>
        <label className={styles.quotesPage__checkbox}>
          <input
            type="checkbox"
            checked={publishNow}
            onChange={(event) => setPublishNow(event.target.checked)}
          />
          Опубликовать сразу
        </label>
        <button
          type="submit"
          className={styles.quotesPage__primaryBtn}
          disabled={isCreating || !body.trim()}
        >
          {isCreating ? 'Сохранение…' : 'Добавить'}
        </button>
      </form>

      {editing ? (
        <form className={styles.quotesPage__form} onSubmit={handleSaveEdit}>
          <div className={styles.quotesPage__formHeader}>
            <h2 className={styles.quotesPage__formTitle}>Редактирование</h2>
            <button
              type="button"
              className={styles.quotesPage__linkBtn}
              onClick={closeEdit}
            >
              Закрыть
            </button>
          </div>
          <label className={styles.quotesPage__label}>
            Текст
            <textarea
              className={styles.quotesPage__textarea}
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              rows={4}
              required
              maxLength={4000}
            />
          </label>
          <div className={styles.quotesPage__row}>
            <label className={styles.quotesPage__label}>
              Автор
              <input
                className={styles.quotesPage__input}
                value={editAuthor}
                onChange={(event) => setEditAuthor(event.target.value)}
                maxLength={255}
              />
            </label>
            <label className={styles.quotesPage__label}>
              Дата
              <input
                className={styles.quotesPage__input}
                type="date"
                value={editPublishedAt}
                onChange={(event) => setEditPublishedAt(event.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className={styles.quotesPage__primaryBtn}
            disabled={isSavingEdit || !editBody.trim()}
          >
            {isSavingEdit ? 'Сохранение…' : 'Сохранить'}
          </button>
        </form>
      ) : null}

      <div className={styles.quotesPage__tableCard}>
        <table className={styles.quotesPage__table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Цитата</th>
              <th>Автор</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className={styles.quotesPage__empty}>
                  Загрузка…
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.quotesPage__empty}>
                  Пока нет цитат
                </td>
              </tr>
            ) : (
              quotes.map((quote) => {
                const isPublished = quote.status === QuoteStatus.PUBLISHED;
                const busy = actionId === quote.id;
                return (
                  <tr key={quote.id}>
                    <td>{formatDate(quote.publishedAt)}</td>
                    <td className={styles.quotesPage__bodyCell}>
                      <span className={styles.quotesPage__bodyPreview}>
                        {quote.body}
                      </span>
                    </td>
                    <td>{quote.author || '—'}</td>
                    <td>
                      <span
                        className={
                          isPublished
                            ? styles.quotesPage__badge_published
                            : styles.quotesPage__badge_draft
                        }
                      >
                        {isPublished ? 'Опубликована' : 'Черновик'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.quotesPage__actions}>
                        <button
                          type="button"
                          className={styles.quotesPage__linkBtn}
                          onClick={() => openEdit(quote)}
                          disabled={busy}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className={styles.quotesPage__linkBtn}
                          onClick={() => void handleTogglePublish(quote)}
                          disabled={busy}
                        >
                          {isPublished ? 'Снять' : 'Опубликовать'}
                        </button>
                        <button
                          type="button"
                          className={styles.quotesPage__dangerBtn}
                          onClick={() => void handleDelete(quote)}
                          disabled={busy}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default QuotesPage;
