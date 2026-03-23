"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { X, Plus, User, MapPin, Twitter, Github, Linkedin, Save, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"
import { Separator } from "@/components/ui/separator"
import { Tag } from "@/components/common/Tag"
import { createLogger } from "@/lib/logger"

const logger = createLogger("EditProfileForm")

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  bio: z.string().max(160, {
    message: "La biografía no puede tener más de 160 caracteres.",
  }),
  location: z.string({
    required_error: "Por favor selecciona una ubicación.",
  }),
  twitter: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  github: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  linkedin: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  skills: z.array(z.object({ value: z.string() })),
})

// Función auxiliar para extraer el nombre de usuario de una URL
const extractUsername = (url: string, domain: string): string => {
  try {
    if (!url.includes('http://') && !url.includes('https://')) {
      url = 'https://' + url;
    }
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').filter(Boolean);
    
    // Si el dominio es linkedin y la URL tiene formato linkedin.com/in/username
    if (domain === 'linkedin.com/in' && urlObj.hostname.includes('linkedin.com') && path.length > 0) {
      return path[path.length - 1];
    }
    
    // Para twitter y github, extraemos el username que viene después del dominio
    if (urlObj.hostname.includes(domain.split('/')[0])) {
      return path.length > 0 ? path[path.length - 1] : "";
    }
    
    // Si no es una URL válida o no contiene el dominio correcto, devolvemos el texto original
    return url;
  } catch {
    // Si hay un error al parsear la URL, asumimos que es solo el nombre de usuario
    return url.replace(/^@/, ''); // Eliminar @ si existe
  }
}

// Función auxiliar para extraer el código del país a partir del texto con emoji
const extractCountryCode = (locationString: string): string => {
  // Buscar el país cuyo nombre está contenido en el string
  const country = countries.find(
    (country) => locationString.includes(country.name) || locationString.includes(country.emoji)
  );
  return country ? country.code : "";
};

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileFormProps {
  profile: UserProfile
  onCancel: () => void
  onSave: (updatedProfile: UserProfile) => Promise<void>
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onCancel, onSave }) => {
  const [isSaving, setIsSaving] = useState(false)

  // Extraer el código del país a partir de la ubicación guardada
  const countryCode = extractCountryCode(profile.location || "");
  logger.debug("Ubicación y código de país extraído", {
    location: profile.location,
    countryCode,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name || "",
      bio: profile.bio || "",
      location: countryCode || "",
      twitter: profile.socialLinks.twitter ? `https://twitter.com/${profile.socialLinks.twitter}` : "",
      github: profile.socialLinks.github ? `https://github.com/${profile.socialLinks.github}` : "",
      linkedin: profile.socialLinks.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : "",
      skills: profile.skills?.map((skill) => ({ value: skill })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  useEffect(() => {
    // Extraer el código del país cada vez que cambia el perfil
    const profileCountryCode = extractCountryCode(profile.location || "");
    logger.debug("Reset formulario con ubicación", {
      location: profile.location,
      countryCode: profileCountryCode,
    });
    
    form.reset({
      name: profile.name,
      bio: profile.bio,
      location: profileCountryCode, // Usar el código del país en lugar del texto completo
      twitter: profile.socialLinks.twitter ? `https://twitter.com/${profile.socialLinks.twitter}` : "",
      github: profile.socialLinks.github ? `https://github.com/${profile.socialLinks.github}` : "",
      linkedin: profile.socialLinks.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : "",
      skills: profile.skills?.map((skill) => ({ value: skill })) || [],
    })
  }, [profile, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const selectedCountry = countries.find((country) => country.code === data.location)
      const locationString = selectedCountry ? `${selectedCountry.emoji} ${selectedCountry.name}` : data.location

      // Extraer usernames de las URLs
      const twitterUsername = data.twitter ? extractUsername(data.twitter, 'twitter.com') : ""
      const githubUsername = data.github ? extractUsername(data.github, 'github.com') : ""
      const linkedinUsername = data.linkedin ? extractUsername(data.linkedin, 'linkedin.com/in') : ""
      
      // Convertir skills a formato simple de array
      const skills = data.skills.map((skill) => skill.value)
      
      // Verificar si hay cambios antes de enviar al backend
      const hasChanges = 
        profile.name !== data.name ||
        profile.bio !== data.bio ||
        profile.location !== locationString ||
        profile.socialLinks.twitter !== twitterUsername ||
        profile.socialLinks.github !== githubUsername ||
        profile.socialLinks.linkedin !== linkedinUsername ||
        JSON.stringify(profile.skills) !== JSON.stringify(skills)
      
      if (!hasChanges) {
        toast({
          title: "Sin cambios",
          description: "No se detectaron cambios en el perfil.",
        })
        onCancel()
        return
      }

      const updatedProfile: UserProfile = {
        ...profile,
        name: data.name,
        bio: data.bio,
        location: locationString,
        socialLinks: {
          twitter: twitterUsername,
          github: githubUsername,
          linkedin: linkedinUsername,
        },
        skills: skills,
      }

      await onSave(updatedProfile)
      
      // Hacer scroll hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })
      
      onCancel()
    } catch (error) {
      console.error("Error al guardar el perfil:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar tu perfil. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!profile) return <div>Cargando perfil...</div>

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre"
                      {...field}
                      className="bg-background border-input focus:border-primary"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">
                    Este es tu nombre público. Puede ser tu nombre real o un pseudónimo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ubicación
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-input focus:border-primary">
                        <SelectValue placeholder="Selecciona tu ubicación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-muted-foreground">Tu país de residencia.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Biografía</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cuéntanos un poco sobre ti"
                    className="bg-background border-input focus:border-primary resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Escribe una breve biografía sobre ti. Máximo 160 caracteres.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/tu_usuario"
                        {...field}
                        className="bg-background border-input focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/tu_usuario"
                        {...field}
                        className="bg-background border-input focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium flex items-center">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/tu_usuario"
                        {...field}
                        className="bg-background border-input focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div>
            <FormLabel className="text-foreground font-medium">Habilidades</FormLabel>
            <FormDescription className="text-muted-foreground mb-2">
              Añade tus habilidades técnicas o áreas de experiencia.
            </FormDescription>

            {/* 🔹 Mostrar habilidades agregadas */}
            <div className="flex flex-wrap gap-2 mb-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center">
                  <Tag name={field.value} />
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => remove(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* 🔹 Input para agregar habilidades */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nueva habilidad"
                id="skill-input"
                className="bg-background border-input focus:border-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = document.getElementById("skill-input") as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      append({ value }); // 🔹 Añadir al estado correctamente
                      input.value = ""; // 🔹 Limpiar el input
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById("skill-input") as HTMLInputElement;
                  const value = input.value.trim();
                  if (value) {
                    append({ value }); // 🔹 Añadir al estado correctamente
                    input.value = ""; // 🔹 Limpiar el input
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-background text-foreground hover:bg-accent"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

