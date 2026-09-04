import Dexie, { type EntityTable } from "dexie";
import type {
  Category,
  CreditPayment,
  Customer,
  Product,
  Sale,
  SaleItem,
} from "@/types";

/**
 * Local offline-first store. Mirrors the Supabase tables that the POS needs
 * to keep working without a network connection. `sync_status` on `sales`
 * (and, transitively, its dependents) and `products` drives the background
 * sync worker in `src/lib/sync/`.
 */
export class JereBoutikDB extends Dexie {
  products!: EntityTable<Product, "id">;
  categories!: EntityTable<Category, "id">;
  customers!: EntityTable<Customer, "id">;
  sales!: EntityTable<Sale, "id">;
  saleItems!: EntityTable<SaleItem, "id">;
  creditPayments!: EntityTable<CreditPayment, "id">;

  constructor() {
    super("patwonpro");

    this.version(1).stores({
      products: "id, store_id, category_id, name, sku, is_active",
      categories: "id, store_id, name",
      customers: "id, store_id, full_name, phone",
      sales: "id, store_id, customer_id, sync_status, created_at",
      saleItems: "id, sale_id, product_id",
      creditPayments: "id, store_id, customer_id, sale_id, created_at",
    });

    // v2: products can now be created/edited offline (docs/PROMPTS/03-products.md,
    // dexie-offline.skill) — indexed sync_status so the sync engine can
    // query pending rows the same way it already does for sales.
    this.version(2).stores({
      products: "id, store_id, category_id, name, sku, is_active, sync_status",
    });

    // v3: repayments (docs/PROMPTS/05-credits.md) are recorded offline and
    // pushed the same way as sales/products — indexed sync_status so the
    // sync engine can find pending rows.
    this.version(3).stores({
      creditPayments: "id, store_id, customer_id, sale_id, created_at, sync_status",
    });
  }
}

export const db = new JereBoutikDB();
