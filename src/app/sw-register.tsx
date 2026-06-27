"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) on the client, enabling
 * install-to-home-screen and offline support. Renders nothing.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app still works online.
      });
    }
  }, []);

  return null;
}
