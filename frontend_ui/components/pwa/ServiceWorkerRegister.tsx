"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker (public/sw.js) in production only.
 * Renders nothing. Registration is intentionally best-effort and never
 * throws or blocks rendering — if it fails (unsupported browser, no
 * HTTPS, etc.) the app continues to work exactly as before.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // If an updated service worker is found, let it activate on next
        // load without forcing a disruptive reload mid-session (important
        // while a user may be mid-exam).
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // A new version is ready; it will take over on the next
              // full navigation/reload, keeping the current exam session
              // undisturbed.
              console.info("[PWA] New content is available and will be used on next visit.");
            }
          });
        });
      } catch (error) {
        console.warn("[PWA] Service worker registration failed:", error);
      }
    };

    // window.addEventListener("load", register);
    // return () => window.removeEventListener("load", register);
    register();
  }, []);

  return null;
}
