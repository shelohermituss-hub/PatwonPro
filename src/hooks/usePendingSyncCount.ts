"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

/** Number of sales recorded locally that haven't reached Supabase yet. */
export function usePendingSyncCount() {
  return useLiveQuery(
    () => db.sales.where("sync_status").equals("pending").count(),
    [],
    0,
  );
}
