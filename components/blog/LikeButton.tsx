"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useLikes } from "@/hooks/use-likes"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  postId: number | null
  initialLikesCount: number
  className?: string
  size?: "sm" | "default" | "lg"
  showCount?: boolean
  iconOnly?: boolean
}

export function LikeButton({
  postId,
  initialLikesCount,
  className,
  size = "sm",
  showCount = true,
  iconOnly = false,
}: LikeButtonProps) {
  const { hasLiked, likesCount, toggleLike, isLoading } = useLikes({
    postId,
    initialLikesCount,
  })

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    liked: { scale: [1, 1.15, 1], transition: { duration: 0.4 } },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    liked: {
      scale: [1, 1.4, 1],
      rotate: [0, 15, 0],
      transition: { duration: 0.4 },
    },
    unliked: {
      scale: [1, 0.8, 1],
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      initial="initial"
      animate={hasLiked ? "liked" : "initial"}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
    >
      <Button
        variant={hasLiked ? "default" : "outline"}
        size={size}
        className={cn(
          "transition-all duration-300 group overflow-hidden",
          hasLiked
            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
            : "hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20",
          iconOnly ? "p-2" : "px-2 sm:px-3",
          "text-xs sm:text-sm",
          className,
        )}
        onClick={toggleLike}
        disabled={isLoading}
        aria-label={hasLiked ? "Quitar like" : "Dar like"}
        title={hasLiked ? "Quitar like" : "Dar like"}
      >
        <motion.div variants={iconVariants} animate={hasLiked ? "liked" : "unliked"} className="relative">
          <ThumbsUp
            className={cn(
              "h-4 w-4 transition-all duration-300 relative z-10",
              !iconOnly && "mr-1 sm:mr-2",
              hasLiked ? "fill-primary-foreground text-primary-foreground" : "group-hover:text-primary",
              isLoading && "opacity-70",
            )}
          />
          {hasLiked && (
            <motion.div
              className="absolute inset-0 z-0"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-full w-full rounded-full bg-primary-foreground opacity-30" />
            </motion.div>
          )}
        </motion.div>

        {showCount && !iconOnly && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={likesCount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? "..." : likesCount}
            </motion.span>
          </AnimatePresence>
        )}
      </Button>
    </motion.div>
  )
}

