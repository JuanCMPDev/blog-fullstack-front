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

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED"
}

export enum ThemePreference {
  System = "system",
  Light = "light",
  Dark = "dark",
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
  nick?: string
}

// Tipos principales
export interface User extends BaseUser {
  role: UserRole
}

export interface Post extends BasePost {
  content: string
  slug: string
  author: Author
  coverImage: string
  date: string
  publishDate: string | null
  readTime: number
  status: PostStatus
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  id: string
  author: Author
  content: string
  likes: number
  replies: Comment[]
  createdAt: string
  postId?: number
  hasLiked?: boolean
  authorId?: string
  parentId?: string
  _count?: {
    replies?: number
  }
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
  user: UserProfile | null
  settings?: Settings
  updateSettings?: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

export interface BlogListProps {
  posts: Post[]
  isLoading: boolean
}

export interface CommentsProps {
  comments: Comment[]
  postId?: number
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

export interface RenderProfileData {
  profile: UserProfile;
  savedPosts: Post[];
  activities: Activity[];
  isEditing: boolean;
  canEdit: boolean;
  isLoading: boolean;
  isLoadingActivities: boolean;
  hasMoreActivities: boolean;
  activitiesPagination: {
    page: number;
    lastPage: number;
    total: number;
  };
  handlers: {
    handleEdit: () => void;
    handleCancel: () => void;
    handleSave: (updatedProfile: UserProfile) => Promise<void>;
    handleAvatarChange: (file: File) => void;
    handleAvatarUpdate: () => Promise<void>;
    handleCoverImageChange: (file: File) => void;
    handleCoverImageUpdate: () => Promise<void>;
    loadMoreActivities: () => void;
    goToActivityPage: (page: number) => void;
  };
}

export interface ProfileContainerProps {
  nick?: string;
  render: (data: RenderProfileData) => React.ReactNode;
}
// Estado y hooks
export interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setAccessToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  refreshAccessToken: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isEditor: () => boolean
}

export interface UseCommentsReturn {
  comments: Comment[]
  isLoading: boolean
  replyingTo: string | null
  replyContent: string
  handleLike: (commentId: string) => Promise<void>
  handleReply: (commentId: string) => void
  submitReply: () => Promise<void>
  setReplyContent: (content: string) => void
  addNewComment: (content: string) => Promise<boolean | undefined>
  cancelReply: () => void
  deleteComment: (commentId: string) => Promise<void>
  loadMoreComments: () => void
  changeCommentsOrder: (newOrder: string) => void
  hasMore: boolean
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  order: string
}

// Perfil del usuario
export interface UserProfile {
  userId: string
  name: string
  bio: string
  email: string
  nick: string
  role: UserRole
  roleAsString?: string
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
}

export interface EditProfileFormProps {
  profile: UserProfile
  onSave: (updatedProfile: UserProfile) => void
  onCancel: () => void
}

export interface Activity {
  id: number;
  type: "POST_CREATED" | "COMMENTED" | "LIKED" | "SAVED_POST";
  description: string;
  createdAt: string;
  user: {
    id: string;
    nick: string;
    name: string;
    avatar: string | null;
  };
}

export interface UseProfileReturn {
  profile: UserProfile | null
  savedPosts: Post[]
  activities: Activity[] 
  isLoading: boolean
  isLoadingActivities: boolean
  error: string | null
  activitiesError: string | null
  updateProfile: (updatedProfile: UserProfile) => Promise<UserProfile | null>
  updateAvatar: (newAvatar: File) => Promise<void>
  updateCoverImage: (newCoverImage: File) => Promise<void>
  fetchProfile: () => Promise<void>
  loadMoreActivities: () => void
  goToActivityPage: (page: number) => void
  hasMoreActivities: boolean
  activitiesPagination: {
    page: number
    lastPage: number
    total: number
  }
}

// Configuración de usuario
export type Settings = {
  fontSize: FontSize
  postLayout: PostLayout
  themePreference: ThemePreference
  contentDensity: "comfortable" | "compact" | "spacious"
}

export const postSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
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
