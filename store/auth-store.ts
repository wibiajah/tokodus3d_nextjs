"use client";
import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
//  AUTH STORE
//  Menyimpan state customer yang teridentifikasi dari Laravel
//  via Auth Bridge (token one-time dari /design-3d/launch)
//
//  Data ini TIDAK persistent (hilang kalau halaman di-refresh).
//  Untuk persist, bisa pakai sessionStorage di useAuthBridge.
// ─────────────────────────────────────────────────────────────

export interface AuthCustomer {
  customer_id: number;
  name: string;
  email: string;
  foto_profil: string | null;
}

interface AuthState {
  customer: AuthCustomer | null;
  isIdentified: boolean;
  isLoading: boolean;

  // Actions
  setCustomer: (c: AuthCustomer) => void;
  clearCustomer: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  isIdentified: false,
  isLoading: false,

  setCustomer: (c) => set({ customer: c, isIdentified: true, isLoading: false }),
  clearCustomer: () => set({ customer: null, isIdentified: false }),
  setLoading: (v) => set({ isLoading: v }),
}));