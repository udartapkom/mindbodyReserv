'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { quotes, type Quote } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { canAccessQuotes } from '@/utils/quoteAccess';
import styles from './QuoteOfDay.module.scss';

function QuoteOfDay() {
  const { user } = useAuth();
  const hasAccess = canAccessQuotes(user?.tariff, user?.role);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(hasAccess);
  const [forbidden, setForbidden] = useState(!hasAccess);

  useEffect(() => {
    if (!hasAccess) {
      setForbidden(true);
      setIsLoading(false);
      setQuote(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const today = await quotes.getToday();
        if (!cancelled) {
          setQuote(today);
          setForbidden(false);
        }
      } catch (err) {
        const status =
          err && typeof err === 'object' && 'statusCode' in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;
        if (!cancelled) {
          if (status === 403) {
            setForbidden(true);
          }
          setQuote(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasAccess]);

  if (forbidden) {
    return (
      <section className={styles.quoteOfDay}>
        <h2 className={styles.quoteOfDay__title}>Цитата дня</h2>
        <p className={styles.quoteOfDay__text}>
          Доступна на платных тарифах.
        </p>
        <Link className={styles.quoteOfDay__link} href="/price">
          Смотреть тарифы
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.quoteOfDay}>
      <div className={styles.quoteOfDay__header}>
        <h2 className={styles.quoteOfDay__title}>Цитата дня</h2>
        <Link className={styles.quoteOfDay__link} href="/cabinet/quotes">
          Все цитаты
        </Link>
      </div>

      {isLoading ? (
        <p className={styles.quoteOfDay__text}>Загрузка…</p>
      ) : quote ? (
        <>
          <blockquote className={styles.quoteOfDay__body}>{quote.body}</blockquote>
          {quote.author ? (
            <cite className={styles.quoteOfDay__author}>— {quote.author}</cite>
          ) : null}
        </>
      ) : (
        <p className={styles.quoteOfDay__text}>
          На сегодня цитаты пока нет. Загляните в{' '}
          <Link href="/cabinet/quotes">архив</Link>.
        </p>
      )}
    </section>
  );
}

export default QuoteOfDay;
