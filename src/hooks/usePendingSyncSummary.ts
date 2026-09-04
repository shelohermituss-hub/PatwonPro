"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export interface PendingSyncSummary {
  total: number;
  sales: number;
  products: number;
  creditPayments: number;
}

const EMPTY: PendingSyncSummary = { total: 0, sales: 0, products: 0, creditPayments: 0 };

/**
 * Breakdown of locally-recorded rows that haven't reached Supabase yet,
 * across every table the sync engine (src/lib/sync/) pushes — the data
 * behind both the sidebar's sync pill and its queue breakdown popover.
 */
export function usePendingSyncSummary(): PendingSyncSummary {
  return (
    useLiveQuery(async () => {
      const [sales, products, creditPayments] = await Promise.all([
        db.sales.where("sync_status").equals("pending").count(),
        db.products.where("sync_status").equals("pending").count(),
        db.creditPayments.where("sync_status").equals("pending").count(),
      ]);
      return { total: sales + products + creditPayments, sales, products, creditPayments };
    }, []) ?? EMPTY
  );
}
