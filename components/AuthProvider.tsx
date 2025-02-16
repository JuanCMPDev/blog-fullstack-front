"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const refreshAccessToken = useAuth((state) => state.refreshAccessToken);
  const accessToken = useAuth((state) => state.accessToken);

  useEffect(() => {
    // Refrescar el token cada 15 minutos, solo si hay un accessToken válido
    const interval = setInterval(() => {
      if (accessToken) {
        refreshAccessToken();
      }
    }, 15 * 60 * 1000); // 15 minutos
    return () => clearInterval(interval);
  }, [refreshAccessToken, accessToken]);

  return <>{children}</>;
}
