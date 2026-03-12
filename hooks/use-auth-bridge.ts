"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";

const PROXY_BASE   = "";
const SESSION_KEY  = "3d_customer";
const LOGIN_AT_KEY = "3d_login_at";
const POLL_MS      = 60_000;

// ── #14: dispatch custom event — listener ada di SessionBanner ──
function notifyUser(type: "expired" | "invalid" | "network") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:notify", { detail: { type } }));
}

// ── #13: retry whoami max 3x ────────────────────────────────────
async function fetchWhoamiWithRetry(token: string, maxRetries = 3): Promise<Response> {
  let lastError: Error = new Error("Unknown error");
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(
        `${PROXY_BASE}/api/proxy/auth/whoami?t=${encodeURIComponent(token)}`
      );
      if (res.status === 401 || res.status === 400) return res;
      if (res.ok) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        const delay = attempt * 1500;
        console.warn(`⚠️ whoami attempt ${attempt} gagal, retry dalam ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export function useAuthBridge() {
  const { setCustomer, clearCustomer, setLoading } = useAuthStore();
  const calledRef   = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkSession = useCallback(async (customerId: number) => {
    const loginAt = localStorage.getItem(LOGIN_AT_KEY) ?? "0";
    try {
      const res = await fetch(`${PROXY_BASE}/api/proxy/auth/check-session`, {
        headers: {
          "X-Customer-Id": String(customerId),
          "X-Login-At":    loginAt,
        },
      });
      if (res.status === 401) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LOGIN_AT_KEY);
        clearCustomer();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        console.warn("🔒 Session check: sesi berakhir, auto-logout");
        notifyUser("expired"); // #14
      }
    } catch (_) {
      console.warn("⚠️ Session check: network error, skip");
    }
  }, [clearCustomer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("t");

    if (token) {
      window.history.replaceState({}, "", window.location.pathname);
      if (calledRef.current) return;
      calledRef.current = true;

      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOGIN_AT_KEY);
      setLoading(true);

      fetchWhoamiWithRetry(token) // #13
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((res) => {
          if (res.status === 200 && res.data) {
            setCustomer(res.data);
            const loginAt = res.data.server_time
              ? String(res.data.server_time)
              : Math.floor(Date.now() / 1000).toString();
            try {
              localStorage.setItem(SESSION_KEY, JSON.stringify(res.data));
              localStorage.setItem(LOGIN_AT_KEY, loginAt);
            } catch (_) {}
            console.log("✅ Auth bridge: identified →", res.data.name);
            intervalRef.current = setInterval(() => {
              checkSession(res.data.customer_id);
            }, POLL_MS);
          } else {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(LOGIN_AT_KEY);
            console.warn("⚠️ Auth bridge: invalid →", res.message);
            notifyUser("invalid"); // #14
          }
        })
        .catch((err) => {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(LOGIN_AT_KEY);
          console.error("❌ Auth bridge: error →", err.message);
          notifyUser("network"); // #14
        })
        .finally(() => setLoading(false));

    } else {
      try {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setCustomer(data);
          console.log("🔄 Auth bridge: restored from localStorage");
          checkSession(data.customer_id);
          intervalRef.current = setInterval(() => {
            checkSession(data.customer_id);
          }, POLL_MS);
        }
      } catch (_) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LOGIN_AT_KEY);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkSession, setCustomer, setLoading]);

  useEffect(() => {
    function handleFocus() {
      const customer = useAuthStore.getState().customer;
      if (customer) {
        console.log("👁 Tab fokus: cek sesi...");
        checkSession(customer.customer_id);
      }
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkSession]);
}