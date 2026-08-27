'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { insights, type InsightListItem } from '@/api/api';
import styles from './page.module.scss';

const PAGE_SIZE = 10;
const MAX_FILL_PASSES = 3;

function formatInsightDate(value?: string | null): string {
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

function InsightsPageContent() {
  const [items, setItems] = useState<InsightListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

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
    const data = await insights.getFeed(nextPage, PAGE_SIZE);
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
    } catch {
      setError('Не удалось загрузить инсайты');
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
      setError('Не удалось загрузить инсайты');
    } finally {
      setIsLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [fetchPage]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

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

  return (
    <section className={styles.insights}>
      <header className={styles.insights__header}>
        <h1 className={styles.insights__title}>Инсайты</h1>
        <p className={styles.insights__lead}>
          Короткие еженедельные материалы.
          {!isLoading ? ` В архиве: ${total}.` : null}
        </p>
      </header>

      {error ? <p className={styles.insights__error}>{error}</p> : null}

      {isLoading ? (
        <p className={styles.insights__hint}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.insights__hint}>Пока нет опубликованных инсайтов.</p>
      ) : (
        <>
          <ul className={styles.insights__list}>
            {items.map((insight) => (
              <li key={insight.id}>
                <Link
                  className={styles.insights__card}
                  href={`/cabinet/insights/${insight.slug}`}
                >
                  {insight.publishedAt ? (
                    <time
                      className={styles.insights__date}
                      dateTime={insight.publishedAt}
                    >
                      {formatInsightDate(insight.publishedAt)}
                    </time>
                  ) : null}
                  <span className={styles.insights__cardTitle}>{insight.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div
              ref={sentinelCallbackRef}
              className={styles.insights__sentinel}
              aria-hidden
            />
          ) : null}

          {isLoadingMore ? (
            <p className={styles.insights__hint}>Загрузка…</p>
          ) : null}
        </>
      )}
    </section>
  );
}

export default InsightsPageContent;
