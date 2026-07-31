'use client';

import { useCallback, useState } from 'react';
import styles from './MaterialShareButton.module.scss';

type MaterialShareButtonProps = {
  title: string;
  text?: string | null;
  className?: string;
};

function MaterialShareButton({ title, text, className }: MaterialShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    const payload = {
      title,
      text: text?.trim() || title,
      url,
    };

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share(payload);
        return;
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Скопируйте ссылку:', url);
    }
  }, [title, text]);

  return (
    <button
      type="button"
      className={[styles.share, className].filter(Boolean).join(' ')}
      onClick={() => void share()}
    >
      {copied ? 'Ссылка скопирована' : 'Поделиться'}
    </button>
  );
}

export default MaterialShareButton;
