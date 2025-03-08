import { useState, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Trash2, MoreHorizontal, Eye, Calendar, Clock, FileText, X, Check } from "lucide-react"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Post } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthorAvatar } from "@/components/common/AuthorAvatar"
import React from "react"

interface PostsTableProps {
  posts: Post[]
  onDelete: (postId: number) => Promise<boolean>
  onEdit: (postId: number) => void
  onStatusChange: (postId: number, publishDate: string | null) => Promise<boolean>
  isLoading?: boolean
}

export function PostsTable({ posts, onDelete, onEdit, onStatusChange, isLoading = false }: PostsTableProps) {
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [postToSchedule, setPostToSchedule] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [calendarVisible, setCalendarVisible] = useState(false)

  const resetStates = useCallback(() => {
    setPostToDelete(null)
    setPostToSchedule(null)
    setIsDeleting(false)
    setIsChangingStatus(false)
    setSelectedDate(undefined)
    setCalendarVisible(false)
  }, [])

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      resetStates();
    };
  }, [resetStates]);

  const handleDeleteClick = (post: Post) => {
    resetStates();
    setPostToDelete(post);
  }

  const cancelDelete = () => {
    setPostToDelete(null);
  }

  const confirmDelete = async () => {
    if (!postToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(postToDelete.id);
      if (success) {
        resetStates();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleScheduleClick = (post: Post) => {
    resetStates();
    setPostToSchedule(post);
    setSelectedDate(post.publishDate ? new Date(post.publishDate) : undefined);
    setCalendarVisible(true);
  }

  const cancelSchedule = () => {
    setPostToSchedule(null);
    setCalendarVisible(false);
    setSelectedDate(undefined);
  }

  const confirmSchedule = async () => {
    if (!postToSchedule || !selectedDate || isChangingStatus) return;
    
    await handleStatusChange(postToSchedule.id, selectedDate.toISOString());
  }

  const handleStatusChange = async (postId: number, publishDate: string | null) => {
    if (isChangingStatus) return;
    
    setIsChangingStatus(true);
    try {
      const success = await onStatusChange(postId, publishDate);
      if (success) {
        resetStates();
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setIsChangingStatus(false);
    }
  }

  const getStatusBadge = (post: Post) => {
    if (!post.publishDate) {
      return (
        <Badge variant="default" className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30">
          <FileText className="mr-1 h-3 w-3" />
          Borrador
        </Badge>
      )
    }

    const publishDate = new Date(post.publishDate)
    const now = new Date()

    if (publishDate > now) {
      return (
        <Badge variant="default" className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
          <Calendar className="mr-1 h-3 w-3" />
          Programado
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
        <Clock className="mr-1 h-3 w-3" />
        Publicado
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] lg:w-[35%]">Título</TableHead>
                <TableHead className="min-w-[150px] lg:w-[20%]">Autor</TableHead>
                <TableHead className="min-w-[120px] lg:w-[15%]">Estado</TableHead>
                <TableHead className="min-w-[120px] lg:w-[20%]">Fecha</TableHead>
                <TableHead className="w-[10%]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No se encontraron posts
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <React.Fragment key={post.id}>
                    <TableRow>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <AuthorAvatar author={post.author} className="h-8 w-8" />
                          <span>{post.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post)}
                      </TableCell>
                      <TableCell>
                        {post.publishDate ? format(new Date(post.publishDate), "dd MMM yyyy", { locale: es }) : "Sin fecha"}
                      </TableCell>
                      <TableCell>
                        {postToDelete?.id === post.id ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={confirmDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "..." : <Check className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={cancelDelete}
                              disabled={isDeleting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.open(`/post/${post.slug}`, "_blank")}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(post.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>Cambiar estado</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(post.id, new Date().toISOString())}
                                      disabled={isChangingStatus}
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      <span>Publicar ahora</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleScheduleClick(post)}
                                      disabled={isChangingStatus}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      <span>Programar publicación</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(post.id, null)}
                                      disabled={isChangingStatus}
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      <span>Guardar como borrador</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(post)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                    {postToSchedule?.id === post.id && calendarVisible && (
                      <TableRow key={`schedule-${post.id}`}>
                        <TableCell colSpan={5} className="p-0 border-t-0">
                          <Card className="border-t-0 rounded-t-none shadow-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                Programar publicación
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date: Date) => date < new Date()}
                                initialFocus
                                className="mx-auto"
                              />
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={cancelSchedule}
                                disabled={isChangingStatus}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={confirmSchedule}
                                disabled={isChangingStatus || !selectedDate}
                              >
                                {isChangingStatus ? "Programando..." : "Programar"}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </>
  )
}

