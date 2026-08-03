"use client";

import { useEffect } from "react";

function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Dev: SW + Turbopack HMR fight and look like a full-page remount loop.
    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          void reg.unregister();
        }
      });
      return;
    }

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Install still works without SW on some browsers; ignore registration errors.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}

export default PwaRegister;
