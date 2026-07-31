"use client";

import { useEffect } from "react";
import { pushApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import {
  getCurrentPushSubscription,
  isPushSupported,
  serializePushSubscription,
  subscribeToPush,
} from "@/utils/push";

/**
 * Keep backend push subscription in sync after login.
 * If the server lost the endpoint (e.g. 410 cleanup) but permission is still
 * granted, create a fresh browser subscription and re-register it.
 */
function PwaPushSync() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !isPushSupported()) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const sync = async () => {
      try {
        const status = await pushApi.getStatus();
        if (!status.configured) {
          return;
        }

        if (status.subscribed) {
          const local = await getCurrentPushSubscription();
          if (!local) {
            return;
          }
          const payload = serializePushSubscription(local);
          await pushApi.subscribe({
            ...payload,
            userAgent: navigator.userAgent,
          });
          return;
        }

        // Server has no sub — refresh browser endpoint (stale ones cause 410).
        const { publicKey } = await pushApi.getVapidPublicKey();
        if (!publicKey) {
          return;
        }

        const subscription = await subscribeToPush(publicKey, { forceNew: true });
        const payload = serializePushSubscription(subscription);
        await pushApi.subscribe({
          ...payload,
          userAgent: navigator.userAgent,
        });
      } catch {
        // Non-blocking background sync
      }
    };

    void sync();
  }, [isAuthenticated, isLoading]);

  return null;
}

export default PwaPushSync;
