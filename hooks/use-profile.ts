// hooks/use-profile.ts
import { useState, useEffect } from "react";
import type { UserProfile, Post, UseProfileReturn } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@/lib/customFetch";
import { buildApiUrl, extractApiErrorMessageFromResponse } from "@/lib/api";
import {
  buildProfileUpdatePayload,
  extractAvatarUrlFromPayload,
  normalizeProfilePayload,
} from "@/lib/profile-adapter";
import { useSavedPosts } from "./use-saved-posts";
import { getPosts } from "@/lib/services/postService";
import { useActivities } from "./use-activities";

// Eliminar los datos mock ya que usaremos datos reales
// const mockSavedPosts: Post[] = [...]; (Eliminar todo el array mock)

export const useProfile = (nick: string | undefined): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { accessToken, setUser, user } = useAuth();
  const { savedPostIds, loadSavedPostIds } = useSavedPosts();
  const { 
    activities, 
    isLoading: isLoadingActivities,
    error: activitiesError,
    loadMore: loadMoreActivities,
    goToPage: goToActivityPage,
    hasMore: hasMoreActivities,
    pagination: activitiesPagination
  } = useActivities(nick);

  // Efecto para cargar el perfil del usuario
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
          buildApiUrl(`profile/${nick}`)
        );
        if (!response.ok) throw new Error("Failed to fetch profile");
        const userData = normalizeProfilePayload(await response.json());
        if (isMounted) {
          setProfile(userData);
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

  // Efecto para cargar los posts guardados cuando hay un cambio en savedPostIds
  useEffect(() => {
    // Comprobar si este perfil pertenece al usuario actual
    const isCurrentUser = user && nick === user.nick;
    
    // Solo cargamos los posts guardados si es el perfil del usuario actual
    if (isCurrentUser && savedPostIds.length > 0) {
      const fetchSavedPosts = async () => {
        try {
          setIsLoading(true);
          
          // Obtener todos los posts (esto es temporal, idealmente haría una petición específica por IDs)
          const response = await getPosts(1, 50); // Obtenemos una cantidad razonable de posts
          
          // Filtrar los posts que están en savedPostIds
          const filteredPosts = response.data.filter(post => 
            savedPostIds.includes(post.id)
          );
          
          setSavedPosts(filteredPosts);
        } catch (error) {
          console.error("Error al cargar los posts guardados:", error);
          setSavedPosts([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSavedPosts();
    } else if (isCurrentUser) {
      // Si el usuario no tiene posts guardados, establecemos un array vacío
      setSavedPosts([]);
    }
  }, [savedPostIds, nick, user]);

  // Efecto para cargar los IDs de posts guardados cuando se carga el perfil
  useEffect(() => {
    // Solo cargamos los IDs de posts guardados si es el perfil del usuario actual
    if (user && nick === user.nick) {
      loadSavedPostIds();
    }
  }, [user, nick, loadSavedPostIds]);

  const updateProfile = async (updatedProfile: UserProfile): Promise<UserProfile | null> => {
    setIsLoading(true);
    try {
      if (!accessToken) throw new Error("No access token available");

      const profileDataForBackend = buildProfileUpdatePayload(updatedProfile);

      const response = await customFetch(buildApiUrl("profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileDataForBackend),
      });
      if (!response.ok) {
        const message = await extractApiErrorMessageFromResponse(response, "Failed to update profile");
        throw new Error(message);
      }

      const updatedData = normalizeProfilePayload(await response.json());
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
      const response = await customFetch(buildApiUrl("users/avatar"), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update avatar");
      const avatarPayload = await response.json();
      const avatarUrl = extractAvatarUrlFromPayload(avatarPayload);

      if (!avatarUrl) {
        await fetchProfile();
        return;
      }
      
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
      const response = await customFetch(buildApiUrl("profile/cover-image"), {
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
      const response = await customFetch(buildApiUrl(`profile/${nick}`), {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      const userData = normalizeProfilePayload(await response.json());
      setProfile(userData);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
    }
  };

  return { 
    profile, 
    savedPosts, 
    activities,
    isLoading, 
    isLoadingActivities,
    error, 
    activitiesError,
    updateProfile, 
    updateAvatar, 
    updateCoverImage, 
    fetchProfile,
    loadMoreActivities,
    goToActivityPage,
    hasMoreActivities,
    activitiesPagination
  };
};
