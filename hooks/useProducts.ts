import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, PRODUCTS } from '../constants/products';

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
      
      let fetchedProducts: Product[] = [];
      if (Array.isArray(data)) {
        fetchedProducts = data;
      } else if (data && Array.isArray(data.data)) {
        fetchedProducts = data.data;
      } else if (data && Array.isArray(data.products)) {
        fetchedProducts = data.products;
      }
      
      const apiIds = new Set(fetchedProducts.map(p => String(p.id)));
      let mergedProducts = [
        ...PRODUCTS.filter(p => !apiIds.has(String(p.id))),
        ...fetchedProducts
      ];
      
      // Apply local overrides for sample products
      try {
        const storedUpdates = await AsyncStorage.getItem('@local_product_updates');
        if (storedUpdates) {
          const updates = JSON.parse(storedUpdates);
          mergedProducts = mergedProducts.map(p => 
            updates[String(p.id)] ? { ...p, ...updates[String(p.id)], id: p.id } : p
          );
        }
        const storedDeleted = await AsyncStorage.getItem('@local_product_deleted');
        if (storedDeleted) {
          const deleted = JSON.parse(storedDeleted);
          mergedProducts = mergedProducts.filter(p => !deleted.includes(String(p.id)));
        }
      } catch (e) {
        console.warn("Error loading local updates", e);
      }
      
      setProducts(mergedProducts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      setProducts([...PRODUCTS]);
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
      
      // If product not found on backend (usually 404), allow local state update for sample products
      if (response.status === 404 || msg.includes('not found')) {
        try {
          const storedUpdates = await AsyncStorage.getItem('@local_product_updates');
          const updates = storedUpdates ? JSON.parse(storedUpdates) : {};
          updates[String(id)] = data;
          await AsyncStorage.setItem('@local_product_updates', JSON.stringify(updates));
        } catch (e) {
           console.warn("Failed to save local update", e);
        }
        await fetchProducts();
        return;
      }
      
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
        
        // Optimistically delete local product
        if (response.status === 404 || msg.includes('not found')) {
          try {
            const storedDeleted = await AsyncStorage.getItem('@local_product_deleted');
            const deleted = storedDeleted ? JSON.parse(storedDeleted) : [];
            deleted.push(String(id));
            await AsyncStorage.setItem('@local_product_deleted', JSON.stringify(deleted));
          } catch (e) {}
          await fetchProducts();
          return;
        }

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
