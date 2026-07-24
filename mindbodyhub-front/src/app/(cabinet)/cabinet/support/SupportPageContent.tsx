'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { tickets, type TicketResponse } from '@/api/api';
import styles from './page.module.scss';

const POLL_INTERVAL_MS = 12_000;

const statusLabels: Record<string, string> = {
  new: 'Новое',
  in_progress: 'В работе',
  closed: 'Закрыто',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

function threadFingerprint(ticket: TicketResponse | null) {
  if (!ticket) return '';
  const messages = ticket.messages ?? [];
  return `${ticket.status}:${ticket.updatedAt ?? ''}:${messages.length}:${messages.at(-1)?.id ?? ''}`;
}

function SupportPageContent() {
  const [list, setList] = useState<TicketResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TicketResponse | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [listError, setListError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const selectedFingerprintRef = useRef('');

  selectedIdRef.current = selectedId;

  const lastMessageId = selected?.messages?.at(-1)?.id ?? null;
  const messagesCount = selected?.messages?.length ?? 0;

  const scrollMessagesToEnd = useCallback((smooth = false) => {
    const end = messagesEndRef.current;
    if (end) {
      end.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
      return;
    }
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!selectedId || isLoadingThread || !messagesCount) return;
    const frame = window.requestAnimationFrame(() => {
      scrollMessagesToEnd(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [
    selectedId,
    lastMessageId,
    messagesCount,
    isLoadingThread,
    scrollMessagesToEnd,
  ]);

  const loadList = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setIsLoadingList(true);
      setListError('');
    }
    try {
      const data = await tickets.getMine();
      setList(data);
    } catch (error) {
      if (!opts?.silent) {
        setListError(getErrorMessage(error, 'Не удалось загрузить обращения'));
      }
    } finally {
      if (!opts?.silent) {
        setIsLoadingList(false);
      }
    }
  }, []);

  const refreshThread = useCallback(async (id: string, opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setIsLoadingThread(true);
      setThreadError('');
    }
    try {
      const data = await tickets.getMineById(id);
      if (selectedIdRef.current !== id) return;

      const nextFingerprint = threadFingerprint(data);
      selectedFingerprintRef.current = nextFingerprint;
      setSelected(data);
    } catch (error) {
      if (!opts?.silent && selectedIdRef.current === id) {
        setThreadError(getErrorMessage(error, 'Не удалось открыть переписку'));
        setSelected(null);
      }
    } finally {
      if (!opts?.silent && selectedIdRef.current === id) {
        setIsLoadingThread(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    const poll = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadList({ silent: true });
      const id = selectedIdRef.current;
      if (id && !showNewForm) {
        void refreshThread(id, { silent: true });
      }
    };

    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        poll();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadList, refreshThread, showNewForm]);

  const openTicket = async (id: string) => {
    setSelectedId(id);
    setShowNewForm(false);
    setReplyBody('');
    selectedFingerprintRef.current = '';
    await refreshThread(id);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;

    setIsCreating(true);
    setListError('');
    try {
      const created = await tickets.createMine(newMessage.trim());
      setNewMessage('');
      setShowNewForm(false);
      await loadList();
      await openTicket(created.id);
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось создать обращение'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !replyBody.trim()) return;

    setIsSending(true);
    setThreadError('');
    try {
      await tickets.sendMineMessage(selectedId, replyBody.trim());
      setReplyBody('');
      await refreshThread(selectedId, { silent: true });
      await loadList({ silent: true });
    } catch (error) {
      setThreadError(getErrorMessage(error, 'Не удалось отправить сообщение'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={styles.support}>
      <header className={styles.support__header}>
        <div>
          <h1 className={styles.support__title}>Поддержка</h1>
          <p className={styles.support__subtitle}>
            Переписка с техподдержкой. Новые ответы подгружаются автоматически.
          </p>
        </div>
        <button
          type="button"
          className={styles.support__primaryBtn}
          onClick={() => {
            setShowNewForm(true);
            setSelectedId(null);
            setSelected(null);
            selectedFingerprintRef.current = '';
          }}
        >
          Новое обращение
        </button>
      </header>

      {listError ? <p className={styles.support__error}>{listError}</p> : null}

      <div className={styles.support__layout}>
        <aside className={styles.support__list}>
          {isLoadingList ? (
            <p className={styles.support__hint}>Загрузка…</p>
          ) : list.length === 0 ? (
            <p className={styles.support__hint}>
              Обращений пока нет. Создайте первое — ответим в этом разделе.
            </p>
          ) : (
            list.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                className={`${styles.support__listItem} ${
                  selectedId === ticket.id ? styles.support__listItem_active : ''
                }`}
                onClick={() => void openTicket(ticket.id)}
              >
                <span className={styles.support__listPreview}>
                  {ticket.message.length > 80
                    ? `${ticket.message.slice(0, 80)}…`
                    : ticket.message}
                </span>
                <span className={styles.support__listMeta}>
                  <span
                    className={`${styles.support__badge} ${
                      styles[`support__badge_${ticket.status}`] ?? ''
                    }`}
                  >
                    {statusLabels[ticket.status] ?? ticket.status}
                  </span>
                  <span>{formatDate(ticket.updatedAt ?? ticket.createdAt)}</span>
                </span>
              </button>
            ))
          )}
        </aside>

        <div className={styles.support__thread}>
          {showNewForm ? (
            <form className={styles.support__compose} onSubmit={(e) => void handleCreate(e)}>
              <h2 className={styles.support__threadTitle}>Новое обращение</h2>
              <textarea
                className={styles.support__textarea}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Опишите вопрос или проблему"
                rows={6}
                required
              />
              <button
                type="submit"
                className={styles.support__primaryBtn}
                disabled={isCreating || !newMessage.trim()}
              >
                {isCreating ? 'Отправка…' : 'Отправить'}
              </button>
            </form>
          ) : null}

          {!showNewForm && !selectedId ? (
            <p className={styles.support__hint}>
              Выберите обращение слева или создайте новое.
            </p>
          ) : null}

          {!showNewForm && selectedId ? (
            <>
              {isLoadingThread ? (
                <p className={styles.support__hint}>Загрузка переписки…</p>
              ) : selected ? (
                <>
                  <div className={styles.support__threadHeader}>
                    <h2 className={styles.support__threadTitle}>Переписка</h2>
                    <span
                      className={`${styles.support__badge} ${
                        styles[`support__badge_${selected.status}`] ?? ''
                      }`}
                    >
                      {statusLabels[selected.status] ?? selected.status}
                    </span>
                  </div>

                  <div className={styles.support__messages} ref={messagesRef}>
                    {(selected.messages ?? []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`${styles.support__bubble} ${
                          msg.authorType === 'admin'
                            ? styles.support__bubble_admin
                            : styles.support__bubble_user
                        }`}
                      >
                        <div className={styles.support__bubbleMeta}>
                          {msg.authorType === 'admin' ? 'Поддержка' : 'Вы'} ·{' '}
                          {formatDate(msg.createdAt)}
                        </div>
                        <p className={styles.support__bubbleBody}>{msg.body}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} aria-hidden />
                  </div>

                  {threadError ? (
                    <p className={styles.support__error}>{threadError}</p>
                  ) : null}

                  <form
                    className={styles.support__compose}
                    onSubmit={(e) => void handleReply(e)}
                  >
                    <textarea
                      className={styles.support__textarea}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Ваше сообщение"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.support__primaryBtn}
                      disabled={isSending || !replyBody.trim()}
                    >
                      {isSending ? 'Отправка…' : 'Отправить'}
                    </button>
                  </form>
                </>
              ) : (
                <p className={styles.support__error}>
                  {threadError || 'Не удалось открыть обращение'}
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SupportPageContent;
