import { useState, useEffect } from "react"
import type { UserProfile, Post, UseProfileReturn } from "@/lib/types"

// Simulated function to fetch user profile data
const fetchUserProfile = async (): Promise<UserProfile> => {
  // In a real application, this would be an API call
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
  return {
    name: "John Doe",
    email: "john@example.com",
    bio: "Passionate developer and tech enthusiast with a keen interest in web technologies and open source projects.",
    avatar: "/placeholder-avatar.jpeg",
    coverImage: "/placeholder-post-image.jpeg",
    location: "San Francisco, CA",
    joinDate: "Enero 2020",
    socialLinks: {
      twitter: "johndoe",
      github: "johndoe",
      linkedin: "johndoe",
    },
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "GraphQL", "Next.js"],
    stats: {
      savedPosts: 15,
      followers: 1337,
      following: 420,
    },
  }
}

// Simulated function to fetch user's saved posts
const fetchSavedPosts = async (): Promise<Post[]> => {
  // In a real application, this would be an API call
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
  return [
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
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const [userData, userSavedPosts] = await Promise.all([fetchUserProfile(), fetchSavedPosts()])
        setProfile(userData)
        setSavedPosts(userSavedPosts)
      } catch (err) {
        console.log(err);
        
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const updateProfile = async (updatedProfile: UserProfile) => {
    // In a real application, you would make an API call here
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProfile(updatedProfile)
    } catch (err) {
      setError("Failed to update profile")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { profile, savedPosts, isLoading, error, updateProfile }
}

