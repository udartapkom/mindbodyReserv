'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { insights, type Insight } from '@/api/api';
import MaterialReaderShell from '@/components/MaterialReaderShell/MaterialReaderShell';
import styles from './page.module.scss';

function InsightDetailContent() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [insight, setInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        setInsight(await insights.getBySlug(slug));
      } catch {
        setInsight(null);
        setError('Инсайт не найден');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [slug]);

  if (isLoading) {
    return <p className={styles.hint}>Загрузка…</p>;
  }

  if (!insight) {
    return (
      <section className={styles.wrap}>
        <p className={styles.error}>{error || 'Инсайт не найден'}</p>
      </section>
    );
  }

  return (
    <MaterialReaderShell
      layout="cabinet"
      showToc={false}
      enableScrollAids={false}
      document={{
        title: insight.title,
        summary: null,
        coverUrl: null,
        blocks: insight.blocks,
        showMetadata: true,
        publishedAt: insight.publishedAt,
      }}
      back={{ href: '/cabinet/insights', label: '← К инсайтам' }}
      eyebrow="Инсайт"
    />
  );
}

export default InsightDetailContent;
