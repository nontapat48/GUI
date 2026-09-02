import { useState, useEffect, useCallback } from 'react';
import { Product } from '../constants/products';

const API_URL = 'http://119.59.102.161:3023/api/products';

export type ProductInput = Omit<Product, 'id' | 'created_at'>;

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createProduct: (data: ProductInput) => Promise<void>;
  updateProduct: (id: number, data: ProductInput) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- CREATE ---
  const createProduct = useCallback(async (data: ProductInput) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = `ไม่สามารถเพิ่มสินค้าได้ (${response.status})`;
      try { msg = await response.text(); } catch (_) {}
      throw new Error(msg);
    }
    await fetchProducts();
  }, [fetchProducts]);

  // --- UPDATE ---
  const updateProduct = useCallback(async (id: number, data: ProductInput) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = `ไม่สามารถแก้ไขสินค้าได้ (${response.status})`;
      try { msg = await response.text(); } catch (_) {}
      throw new Error(msg);
    }
    await fetchProducts();
  }, [fetchProducts]);

  // --- DELETE ---
  const deleteProduct = useCallback(async (id: number | string) => {
    // 1. Optimistic removal from state so UI updates instantly
    setProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => String(p.id) !== String(id)) : []));

    try {
      // Method A: DELETE /api/products/:id
      let response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      // Method B: If 404 or 405, try DELETE /api/products with JSON body { id }
      if (!response.ok && (response.status === 404 || response.status === 405 || response.status === 400)) {
        response = await fetch(API_URL, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) || id }),
        });
      }

      // Method C: If still not ok, try query parameter DELETE /api/products?id=:id
      if (!response.ok && (response.status === 404 || response.status === 405 || response.status === 400)) {
        response = await fetch(`${API_URL}?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!response.ok) {
        let msg = `ลบสินค้าไม่สำเร็จ (${response.status})`;
        try {
          const errText = await response.text();
          if (errText) msg = errText;
        } catch (_) {}
        // Re-sync with server if backend returned error
        await fetchProducts();
        throw new Error(msg);
      }

      // Re-sync with server to make sure state is 100% accurate
      await fetchProducts();
    } catch (err) {
      // Re-sync on failure
      await fetchProducts();
      throw err;
    }
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
}
