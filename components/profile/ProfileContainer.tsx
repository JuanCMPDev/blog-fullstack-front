import React, { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { useAuth } from "@/lib/auth";
import { ProfileContainerProps, RenderProfileData, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export function ProfileContainer({ nick, render }: ProfileContainerProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  // Estados locales para editar y gestionar archivos
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  
  // Usamos useProfile(nick) para obtener el perfil (propio o ajeno)
  // Si nick es undefined, el hook manejará este caso internamente
  const { 
    profile, 
    savedPosts, 
    activities,
    isLoading, 
    isLoadingActivities,
    error, 
    updateProfile, 
    updateAvatar, 
    updateCoverImage, 
    fetchProfile,
    loadMoreActivities,
    goToActivityPage,
    hasMoreActivities,
    activitiesPagination
  } = useProfile(nick);
  
  // Si no hay nick, mostrar un mensaje de error con opciones para el usuario
  if (!nick) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Perfil no encontrado</h2>
        <p className="text-muted-foreground mb-6">
          No se ha especificado un usuario para mostrar el perfil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Ir al inicio
          </Button>
          <Button onClick={() => router.push("/signin")}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <ProfileSkeleton />;
  
  // Mejorar el mensaje de error con opciones para el usuario
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar el perfil</h2>
        <p className="text-muted-foreground mb-6">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Ir al inicio
          </Button>
          <Button onClick={() => router.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }
  
  // Mejorar el mensaje cuando no hay perfil disponible
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Perfil no encontrado</h2>
        <p className="text-muted-foreground mb-6">
          No se encontró el perfil para el usuario <span className="font-semibold">{nick}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => router.push("/")} variant="outline">
            Ir al inicio
          </Button>
          <Button onClick={() => router.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  // Se considera que el perfil es del usuario actual si currentUser existe y su nick coincide con el del perfil cargado
  const isOwner = currentUser && nick === currentUser.nick;

  // Handlers para la UI de edición
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    // Hacemos scroll hacia arriba cuando se cancela la edición
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSave = async (updatedProfile: UserProfile) => {
    const result = await updateProfile(updatedProfile);
    if (result) {
      // Recargamos los datos del perfil para asegurar información actualizada
      await fetchProfile();
      // Garantizamos que la vista comience desde arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsEditing(false);
  };

  const handleAvatarChange = (file: File) => setSelectedAvatar(file);
  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return;
    await updateAvatar(selectedAvatar);
    setSelectedAvatar(null);
  };

  const handleCoverImageChange = (file: File) => setSelectedCoverImage(file);
  const handleCoverImageUpdate = async () => {
    if (!selectedCoverImage) return;
    await updateCoverImage(selectedCoverImage);
    setSelectedCoverImage(null);
  };

  const renderData: RenderProfileData = {
    profile,
    savedPosts,
    activities,
    isEditing,
    canEdit: Boolean(isOwner),
    isLoading,
    isLoadingActivities,
    hasMoreActivities,
    activitiesPagination,
    handlers: {
      handleEdit,
      handleCancel,
      handleSave,
      handleAvatarChange,
      handleAvatarUpdate,
      handleCoverImageChange,
      handleCoverImageUpdate,
      loadMoreActivities,
      goToActivityPage,
    },
  };

  return <>{render(renderData)}</>;
}
