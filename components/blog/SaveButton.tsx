import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSavedPosts } from "@/hooks/use-saved-posts"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  postId: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function SaveButton({ postId, size = "md", showText = true }: SaveButtonProps) {
  const { isSaved, toggleSavePost } = useSavedPosts()
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()

  // Sincronizar el estado local con el estado del hook
  useEffect(() => {
    setSaved(isSaved(postId))
  }, [isSaved, postId])

  const handleClick = async () => {
    if (isLoading || !auth.user) return
    
    setIsLoading(true)
    try {
      await toggleSavePost(postId)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-4 w-4 mr-1 sm:mr-2",
    md: "h-5 w-5 mr-2",
    lg: "h-6 w-6 mr-2"
  }

  const buttonSizeClasses = {
    sm: "text-xs sm:text-sm px-2 sm:px-3",
    md: "text-sm px-3",
    lg: "text-base px-4"
  }

  return (
    <Button 
      variant="ghost" 
      size={size === "lg" ? "default" : "sm"} 
      onClick={handleClick}
      className={cn(
        buttonSizeClasses[size],
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      disabled={isLoading}
    >
      <Bookmark 
        className={cn(
          sizeClasses[size],
          saved ? "fill-foreground" : ""
        )} 
      />
      {showText && <span className={size === "sm" ? "hidden sm:inline" : ""}>
        {saved ? "Guardado" : "Guardar"}
      </span>}
    </Button>
  )
} 