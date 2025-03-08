// hooks/use-profile.ts
import { useState, useEffect } from "react";
import type { UserProfile, Post, UseProfileReturn } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@/lib/customFetch";

// Mocked saved posts data
const mockSavedPosts: Post[] = [
  {
    id: 1,
    title: "Introducción a React Hooks",
    excerpt:
      "Aprende a usar los Hooks más comunes en React y cómo pueden simplificar tu código.",
    coverImage: "/placeholder-post-image.jpeg",
    date: "2023-05-15",
    publishDate: "2023-05-15",
    readTime: 10,
    content: "Aquí iría el contenido del post...",
    author: {
      id: "1",
      name: "Jane Smith",
      avatar: "/placeholder-avatar.jpeg",
    },
    likes: 25,
    comments: 8,
    image: "/placeholder-post-image.jpeg",
    tags: ["React", "Hooks", "JavaScript"],
  },
  {
    id: 2,
    title: "Optimización de rendimiento en React",
    excerpt:
      "Descubre técnicas avanzadas para mejorar el rendimiento de tus aplicaciones React.",
    coverImage: "/placeholder-post-image.jpeg",
    date: "2023-06-01",
    publishDate: "2023-06-01",
    readTime: 15,
    content: "Aquí iría el contenido del post...",
    author: {
      id: "2",
      name: "Bob Johnson",
      avatar: "/placeholder-avatar.jpeg",
    },
    likes: 32,
    comments: 12,
    image: "/placeholder-post-image.jpeg",
    tags: ["React", "Performance", "Optimization"],
  },
  // Puedes añadir más posts mock si lo deseas
];

export const useProfile = (nick: string | undefined): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { accessToken, setUser, user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    // Si no hay nick, establecer un error y detener la carga
    if (!nick) {
      setError("No se ha especificado un usuario para mostrar el perfil");
      setIsLoading(false);
      return;
    }
    
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await customFetch(
          `${process.env.NEXT_PUBLIC_API_URL}profile/${nick}`
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const userData = await response.json();
        if (isMounted) {
          setProfile(userData);
          // Se asignan los mock de posts mientras no tengas endpoint real para ellos.
          setSavedPosts(mockSavedPosts);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load profile data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile()

    return () => {
      isMounted = false;
    };
  }, [nick, accessToken]);

  const updateProfile = async (updatedProfile: UserProfile): Promise<UserProfile | null> => {
    setIsLoading(true);
    try {
      if (!accessToken) throw new Error("No access token available");

      // Transformar el objeto UserProfile para que coincida con el formato esperado por el DTO
      const profileDataForBackend = {
        name: updatedProfile.name,
        nick: updatedProfile.nick,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar,
        role: updatedProfile.role,
        location: updatedProfile.location,
        skills: updatedProfile.skills,
        // Convertir las propiedades anidadas de socialLinks a campos separados de nivel superior
        twitter: updatedProfile.socialLinks.twitter ? `https://twitter.com/${updatedProfile.socialLinks.twitter}` : undefined,
        github: updatedProfile.socialLinks.github ? `https://github.com/${updatedProfile.socialLinks.github}` : undefined,
        linkedin: updatedProfile.socialLinks.linkedin ? `https://linkedin.com/in/${updatedProfile.socialLinks.linkedin}` : undefined,
        // No enviamos socialLinks como objeto anidado, ya que el DTO espera propiedades individuales
      };

      console.log("Datos enviados al backend:", profileDataForBackend);

      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileDataForBackend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      setProfile(updatedData);
      
      // Actualizar también el estado de autenticación si el perfil actualizado es del usuario actual
      if (user && user.userId === updatedData.userId) {
        setUser(updatedData);
      }
      
      return updatedData;
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (newAvatar: File) => {
    if (!accessToken) {
      setError("User not authenticated or missing token");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", newAvatar);
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}users/avatar/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update avatar");
      const { avatarUrl } = await response.json();
      
      // Actualizar el perfil local
      setProfile(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
      
      // Actualizar también el estado de autenticación si el perfil es del usuario actual
      if (user && profile && user.userId === profile.userId) {
        setUser({ ...user, avatar: avatarUrl });
      }
    } catch (err) {
      setError("Failed to update avatar");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCoverImage = async (newCoverImage: File) => {
    const formData = new FormData();
    formData.append("file", newCoverImage);
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/cover-image`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update cover image");
      const { coverImageUrl } = await response.json();
      
      // Actualizar el perfil local
      setProfile(prev => (prev ? { ...prev, coverImage: coverImageUrl } : null));
      
      // Actualizar también el estado de autenticación si el perfil es del usuario actual
      if (user && profile && user.userId === profile.userId) {
        setUser({ ...user, coverImage: coverImageUrl });
      }
    } catch (err) {
      setError("Failed to update cover image");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/${nick}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      const userData = await response.json();
      setProfile(userData);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
    }
  };

  return { profile, savedPosts, isLoading, error, updateProfile, updateAvatar, updateCoverImage, fetchProfile };
};
