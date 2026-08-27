"use client";

import { useCallback, useEffect, useState } from "react";
import { pushApi } from "@/api/api";
import { pwaPushCopy } from "@/content/pwaPush";
import { useAuth } from "@/context/AuthContext";
import {
  getCurrentPushSubscription,
  isIosDevice,
  isPushSupported,
  isStandaloneDisplay,
  serializePushSubscription,
  subscribeToPush,
} from "@/utils/push";
import styles from "./PwaPushCard.module.scss";

type PermissionState = NotificationPermission | "unsupported" | "loading";

function PwaPushCard() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [permission, setPermission] = useState<PermissionState>("loading");
  const [subscribed, setSubscribed] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    try {
      const localSub = await getCurrentPushSubscription();

      if (isAuthenticated) {
        const status = await pushApi.getStatus();
        setConfigured(status.configured);
        // Server is source of truth — local-only stale subs look "enabled" but never receive.
        setSubscribed(status.subscribed);
      } else {
        setSubscribed(Boolean(localSub));
      }
    } catch {
      // keep local state
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleEnable = async () => {
    setError(null);
    setMessage(null);
    setIsEnabling(true);

    try {
      if (isIosDevice() && !isStandaloneDisplay()) {
        setError(pwaPushCopy.needInstallIos);
        return;
      }

      const { publicKey } = await pushApi.getVapidPublicKey();
      if (!publicKey) {
        setError(pwaPushCopy.notConfigured);
        setConfigured(false);
        return;
      }

      const subscription = await subscribeToPush(publicKey, { forceNew: true });
      const payload = serializePushSubscription(subscription);
      await pushApi.subscribe({
        ...payload,
        userAgent: navigator.userAgent,
      });

      setPermission("granted");
      setSubscribed(true);
      setMessage(pwaPushCopy.enabledStatus);
    } catch (err) {
      if (Notification.permission === "denied") {
        setPermission("denied");
        setError(pwaPushCopy.deniedStatus);
      } else {
        setError(
          typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof err.message === "string"
            ? err.message
            : pwaPushCopy.enableError,
        );
      }
    } finally {
      setIsEnabling(false);
    }
  };

  const handlePrefChange = async (
    key:
      | "notifySupportReplies"
      | "notifyNewMaterials"
      | "notifyNewInsights"
      | "notifyDailyQuote"
      | "notifyTariffExpiry",
    value: boolean,
  ) => {
    setError(null);
    setMessage(null);
    setIsSavingPrefs(true);

    try {
      await updateProfile({ [key]: value });
      setMessage(pwaPushCopy.prefsSaved);
    } catch {
      setError(pwaPushCopy.prefsError);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const showEnableButton =
    permission !== "loading" &&
    permission !== "unsupported" &&
    permission !== "denied" &&
    !(subscribed && permission === "granted");

  return (
    <section className={styles.card} aria-labelledby="pwa-push-title">
      <h2 id="pwa-push-title" className={styles.title}>
        {pwaPushCopy.title}
      </h2>
      <p className={styles.hint}>{pwaPushCopy.subtitle}</p>

      {permission === "unsupported" ? (
        <p className={styles.status}>{pwaPushCopy.unsupportedStatus}</p>
      ) : null}

      {permission === "denied" ? (
        <p className={styles.status}>{pwaPushCopy.deniedStatus}</p>
      ) : null}

      {!configured ? (
        <p className={styles.status}>{pwaPushCopy.notConfigured}</p>
      ) : null}

      {subscribed && permission === "granted" ? (
        <p className={`${styles.status} ${styles.statusOk}`}>
          {pwaPushCopy.enabledStatus}
        </p>
      ) : null}

      {permission === "granted" && !subscribed && configured ? (
        <p className={styles.status}>{pwaPushCopy.reEnableHint}</p>
      ) : null}

      {isIosDevice() && !isStandaloneDisplay() && showEnableButton ? (
        <p className={styles.status}>{pwaPushCopy.needInstallIos}</p>
      ) : null}

      {showEnableButton ? (
        <button
          type="button"
          className={styles.button}
          disabled={
            isEnabling ||
            !configured ||
            (isIosDevice() && !isStandaloneDisplay())
          }
          onClick={() => {
            void handleEnable();
          }}
        >
          {isEnabling ? "…" : pwaPushCopy.enableButton}
        </button>
      ) : null}

      <h3 className={styles.prefsTitle}>{pwaPushCopy.prefsTitle}</h3>
      <div className={styles.prefs}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={user.notifySupportReplies}
            disabled={isSavingPrefs}
            onChange={(event) => {
              void handlePrefChange("notifySupportReplies", event.target.checked);
            }}
          />
          {pwaPushCopy.notifySupport}
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={user.notifyNewMaterials}
            disabled={isSavingPrefs}
            onChange={(event) => {
              void handlePrefChange("notifyNewMaterials", event.target.checked);
            }}
          />
          {pwaPushCopy.notifyMaterials}
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={user.notifyNewInsights}
            disabled={isSavingPrefs}
            onChange={(event) => {
              void handlePrefChange("notifyNewInsights", event.target.checked);
            }}
          />
          {pwaPushCopy.notifyInsights}
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={user.notifyDailyQuote}
            disabled={isSavingPrefs}
            onChange={(event) => {
              void handlePrefChange("notifyDailyQuote", event.target.checked);
            }}
          />
          {pwaPushCopy.notifyQuote}
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={user.notifyTariffExpiry}
            disabled={isSavingPrefs}
            onChange={(event) => {
              void handlePrefChange("notifyTariffExpiry", event.target.checked);
            }}
          />
          {pwaPushCopy.notifyTariffExpiry}
        </label>
      </div>

      {message ? (
        <p className={`${styles.status} ${styles.statusOk}`}>{message}</p>
      ) : null}
      {error ? <p className={styles.status}>{error}</p> : null}
    </section>
  );
}

export default PwaPushCard;
