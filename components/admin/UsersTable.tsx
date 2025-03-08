'use client'

import { useState } from "react"
import { useUsers, type User } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Key, UserX, Shield, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination } from "@/components/common/Pagination"
import { UsersTableSkeleton } from "@/components/admin/UserTableSkeleton"

const USERS_PER_PAGE = 10

export function UsersTable() {
  const {
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
  } = useUsers(USERS_PER_PAGE)

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca"
    
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "EDITOR":
        return "secondary"
      case "USER":
      default:
        return "outline"
    }
  }

  const getRoleDisplayName = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "EDITOR":
        return "Editor"
      case "USER":
        return "Usuario"
      default:
        return role
    }
  }

  const availableRoles: ("USER" | "EDITOR")[] = ["USER", "EDITOR"]

  const handleLocalSearch = () => {
    handleSearch(localSearchTerm)
  }

  const handleClearSearch = () => {
    setLocalSearchTerm("")
    clearSearch()
  }

  const handleRoleChange = async (userId: string, newRole: "USER" | "EDITOR") => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.role === "ADMIN") {
      alert("No se puede cambiar el rol de un administrador");
      return;
    }

    const success = await changeRole(userId, newRole);
    
    if (success) {
      console.log(`Rol de usuario cambiado a ${newRole} exitosamente`);
    } else {
      console.error("No se pudo cambiar el rol del usuario");
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl px-4 font-bold tracking-tight">Lista de Usuarios</h2>
        <div className="flex items-center space-x-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-sm w-full sm:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            {localSearchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={handleLocalSearch}>
            Buscar
          </Button>
        </div>
      </div>
      {isLoading ? (
        <UsersTableSkeleton />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "activo" ? "outline" : "destructive"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell>{formatDate(user.registrationDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => resetPassword(user.id)}>
                          <Key className="mr-2 h-4 w-4" />
                          Restablecer contraseña
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
                        {user.role !== "ADMIN" ? (
                          availableRoles.map((role) => (
                            user.role !== role && (
                              <DropdownMenuItem key={role} onClick={() => handleRoleChange(user.id, role)}>
                                <Shield className="mr-2 h-4 w-4" />
                                {getRoleDisplayName(role)}
                              </DropdownMenuItem>
                            )
                          ))
                        ) : (
                          <DropdownMenuItem disabled>
                            <Shield className="mr-2 h-4 w-4" />
                            No modificable
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleBanStatus(user.id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          {user.status === "activo" ? "Banear usuario" : "Desbanear usuario"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">No se encontraron usuarios que coincidan con la búsqueda.</p>
              <Button variant="link" onClick={handleClearSearch} className="mt-2">
                Limpiar búsqueda
              </Button>
            </div>
          )}
          {totalUsers > 0 && (
            <div className="text-sm text-muted-foreground mt-2 ml-4">
              Mostrando {users.length} de {totalUsers} usuarios
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} className="my-4" />
        </>
      )}
    </>
  )
}

