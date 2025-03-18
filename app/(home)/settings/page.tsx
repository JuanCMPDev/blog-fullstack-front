"use client"

import { useState, useEffect } from "react"
import { SettingsIcon, MonitorIcon, SlidersHorizontal, RotateCcw, Blocks, Type } from "lucide-react"
import { FontSize, ThemePreference } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"

// Componente SettingsItem separado para mejor rendimiento
const SettingsItem = ({
  icon: Icon,
  label,
  control,
  description,
  preview
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  control: React.ReactNode
  description?: string
  preview?: React.ReactNode
}) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div className="flex items-center gap-4">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <div>
        <Label className="text-base label">{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {preview && <div className="mt-2">{preview}</div>}
      </div>
    </div>
    {control}
  </div>
)

// Componente de vista previa para tamaño de texto
const FontSizePreview = ({ fontSize }: { fontSize: FontSize }) => {
  const sizes = {
    [FontSize.Small]: { sample: "0.875rem", height: "h-3" },
    [FontSize.Medium]: { sample: "1rem", height: "h-4" },
    [FontSize.Large]: { sample: "1.125rem", height: "h-5" },
  }
  
  return (
    <div className="flex items-center gap-2">
      <Type className="w-4 h-4 text-muted-foreground" />
      <div className={cn("bg-primary/20 rounded", sizes[fontSize].height)} style={{ width: "100px" }}></div>
      <span className="text-xs text-muted-foreground">{sizes[fontSize].sample}</span>
    </div>
  )
}

// Componente de vista previa para densidad
const DensityPreview = ({ density }: { density: "comfortable" | "compact" | "spacious" }) => {
  const sizes: Record<string, { spacing: string; bars: number }> = {
    "comfortable": { spacing: "gap-3", bars: 3 },
    "compact": { spacing: "gap-1", bars: 4 },
    "spacious": { spacing: "gap-4", bars: 2 },
  }
  
  return (
    <div className="flex items-center gap-2">
      <Blocks className="w-4 h-4 text-muted-foreground" />
      <div className={cn("flex items-center", sizes[density].spacing)}>
        {Array(sizes[density].bars).fill(null).map((_, i) => (
          <div key={i} className="bg-primary/20 h-2 w-5 rounded"></div>
        ))}
      </div>
    </div>
  )
}

// Valores predefinidos para selects
const FONT_SIZE_OPTIONS = [
  { value: FontSize.Small, label: "Pequeño" },
  { value: FontSize.Medium, label: "Mediano" },
  { value: FontSize.Large, label: "Grande" }
]

const THEME_OPTIONS = [
  { value: ThemePreference.System, label: "Sistema" },
  { value: ThemePreference.Light, label: "Claro" },
  { value: ThemePreference.Dark, label: "Oscuro" }
]

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Normal" },
  { value: "compact", label: "Compacto" },
  { value: "spacious", label: "Espacioso" }
]

export default function SimpleSettingsPage() {
  const { toast } = useToast()
  const { settings, updateSettings, resetSettings } = useSettings()
  const [isMounted, setIsMounted] = useState(false)

  // Verificar si el componente está montado (solución para hidratación en SSR)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Si el componente no está montado, mostramos un esqueleto de carga para evitar problemas de hidratación
  if (!isMounted) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] bg-background px-4 bg-dot-pattern">
        <div className="max-w-2xl lg:min-w-[700px] md:min-w-[600px] sm:min-w-[550px] m-auto">
          <Card className="animate-pulse">
            <CardHeader className="border-b">
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="p-0">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-40"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-muted rounded w-32"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Función para restablecer valores por defecto
  const handleReset = () => {
    resetSettings()
    
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados",
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-background px-4 bg-dot-pattern">
      <div className="max-w-2xl lg:min-w-[700px] md:min-w-[600px] sm:min-w-[550px] m-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 card-title">
              <SettingsIcon className="w-6 h-6" />
              Configuración General
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <SettingsItem
              icon={MonitorIcon}
              label="Tema de la aplicación"
              control={
                <Select 
                  value={settings.themePreference} 
                  onValueChange={(value) => updateSettings("themePreference", value as ThemePreference)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
              description="Cambia el aspecto visual de la aplicación"
            />
            
            <SettingsItem
              icon={SlidersHorizontal}
              label="Densidad de contenido"
              control={
                <Select 
                  value={settings.contentDensity}
                  onValueChange={(value) => updateSettings("contentDensity", value as "comfortable" | "compact" | "spacious")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DENSITY_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
              description="Controla el espaciado entre elementos"
              preview={<DensityPreview density={settings.contentDensity} />}
            />

            <SettingsItem
              icon={Type}
              label="Tamaño de texto"
              control={
                <Select 
                  value={settings.fontSize}
                  onValueChange={(value) => updateSettings("fontSize", value as FontSize)}
                >
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
              preview={<FontSizePreview fontSize={settings.fontSize} />}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end mt-6">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}