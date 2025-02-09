import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Trash2, MoreHorizontal, Eye } from "lucide-react"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post } from "@/lib/types"

interface PostsTableProps {
  posts: Post[]
  onDelete: (postId: number) => void
  onEdit: (postId: number) => void
}

export function PostsTable({ posts, onDelete, onEdit }: PostsTableProps) {
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post)
  }

  const confirmDelete = () => {
    if (postToDelete) {
      onDelete(postToDelete.id)
      setPostToDelete(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Título</TableHead>
            <TableHead className="w-[30%]">Autor</TableHead>
            <TableHead className="w-[20%]">Fecha</TableHead>
            <TableHead className="w-[10%]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{post.author.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {post.publishDate ? format(new Date(post.publishDate), "dd MMM yyyy", { locale: es }) : "Borrador"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => window.open(`/post/${post.id}`, "_blank")}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Ver</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(post.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(post)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de que quieres eliminar este post?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el post &quot;
              {postToDelete?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

