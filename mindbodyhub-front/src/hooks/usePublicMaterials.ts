"use client";

import { useEffect, useState } from "react";
import { problems as problemsApi } from "@/api/api";
import type { Problem } from "@/api/responsesTypes";

export function usePublicMaterials() {
  const [materials, setMaterials] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    problemsApi
      .getProblems()
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
  }, []);

  return { materials, isLoading };
}
