import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export function DownloadCV() {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        className="w-full bg-primary text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
        asChild
      >
        <a href="/path-to-your-cv.pdf" download>
          <FileDown className="mr-2 h-4 w-4" /> Descargar CV
        </a>
      </Button>
    </motion.div>
  )
}

