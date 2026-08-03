'use client';

import { useEffect, useRef, useState } from 'react';
import { problems } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import styles from './MaterialScrollAids.module.scss';

const SHOW_TOP_AFTER_PX = 480;
const SAVE_DEBOUNCE_MS = 1200;
const MIN_SAVE_RATIO = 0.05;
const RESTORE_MIN_RATIO = 0.08;
const RESTORE_MAX_RATIO = 0.92;

type MaterialScrollAidsProps = {
  /** Lift the button above the cabinet mobile bottom nav. */
  offsetForCabinetNav?: boolean;
  /** When set and user is logged in, persist / restore scroll via profile. */
  materialId?: string;
  /** CSS selector for the reading article (progress is relative to it). */
  articleSelector?: string;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Progress through the article element, falling back to document scroll. */
function getScrollRatio(articleSelector: string): number {
  const article = document.querySelector(articleSelector);
  if (article instanceof HTMLElement) {
    const rect = article.getBoundingClientRect();
    const articleTop = window.scrollY + rect.top;
    const articleHeight = article.offsetHeight;
    const viewport = window.innerHeight;
    const start = articleTop;
    const end = articleTop + articleHeight - viewport;
    if (end <= start) {
      return window.scrollY > start ? 1 : 0;
    }
    return clamp01((window.scrollY - start) / (end - start));
  }

  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  if (scrollable <= 0) return 0;
  return clamp01(window.scrollY / scrollable);
}

function scrollToRatio(ratio: number, articleSelector: string) {
  const article = document.querySelector(articleSelector);
  if (article instanceof HTMLElement) {
    const rect = article.getBoundingClientRect();
    const articleTop = window.scrollY + rect.top;
    const articleHeight = article.offsetHeight;
    const viewport = window.innerHeight;
    const start = articleTop;
    const end = articleTop + articleHeight - viewport;
    if (end <= start) {
      window.scrollTo({ top: start, behavior: 'auto' });
      return;
    }
    window.scrollTo({ top: start + (end - start) * ratio, behavior: 'auto' });
    return;
  }

  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  window.scrollTo({ top: scrollable * ratio, behavior: 'auto' });
}

function MaterialScrollAids({
  offsetForCabinetNav = false,
  materialId,
  articleSelector = "article[data-reader-article]",
}: MaterialScrollAidsProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const restoredForIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRatioRef = useRef(0);
  const restoreDoneRef = useRef(!materialId);

  useEffect(() => {
    const update = () => {
      const ratio = getScrollRatio(articleSelector);
      latestRatioRef.current = ratio;
      const nextProgress = Math.round(ratio * 1000) / 10;
      setProgress((prev) => (prev === nextProgress ? prev : nextProgress));
      const nextShowTop = window.scrollY > SHOW_TOP_AFTER_PX;
      setShowTop((prev) => (prev === nextShowTop ? prev : nextShowTop));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [articleSelector]);

  useEffect(() => {
    restoreDoneRef.current = !materialId;
    if (!materialId) {
      restoredForIdRef.current = null;
      return;
    }

    if (authLoading || !isAuthenticated) {
      return;
    }

    if (restoredForIdRef.current === materialId) {
      restoreDoneRef.current = true;
      return;
    }

    let cancelled = false;

    const restore = async () => {
      try {
        const saved = await problems.getReadingProgress(materialId);
        if (cancelled) {
          return;
        }

        if (!saved || saved.scrollRatio < RESTORE_MIN_RATIO) {
          restoredForIdRef.current = materialId;
          restoreDoneRef.current = true;
          return;
        }

        const ratio = Math.min(RESTORE_MAX_RATIO, saved.scrollRatio);

        const tryScroll = (attempt: number) => {
          if (cancelled) return;
          const article = document.querySelector(articleSelector);
          const height =
            article instanceof HTMLElement
              ? article.offsetHeight
              : document.documentElement.scrollHeight;
          if (height < 200 && attempt < 12) {
            window.setTimeout(() => tryScroll(attempt + 1), 80);
            return;
          }
          scrollToRatio(ratio, articleSelector);
          lastSavedRef.current = ratio;
          restoredForIdRef.current = materialId;
          restoreDoneRef.current = true;
        };

        tryScroll(0);
      } catch {
        if (!cancelled) {
          restoredForIdRef.current = materialId;
          restoreDoneRef.current = true;
        }
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [materialId, isAuthenticated, authLoading, articleSelector]);

  useEffect(() => {
    if (!materialId || authLoading || !isAuthenticated) {
      return;
    }

    const persist = (ratio: number) => {
      if (!restoreDoneRef.current) return;
      if (ratio < MIN_SAVE_RATIO) return;
      if (Math.abs(ratio - lastSavedRef.current) < 0.02) return;
      lastSavedRef.current = ratio;
      void problems.saveReadingProgress(materialId, ratio).catch(() => {
        lastSavedRef.current = -1;
      });
    };

    const onScroll = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        persist(latestRatioRef.current);
      }, SAVE_DEBOUNCE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      persist(latestRatioRef.current);
    };
  }, [materialId, isAuthenticated, authLoading]);

  return (
    <>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Прогресс чтения"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className={styles.progress__bar} style={{ width: `${progress}%` }} />
      </div>

      {showTop ? (
        <button
          type="button"
          className={[
            styles.topButton,
            offsetForCabinetNav ? styles.topButton_cabinet : null,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Наверх"
        >
          ↑ Наверх
        </button>
      ) : null}
    </>
  );
}

export default MaterialScrollAids;
