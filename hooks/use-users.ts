import { useState, useCallback, useEffect } from "react"
import { customFetch } from "@/lib/customFetch"

// Actualizamos la interfaz User para que coincida con el backend
export interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "USER" | "EDITOR" // Actualizamos los roles según el backend
  status: "activo" | "baneado"
  lastLogin: string | null
  registrationDate: string
  avatar: string | null
}

// Interfaz para la respuesta paginada del backend
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}

export function useUsers(usersPerPage = 10) {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Función para obtener los usuarios del backend
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      // Construimos la URL con los parámetros de paginación y búsqueda
      const url = new URL('/users', process.env.NEXT_PUBLIC_API_URL);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', usersPerPage.toString());
      
      if (searchTerm) {
        url.searchParams.append('searchTerm', searchTerm);
      }
      
      const response = await customFetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
      }
      
      const data: PaginatedResponse<User> = await response.json();
      
      setUsers(data.data);
      setTotalUsers(data.meta.total);
      setTotalPages(data.meta.lastPage);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, usersPerPage]);

  // Efecto para cargar usuarios cuando cambian los parámetros
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Función para banear a un usuario
  const banUser = useCallback(async (userId: string) => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}users/${userId}/ban`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Actualizamos el estado del usuario localmente
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: "baneado" } : user
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al banear usuario:", error);
      return false;
    }
  }, []);

  // Función para desbanear a un usuario
  const unbanUser = useCallback(async (userId: string) => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}users/${userId}/unban`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Actualizamos el estado del usuario localmente
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: "activo" } : user
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al desbanear usuario:", error);
      return false;
    }
  }, []);

  // Función que decide si banear o desbanear según el estado actual
  const toggleBanStatus = useCallback(async (userId: string) => {
    const user = users.find(user => user.id === userId);
    if (!user) return false;
    
    if (user.status === "activo") {
      return await banUser(userId);
    } else {
      return await unbanUser(userId);
    }
  }, [users, banUser, unbanUser]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Función para cambiar el rol de un usuario
  const changeRole = useCallback(async (userId: string, newRole: "USER" | "EDITOR") => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        // Actualizamos el estado del usuario localmente
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al cambiar el rol del usuario:", error);
      return false;
    }
  }, []);

  // La función resetPassword también podría implementarse cuando exista el endpoint
  const resetPassword = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_userId: string) => {
      console.warn("Restablecimiento de contraseña no implementado en el backend todavía");
    }, 
    []
  );

  return {
    users,
    resetPassword,
    changeRole,
    toggleBanStatus,
    currentPage,
    totalPages,
    goToPage,
    handleSearch,
    clearSearch,
    searchTerm,
    isLoading,
    totalUsers,
    refreshUsers: fetchUsers,
  }
}

