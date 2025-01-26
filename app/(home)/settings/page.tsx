"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsIcon, BellIcon, MessageSquareIcon, LayoutIcon } from "lucide-react"
import { Settings } from "@/lib/types"

export default function SimpleSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    replyNotifications: false,
    fontSize: "medium",
    postLayout: "card",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = <K extends keyof Settings>(name: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias se actualizaron correctamente",
      })
    }, 1000)
  }

  type SettingsItemProps = {
    icon: React.ComponentType<{ className?: string }>
    label: string
    control: React.ReactNode
    description?: string
  }

  const SettingsItem = ({ icon: Icon, label, control, description }: SettingsItemProps) => (
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

  return (
    <div className="max-w-2xl mx-auto p-4">
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
            control={
              <Switch checked={settings.notifications} onCheckedChange={(val) => handleChange("notifications", val)} />
            }
            description="Recibir alertas de nuevas publicaciones"
          />

          <SettingsItem
            icon={MessageSquareIcon}
            label="Notificaciones de respuestas"
            control={
              <Switch
                checked={settings.replyNotifications}
                onCheckedChange={(val) => handleChange("replyNotifications", val)}
              />
            }
            description="Alertas cuando responden tus comentarios"
          />

          <SettingsItem
            icon={SettingsIcon}
            label="Tamaño de texto"
            control={
              <Select
                value={settings.fontSize}
                onValueChange={(val) => handleChange("fontSize", val as Settings["fontSize"])}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeño</SelectItem>
                  <SelectItem value="medium">Mediano</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <SettingsItem
            icon={LayoutIcon}
            label="Estilo de visualización de posts"
            control={
              <Select
                value={settings.postLayout}
                onValueChange={(val) => handleChange("postLayout", val as Settings["postLayout"])}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Tarjetas</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="compact">Compacto</SelectItem>
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
  )
}

