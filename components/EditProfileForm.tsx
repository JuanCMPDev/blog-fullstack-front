import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { X, Plus, Upload } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  bio: z.string().max(160, {
    message: "La biografía no puede tener más de 160 caracteres.",
  }),
  location: z.string().min(2, {
    message: "La ubicación debe tener al menos 2 caracteres.",
  }),
  avatar: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Solo se aceptan archivos .jpg, .jpeg, .png y .webp.")
    .optional(),
  coverImage: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Solo se aceptan archivos .jpg, .jpeg, .png y .webp.")
    .optional(),
  twitter: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  github: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  linkedin: z.string().url({ message: "Introduce una URL válida." }).optional().or(z.literal("")),
  skills: z.array(z.string()).min(1, "Debes tener al menos una habilidad."),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileFormProps {
  profile: UserProfile
  onSave: (updatedProfile: UserProfile) => void
  onCancel: () => void
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      location: profile.location,
      twitter: profile.socialLinks.twitter ? `https://twitter.com/${profile.socialLinks.twitter}` : "",
      github: profile.socialLinks.github ? `https://github.com/${profile.socialLinks.github}` : "",
      linkedin: profile.socialLinks.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : "",
      skills: profile.skills,
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "skills",
    control: form.control,
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: data.name,
        email: data.email,
        bio: data.bio,
        location: data.location,
        socialLinks: {
          twitter: data.twitter ? new URL(data.twitter).pathname.split("/").pop() || "" : "",
          github: data.github ? new URL(data.github).pathname.split("/").pop() || "" : "",
          linkedin: data.linkedin ? new URL(data.linkedin).pathname.split("/").pop() || "" : "",
        },
        skills: data.skills,
      }

      if (data.avatar) {
        // En una aplicación real, aquí subirías la imagen a un servidor y obtendrías la URL
        updatedProfile.avatar = URL.createObjectURL(data.avatar)
      }

      if (data.coverImage) {
        // En una aplicación real, aquí subirías la imagen a un servidor y obtendrías la URL
        updatedProfile.coverImage = URL.createObjectURL(data.coverImage)
      }

      await onSave(updatedProfile)
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Foto de perfil</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      className="bg-background border-input focus:border-primary hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir foto
                    </label>
                    {field.value && <span className="text-sm text-muted-foreground">{field.value.name}</span>}
                  </div>
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Sube una nueva foto de perfil. Tamaño máximo: 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Imagen de portada</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      className="bg-background border-input focus:border-primary hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir portada
                    </label>
                    {field.value && <span className="text-sm text-muted-foreground">{field.value.name}</span>}
                  </div>
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Sube una nueva imagen de portada. Tamaño máximo: 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="tu@ejemplo.com"
                  {...field}
                  className="bg-background border-input focus:border-primary"
                />
              </FormControl>
              <FormDescription className="text-muted-foreground">
                Tu dirección de email. No será visible públicamente.
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
              <FormControl>
                <Input
                  placeholder="Tu ciudad o país"
                  {...field}
                  className="bg-background border-input focus:border-primary"
                />
              </FormControl>
              <FormDescription className="text-muted-foreground">Donde te encuentras actualmente.</FormDescription>
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

