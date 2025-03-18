"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback
} from "react"
import { 
  Settings, 
  FontSize, 
  PostLayout, 
  ThemePreference 
} from "@/lib/types"
import { useTheme } from "next-themes"

// Valores por defecto para las configuraciones
const defaultSettings: Settings = {
  fontSize: FontSize.Medium,
  postLayout: PostLayout.Card,
  themePreference: ThemePreference.System,
  contentDensity: "comfortable"
}

// Clave para localStorage
const SETTINGS_STORAGE_KEY = "userSettings"

// Contexto para las configuraciones
type SettingsContextType = {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider para el contexto
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Función para aplicar configuraciones al DOM
  const applySettingsToDOM = useCallback((settings: Settings) => {
    if (typeof window === 'undefined') return;
    
    const rootElement = document.documentElement
    
    // Aplicar tamaño de fuente
    rootElement.classList.remove("text-size-small", "text-size-medium", "text-size-large")
    rootElement.classList.add(`text-size-${settings.fontSize}`)
    
    // Aplicar densidad de contenido
    rootElement.classList.remove("density-comfortable", "density-compact", "density-spacious")
    rootElement.classList.add(`density-${settings.contentDensity}`)
  }, [])

  // Cargar configuraciones al inicio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
        
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings) as Settings
          setSettings(parsed)
          
          // Sincronizar el tema con las configuraciones
          if (parsed.themePreference) {
            // Usamos setTimeout para sacar la actualización del tema 
            // fuera del ciclo de renderizado actual
            setTimeout(() => {
              setTheme(parsed.themePreference)
            }, 0)
          }
        } else if (theme) {
          // Si no hay configuraciones guardadas pero hay un tema activo
          setSettings(prev => ({
            ...prev,
            themePreference: theme as ThemePreference
          }))
        }
      } catch (error) {
        console.error('Error al cargar configuraciones:', error)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [theme, setTheme])

  // Actualizar una configuración individual
  const updateSettings = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    // Solo actualizamos el estado, no aplicamos cambios al DOM directamente aquí
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      
      // Aplicar cambios en tiempo real para el tema
      if (key === "themePreference") {
        // Usamos setTimeout para sacar la actualización del tema 
        // fuera del ciclo de renderizado actual
        setTimeout(() => {
          setTheme(value as string)
        }, 0)
      }
      
      // Guardar automáticamente las configuraciones actualizadas
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
      }
      
      return newSettings
    })
  }, [setTheme])

  // Guardar configuraciones en localStorage
  const saveSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings])

  // Restablecer configuraciones a valores por defecto
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    setTheme(defaultSettings.themePreference)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
    }
  }, [setTheme])

  // Aplicar las configuraciones al DOM cuando cambian
  useEffect(() => {
    if (isLoaded) {
      applySettingsToDOM(settings)
    }
  }, [settings, isLoaded, applySettingsToDOM])

  // El valor del contexto que exponemos
  const contextValue = {
    settings,
    updateSettings,
    saveSettings,
    resetSettings
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook para usar las configuraciones
export function useSettings() {
  const context = useContext(SettingsContext)
  
  if (context === undefined) {
    throw new Error('useSettings debe ser usado dentro de un SettingsProvider')
  }
  
  return context
} 