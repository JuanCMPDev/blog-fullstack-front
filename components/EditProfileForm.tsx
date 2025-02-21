"use client"

import type React from "react"

import { useState } from "react"
import { useForm, useFieldArray, type FieldArrayPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { X, Plus } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries" // Assume this file contains the country data

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
  skills: z.array(z.string()),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileFormProps {
  onCancel: () => void
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { profile, updateProfile, fetchProfile } = useProfile()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      twitter: profile?.socialLinks.twitter ? `https://twitter.com/${profile.socialLinks.twitter}` : "",
      github: profile?.socialLinks.github ? `https://github.com/${profile.socialLinks.github}` : "",
      linkedin: profile?.socialLinks.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : "",
      skills: profile?.skills || [],
    },
  })

  const { fields, append, remove } = useFieldArray<ProfileFormValues>({
    name: "skills" as FieldArrayPath<ProfileFormValues>,
    control: form.control,
  })

  const onSubmit = async (data: ProfileFormValues) => {
    console.log("Form submission started", data)

    setIsSaving(true)
    try {
      const selectedCountry: { code: string; name: string; emoji: string } | undefined = countries.find(
        (country: { code: string; name: string; emoji: string }) => country.code === data.location
      )
      const locationString = selectedCountry ? `${selectedCountry.emoji} ${selectedCountry.name}` : data.location

      const updatedProfile: UserProfile = {
        ...profile!,
        name: data.name,
        bio: data.bio,
        location: locationString,
        socialLinks: {
          twitter: data.twitter ? new URL(data.twitter).pathname.split("/").pop() || "" : "",
          github: data.github ? new URL(data.github).pathname.split("/").pop() || "" : "",
          linkedin: data.linkedin ? new URL(data.linkedin).pathname.split("/").pop() || "" : "",
        },
        skills: data.skills,
      }

      console.log(updateProfile)

      await updateProfile(updatedProfile)
      await fetchProfile()

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })

      // Close the form after successful update
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

  if (!profile) {
    return <div>Cargando perfil...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} className="bg-background border-input focus:border-primary" />
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Biografía</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos un poco sobre ti"
                  className="bg-background border-input focus:border-primary resize-none"
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

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Ubicación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background border-input focus:border-primary">
                    <SelectValue placeholder="Selecciona tu ubicación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country: { code: string; name: string; emoji: string }) => (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Twitter</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://twitter.com/tu_usuario"
                    {...field}
                    className="bg-background border-input focus:border-primary"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">Tu perfil de Twitter (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">GitHub</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/tu_usuario"
                    {...field}
                    className="bg-background border-input focus:border-primary"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">Tu perfil de GitHub (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">LinkedIn</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/tu_usuario"
                    {...field}
                    className="bg-background border-input focus:border-primary"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">Tu perfil de LinkedIn (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-foreground font-medium">Habilidades</FormLabel>
          <FormDescription className="text-muted-foreground mb-2">
            Añade tus habilidades técnicas o áreas de experiencia.
          </FormDescription>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`skills.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input {...field} className="bg-background border-input focus:border-primary" />
                      <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append("")}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir habilidad
          </Button>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-background text-foreground hover:bg-accent"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

