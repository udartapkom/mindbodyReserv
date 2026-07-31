"use client";

import { useState } from "react";
import Popup from "@/components/Popup/Popup";
import ErrorPopup from "@/components/ErrorPopup/ErrorPopup";
import { pwaInstallCopy } from "@/content/pwaInstall";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import styles from "./PwaInstallCard.module.scss";

function PwaInstallCard() {
  const { mode, isPrompting, promptInstall, canPrompt } = usePwaInstall();
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);

  if (mode !== "android" && mode !== "ios") {
    return null;
  }

  return (
    <section className={styles.card} aria-labelledby="pwa-install-title">
      <h2 id="pwa-install-title" className={styles.title}>
        {pwaInstallCopy.title}
      </h2>
      <p className={styles.hint}>{pwaInstallCopy.subtitle}</p>

      {mode === "android" ? (
        <button
          type="button"
          className={styles.button}
          disabled={!canPrompt || isPrompting}
          onClick={() => {
            void promptInstall();
          }}
        >
          {isPrompting ? "…" : pwaInstallCopy.installButton}
        </button>
      ) : null}

      {mode === "ios" ? (
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsIosGuideOpen(true)}
        >
          {pwaInstallCopy.iosButton}
        </button>
      ) : null}

      <Popup
        title={pwaInstallCopy.iosPopupTitle}
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
      >
        <ErrorPopup
          title={pwaInstallCopy.iosPopupTitle}
          description={pwaInstallCopy.iosSteps}
          icon="share-alt"
          variant="solid"
          tone="info"
          submit={() => setIsIosGuideOpen(false)}
        />
      </Popup>
    </section>
  );
}

export default PwaInstallCard;
