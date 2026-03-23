import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter } from "lucide-react"

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com/JuanCMPDev" },
  { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/in/juan-carlos-mu%C3%B1oz/" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com/juancm_dev" },
]

export function SocialLinks() {
  return (
    <div className="flex gap-2">
      {socialLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="icon"
          className="border-border/30 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200"
          asChild
        >
          <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
            <link.icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  )
}
