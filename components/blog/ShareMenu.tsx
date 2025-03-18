import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, Linkedin, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ShareMenuProps {
  url: string
  title: string
}

interface ShareOption {
  name: string
  icon: React.ElementType | string
  color: string
  action: () => void
}

// Variables hardcodeadas para las redes sociales
const SOCIAL_NETWORKS = {
  whatsapp: {
    baseUrl: "https://wa.me/?text=",
    color: "bg-[#25D366] hover:bg-[#128C7E]",
    icon: MessageCircle,
  },
  twitter: {
    baseUrl: "https://twitter.com/intent/tweet?url=",
    color: "bg-black hover:bg-gray-800",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  linkedin: {
    baseUrl: "https://www.linkedin.com/shareArticle?mini=true&url=",
    color: "bg-[#0A66C2] hover:bg-[#004182]",
    icon: Linkedin,
  },
  telegram: {
    baseUrl: "https://t.me/share/url?url=",
    color: "bg-[#26A5E4] hover:bg-[#0088cc]",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.0069 10.4252 14 10.3934C13.9931 10.3616 13.9797 10.3322 13.96 10.31C13.89 10.26 13.78 10.28 13.68 10.29C13.56 10.31 12.32 11.14 9.95 12.77C9.56 13.04 9.21 13.17 8.89 13.16C8.54 13.16 7.86 12.95 7.35 12.78C6.74 12.56 6.26 12.44 6.31 12.1C6.33 11.92 6.57 11.74 7.03 11.56C9.56 10.31 11.25 9.47 12.1 9.04C14.41 7.84 14.92 7.65 15.25 7.65C15.33 7.65 15.51 7.67 15.63 7.77C15.73 7.85 15.76 7.97 15.77 8.05C15.75 8.14 15.78 8.46 15.64 8.8H16.64Z" />
      </svg>
    ),
  }
};

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Usar la URL real en lugar de una acortada
  const shareUrl = url

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select()
      
      // Intentar usar el API moderno de clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true)
          toast({
            title: "URL copiada",
            description: "El enlace ha sido copiado al portapapeles.",
          })
          setTimeout(() => setCopied(false), 3000)
        }).catch(() => {
          // Si falla, usar el método antiguo
          fallbackCopy();
        });
      } else {
        // Si navigator.clipboard no está disponible
        fallbackCopy();
      }
    }
  }
  
  // Método antiguo para copiar
  const fallbackCopy = () => {
    document.execCommand("copy")
    setCopied(true)
    toast({
      title: "URL copiada",
      description: "El enlace ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  // Función para compartir en cada red social
  const shareOn = (network: keyof typeof SOCIAL_NETWORKS) => {
    const socialNetwork = SOCIAL_NETWORKS[network];
    
    let shareLink = '';
    switch (network) {
      case 'whatsapp':
        shareLink = `${socialNetwork.baseUrl}${encodeURIComponent(`${title} ${shareUrl}`)}`;
        break;
      case 'twitter':
        shareLink = `${socialNetwork.baseUrl}${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareLink = `${socialNetwork.baseUrl}${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
      case 'telegram':
        shareLink = `${socialNetwork.baseUrl}${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        console.warn(`Red social no configurada: ${network}`);
        return;
    }
    
    // Registrar evento de compartir (se podría implementar análisis aquí)
    console.log(`Compartiendo en ${network}: ${shareLink}`);
    
    // Abrir ventana para compartir
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const shareOptions: ShareOption[] = [
    {
      name: "WhatsApp",
      icon: SOCIAL_NETWORKS.whatsapp.icon,
      color: SOCIAL_NETWORKS.whatsapp.color,
      action: () => shareOn('whatsapp'),
    },
    {
      name: "X / Twitter",
      icon: SOCIAL_NETWORKS.twitter.icon,
      color: SOCIAL_NETWORKS.twitter.color,
      action: () => shareOn('twitter'),
    },
    {
      name: "LinkedIn",
      icon: SOCIAL_NETWORKS.linkedin.icon,
      color: SOCIAL_NETWORKS.linkedin.color,
      action: () => shareOn('linkedin'),
    },
    {
      name: "Telegram",
      icon: SOCIAL_NETWORKS.telegram.icon,
      color: SOCIAL_NETWORKS.telegram.color,
      action: () => shareOn('telegram'),
    },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs sm:text-sm px-2 sm:px-3 flex items-center justify-start"
        onClick={() => setIsOpen(true)}
      >
        <Share2 className="h-4 w-4 sm:mr-2 flex-shrink-0" />
        <span className="hidden sm:inline ml-2">Compartir</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-6 bg-secondary">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Compartir artículo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 mt-4">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 w-full">
              {shareOptions.map((option) => (
                <div key={option.name} className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${option.color} text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:scale-105 active:scale-95`}
                    onClick={option.action}
                    title={`Compartir en ${option.name}`}
                  >
                    {typeof option.icon === "function" ? (
                      <option.icon />
                    ) : (
                      <option.icon />
                    )}
                  </Button>
                  <span className="text-[10px] sm:text-xs font-medium">{option.name}</span>
                </div>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
              <input
                ref={inputRef}
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-4 py-2 text-sm border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ease-in-out pr-24"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm"
              >
                {copied ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-foreground/80 text-center font-medium">
              Comparte este artículo con tus amigos y colegas
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

