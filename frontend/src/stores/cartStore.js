import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * item.quantity, 0),

  addToCart: (product) =>
    set((state) => {
      const cartItemId = product.cartItemId || String(product.id);
      const existing = state.items.find((item) => (item.cartItemId || String(item.id)) === cartItemId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            (item.cartItemId || String(item.id)) === cartItemId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            cartItemId: cartItemId,
            name: product.name,
            variantLabel: product.variantLabel || '',
            price: product.price,
            img: product.img || product.image_url,
            quantity: 1,
          },
        ],
      };
    }),

  removeFromCart: (cartItemId) =>
    set((state) => ({ items: state.items.filter((item) => (item.cartItemId || String(item.id)) !== cartItemId) })),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        (item.cartItemId || String(item.id)) === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    })),

  clearCart: () => set({ items: [] }),
}));
