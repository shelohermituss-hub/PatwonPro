"use client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const array = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    array[i] = rawData.charCodeAt(i);
  }
  return array;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC_KEY
  );
}

/**
 * Requests notification permission (must be called from a user gesture
 * — the caller shows an explanatory Creole screen first, same pattern
 * as `InstallPrompt.tsx`, never a cold prompt on first load) then
 * subscribes via the Push API and registers the subscription server-side.
 */
export async function subscribeToPush(): Promise<{ error: string | null }> {
  if (!isPushSupported()) {
    return { error: "Aparèy sa a pa sipòte notifikasyon push." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { error: "Ou refize otorizasyon notifikasyon an." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    });

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      return { error: "Nou pa t ka anrejistre abònman an." };
    }

    return { error: null };
  } catch {
    return { error: "Nou pa t ka aktive notifikasyon yo." };
  }
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}
