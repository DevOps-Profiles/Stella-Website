import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('stella_wishlist') || '[]'),

  isInWishlist: (productId) => get().items.some((item) => item.id === productId),

  get totalItems() {
    return get().items.length;
  },

  clearWishlist: () => {
    localStorage.setItem('stella_wishlist', '[]');
    set({ items: [] });
  },

  toggleWishlist: (product) =>
    set((state) => {
      const index = state.items.findIndex((item) => item.id === product.id);
      let items;
      if (index > -1) {
        items = state.items.filter((item) => item.id !== product.id);
      } else {
        items = [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            img:
              product.img ||
              product.image_url ||
              'https://images.unsplash.com/photo-1592899677974-c12d0d014bc0?auto=format&fit=crop&w=400&q=80',
          },
        ];
      }
      localStorage.setItem('stella_wishlist', JSON.stringify(items));
      return { items };
    }),

  removeFromWishlist: (productId) =>
    set((state) => {
      const items = state.items.filter((item) => item.id !== productId);
      localStorage.setItem('stella_wishlist', JSON.stringify(items));
      return { items };
    }),
}));
