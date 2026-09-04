import { db } from "@/lib/db";
import { syncPendingStockEntries } from "@/lib/sync/stockEntries";
import type { StockEntry, StockEntryType } from "@/types";

export interface CreateStockEntryInput {
  storeId: string;
  employeeId: string;
  productId: string;
  entryType: StockEntryType;
  quantityDelta: number;
  reason?: string;
}

/**
 * Records a stock entry (restock/correction/adjustment) offline-first, same
 * split-ownership model as checkoutSale(): the local `stock_quantity` patch
 * below is UI-only feedback, never pushed — the `security definer`
 * `stock_entries_apply_delta` trigger (00000000000008) is the sole
 * server-side source of truth once the entry syncs.
 */
export async function createStockEntry(
  input: CreateStockEntryInput,
): Promise<StockEntry> {
  const now = new Date().toISOString();

  const entry = await db.transaction(
    "rw",
    db.stockEntries,
    db.products,
    async () => {
      const product = await db.products.get(input.productId);
      if (!product) throw new Error("Pwodwi a pa disponib.");

      const stockBefore = product.stock_quantity;
      const stockAfter = Math.max(stockBefore + input.quantityDelta, 0);

      const newEntry: StockEntry = {
        id: crypto.randomUUID(),
        store_id: input.storeId,
        product_id: input.productId,
        employee_id: input.employeeId,
        entry_type: input.entryType,
        quantity_delta: input.quantityDelta,
        stock_before: stockBefore,
        stock_after: stockAfter,
        reason: input.reason?.trim() || null,
        sync_status: "pending",
        sync_attempts: 0,
        next_sync_at: null,
        created_at: now,
      };

      await db.stockEntries.add(newEntry);
      await db.products.update(input.productId, {
        stock_quantity: stockAfter,
        updated_at: now,
      });

      return newEntry;
    },
  );

  void syncPendingStockEntries();

  return entry;
}
