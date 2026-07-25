'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/api/api';
import {
  DEFAULT_SUPPORT_LINKS,
  type SupportLinks,
} from '@/content/supportCard';

export function useSupportLinks() {
  const [links, setLinks] = useState<SupportLinks>(DEFAULT_SUPPORT_LINKS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void settingsApi
      .getSupportLinks()
      .then((data) => {
        if (!cancelled) {
          setLinks({
            telegram: data.telegram || DEFAULT_SUPPORT_LINKS.telegram,
            vk: data.vk || DEFAULT_SUPPORT_LINKS.vk,
            max: data.max || DEFAULT_SUPPORT_LINKS.max,
          });
        }
      })
      .catch(() => {
        // keep defaults
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { links, isLoading };
}
