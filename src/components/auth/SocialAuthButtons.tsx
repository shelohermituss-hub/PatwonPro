"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "facebook" | "apple";

const PROVIDERS: { id: Provider; label: string; mark: React.ReactNode }[] = [
  { id: "google", label: "Google", mark: <GoogleMark /> },
  { id: "facebook", label: "Facebook", mark: <FacebookMark /> },
  { id: "apple", label: "Apple", mark: <AppleMark /> },
];

/**
 * "Kontinye ak ..." OAuth buttons. Requires the corresponding provider to
 * be enabled in the Supabase project (Authentication → Providers) with a
 * real Client ID/Secret from each provider's own developer console — that
 * part can't be done from here, see docs/PROMPTS/02-auth.md.
 */
export function SocialAuthButtons() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: Provider) {
    setError(null);
    setPending(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Nou pa t ka konekte ak founisè sa a. Eseye ankò.");
      setPending(null);
    }
    // On success the browser navigates away to the provider immediately —
    // no local "success" state to handle here.
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
        <span className="h-px flex-1 bg-border" />
        oswa kontinye ak
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        {PROVIDERS.map(({ id, label, mark }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => signInWith(id)}
            className="min-h-12 w-full justify-center gap-2.5"
          >
            {pending === id ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              mark
            )}
            Kontinye ak {label}
          </Button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="9" fill="#1877F2" />
      <path
        fill="#fff"
        d="M12.1 11.6l.4-2.6h-2.5V7.3c0-.7.35-1.4 1.48-1.4h1.14V3.7s-1.04-.18-2.03-.18c-2.07 0-3.42 1.25-3.42 3.53v2h-2.3v2.6h2.3v6.28c.46.07.93.11 1.42.11s.96-.04 1.42-.11V11.6h2.1Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
      <path
        fill="currentColor"
        d="M13.1 9.55c-.02-1.83 1.5-2.72 1.57-2.76-.86-1.25-2.19-1.42-2.66-1.44-1.13-.11-2.2.66-2.78.66-.58 0-1.47-.65-2.42-.63-1.24.02-2.4.72-3.04 1.83-1.3 2.25-.33 5.57.93 7.4.62.9 1.35 1.9 2.32 1.87.93-.04 1.28-.6 2.4-.6 1.13 0 1.44.6 2.42.58 1-.02 1.63-.9 2.24-1.8.71-1.04 1-2.04 1.01-2.09-.02-.01-1.94-.75-1.96-2.98l-.03-.04Z"
      />
      <path
        fill="currentColor"
        d="M11.3 3.72c.51-.62.86-1.48.76-2.34-.74.03-1.63.49-2.16 1.11-.47.55-.89 1.43-.78 2.27.83.06 1.67-.42 2.18-1.04Z"
      />
    </svg>
  );
}
