import { create } from 'zustand';

const stored = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const useAuthStore = create((set) => ({
  user: stored(),

  setAuth: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
