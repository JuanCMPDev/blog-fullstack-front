import { useState, useEffect } from "react"
import type { UserProfile, Post, UseProfileReturn } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { customFetch } from "@/lib/customFetch"

// Mocked saved posts data
const mockSavedPosts: Post[] = [
  {
    id: 1,
    title: "Introducción a React Hooks",
    excerpt: "Aprende a usar los Hooks más comunes en React y cómo pueden simplificar tu código.",
    coverImage: "/placeholder-post-image.jpeg",
    date: "2023-05-15", // Mantengo date porque es parte del mock, pero en tu interfaz es publishDate
    publishDate: "2023-05-15", // Agrego publishDate como fecha de publicación
    readTime: 10, // Suponiendo un tiempo de lectura en minutos
    content: "Aquí iría el contenido del post...",
    author: {
      id: "1",
      name: "Jane Smith",
      avatar: "/placeholder-avatar.jpeg",
    },
    likes: 25,
    comments: 8,
    image: "/placeholder-post-image.jpeg", // Cambio image por coverImage
    tags: ["React", "Hooks", "JavaScript"],
  },
  {
    id: 2,
    title: "Optimización de rendimiento en React",
    excerpt: "Descubre técnicas avanzadas para mejorar el rendimiento de tus aplicaciones React.",
    coverImage: "/placeholder-post-image.jpeg",
    date: "2023-06-01", // Mantengo date porque es parte del mock, pero en tu interfaz es publishDate
    publishDate: "2023-06-01", // Agrego publishDate como fecha de publicación
    readTime: 15, // Suponiendo un tiempo de lectura en minutos
    content: "Aquí iría el contenido del post...",
    author: {
      id: "2",
      name: "Bob Johnson",
      avatar: "/placeholder-avatar.jpeg",
    },
    likes: 32,
    comments: 12,
    image: "/placeholder-post-image.jpeg", // Cambio image por coverImage
    tags: ["React", "Performance", "Optimization"],
  },
  // Puedes añadir más posts mock según necesites
]

export const useProfile = (nick?: string): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { accessToken, user, setUser } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true)
        let userData: UserProfile

        // Si hay un nick en la URL, SIEMPRE intentamos cargar ese perfil específico
        // independientemente del estado de autenticación
        if (nick) {
          console.log('Loading profile for:', nick)
          const response = await customFetch(
            `${process.env.NEXT_PUBLIC_API_URL}profile/${nick}`
          )
          if (!response.ok) throw new Error("Failed to fetch profile")
          userData = await response.json()
        }
        // Solo cargamos el perfil propio si NO hay nick en la URL y SÍ hay token
        else if (!nick && accessToken) {
          console.log('Loading own profile')
          const response = await customFetch(
            `${process.env.NEXT_PUBLIC_API_URL}profile/me`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              credentials: "include"
            }
          )
          if (!response.ok) throw new Error("Failed to fetch user profile")
          userData = await response.json()
        } else {
          throw new Error("No profile identifier provided")
        }

        if (!isMounted) return;
        setProfile(userData)
        setSavedPosts(mockSavedPosts)
        setError(null)
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError("Failed to load profile data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Simplificamos la lógica de cuándo cargar
    if (nick || (!nick && accessToken)) {
      loadProfile()
    } else {
      setIsLoading(false)
      setError("No profile identifier provided")
    }

    return () => {
      isMounted = false;
    }
  }, [nick, accessToken])

  const updateProfile = async (updatedProfile: UserProfile): Promise<UserProfile | null> => {
    setIsLoading(true)
    try {
      if (!accessToken) throw new Error("No access token available")

      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      })
      if (!response.ok) throw new Error("Failed to update profile")

      const updatedData = await response.json()
      setProfile(updatedData)
      return updatedData
    } catch (err) {
      setError("Failed to update profile")
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvatar = async (newAvatar: File) => {
    if (!accessToken || !user) {
      setError("User not authenticated or missing token")
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", newAvatar)

    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}users/avatar/`,
        {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${accessToken}` },
          credentials: "include",
          body: formData
        }
      )
      if (!response.ok) throw new Error("Failed to update avatar")

      const { avatarUrl } = await response.json()
      setProfile((prev) => (prev ? { ...prev, avatar: avatarUrl } : null))
      setUser({ ...user, avatar: avatarUrl })
    } catch (err) {
      setError("Failed to update avatar")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateCoverImage = async (NewCoverImage: File) => {
    const formData = new FormData();
    formData.append("file", NewCoverImage)

    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/me/cover-image`,
        {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${accessToken}` },
          credentials: "include",
          body: formData
        }
      )
      if (!response.ok) throw new Error("Failed to update avatar")

      const { coverImageUrl } = await response.json()
      setProfile((prev) => (prev ? { ...prev, coverImage: coverImageUrl } : null))
    } catch (err) {
      setError("Failed to update avatar")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await customFetch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/me`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch profile");
      const userData = await response.json();
      setProfile(userData);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
    }
  };


  return { profile, savedPosts, isLoading, error, updateProfile, updateAvatar, updateCoverImage, fetchProfile }
}
