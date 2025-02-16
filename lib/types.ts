import { z } from "zod"

// Enums para valores restringidos
export enum UserRole {
  Admin = "admin",
  User = "user",
  Editor = "editor",
}

export enum FontSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

export enum PostLayout {
  Card = "card",
  List = "list",
  Compact = "compact",
}

// Tipos base reutilizables
export interface BaseUser {
  id: string
  email: string
  nick: string
  name: string
  avatar?: string
}

export interface BasePost {
  id: number
  title: string
  excerpt: string
  image: string
  tags: string[]
  likes: number
  comments: number
}

export interface Author {
  id: string
  name: string
  avatar: string
}

// Tipos principales
export interface User extends BaseUser {
  role: UserRole
}

export interface Post extends BasePost {
  content: string
  author: Author
  coverImage: string
  date: string
  publishDate: string | null
  readTime: number
}

export interface Comment {
  id: string
  author: Author
  content: string
  likes: number
  replies: Comment[]
  createdAt: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
}

// Props de componentes
export type UserAvatarProps = Pick<BaseUser, "name" | "avatar">

export interface UserMenuProps {
  user: BaseUser
}

export interface MobileMenuProps {
  theme: string | undefined
  setTheme: (theme: string) => void
  user: User | null
}

export interface BlogListProps {
  posts: Post[]
  isLoading: boolean
}

export interface CommentsProps {
  comments: Comment[]
}

export interface CodeBlockProps {
  language: string
  value: string
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface SidebarProps {
  recommendedPosts?: Post[]
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

// Estado y hooks
export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  refreshAccessToken: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isEditor: () => boolean
}

export interface UseCommentsReturn {
  comments: Comment[]
  replyingTo: string | null
  replyContent: string
  handleLike: (commentId: string) => void
  handleReply: (commentId: string) => void
  submitReply: () => void
  setReplyContent: (content: string) => void
  addNewComment: (content: string, authorId: string) => void
  cancelReply: () => void
  deleteComment: (commentId: string) => void
}

// Perfil del usuario
export interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  joinDate: string
  socialLinks: {
    twitter?: string
    github?: string
    linkedin?: string
  }
  skills: string[]
  stats: {
    savedPosts: number
    followers: number
    following: number
  }
}

export interface EditProfileFormProps {
  profile: UserProfile
  onSave: (updatedProfile: UserProfile) => void
  onCancel: () => void
}

export interface UseProfileReturn {
  profile: UserProfile | null
  savedPosts: Post[]
  isLoading: boolean
  error: string | null
  updateProfile: (updatedProfile: UserProfile) => Promise<void>
}

// Configuración de usuario
export type Settings = {
  notifications: boolean
  replyNotifications: boolean
  fontSize: FontSize
  postLayout: PostLayout
}

export const postSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  excerpt: z.string().min(1, "El extracto es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  tags: z.array(z.string()).min(1, "Debes agregar al menos un tag"),
  coverImage: z
    .any()
    .refine((files) => !files || files?.length === 0 || files[0]?.size <= 10 * 1024 * 1024, "El tamaño máximo es 10MB")
    .refine(
      (files) => !files || files?.length === 0 || ["image/jpeg", "image/png", "image/gif"].includes(files[0]?.type),
      "Solo se permiten formatos .jpg, .png o .gif"
    )
});

export type PostFormData = z.infer<typeof postSchema>
