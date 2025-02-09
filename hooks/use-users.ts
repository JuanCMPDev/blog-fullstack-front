import { useState, useCallback, useMemo, useEffect } from "react"
import { type User, mockUsers } from "@/lib/mock-users"

export function useUsers(usersPerPage = 10) {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      // Simulamos una carga desde el backend
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setUsers(mockUsers)
      setIsLoading(false)
    }

    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage
    return filteredUsers.slice(startIndex, startIndex + usersPerPage)
  }, [filteredUsers, currentPage, usersPerPage])

  const resetPassword = useCallback((userId: string) => {
    console.log(`Contraseña restablecida para el usuario ${userId}`)
  }, [])

  const changeRole = useCallback((userId: string, newRole: User["role"]) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }, [])

  const toggleBanStatus = useCallback((userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: user.status === "activo" ? "baneado" : "activo" } : user,
      ),
    )
  }, [])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setCurrentPage(1)
  }, [])

  return {
    users: paginatedUsers,
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
  }
}

