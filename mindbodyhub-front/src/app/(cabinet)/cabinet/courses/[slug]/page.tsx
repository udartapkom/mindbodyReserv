'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { problems } from '@/api/api';
import { isPaidMaterialShelf } from '@/utils/materialAccess';

/**
 * Legacy /cabinet/courses/[slug] → materials shelf.
 * Uses hard navigation to avoid Next Soft Nav Performance.measure glitches
 * on a page that only exists to redirect.
 */
export default function CabinetCourseRedirectPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let target = '/cabinet/materials';

      try {
        const material = await problems.getBySlug(slug);
        if (isPaidMaterialShelf(material.tariffType)) {
          target = `/cabinet/materials/${material.tariffType}/${material.slug}`;
        }
      } catch {
        // hub fallback
      }

      if (!cancelled) {
        window.location.replace(target);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return null;
}
