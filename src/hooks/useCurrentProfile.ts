"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

/**
 * Client-side counterpart to src/lib/supabase/profile.ts's
 * getCurrentProfile() (that one needs next/headers, server-only). RLS
 * already scopes `profiles` to the caller's own row/store, so this is a
 * plain client-side select, not a privileged call.
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setProfile(data);
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, isLoading };
}
