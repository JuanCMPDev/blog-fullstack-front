"use client"

import { useState, useCallback } from "react"
import { SettingsIcon, BellIcon, MessageSquareIcon, LayoutIcon } from "lucide-react"
import { Settings } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export enum FontSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

export enum PostLayout {
  Card = "card",
  List = "list",
  Compact = "compact",
}

// Componente SettingsItem separado para mejor rendimiento
const SettingsItem = ({
  icon: Icon,
  label,
  control,
  description
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  control: React.ReactNode
  description?: string
}) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div className="flex items-center gap-4">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <div>
        <Label className="text-base">{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    {control}
  </div>
)

// Valores predefinidos para selects
const FONT_SIZE_OPTIONS = [
  { value: FontSize.Small, label: "Pequeño" },
  { value: FontSize.Medium, label: "Mediano" },
  { value: FontSize.Large, label: "Grande" }
]

const POST_LAYOUT_OPTIONS = [
  { value: PostLayout.Card, label: "Tarjetas" },
  { value: PostLayout.List, label: "Lista" },
  { value: PostLayout.Compact, label: "Compacto" }
]

export default function SimpleSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    replyNotifications: false,
    fontSize: FontSize.Small,
    postLayout: PostLayout.Card,
  })

  // Handler genérico memoizado
  const handleChange = useCallback(<K extends keyof Settings>(name: K) =>
    (value: Settings[K]) => {
      setSettings(prev => ({ ...prev, [name]: value }))
    }, [])

  // Función de guardado optimizada
  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias se actualizaron correctamente",
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-background px-4 bg-dot-pattern">
      <div className="max-w-2xl lg:min-w-[700px] md:min-w-[600px] sm:min-w-[550px] m-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Configuración General
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <SettingsItem
              icon={BellIcon}
              label="Notificaciones de nuevos posts"
              control={<Switch checked={settings.notifications} onCheckedChange={handleChange("notifications")} />}
              description="Recibir alertas de nuevas publicaciones"
            />

            <SettingsItem
              icon={MessageSquareIcon}
              label="Notificaciones de respuestas"
              control={<Switch checked={settings.replyNotifications} onCheckedChange={handleChange("replyNotifications")} />}
              description="Alertas cuando responden tus comentarios"
            />

            <SettingsItem
              icon={SettingsIcon}
              label="Tamaño de texto"
              control={
                <Select value={settings.fontSize} onValueChange={handleChange("fontSize")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZE_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <SettingsItem
              icon={LayoutIcon}
              label="Estilo de visualización de posts"
              control={
                <Select value={settings.postLayout} onValueChange={handleChange("postLayout")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_LAYOUT_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
              description="Elige cómo se muestran los posts en la página principal"
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}