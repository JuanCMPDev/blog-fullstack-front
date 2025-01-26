// Enums para valores restringidos
export enum UserRole {
  Admin = "admin",
  User = "user",
  Moderator = "moderator",
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
  publishDate: string
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

// Props de componentes
export type UserAvatarProps = Pick<BaseUser, "name" | "avatar">

export interface UserMenuProps {
  user: BaseUser
}

export interface MobileMenuProps {
  theme: string | null
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

// Estado y hooks
export interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  isAdmin: () => boolean
  logout: () => void
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
