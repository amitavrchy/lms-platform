"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { mapAuthPayload } from "@/lib/auth-map";
import { setHydrated, setUser } from "@/features/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const token = localStorage.getItem("learnora_access_token");
      if (!token) {
        dispatch(setHydrated(true));
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) dispatch(setUser(mapAuthPayload(data)));
      } catch {
        if (!cancelled) {
          localStorage.removeItem("learnora_access_token");
          localStorage.removeItem("learnora_refresh_token");
          dispatch(setUser(null));
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return children;
}
