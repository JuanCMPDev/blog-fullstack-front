import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter } from "lucide-react"

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com/yourusername" },
  { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/in/yourusername" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com/yourusername" },
]

export function SocialLinks() {
  return (
    <div className="flex flex-col space-y-4">
      {socialLinks.map((link, index) => (
        <motion.div
          key={link.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            className="w-full bg-background hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md rounded-lg"
            asChild
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <link.icon className="mr-2 h-4 w-4" /> {link.name}
            </a>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

