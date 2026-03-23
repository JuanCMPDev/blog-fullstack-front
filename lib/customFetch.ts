import { useAuth } from "@/lib/auth"
import { buildApiUrl } from "@/lib/api"

// Mutex para evitar múltiples refresh concurrentes
let refreshPromise: Promise<void> | null = null

export async function customFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refreshAccessToken, logout } = useAuth.getState();

  const finalUrl = buildApiUrl(url)
  const baseHeaders = options.headers ? new Headers(options.headers) : new Headers()
  if (accessToken) {
    baseHeaders.set("Authorization", `Bearer ${accessToken}`)
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: baseHeaders,
    credentials: "include",
  }

  const response = await fetch(finalUrl, requestOptions);

  // Si el AuthGuard auto-refrescó el token, actualizar el store con el nuevo access token
  const newTokenFromHeader = response.headers.get("x-access-token");
  if (newTokenFromHeader) {
    useAuth.getState().setAccessToken(newTokenFromHeader);
  }

  if (response.status === 401) {
    console.warn("⚠️ Token expirado, intentando refrescar...");

    // Si ya hay un refresh en curso, esperar a que termine
    // Si no, iniciar uno nuevo
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    await refreshPromise

    // Obtiene el nuevo token de Zustand (después del refresh)
    const newAccessToken = useAuth.getState().accessToken;

    if (newAccessToken) {
      console.log("🔄 Token refrescado, reintentando request original...");

      const retryHeaders = requestOptions.headers ? new Headers(requestOptions.headers) : new Headers()
      retryHeaders.set("Authorization", `Bearer ${newAccessToken}`)

      return fetch(finalUrl, {
        ...requestOptions,
        headers: retryHeaders,
      });
    } else {
      console.error("❌ No se pudo refrescar el token, cerrando sesión...");
      logout();
      throw new Error("No autorizado");
    }
  }

  return response;
}
