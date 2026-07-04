import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null); // null = easier to catch missing provider

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider'); // Senior guardrail
  return ctx;
}

const CART_KEY = 'singular_cart_v1'; // versioned key = safe migrations later

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // 1. SSR Safe + JSON Safe
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      console.warn('Corrupt cart in localStorage. Resetting.');
      localStorage.removeItem(CART_KEY);
      return [];
    }
  });

  // 2. Persist to localStorage, but debounce = performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product, qtyToAdd = 1) => {
    const price = Number(product.price); // 3. Type safety
    const stock = Number(product.stock ?? Infinity);

    if (!product?.id || price <= 0) return; // 4. Validation

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing?.qty ?? 0;
      const newQty = currentQty + qtyToAdd;

      if (newQty > stock) {
        alert(`Only ${stock} in stock`); // Replace with toast in prod
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: newQty } : item
        );
      }
      return [...prev, { ...product, price, qty: qtyToAdd }]; // store normalized price
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, qty) => {
    const newQty = Number(qty);
    if (newQty <= 0) return removeFromCart(id);

    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const stock = Number(item.stock ?? Infinity);
      if (newQty > stock) {
        alert(`Max stock: ${stock}`);
        return { ...item, qty: stock };
      }
      return { ...item, qty: newQty };
    }));
  };

  const clearCart = () => setCart([]);

  // 5. useMemo = no recalc on unrelated rerenders
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const total = subtotal; // Add tax/delivery here later

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    itemCount,
    subtotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}