import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ticketsApi } from '@/api/tickets';
import type { Ticket, UpdateTicketPayload } from '@/types/ticket';
import { TicketSource, TicketStatus } from '@/types/ticket';
import styles from './TicketsPage.module.scss';

type StatusFilter = TicketStatus | 'all';

const statusLabels: Record<TicketStatus, string> = {
  new: 'Новое',
  in_progress: 'В работе',
  closed: 'Закрыто',
};

const sourceLabels: Record<TicketSource, string> = {
  home: 'Главная',
  support: 'Поддержка',
  cabinet: 'Кабинет',
  other: 'Другое',
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

function statusBadgeClass(status: TicketStatus) {
  if (status === TicketStatus.NEW) return styles.ticketsPage__badge_new;
  if (status === TicketStatus.IN_PROGRESS) return styles.ticketsPage__badge_progress;
  return styles.ticketsPage__badge_closed;
}

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState<UpdateTicketPayload>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await ticketsApi.getAll();
      setTickets(data);
    } catch {
      setListError('Не удалось загрузить обращения');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSaveError('');
    setForm({
      status: ticket.status,
      adminNote: ticket.adminNote ?? '',
    });
  };

  const closeDrawer = () => {
    setSelectedTicket(null);
    setSaveError('');
  };

  const updateTicketInList = (updated: Ticket) => {
    setTickets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedTicket((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const payload: UpdateTicketPayload = {
        status: form.status,
        adminNote: form.adminNote?.toString().trim() || null,
      };
      const updated = await ticketsApi.update(selectedTicket.id, payload);
      updateTicketInList(updated);
      setForm({
        status: updated.status,
        adminNote: updated.adminNote ?? '',
      });
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Не удалось сохранить изменения'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ticket: Ticket) => {
    const confirmed = window.confirm(
      `Удалить обращение от ${ticket.name}?\nЭто действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setActionId(ticket.id);
    setListError('');

    try {
      await ticketsApi.remove(ticket.id);
      setTickets((prev) => prev.filter((item) => item.id !== ticket.id));
      if (selectedTicket?.id === ticket.id) {
        closeDrawer();
      }
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить обращение'));
    } finally {
      setActionId(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: tickets.length,
      new: tickets.filter((t) => t.status === TicketStatus.NEW).length,
      in_progress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
      closed: tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
    }),
    [tickets],
  );

  return (
    <section className={styles.ticketsPage}>
      <header className={styles.ticketsPage__header}>
        <div>
          <h1 className={styles.ticketsPage__title}>Обращения</h1>
          <p className={styles.ticketsPage__subtitle}>
            {isLoading ? 'Загрузка...' : `${tickets.length} обращений`}
          </p>
        </div>

        <div className={styles.ticketsPage__filters}>
          {(
            [
              ['all', `Все (${counts.all})`],
              [TicketStatus.NEW, `Новые (${counts.new})`],
              [TicketStatus.IN_PROGRESS, `В работе (${counts.in_progress})`],
              [TicketStatus.CLOSED, `Закрытые (${counts.closed})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${styles.ticketsPage__filterBtn} ${
                statusFilter === value ? styles.ticketsPage__filterBtn_active : ''
              }`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {listError ? <p className={styles.ticketsPage__error}>{listError}</p> : null}

      <div className={styles.ticketsPage__tableCard}>
        <table className={styles.ticketsPage__table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Сообщение</th>
              <th>Источник</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.ticketsPage__empty}>
                  Обращений пока нет
                </td>
              </tr>
            ) : null}

            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{formatDate(ticket.createdAt)}</td>
                <td>{ticket.name}</td>
                <td>{ticket.phone}</td>
                <td>
                  <span className={styles.ticketsPage__messagePreview}>{ticket.message}</span>
                </td>
                <td>
                  <span className={`${styles.ticketsPage__badge} ${styles.ticketsPage__badge_source}`}>
                    {sourceLabels[ticket.source]}
                  </span>
                </td>
                <td>
                  <span className={`${styles.ticketsPage__badge} ${statusBadgeClass(ticket.status)}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </td>
                <td>
                  <div className={styles.ticketsPage__actions}>
                    <button
                      type="button"
                      className={`${styles.ticketsPage__actionBtn} ${styles.ticketsPage__actionBtn_primary}`}
                      onClick={() => openTicket(ticket)}
                    >
                      Открыть
                    </button>
                    <button
                      type="button"
                      className={`${styles.ticketsPage__actionBtn} ${styles.ticketsPage__actionBtn_danger}`}
                      onClick={() => void handleDelete(ticket)}
                      disabled={actionId === ticket.id}
                    >
                      {actionId === ticket.id ? '...' : 'Удалить'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket ? (
        <>
          <button
            type="button"
            className={styles.ticketsPage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.ticketsPage__drawer}>
            <div className={styles.ticketsPage__drawerHeader}>
              <h2 className={styles.ticketsPage__drawerTitle}>Обращение</h2>
              <button type="button" className={styles.ticketsPage__close} onClick={closeDrawer}>
                ×
              </button>
            </div>

            <div className={styles.ticketsPage__drawerBody}>
              <div className={styles.ticketsPage__fields}>
                <div className={styles.ticketsPage__field}>
                  <span className={styles.ticketsPage__fieldLabel}>Дата</span>
                  <p className={styles.ticketsPage__fieldValue}>
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <div className={styles.ticketsPage__field}>
                  <span className={styles.ticketsPage__fieldLabel}>Имя</span>
                  <p className={styles.ticketsPage__fieldValue}>{selectedTicket.name}</p>
                </div>
                <div className={styles.ticketsPage__field}>
                  <span className={styles.ticketsPage__fieldLabel}>Телефон</span>
                  <p className={styles.ticketsPage__fieldValue}>{selectedTicket.phone}</p>
                </div>
                <div className={styles.ticketsPage__field}>
                  <span className={styles.ticketsPage__fieldLabel}>Источник</span>
                  <p className={styles.ticketsPage__fieldValue}>
                    {sourceLabels[selectedTicket.source]}
                  </p>
                </div>
                <div className={styles.ticketsPage__field}>
                  <span className={styles.ticketsPage__fieldLabel}>Сообщение</span>
                  <p className={styles.ticketsPage__fieldValue}>{selectedTicket.message}</p>
                </div>
              </div>

              <form className={styles.ticketsPage__form} onSubmit={(e) => void handleSave(e)}>
                <label className={styles.ticketsPage__fieldLabel} htmlFor="status">
                  Статус
                </label>
                <select
                  id="status"
                  className={styles.ticketsPage__input}
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as TicketStatus,
                    }))
                  }
                >
                  <option value={TicketStatus.NEW}>Новое</option>
                  <option value={TicketStatus.IN_PROGRESS}>В работе</option>
                  <option value={TicketStatus.CLOSED}>Закрыто</option>
                </select>

                <label className={styles.ticketsPage__fieldLabel} htmlFor="adminNote">
                  Заметка администратора
                </label>
                <textarea
                  id="adminNote"
                  className={styles.ticketsPage__textarea}
                  value={form.adminNote?.toString() ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, adminNote: e.target.value }))}
                  placeholder="Комментарий по обращению"
                />

                {saveError ? <p className={styles.ticketsPage__error}>{saveError}</p> : null}

                <button
                  type="submit"
                  className={`${styles.ticketsPage__actionBtn} ${styles.ticketsPage__actionBtn_primary}`}
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </form>
            </div>

            <div className={styles.ticketsPage__drawerFooter}>
              <button
                type="button"
                className={`${styles.ticketsPage__actionBtn} ${styles.ticketsPage__actionBtn_danger}`}
                onClick={() => void handleDelete(selectedTicket)}
                disabled={actionId === selectedTicket.id}
              >
                Удалить
              </button>
              <button type="button" className={styles.ticketsPage__actionBtn} onClick={closeDrawer}>
                Закрыть
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </section>
  );
}

export default TicketsPage;
