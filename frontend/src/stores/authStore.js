import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';

const API = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('stella_user') || 'null'),
  loading: false,
  error: null,
  phoneNumber: '',
  showLoginModal: false,

  get isAuthenticated() {
    return !!get().user;
  },
  get isAdmin() {
    return get().user?.role === 'admin';
  },

  toggleLoginModal: (show) => set({ showLoginModal: show }),

  checkUser: async (phoneNumber) => {
    set({ loading: true, error: null, phoneNumber });
    try {
      const response = await fetch(`${API}/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to check user');
      return data.exists;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  sendOTP: async (phoneNumber) => {
    set({ loading: true, error: null, phoneNumber });
    try {
      const response = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
      return true;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  login: async (phoneNumber, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid credentials');
      
      localStorage.setItem('stella_user', JSON.stringify(data.user));
      set({ user: data.user });
      return data.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async (phoneNumber, password, code, name = 'Stella Customer') => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password, code, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      
      localStorage.setItem('stella_user', JSON.stringify(data.user));
      set({ user: data.user });
      return data.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (phoneNumber, newPassword, code) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, newPassword, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      return true;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('stella_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: () => {
    localStorage.removeItem('stella_user');
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();
    set({ user: null, phoneNumber: '' });
  },
}));
