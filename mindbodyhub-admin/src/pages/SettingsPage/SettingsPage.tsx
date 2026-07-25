import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { paymentsApi, type CreatePaymentResponse } from '@/api/payments';
import { settingsApi } from '@/api/settings';
import { tariffsApi } from '@/api/tariffs';
import type { Payment } from '@/types/payment';
import { PaymentStatus } from '@/types/payment';
import type { SupportLinks } from '@/types/settings';
import type { Tariff } from '@/types/tariff';
import styles from './SettingsPage.module.scss';

const PAID_TARIFF_TYPES = new Set(['trial', 'popular', 'vip']);

const EMPTY_LINKS: SupportLinks = {
  telegram: '',
  vk: '',
  max: '',
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  canceled: 'Отменён',
  failed: 'Ошибка',
  chargeback: 'Chargeback',
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function SettingsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffType, setTariffType] = useState('');
  const [isLoadingTariffs, setIsLoadingTariffs] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatePaymentResponse | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [links, setLinks] = useState<SupportLinks>(EMPTY_LINKS);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [linksError, setLinksError] = useState('');
  const [linksSuccess, setLinksSuccess] = useState('');

  const paidTariffs = useMemo(
    () =>
      tariffs
        .filter((t) => t.isActive && PAID_TARIFF_TYPES.has(t.type))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [tariffs],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingTariffs(true);
      try {
        const data = await tariffsApi.getAll();
        if (cancelled) return;
        setTariffs(data);
        const first = data
          .filter((t) => t.isActive && PAID_TARIFF_TYPES.has(t.type))
          .sort((a, b) => a.sortOrder - b.sortOrder)[0];
        if (first) setTariffType(first.type);
      } catch {
        if (!cancelled) setError('Не удалось загрузить тарифы');
      } finally {
        if (!cancelled) setIsLoadingTariffs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingLinks(true);
      setLinksError('');
      try {
        const data = await settingsApi.getSupportLinks();
        if (!cancelled) setLinks(data);
      } catch (err) {
        if (!cancelled) {
          setLinksError(getErrorMessage(err, 'Не удалось загрузить ссылки поддержки'));
        }
      } finally {
        if (!cancelled) setIsLoadingLinks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSaveLinks = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingLinks(true);
    setLinksError('');
    setLinksSuccess('');

    try {
      const saved = await settingsApi.updateSupportLinks({
        telegram: links.telegram.trim(),
        vk: links.vk.trim(),
        max: links.max.trim(),
      });
      setLinks(saved);
      setLinksSuccess('Ссылки сохранены');
    } catch (err) {
      setLinksError(getErrorMessage(err, 'Не удалось сохранить ссылки'));
    } finally {
      setIsSavingLinks(false);
    }
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!tariffType) return;

    setIsCreating(true);
    setError('');
    setCreated(null);
    setPayment(null);

    try {
      const result = await paymentsApi.createTest(tariffType);
      setCreated(result);
      const details = await paymentsApi.getById(result.id);
      setPayment(details);
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось создать платёж'));
    } finally {
      setIsCreating(false);
    }
  };

  const onRefreshStatus = async () => {
    if (!created?.id) return;
    setIsRefreshing(true);
    setError('');
    try {
      const details = await paymentsApi.getById(created.id);
      setPayment(details);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось обновить статус'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentStatus = payment?.status ?? created?.status;

  return (
    <section className={styles.settingsPage}>
      <h1 className={styles.settingsPage__title}>Настройки</h1>

      <div className={styles.settingsPage__section}>
        <h2 className={styles.settingsPage__sectionTitle}>Ссылки поддержки</h2>
        <p className={styles.settingsPage__hint}>
          Эти URL используются на сайте в карточках поддержки и в блоках «Написать
          нам» (Telegram, VK, MAX).
        </p>

        <form className={styles.settingsPage__linksForm} onSubmit={onSaveLinks}>
          <label className={styles.settingsPage__field}>
            <span className={styles.settingsPage__label}>Telegram</span>
            <div className={styles.settingsPage__linkRow}>
              <img
                className={styles.settingsPage__linkIcon}
                src="/icons/telegram.svg"
                alt=""
                width={48}
                height={48}
              />
              <input
                className={styles.settingsPage__input}
                type="url"
                value={links.telegram}
                disabled={isLoadingLinks || isSavingLinks}
                onChange={(e) =>
                  setLinks((prev) => ({ ...prev, telegram: e.target.value }))
                }
                placeholder="https://t.me/..."
                required
              />
            </div>
          </label>

          <label className={styles.settingsPage__field}>
            <span className={styles.settingsPage__label}>ВКонтакте</span>
            <div className={styles.settingsPage__linkRow}>
              <img
                className={styles.settingsPage__linkIcon}
                src="/icons/vk.svg"
                alt=""
                width={48}
                height={48}
              />
              <input
                className={styles.settingsPage__input}
                type="url"
                value={links.vk}
                disabled={isLoadingLinks || isSavingLinks}
                onChange={(e) =>
                  setLinks((prev) => ({ ...prev, vk: e.target.value }))
                }
                placeholder="https://vk.com/..."
                required
              />
            </div>
          </label>

          <label className={styles.settingsPage__field}>
            <span className={styles.settingsPage__label}>MAX</span>
            <div className={styles.settingsPage__linkRow}>
              <img
                className={styles.settingsPage__linkIcon}
                src="/icons/max.svg"
                alt=""
                width={48}
                height={48}
              />
              <input
                className={styles.settingsPage__input}
                type="url"
                value={links.max}
                disabled={isLoadingLinks || isSavingLinks}
                onChange={(e) =>
                  setLinks((prev) => ({ ...prev, max: e.target.value }))
                }
                placeholder="https://max.ru/..."
                required
              />
            </div>
          </label>

          <div className={styles.settingsPage__linksActions}>
            <button
              type="submit"
              className={styles.settingsPage__button}
              disabled={isLoadingLinks || isSavingLinks}
            >
              {isSavingLinks ? 'Сохранение…' : 'Сохранить ссылки'}
            </button>
            {linksSuccess ? (
              <p className={styles.settingsPage__success}>{linksSuccess}</p>
            ) : null}
          </div>
        </form>

        {linksError ? <p className={styles.settingsPage__error}>{linksError}</p> : null}
      </div>

      <div className={styles.settingsPage__section}>
        <h2 className={styles.settingsPage__sectionTitle}>Тестовый платёж</h2>
        <p className={styles.settingsPage__hint}>
          Создаёт реальный платёж через Platega на текущего админа с минимальной
          суммой: trial — 1 ₽, popular — 2 ₽, vip — 3 ₽. После оплаты callback
          должен перевести статус в «Оплачен» и обновить тариф. Проверьте также
          раздел «Бухгалтерия».
        </p>

        <form className={styles.settingsPage__form} onSubmit={onCreate}>
          <label className={styles.settingsPage__field}>
            <span className={styles.settingsPage__label}>Тариф</span>
            <select
              className={styles.settingsPage__select}
              value={tariffType}
              disabled={isLoadingTariffs || isCreating || paidTariffs.length === 0}
              onChange={(e) => setTariffType(e.target.value)}
            >
              {paidTariffs.length === 0 ? (
                <option value="">Нет активных тарифов</option>
              ) : (
                paidTariffs.map((tariff) => {
                  const testAmount =
                    tariff.type === 'trial'
                      ? 1
                      : tariff.type === 'popular'
                        ? 2
                        : 3;
                  return (
                    <option key={tariff.id} value={tariff.type}>
                      {tariff.title} — тест {testAmount} ₽
                    </option>
                  );
                })
              )}
            </select>
          </label>

          <button
            type="submit"
            className={styles.settingsPage__button}
            disabled={!tariffType || isCreating || isLoadingTariffs}
          >
            {isCreating ? 'Создание…' : 'Создать и открыть оплату'}
          </button>
        </form>

        {error ? <p className={styles.settingsPage__error}>{error}</p> : null}

        {created ? (
          <div className={styles.settingsPage__result}>
            <div className={styles.settingsPage__resultRow}>
              <span className={styles.settingsPage__resultLabel}>ID</span>
              <span>{created.id}</span>
            </div>
            <div className={styles.settingsPage__resultRow}>
              <span className={styles.settingsPage__resultLabel}>Тариф</span>
              <span>{created.tariffType}</span>
            </div>
            <div className={styles.settingsPage__resultRow}>
              <span className={styles.settingsPage__resultLabel}>Сумма</span>
              <span>
                {created.amount.toLocaleString('ru-RU')} {created.currency}
              </span>
            </div>
            <div className={styles.settingsPage__resultRow}>
              <span className={styles.settingsPage__resultLabel}>Статус</span>
              {currentStatus ? (
                <span
                  className={`${styles.settingsPage__status} ${styles[`settingsPage__status--${currentStatus}`]}`}
                >
                  {statusLabels[currentStatus]}
                </span>
              ) : (
                '—'
              )}
            </div>

            <div className={styles.settingsPage__resultActions}>
              {created.paymentUrl ? (
                <a
                  className={styles.settingsPage__buttonSecondary}
                  href={created.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть ссылку оплаты
                </a>
              ) : null}
              <button
                type="button"
                className={styles.settingsPage__buttonSecondary}
                onClick={onRefreshStatus}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Обновление…' : 'Обновить статус'}
              </button>
              <Link className={styles.settingsPage__buttonSecondary} to="/accounting">
                Открыть бухгалтерию
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SettingsPage;
