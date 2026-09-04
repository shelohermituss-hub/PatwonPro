"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "patwonpro:install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Slim, dismissible banner offering to install the PWA. Chrome only fires
 * `beforeinstallprompt` when its own installability checks pass (manifest,
 * service worker, HTTPS) — there's nothing to fake here for browsers that
 * never fire it (iOS Safari, an already-installed app).
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferredPrompt) return null;

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDeferredPrompt(null);
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Download className="size-4 shrink-0 text-primary" aria-hidden />
        Enstale PatwonPro sou aparèy ou pou l louvri pi vit e travay san entènèt.
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" onClick={install}>
          Enstale
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fèmen"
          className="flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
