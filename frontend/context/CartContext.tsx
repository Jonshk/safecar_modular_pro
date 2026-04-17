"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: number) => void;
  update: (id: number, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [], count: 0, total: 0,
  add: () => {}, remove: () => {}, update: () => {}, clear: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const update = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, update, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);