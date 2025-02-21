import { useAuth } from "@/lib/auth"

export async function customFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refreshAccessToken, logout } = useAuth.getState(); // Acceder a Zustand

  options.headers = {
    ...options.headers,
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
  };

  const response = await fetch(url, options);

  if (response.status === 401) {
    console.warn("⚠️ Token expirado, intentando refrescar...");

    // Intenta refrescar el token
    await refreshAccessToken();

    // Obtiene el nuevo token de Zustand (después del refresh)
    const newAccessToken = useAuth.getState().accessToken;

    if (newAccessToken) {
      console.log("🔄 Token refrescado, reintentando request original...");

      // Actualiza el header con el nuevo token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return fetch(url, options); // Reintenta la petición original con el nuevo token
    } else {
      console.error("❌ No se pudo refrescar el token, cerrando sesión...");
      logout();
      throw new Error("No autorizado");
    }
  }

  return response;
}
