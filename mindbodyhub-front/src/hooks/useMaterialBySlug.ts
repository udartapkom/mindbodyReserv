"use client";

import { useEffect, useState } from "react";
import { problems as problemsApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import type { Material } from "@/types/material";

export type MaterialLoadState =
  | { status: "loading" }
  | { status: "ready"; material: Material }
  | { status: "forbidden"; message: string }
  | { status: "not-found" };

function getErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    return typeof statusCode === "number" ? statusCode : null;
  }
  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  return fallback;
}

export function useMaterialBySlug(slug: string): MaterialLoadState {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<MaterialLoadState>({ status: "loading" });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    problemsApi
      .getBySlug(slug)
      .then((material) => {
        if (!cancelled) {
          setState({ status: "ready", material });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const statusCode = getErrorStatus(error);
        if (statusCode === 403) {
          setState({
            status: "forbidden",
            message: getErrorMessage(
              error,
              "Материал доступен только зарегистрированным пользователям",
            ),
          });
          return;
        }

        setState({ status: "not-found" });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated, isAuthLoading]);

  if (isAuthLoading) {
    return { status: "loading" };
  }

  return state;
}
