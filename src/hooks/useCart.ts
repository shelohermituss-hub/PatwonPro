"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";

export interface CartLine {
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  /** Snapshot of stock at add-time — caps how far +/- can go without a re-check. */
  availableStock: number;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addProduct = useCallback((product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error(`Pa gen stòk pou "${product.name}".`);
      return;
    }

    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (!existing) {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            unitPrice: product.sale_price,
            quantity: 1,
            availableStock: product.stock_quantity,
          },
        ];
      }

      if (existing.quantity >= product.stock_quantity) {
        toast.error(`Ou rive nan kantite stòk ki disponib pou "${product.name}".`);
        return prev;
      }

      return prev.map((line) =>
        line.productId === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      );
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.productId !== productId);
      return prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(quantity, line.availableStock) }
          : line,
      );
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  return { lines, addProduct, setQuantity, removeLine, clear, subtotal };
}
