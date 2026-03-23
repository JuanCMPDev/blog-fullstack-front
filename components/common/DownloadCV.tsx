import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export function DownloadCV() {
  return (
    <Button
      className="w-full font-semibold"
      size="lg"
      asChild
    >
      <a href="/Curriculum-Vitae-2025ESP.pdf" download>
        <FileDown className="mr-2 h-4 w-4" />
        Descargar CV
      </a>
    </Button>
  )
}
