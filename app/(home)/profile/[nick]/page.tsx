'use client'

import React from "react";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pencil,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Calendar,
  Bookmark,
  Activity,
  Heart,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { AvatarEdit } from "@/components/profile/AvatarEdit";
import { CoverImageEdit } from "@/components/profile/CoverImageEdit";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Tag } from "@/components/common/Tag";
import { AuthorAvatar } from "@/components/common/AuthorAvatar";
import { getAvatarUrl } from "@/lib/utils";
import { parseLocation } from "@/lib/countries";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ActivityPagination } from "@/components/profile/ActivityPagination";

export default function ProfilePage() {

  const params = useParams()
  const userNick = typeof params?.nick === "string" ? params.nick : undefined;
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dot-pattern">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProfileContainer
          nick={userNick}
          render={({
            profile,
            savedPosts,
            activities,
            isEditing,
            canEdit,
            handlers,
            isLoading,
            isLoadingActivities,
            activitiesPagination,
          }) => (
            <>
              {/* Sección del perfil */}
              <Card className="mb-8 overflow-hidden shadow-lg">
                <div className="relative group h-64 md:h-72">
                  <Image
                    src={profile.coverImage || "/placeholder.svg"}
                    alt="Cover"
                    layout="fill"
                    objectFit="cover"
                  />
                  {canEdit && (
                    <CoverImageEdit
                      currentCoverImage={profile.coverImage}
                      onChange={handlers.handleCoverImageChange}
                      handleCoverImageUpdate={handlers.handleCoverImageUpdate}
                    />
                  )}
                </div>
                <CardContent className="relative px-4 md:px-6 pt-8 max-sm:pt-0 max-sm:-mt-14">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end sm:-mt-24 relative z-10 px-4 sm:px-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
                        <AvatarImage src={getAvatarUrl(profile.avatar)} alt={profile.name} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {canEdit && (
                        <AvatarEdit
                          currentAvatar={profile.avatar}
                          onAvatarChange={handlers.handleAvatarChange}
                          handleAvatarUpdate={handlers.handleAvatarUpdate}
                        />
                      )}
                    </div>
                    <div className="mt-8 sm:mt-4 sm:ml-6 max-sm:mt-2 text-center sm:text-left">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {profile.name}
                      </h1>
                    </div>
                    {canEdit && !isEditing && (
                      <Button
                        onClick={handlers.handleEdit}
                        variant="outline"
                        size="sm"
                        className="mt-4 sm:mt-0 sm:ml-auto"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Button>
                    )}
                  </div>
                  {canEdit && isEditing ? (
                    <div className="mt-8">
                      <EditProfileForm
                        profile={profile}
                        onSave={handlers.handleSave}
                        onCancel={handlers.handleCancel}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mt-8 flex flex-wrap gap-4">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {(() => {
                            const loc = parseLocation(profile.location)
                            return loc.flagUrl ? (
                              <span className="flex items-center gap-1.5">
                                <img
                                  src={loc.flagUrl}
                                  alt={loc.name}
                                  className="h-4 w-5 object-cover rounded-sm"
                                />
                                {loc.name}
                              </span>
                            ) : (
                              loc.name
                            )
                          })()}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          Se unió el{" "}
                          {format(parseISO(profile.joinDate), "d 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </div>
                        <div className="flex items-center space-x-4">
                          {profile.socialLinks.github && (
                            <Link
                              href={`https://github.com/${profile.socialLinks.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="w-5 h-5 hover:text-primary" />
                            </Link>
                          )}
                          {profile.socialLinks.twitter && (
                            <Link
                              href={`https://twitter.com/${profile.socialLinks.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter className="w-5 h-5 hover:text-primary" />
                            </Link>
                          )}
                          {profile.socialLinks.linkedin && (
                            <Link
                              href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Linkedin className="w-5 h-5 hover:text-primary" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Sobre mí</h2>
                        <p>{profile.bio}</p>
                      </div>
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Habilidades</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string) => (
                            <Tag key={skill} name={skill} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Sección de actividad  & post guardados*/}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Actividad</CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <Tabs defaultValue="saved" className="w-full">
                    <TabsList className="mb-4 w-full sm:w-auto justify-center sm:justify-start">
                      <TabsTrigger
                        value="saved"
                        className="flex-1 sm:flex-none data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground px-4 py-2 rounded-md"
                      >
                        <Bookmark className="w-4 h-4 mr-2 hidden sm:inline-block" />
                        <span className="sm:hidden">Guardados</span>
                        <span className="hidden sm:inline">Posts Guardados</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="flex-1 sm:flex-none data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground px-4 py-2 rounded-md"
                      >
                        <Activity className="w-4 h-4 mr-2 hidden sm:inline-block" />
                        <span className="sm:hidden">Actividad</span>
                        <span className="hidden sm:inline">Actividad Reciente</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="saved">
                      {isLoading ? (
                        <div className="flex flex-col items-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                          <p className="text-muted-foreground">Cargando posts guardados...</p>
                        </div>
                      ) : savedPosts.length > 0 ? (
                        savedPosts.map((post) => (
                          <div key={post.id} className="mb-6">
                            <Link href={`/post/${post.slug || post.id}`} className="group">
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-md overflow-hidden">
                                  <Image
                                    src={post.coverImage || "/placeholder.svg"}
                                    alt={post.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-muted-foreground line-clamp-2">
                                    {post.excerpt}
                                  </p>
                                  <div className="flex items-center mt-2 space-x-4">
                                    <div className="flex items-center">
                                      <AuthorAvatar author={post.author} className="h-5 w-5 mr-1.5" />
                                      <span className="text-xs">{post.author?.name}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Heart className="h-3 w-3 mr-1" />
                                      {post.likes}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-lg">
                          <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No hay posts guardados</h3>
                          <p className="text-muted-foreground max-w-md">
                            {profile.nick === user?.nick 
                              ? "Aún no has guardado ningún post. Navega por el blog y guarda los posts que te interesen."
                              : `${profile.name} aún no ha guardado ningún post.`
                            }
                          </p>
                          {profile.nick === user?.nick && (
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => router.push('/')}
                            >
                              Explorar posts
                            </Button>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="activity">
                      {isLoadingActivities && activities.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                          <p className="text-muted-foreground">Cargando actividad reciente...</p>
                        </div>
                      ) : activities.length > 0 ? (
                        <>
                          {/* Timeline de actividades */}
                          <div className="relative">
                            {/* Línea vertical del timeline */}
                            <div className="absolute left-[17px] sm:left-[19px] top-2 bottom-2 w-px bg-border/50" />

                            <div className="space-y-1">
                              {activities.map((activity, actIdx) => {
                                const activityConfig = {
                                  LIKED: {
                                    icon: <Heart className="h-3.5 w-3.5" />,
                                    color: "bg-red-500/10 text-red-500 ring-red-500/20",
                                    label: "Like",
                                  },
                                  COMMENTED: {
                                    icon: <MessageCircle className="h-3.5 w-3.5" />,
                                    color: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
                                    label: "Comentario",
                                  },
                                  SAVED_POST: {
                                    icon: <Bookmark className="h-3.5 w-3.5" />,
                                    color: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
                                    label: "Guardado",
                                  },
                                  POST_CREATED: {
                                    icon: <Pencil className="h-3.5 w-3.5" />,
                                    color: "bg-green-500/10 text-green-500 ring-green-500/20",
                                    label: "Publicación",
                                  },
                                }[activity.type] ?? {
                                  icon: <Activity className="h-3.5 w-3.5" />,
                                  color: "bg-primary/10 text-primary ring-primary/20",
                                  label: "Actividad",
                                };

                                const dateStr = new Date(activity.createdAt);
                                const timeStr = dateStr.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                const dayStr = dateStr.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                                return (
                                  <div
                                    key={activity.id}
                                    className="relative flex items-start gap-3 sm:gap-4 py-2.5 px-1 group"
                                  >
                                    {/* Timeline dot */}
                                    <div
                                      className={`relative z-10 flex-shrink-0 w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ${activityConfig.color}`}
                                    >
                                      {activityConfig.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                                        <p className="text-sm leading-snug break-words">
                                          {activity.description}
                                        </p>
                                        <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap shrink-0">
                                          {dayStr} · {timeStr}
                                        </span>
                                      </div>
                                      <span
                                        className={`inline-block mt-1.5 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${activityConfig.color}`}
                                      >
                                        {activityConfig.label}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Paginación */}
                          <ActivityPagination
                            currentPage={activitiesPagination.page}
                            totalPages={activitiesPagination.lastPage}
                            totalItems={activitiesPagination.total}
                            onPageChange={handlers.goToActivityPage}
                            disabled={isLoadingActivities}
                          />

                          {isLoadingActivities && (
                            <div className="flex justify-center py-4">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-lg">
                          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No hay actividad reciente</h3>
                          <p className="text-muted-foreground max-w-md">
                            {profile.nick === user?.nick
                              ? "Aún no has realizado ninguna actividad. Comienza interactuando con posts y otros usuarios."
                              : `${profile.name} aún no ha realizado ninguna actividad.`
                            }
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        />
      </div>
    </div>
  );
}
