import { useEffect, useMemo, useState } from 'react';
import { paymentsApi } from '@/api/payments';
import { usersApi } from '@/api/users';
import type { Payment } from '@/types/payment';
import { PaymentStatus } from '@/types/payment';
import type { User } from '@/types/user';
import styles from './PaymentsPage.module.scss';

type StatusFilter = PaymentStatus | 'all';

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  canceled: 'Отменён',
  failed: 'Ошибка',
  chargeback: 'Chargeback',
};

const tariffLabels: Record<string, string> = {
  trial: 'Пробный',
  popular: 'Популярный',
  vip: 'VIP',
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
}

function statusBadgeClass(status: PaymentStatus) {
  if (status === PaymentStatus.PENDING) return styles.paymentsPage__badge_pending;
  if (status === PaymentStatus.PAID) return styles.paymentsPage__badge_paid;
  if (status === PaymentStatus.CHARGEBACK) return styles.paymentsPage__badge_chargeback;
  if (status === PaymentStatus.FAILED) return styles.paymentsPage__badge_failed;
  return styles.paymentsPage__badge_canceled;
}

function getUserLabel(usersById: Map<string, User>, userId: string) {
  const user = usersById.get(userId);
  if (!user) return userId;
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name ? `${name} (${user.phone})` : user.phone;
}

function getUserPhone(usersById: Map<string, User>, userId: string) {
  return usersById.get(userId)?.phone ?? '';
}

function getUserName(usersById: Map<string, User>, userId: string) {
  const user = usersById.get(userId);
  if (!user) return '';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

function startOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function endOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999`);
}

function inDateRange(
  iso: string,
  from: string,
  to: string,
): boolean {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  if (from) {
    const fromTime = startOfDay(from).getTime();
    if (time < fromTime) return false;
  }
  if (to) {
    const toTime = endOfDay(to).getTime();
    if (time > toTime) return false;
  }
  return true;
}

function csvEscape(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const body = rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [usersById, setUsersById] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState('');
  const [actionError, setActionError] = useState('');

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
    return fallback;
  };
  const loadData = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const [paymentsData, usersData] = await Promise.all([
        paymentsApi.getAll(),
        usersApi.getAll(),
      ]);
      setPayments(paymentsData);
      setUsersById(new Map(usersData.map((user) => [user.id, user])));
    } catch {
      setListError('Не удалось загрузить платежи');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSync = async (payment: Payment) => {
    setSyncingId(payment.id);
    setSyncError('');
    setActionError('');
    try {
      const updated = await paymentsApi.sync(payment.id);
      setPayments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected(updated);
    } catch (error) {
      setSyncError(getErrorMessage(error, 'Не удалось сверить статус с Platega'));
    } finally {
      setSyncingId(null);
    }
  };

  const handleRefund = async (payment: Payment) => {
    const confirmed = window.confirm(
      `Оформить возврат платежа ${formatAmount(payment.amount, payment.currency)}?\n\n` +
        'Средства вернутся плательщику через Platega. Если у пользователя всё ещё этот тариф — доступ сбросится в free.',
    );
    if (!confirmed) return;

    setRefundingId(payment.id);
    setActionError('');
    setSyncError('');
    try {
      const updated = await paymentsApi.refund(payment.id);
      setPayments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected(updated);
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'Не удалось оформить возврат через Platega'),
      );
    } finally {
      setRefundingId(null);
    }
  };

  const canSync = (payment: Payment) =>
    Boolean(payment.providerTransactionId) &&
    (payment.status === PaymentStatus.PENDING ||
      payment.status === PaymentStatus.FAILED ||
      payment.status === PaymentStatus.PAID);

  const canRefund = (payment: Payment) =>
    payment.status === PaymentStatus.PAID &&
    Boolean(payment.providerTransactionId);
  const dated = useMemo(() => {
    if (!dateFrom && !dateTo) return payments;
    return payments.filter((payment) =>
      inDateRange(payment.createdAt, dateFrom, dateTo),
    );
  }, [payments, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return dated;
    return dated.filter((payment) => payment.status === statusFilter);
  }, [dated, statusFilter]);

  const counts = useMemo(
    () => ({
      all: dated.length,
      pending: dated.filter((p) => p.status === PaymentStatus.PENDING).length,
      paid: dated.filter((p) => p.status === PaymentStatus.PAID).length,
      canceled: dated.filter((p) => p.status === PaymentStatus.CANCELED).length,
      failed: dated.filter((p) => p.status === PaymentStatus.FAILED).length,
      chargeback: dated.filter((p) => p.status === PaymentStatus.CHARGEBACK)
        .length,
    }),
    [dated],
  );

  const sums = useMemo(() => {
    const byStatus: Record<PaymentStatus, number> = {
      pending: 0,
      paid: 0,
      canceled: 0,
      failed: 0,
      chargeback: 0,
    };
    for (const payment of dated) {
      byStatus[payment.status] += payment.amount;
    }
    const filteredSum = filtered.reduce((acc, p) => acc + p.amount, 0);
    return { byStatus, filteredSum };
  }, [dated, filtered]);

  const handleExportCsv = () => {
    const header = [
      'id',
      'createdAt',
      'paidAt',
      'userPhone',
      'userName',
      'tariffType',
      'amount',
      'currency',
      'status',
      'providerTransactionId',
      'description',
    ];
    const rows = filtered.map((payment) => [
      payment.id,
      payment.createdAt,
      payment.paidAt ?? '',
      getUserPhone(usersById, payment.userId),
      getUserName(usersById, payment.userId),
      payment.tariffType,
      payment.amount,
      payment.currency,
      payment.status,
      payment.providerTransactionId ?? '',
      payment.description,
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`payments-${stamp}.csv`, [header, ...rows]);
  };

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <section className={styles.paymentsPage}>
      <header className={styles.paymentsPage__header}>
        <div>
          <h1 className={styles.paymentsPage__title}>Бухгалтерия</h1>
          <p className={styles.paymentsPage__subtitle}>
            {isLoading
              ? 'Загрузка...'
              : `${filtered.length} из ${payments.length} платежей · сумма выбора ${formatAmount(sums.filteredSum, 'RUB')}`}
          </p>
        </div>

        <button
          type="button"
          className={`${styles.paymentsPage__actionBtn} ${styles.paymentsPage__actionBtn_primary}`}
          onClick={handleExportCsv}
          disabled={isLoading || filtered.length === 0}
        >
          Скачать CSV
        </button>
      </header>

      <div className={styles.paymentsPage__toolbar}>
        <div className={styles.paymentsPage__dateFilters}>
          <label className={styles.paymentsPage__dateField}>
            <span>С</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className={styles.paymentsPage__dateField}>
            <span>По</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          {dateFrom || dateTo ? (
            <button
              type="button"
              className={styles.paymentsPage__actionBtn}
              onClick={clearDates}
            >
              Сбросить даты
            </button>
          ) : null}
        </div>

        <div className={styles.paymentsPage__filters}>
          {(
            [
              ['all', `Все (${counts.all})`],
              [PaymentStatus.PENDING, `Ожидают (${counts.pending})`],
              [PaymentStatus.PAID, `Оплачены (${counts.paid})`],
              [PaymentStatus.CANCELED, `Отменены (${counts.canceled})`],
              [PaymentStatus.FAILED, `Ошибки (${counts.failed})`],
              [PaymentStatus.CHARGEBACK, `Chargeback (${counts.chargeback})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${styles.paymentsPage__filterBtn} ${
                statusFilter === value ? styles.paymentsPage__filterBtn_active : ''
              }`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.paymentsPage__sums}>
        <div className={styles.paymentsPage__sumCard}>
          <span className={styles.paymentsPage__sumLabel}>Оплачено</span>
          <strong>{formatAmount(sums.byStatus.paid, 'RUB')}</strong>
        </div>
        <div className={styles.paymentsPage__sumCard}>
          <span className={styles.paymentsPage__sumLabel}>Ожидает</span>
          <strong>{formatAmount(sums.byStatus.pending, 'RUB')}</strong>
        </div>
        <div className={styles.paymentsPage__sumCard}>
          <span className={styles.paymentsPage__sumLabel}>Отменено</span>
          <strong>{formatAmount(sums.byStatus.canceled, 'RUB')}</strong>
        </div>
        <div className={styles.paymentsPage__sumCard}>
          <span className={styles.paymentsPage__sumLabel}>Ошибки</span>
          <strong>{formatAmount(sums.byStatus.failed, 'RUB')}</strong>
        </div>
        <div className={styles.paymentsPage__sumCard}>
          <span className={styles.paymentsPage__sumLabel}>Chargeback</span>
          <strong>{formatAmount(sums.byStatus.chargeback, 'RUB')}</strong>
        </div>
      </div>

      <p className={styles.paymentsPage__hint}>
        Для закрытия месяца: выгрузите CSV за период и сверьте Platega ID / суммы /
        статусы с ЛК Platega. Зависшие pending/failed — кнопка «Сверить» у платежа.
      </p>

      {listError ? <p className={styles.paymentsPage__error}>{listError}</p> : null}
      {actionError && !selected ? (
        <p className={styles.paymentsPage__error}>{actionError}</p>
      ) : null}

      <div className={styles.paymentsPage__tableCard}>
        <table className={styles.paymentsPage__table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пользователь</th>
              <th>Тариф</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Platega ID</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.paymentsPage__empty}>
                  Нет платежей по выбранным фильтрам
                </td>
              </tr>
            ) : null}

            {filtered.map((payment) => (
              <tr key={payment.id}>
                <td>{formatDate(payment.createdAt)}</td>
                <td>{getUserLabel(usersById, payment.userId)}</td>
                <td>{tariffLabels[payment.tariffType] ?? payment.tariffType}</td>
                <td>{formatAmount(payment.amount, payment.currency)}</td>
                <td>
                  <span
                    className={`${styles.paymentsPage__badge} ${statusBadgeClass(payment.status)}`}
                  >
                    {statusLabels[payment.status]}
                  </span>
                </td>
                <td>
                  <span className={styles.paymentsPage__mono}>
                    {payment.providerTransactionId ?? '—'}
                  </span>
                </td>
                <td>
                  <div className={styles.paymentsPage__actions}>
                    <button
                      type="button"
                      className={`${styles.paymentsPage__actionBtn} ${styles.paymentsPage__actionBtn_primary}`}
                      onClick={() => {
                        setSyncError('');
                        setActionError('');
                        setSelected(payment);
                      }}
                    >
                      Открыть
                    </button>
                    {canSync(payment) ? (
                      <button
                        type="button"
                        className={styles.paymentsPage__actionBtn}
                        disabled={syncingId === payment.id || refundingId === payment.id}
                        onClick={() => void handleSync(payment)}
                      >
                        {syncingId === payment.id ? 'Сверка…' : 'Сверить'}
                      </button>
                    ) : null}
                    {canRefund(payment) ? (
                      <button
                        type="button"
                        className={`${styles.paymentsPage__actionBtn} ${styles.paymentsPage__actionBtn_danger}`}
                        disabled={refundingId === payment.id || syncingId === payment.id}
                        onClick={() => void handleRefund(payment)}
                      >
                        {refundingId === payment.id ? 'Возврат…' : 'Вернуть'}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <>
          <button
            type="button"
            className={styles.paymentsPage__overlay}
            aria-label="Закрыть"
            onClick={() => setSelected(null)}
          />
          <aside className={styles.paymentsPage__drawer}>
            <div className={styles.paymentsPage__drawerHeader}>
              <h2 className={styles.paymentsPage__drawerTitle}>Платёж</h2>
              <button
                type="button"
                className={styles.paymentsPage__close}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.paymentsPage__drawerBody}>
              <div className={styles.paymentsPage__fields}>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Создан</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Оплачен</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {formatDate(selected.paidAt)}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Пользователь</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {getUserLabel(usersById, selected.userId)}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Тариф</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {tariffLabels[selected.tariffType] ?? selected.tariffType}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Сумма</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {formatAmount(selected.amount, selected.currency)}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Статус</span>
                  <p className={styles.paymentsPage__fieldValue}>
                    {statusLabels[selected.status]}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Описание</span>
                  <p className={styles.paymentsPage__fieldValue}>{selected.description}</p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>ID платежа</span>
                  <p className={`${styles.paymentsPage__fieldValue} ${styles.paymentsPage__mono}`}>
                    {selected.id}
                  </p>
                </div>
                <div className={styles.paymentsPage__field}>
                  <span className={styles.paymentsPage__fieldLabel}>Platega transaction ID</span>
                  <p className={`${styles.paymentsPage__fieldValue} ${styles.paymentsPage__mono}`}>
                    {selected.providerTransactionId ?? '—'}
                  </p>
                </div>
                {selected.paymentUrl ? (
                  <div className={styles.paymentsPage__field}>
                    <span className={styles.paymentsPage__fieldLabel}>Ссылка на оплату</span>
                    <p className={`${styles.paymentsPage__fieldValue} ${styles.paymentsPage__mono}`}>
                      {selected.paymentUrl}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.paymentsPage__drawerFooter}>
              {syncError ? (
                <p className={styles.paymentsPage__error}>{syncError}</p>
              ) : null}
              {actionError ? (
                <p className={styles.paymentsPage__error}>{actionError}</p>
              ) : null}
              {canRefund(selected) ? (
                <button
                  type="button"
                  className={`${styles.paymentsPage__actionBtn} ${styles.paymentsPage__actionBtn_danger}`}
                  disabled={
                    refundingId === selected.id || syncingId === selected.id
                  }
                  onClick={() => void handleRefund(selected)}
                >
                  {refundingId === selected.id ? 'Возврат…' : 'Вернуть'}
                </button>
              ) : null}
              {canSync(selected) ? (
                <button
                  type="button"
                  className={`${styles.paymentsPage__actionBtn} ${styles.paymentsPage__actionBtn_primary}`}
                  disabled={
                    syncingId === selected.id || refundingId === selected.id
                  }
                  onClick={() => void handleSync(selected)}
                >
                  {syncingId === selected.id ? 'Сверка…' : 'Сверить с Platega'}
                </button>
              ) : null}
              <button
                type="button"
                className={styles.paymentsPage__actionBtn}
                onClick={() => setSelected(null)}
              >
                Закрыть
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </section>
  );
}

export default PaymentsPage;
