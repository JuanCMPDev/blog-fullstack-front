// (home)/profile/[nick]
"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation" // Assuming you're using Zustand for global state
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  MessageSquare,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EditProfileForm } from "@/components/EditProfileForm"
import { useProfile } from "@/hooks/use-profile"
import { ProfileSkeleton } from "@/components/ProfileSkeleton"
import { AvatarEdit } from "@/components/AvatarEdit"
import { CoverImageEdit } from "@/components/CoverImageEdit"
import { useAuth } from "@/lib/auth"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export default function ProfilePage() {
  const params = useParams()
  const userNick = typeof params?.nick === "string" ? params.nick : undefined
  const { profile, savedPosts, isLoading, error, updateProfile, updateAvatar, updateCoverImage } = useProfile(userNick)
  const { accessToken } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null)

  // Get the current user's nick from the global Zustand store
  const currentUserNick: string | undefined = useAuth((state) => state.user?.nick)

  // Check if the profile can be edited
  const canEdit = userNick === currentUserNick

  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "activity" ? "activity" : "saved"

  if (isLoading) return <ProfileSkeleton />
  if (error) return <div>Error: {error}</div>
  if (!profile) return <div>No profile data available</div>

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => setIsEditing(false)
  const handleSave = async (updatedProfile: typeof profile) => {
    await updateProfile(updatedProfile)
    setIsEditing(false)
  }

  const handleAvatarChange = (newAvatar: File) => {
    setSelectedAvatar(newAvatar) // 🔵 Almacena el archivo en el estado temporal
  }

  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return

    try {
      if (!accessToken) {
        return
      }
      await updateAvatar(selectedAvatar) // Asumiendo que updateAvatar maneja la subida
      setSelectedAvatar(null) // Limpiar el estado
    } catch (error) {
      console.error("Error al actualizar el avatar:", error)
    }
  }

  const handleCoverImageChange = (newCoverImage: File) => {
    setSelectedCoverImage(newCoverImage)
  }

  const handleCoverImageUpdate = async () => {
    if (!selectedCoverImage) return

    try {
      if (!accessToken) {
        return
      }
      console.log(selectedCoverImage)

      await updateCoverImage(selectedCoverImage)
      setSelectedCoverImage(null)
    } catch (err) {
      console.error("error al actualizar el cover image", err)
    }
  }
  const recentActivities = [
    { type: "like", content: 'Le gustó el post "Introducción a React Hooks"', date: "2023-07-20", icon: Heart },
    {
      type: "comment",
      content: 'Comentó en "Optimización de rendimiento en React"',
      date: "2023-07-19",
      icon: MessageSquare,
    },
    { type: "post", content: 'Publicó "Mejores prácticas en TypeScript"', date: "2023-07-18", icon: Bookmark },
    { type: "like", content: 'Le gustó el post "Introducción a Next.js 13"', date: "2023-07-17", icon: Heart },
    {
      type: "comment",
      content: 'Comentó en "Patrones de diseño en JavaScript"',
      date: "2023-07-16",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="min-h-screen bg-dot-pattern">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-8 overflow-hidden shadow-lg">
          <div className="relative group h-36 sm:h-48 md:h-64">
            {" "}
            {/* Adjusted height */}
            <Image src={profile.coverImage || "/placeholder.svg"} alt="Cover" layout="fill" objectFit="cover" />
            {canEdit && <CoverImageEdit
              currentCoverImage={profile.coverImage}
              onChange={(newCoverImage) => handleCoverImageChange(newCoverImage)}
              handleCoverImageUpdate={handleCoverImageUpdate}
            />}
          </div>
          <CardContent className="relative px-4 md:px-6 pt-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-18 sm:-mt-24 md:-mt-28 relative z-10 px-4 sm:px-6">
              {" "}
              {/* Adjusted margin top */}
              <div className="relative group">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {canEdit && <AvatarEdit
                  currentAvatar={profile.avatar}
                  onAvatarChange={(newAvatar) => handleAvatarChange(newAvatar)}
                  handleAvatarUpdate={handleAvatarUpdate}
                />}
              </div>
              <div className="mt-8 sm:mt-4 sm:ml-6 text-center sm:text-left">
                {" "}
                {/* Added margin top */}
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.name}</h1>
              </div>
              {canEdit && !isEditing && (
                <Button onClick={handleEdit} variant="outline" size="sm" className="mt-4 sm:mt-0 sm:ml-auto">
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
            {canEdit && isEditing ? (
              <div className="mt-8 sm:mt-12">
                <EditProfileForm profile={profile} onSave={handleSave} onCancel={handleCancel} />
              </div>
            ) : (
              <>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    {profile.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    Se unió el {format(parseISO(profile.joinDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </div>
                  <div className="flex items-center space-x-4">
                    {profile.socialLinks.github && (
                      <Link
                        href={`https://github.com/${profile.socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    )}
                    {profile.socialLinks.twitter && (
                      <Link
                        href={`https://twitter.com/${profile.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    )}
                    {profile.socialLinks.linkedin && (
                      <Link
                        href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-2 text-foreground/80">Sobre mí</h2>
                  <p>{profile.bio}</p>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-2 text-foreground/80">Habilidades</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="mb-4 w-full sm:w-auto">
                  <TabsTrigger
                    value="saved"
                    className="flex-1 sm:flex-none data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                  >
                    <Bookmark className="w-4 h-4 mr-2 hidden sm:inline-block" />
                    <span className="sm:hidden">Guardados</span>
                    <span className="hidden sm:inline">Posts Guardados</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="flex-1 sm:flex-none data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                  >
                    <Activity className="w-4 h-4 mr-2 hidden sm:inline-block" />
                    <span className="sm:hidden">Actividad</span>
                    <span className="hidden sm:inline">Actividad Reciente</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="saved">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="mb-6 last:mb-0">
                      <Link href={`/post/${post.id}`} className="group">
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-md overflow-hidden">
                            <Image
                              src={post.coverImage || "/placeholder.svg"}
                              alt={post.title}
                              layout="fill"
                              objectFit="cover"
                              className="transition-transform group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                            <div className="flex items-center mt-2">
                              <Avatar className="w-6 h-6 mr-2">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{post.author.name}</span>
                              <span className="text-xs text-muted-foreground mx-2">•</span>
                              <span className="text-xs text-muted-foreground">{post.publishDate}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="activity">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-secondary/50">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <activity.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

