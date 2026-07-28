'use client';

import { useEffect, useState } from "react";
import { problems as problemsApi } from "@/api/api";
import type { Problem } from "@/api/responsesTypes";
import { useAuth } from "@/context/AuthContext";

type UsePublicMaterialsOptions = {
  /** Exact tariffType filter (e.g. free for public menu). */
  tariffType?: string;
};

export function usePublicMaterials(options: UsePublicMaterialsOptions = {}) {
  const { tariffType } = options;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [materials, setMaterials] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    problemsApi
      .getProblems(tariffType)
      .then((data) => {
        if (!cancelled) {
          setMaterials(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMaterials([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, tariffType]);

  return { materials, isLoading: isAuthLoading || isLoading };
}
