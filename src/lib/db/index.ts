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
 * (and, transitively, its dependents) drives the background sync worker in
 * `src/lib/sync/`.
 */
export class JereBoutikDB extends Dexie {
  products!: EntityTable<Product, "id">;
  categories!: EntityTable<Category, "id">;
  customers!: EntityTable<Customer, "id">;
  sales!: EntityTable<Sale, "id">;
  saleItems!: EntityTable<SaleItem, "id">;
  creditPayments!: EntityTable<CreditPayment, "id">;

  constructor() {
    super("jere-boutik");

    this.version(1).stores({
      products: "id, store_id, category_id, name, sku, is_active",
      categories: "id, store_id, name",
      customers: "id, store_id, full_name, phone",
      sales: "id, store_id, customer_id, sync_status, created_at",
      saleItems: "id, sale_id, product_id",
      creditPayments: "id, store_id, customer_id, sale_id, created_at",
    });
  }
}

export const db = new JereBoutikDB();
