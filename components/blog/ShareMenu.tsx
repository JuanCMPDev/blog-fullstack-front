import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, MessageSquare, Linkedin, Copy, Check } from "lucide-react"
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

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const shortenedUrl = `https://short.url/${Math.random().toString(36).substr(2, 6)}`

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select()
      document.execCommand("copy")
    }
    setCopied(true)
    toast({
      title: "URL copiado",
      description: "El enlace ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  const shareOptions: ShareOption[] = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] hover:bg-[#128C7E]",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, "_blank"),
    },
    {
      name: "Messenger",
      icon: MessageSquare,
      color: "bg-[#0099FF] hover:bg-[#006AFF]",
      action: () =>
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_FACEBOOK_APP_ID`,
          "_blank",
        ),
    },
    {
      name: "X",
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black hover:bg-gray-800",
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank",
        ),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] hover:bg-[#004182]",
      action: () =>
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
          "_blank",
        ),
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
            <div className="flex justify-center space-x-3 sm:space-x-6 w-full">
              {shareOptions.map((option) => (
                <div key={option.name} className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${option.color} text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:scale-105 active:scale-95`}
                    onClick={option.action}
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
                value={shortenedUrl}
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

