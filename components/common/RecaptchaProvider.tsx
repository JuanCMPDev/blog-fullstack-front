'use client'

import React, { createContext, useState, useEffect, useContext } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface ReCaptchaContextProps {
  executeRecaptcha: ((action: string) => Promise<string | null>) | null
}

const ReCaptchaContext = createContext<ReCaptchaContextProps>({
  executeRecaptcha: null,
})

export const useReCaptcha = () => useContext(ReCaptchaContext)

interface ReCaptchaProviderProps {
  reCaptchaKey: string
  children: React.ReactNode
}

export const ReCaptchaProvider = ({ reCaptchaKey, children }: ReCaptchaProviderProps) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Solo cargar el script si no existe
    if (!document.querySelector(`script[src*="recaptcha"]`)) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${reCaptchaKey}`
      script.async = true
      script.defer = true

      script.onload = () => {
        window.grecaptcha.ready(() => {
          setLoaded(true)
        })
      }

      document.head.appendChild(script)
    } else if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setLoaded(true)
      })
    }

    return () => {
      // Limpiar el script y el badge al desmontar el provider
      setLoaded(false)
      const script = document.querySelector(`script[src*="recaptcha"]`)
      if (script) script.remove()
      // Eliminar el badge flotante que Google inyecta
      const badge = document.querySelector('.grecaptcha-badge')
      if (badge) (badge as HTMLElement).remove()
      // Eliminar los iframes de recaptcha
      document.querySelectorAll('iframe[src*="recaptcha"]').forEach((el) => el.remove())
    }
  }, [reCaptchaKey])

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!loaded || !window.grecaptcha) return null
    
    try {
      return await window.grecaptcha.execute(reCaptchaKey, { action })
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error)
      return null
    }
  }

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha: loaded ? executeRecaptcha : null }}>
      {children}
    </ReCaptchaContext.Provider>
  )
} 