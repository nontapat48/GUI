import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../constants/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: CartItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  favorites: string[];
  orders: Order[];
  addToCart: (product: Product, quantity: number, color: string, size: string) => void;
  removeFromCart: (productId: string | number, color: string, size: string) => void;
  updateQuantity: (productId: string | number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  toggleFavorite: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (product: Product, quantity: number, color: string, size: string) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          String(item.product.id) === String(product.id) &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prevItems, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });
  };

  const removeFromCart = (productId: string | number, color: string, size: string) => {
    const idStr = String(productId);
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            String(item.product.id) === idStr &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
  };

  const updateQuantity = (productId: string | number, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    const idStr = String(productId);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.product.id) === idStr &&
        item.selectedColor === color &&
        item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const toggleFavorite = (productId: string | number) => {
    const idStr = String(productId);
    setFavorites((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    );
  };

  const isFavorite = (productId: string | number) => {
    return favorites.includes(String(productId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        favorites,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addOrder,
        toggleFavorite,
        isFavorite,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
