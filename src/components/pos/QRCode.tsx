"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Skeleton } from "@/components/ui/skeleton";

/** Renders `value` as a scannable QR code — used so the customer can open a payment link on their own phone. */
export function QRCodeImage({ value, size = 200 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <Skeleton style={{ width: size, height: size }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not an optimizable remote asset
    <img
      src={dataUrl}
      alt="Kòd QR pou peman an"
      width={size}
      height={size}
      className="rounded-lg border border-border"
    />
  );
}
