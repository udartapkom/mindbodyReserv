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
};

function getScrollRatio(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / scrollable));
}

function MaterialScrollAids({
  offsetForCabinetNav = false,
  materialId,
}: MaterialScrollAidsProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const restoredRef = useRef(false);
  const lastSavedRef = useRef(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRatioRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const ratio = getScrollRatio();
      latestRatioRef.current = ratio;
      setProgress(ratio * 100);
      setShowTop(window.scrollY > SHOW_TOP_AFTER_PX);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (!materialId || authLoading || !isAuthenticated || restoredRef.current) {
      return;
    }

    let cancelled = false;

    const restore = async () => {
      try {
        const saved = await problems.getReadingProgress(materialId);
        if (cancelled || !saved || saved.scrollRatio < RESTORE_MIN_RATIO) {
          restoredRef.current = true;
          return;
        }

        const ratio = Math.min(RESTORE_MAX_RATIO, saved.scrollRatio);

        const tryScroll = (attempt: number) => {
          if (cancelled) return;
          const doc = document.documentElement;
          const scrollable = doc.scrollHeight - doc.clientHeight;
          if (scrollable < 120 && attempt < 12) {
            window.setTimeout(() => tryScroll(attempt + 1), 80);
            return;
          }
          window.scrollTo({ top: scrollable * ratio, behavior: 'auto' });
          lastSavedRef.current = ratio;
          restoredRef.current = true;
        };

        tryScroll(0);
      } catch {
        restoredRef.current = true;
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [materialId, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!materialId || authLoading || !isAuthenticated) {
      return;
    }

    const persist = (ratio: number) => {
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

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
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
            .join(' ')}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх"
        >
          ↑ Наверх
        </button>
      ) : null}
    </>
  );
}

export default MaterialScrollAids;
