import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

/**
 * Pull-only mirror of `customers` for the current store — read path for
 * the POS customer picker (cash sales can optionally tag a customer;
 * credit sales require one). Unlike products/sales, customers have no
 * local push-sync yet: full CRUD + credit_balance bookkeeping is owned by
 * `docs/PROMPTS/05-credits.md`, not this phase.
 */
export async function pullCustomers(storeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", storeId);

  if (error) return { pulled: 0, error };

  await db.customers.bulkPut(data ?? []);
  return { pulled: data?.length ?? 0, error: null };
}
