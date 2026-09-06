import { createClient } from "@/lib/supabase/client";
import { pullCustomers } from "@/lib/sync/customers";
import type { CustomerFormOutput } from "@/lib/validations/customer";
import type { Customer } from "@/types";

/**
 * Creates a customer directly in Supabase (RLS: `customers_write_owner`,
 * migration 007 — owner only, same as products/categories). No Dexie
 * push-sync exists for customers yet (`pullCustomers` docstring), so
 * this is online-only; the picker refreshes immediately via a re-pull
 * rather than an optimistic local write.
 */
export async function createCustomer(storeId: string, input: CustomerFormOutput): Promise<Customer> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      store_id: storeId,
      full_name: input.fullName,
      phone: input.phone || null,
      credit_limit: input.creditLimit,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message === "" || !error.message ? "Nou pa t ka kreye kliyan an." : error.message);
  }

  await pullCustomers(storeId);
  return data as Customer;
}
