"use client";
// ─────────────────────────────────────────────────────────────
//  AuthBridgeWrapper
//  Wrapper client component agar useAuthBridge bisa dipanggil
//  dari layout.tsx (yang server component)
// ─────────────────────────────────────────────────────────────
import { useAuthBridge } from "@/hooks/use-auth-bridge";

export default function AuthBridgeWrapper() {
  useAuthBridge();
  return null;
}