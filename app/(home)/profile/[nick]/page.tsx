'use client'

import React from "react";
import { ProfileContainer } from "@/components/ProfileContainer";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AvatarEdit } from "@/components/AvatarEdit";
import { CoverImageEdit } from "@/components/CoverImageEdit";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Tag } from "@/components/Tag";
import { useParams } from "next/navigation";

export default function ProfilePage() {

  const params = useParams()
  const userNick = typeof params?.nick === "string" ? params.nick : undefined;

  return (
    <div className="min-h-screen bg-dot-pattern">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProfileContainer
          nick={userNick}
          render={({
            profile,
            savedPosts,
            isEditing,
            canEdit,
            handlers,
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
                        <AvatarImage src={profile.avatar} alt={profile.name} />
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
                          {profile.location}
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
                      {savedPosts.map((post) => (
                        <div key={post.id} className="mb-6">
                          <Link href={`/post/${post.id}`} className="group">
                            <div className="flex flex-col sm:flex-row gap-4">
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
                                <h3 className="text-lg font-semibold group-hover:text-primary">
                                  {post.title}
                                </h3>
                                <p className="text-sm mt-1">{post.excerpt}</p>
                                <div className="flex items-center mt-2">
                                  <Avatar className="w-6 h-6 mr-2">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{post.author.name}</span>
                                  <span className="text-xs mx-2">•</span>
                                  <span className="text-xs">{post.publishDate}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="activity">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg">
                          <Heart className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm">Le gustó el post &quot;Introducción a React Hooks&quot;</p>
                            <p className="text-xs text-muted-foreground">2023-07-20</p>
                          </div>
                        </div>
                      </div>
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
