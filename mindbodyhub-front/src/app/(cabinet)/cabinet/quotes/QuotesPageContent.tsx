'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { quotes, type Quote } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { canAccessQuotes } from '@/utils/quoteAccess';
import styles from './page.module.scss';

const PAGE_SIZE = 10;
/** Extra auto-fetches while the list still doesn't overflow the viewport. */
const MAX_FILL_PASSES = 3;

function formatQuoteDate(value?: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function pageDoesNotScroll(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.scrollHeight <= window.innerHeight + 8;
}

function QuotesPageContent() {
  const { user } = useAuth();
  const hasAccess = canAccessQuotes(user?.tariff, user?.role);

  const [items, setItems] = useState<Quote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(1);
  const fillPassesRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wasIntersectingRef = useRef(false);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchPage = useCallback(async (nextPage: number, append: boolean) => {
    const data = await quotes.getFeed(nextPage, PAGE_SIZE);
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setPage(data.page);
    pageRef.current = data.page;
    setHasMore(data.hasMore);
    hasMoreRef.current = data.hasMore;
    setTotal(data.total);
    return data;
  }, []);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError('');
    fillPassesRef.current = 0;
    wasIntersectingRef.current = false;

    try {
      let data = await fetchPage(1, false);
      setForbidden(false);

      // Fill short first screens only — capped so we never cascade through the archive.
      while (
        data.hasMore &&
        fillPassesRef.current < MAX_FILL_PASSES &&
        pageDoesNotScroll()
      ) {
        fillPassesRef.current += 1;
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        if (!pageDoesNotScroll()) break;
        data = await fetchPage(data.page + 1, true);
      }
    } catch (err) {
      const status =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode?: number }).statusCode)
          : 0;
      if (status === 403) {
        setForbidden(true);
        setItems([]);
      } else {
        setError('Не удалось загрузить цитаты');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError('');

    try {
      await fetchPage(pageRef.current + 1, true);
    } catch {
      setError('Не удалось загрузить цитаты');
    } finally {
      setIsLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [fetchPage]);

  useEffect(() => {
    if (!hasAccess) {
      setIsLoading(false);
      setForbidden(true);
      return;
    }
    void loadInitial();
  }, [hasAccess, loadInitial]);

  const sentinelCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;

          const isIntersecting = entry.isIntersecting;
          const entered = isIntersecting && !wasIntersectingRef.current;
          wasIntersectingRef.current = isIntersecting;

          // Only on enter — staying visible after append must not cascade.
          if (!entered) return;
          if (!hasMoreRef.current || loadingMoreRef.current) return;

          void loadMore();
        },
        { root: null, rootMargin: '0px', threshold: 0 },
      );

      observerRef.current.observe(node);
    },
    [loadMore],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  if (!hasAccess || forbidden) {
    return (
      <section className={styles.quotes}>
        <header className={styles.quotes__header}>
          <h1 className={styles.quotes__title}>Цитаты</h1>
          <p className={styles.quotes__lead}>
            Ежедневные цитаты доступны на платных тарифах.
          </p>
        </header>
        <div className={styles.quotes__locked}>
          <p className={styles.quotes__lockedText}>
            Подключите тариф, чтобы читать цитаты дня и архив.
          </p>
          <Link className={styles.quotes__cta} href="/price">
            Смотреть тарифы
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.quotes}>
      <header className={styles.quotes__header}>
        <h1 className={styles.quotes__title}>Цитаты</h1>
        <p className={styles.quotes__lead}>
          Новые цитаты появляются каждый день.
          {!isLoading ? ` В архиве: ${total}.` : null}
        </p>
      </header>

      {error ? <p className={styles.quotes__error}>{error}</p> : null}

      {isLoading ? (
        <p className={styles.quotes__hint}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.quotes__hint}>Пока нет опубликованных цитат.</p>
      ) : (
        <>
          <ul className={styles.quotes__list}>
            {items.map((quote) => (
              <li key={quote.id} className={styles.quotes__card}>
                {quote.publishedAt ? (
                  <time
                    className={styles.quotes__date}
                    dateTime={quote.publishedAt}
                  >
                    {formatQuoteDate(quote.publishedAt)}
                  </time>
                ) : null}
                <blockquote className={styles.quotes__body}>{quote.body}</blockquote>
                {quote.author ? (
                  <cite className={styles.quotes__author}>— {quote.author}</cite>
                ) : null}
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div
              ref={sentinelCallbackRef}
              className={styles.quotes__sentinel}
              aria-hidden
            />
          ) : null}

          {isLoadingMore ? (
            <p className={styles.quotes__hint}>Загрузка…</p>
          ) : null}
        </>
      )}
    </section>
  );
}

export default QuotesPageContent;
