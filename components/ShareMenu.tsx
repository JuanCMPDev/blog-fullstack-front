import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Facebook, Twitter, Linkedin, Link, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ShareMenuProps {
  url: string
  title: string
}

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const shortenedUrl = `https://short.url/${Math.random().toString(36).substr(2, 6)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl)
    setCopied(true)
    toast({
      title: "URL copiado",
      description: "El enlace ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="text-xs sm:text-sm px-2 sm:px-3 flex items-center justify-start"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="h-4 w-4 sm:mr-2 flex-shrink-0" />
        <span className="hidden sm:inline">Compartir</span>
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 p-4 bg-gradient-to-br from-background to-secondary/20 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg z-50"
            style={{ transform: "translateX(-50%)", right: "50%" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Compartir artículo</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                  aria-label={`Compartir en ${link.name}`}
                >
                  <link.icon className="h-6 w-6 text-primary" />
                </a>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={shortenedUrl}
                readOnly
                className="w-full px-3 py-2 text-sm border rounded-md pr-12 bg-background/50"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-primary/20 transition-colors duration-200"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

