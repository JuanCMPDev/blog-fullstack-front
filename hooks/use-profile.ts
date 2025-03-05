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

  const { accessToken } = useAuth();

  useEffect(() => {
    let isMounted = true;
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

      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error("Failed to update profile");

      const updatedData = await response.json();
      setProfile(updatedData);
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
      setProfile(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
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
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}profile/${nick}/cover-image`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update cover image");
      const { coverImageUrl } = await response.json();
      setProfile(prev => (prev ? { ...prev, coverImage: coverImageUrl } : null));
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
