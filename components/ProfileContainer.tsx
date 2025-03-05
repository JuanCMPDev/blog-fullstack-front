import React, { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { useAuth } from "@/lib/auth";
import { ProfileContainerProps, RenderProfileData, UserProfile } from "@/lib/types";

export function ProfileContainer({ nick, render }: ProfileContainerProps) {
  // Usamos useProfile(nick) para obtener el perfil (propio o ajeno)
  const { profile, savedPosts, isLoading, error, updateProfile, updateAvatar, updateCoverImage } = useProfile(nick);

  // Obtenemos el usuario actual desde el estado global
  const { user: currentUser } = useAuth();

  // Estados locales para editar y gestionar archivos
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);

  if (isLoading) return <ProfileSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No hay datos de perfil disponibles</div>;

  // Se considera que el perfil es del usuario actual si currentUser existe y su nick coincide con el del perfil cargado
  const isOwner = currentUser && nick === currentUser.nick;

  // Handlers para la UI de edición
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = async (updatedProfile: UserProfile) => {
    await updateProfile(updatedProfile);
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
    isEditing,
    canEdit: Boolean(isOwner),
    handlers: {
      handleEdit,
      handleCancel,
      handleSave,
      handleAvatarChange,
      handleAvatarUpdate,
      handleCoverImageChange,
      handleCoverImageUpdate,
    },
  };

  return <>{render(renderData)}</>;
}
