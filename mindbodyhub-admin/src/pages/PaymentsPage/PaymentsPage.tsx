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

function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [usersById, setUsersById] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Payment | null>(null);

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

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  const counts = useMemo(
    () => ({
      all: payments.length,
      pending: payments.filter((p) => p.status === PaymentStatus.PENDING).length,
      paid: payments.filter((p) => p.status === PaymentStatus.PAID).length,
      canceled: payments.filter((p) => p.status === PaymentStatus.CANCELED).length,
      failed: payments.filter((p) => p.status === PaymentStatus.FAILED).length,
      chargeback: payments.filter((p) => p.status === PaymentStatus.CHARGEBACK).length,
    }),
    [payments],
  );

  return (
    <section className={styles.paymentsPage}>
      <header className={styles.paymentsPage__header}>
        <div>
          <h1 className={styles.paymentsPage__title}>Бухгалтерия</h1>
          <p className={styles.paymentsPage__subtitle}>
            {isLoading ? 'Загрузка...' : `${payments.length} платежей`}
          </p>
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
      </header>

      {listError ? <p className={styles.paymentsPage__error}>{listError}</p> : null}

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
                  Платежей пока нет
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
                      onClick={() => setSelected(payment)}
                    >
                      Открыть
                    </button>
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
