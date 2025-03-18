import Link from 'next/link'
import { Linkedin, Github } from 'lucide-react'

// Componente personalizado para el ícono de X (anteriormente Twitter)
const XIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="0"
  >
    <path 
      d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z" 
      fill="currentColor"
    />
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Techno Espacio</h3>
            <p className="text-sm text-muted-foreground">
              Compartiendo conocimientos y experiencias.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/exercises" className="text-sm hover:text-primary transition-colors">Ejercicios</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Recursos</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/politica-privacidad" className="text-sm hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terminos" className="text-sm hover:text-primary transition-colors">Términos de Uso</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/in/juan-carlos-mu%C3%B1oz/" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com/JuanCMPDev" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                <Github size={20} />
              </a>
              <a href="https://x.com/juancm_dev" className="text-muted-foreground hover:text-primary transition-colors" aria-label="X" target="_blank" rel="noopener noreferrer">
                <XIcon size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Techno Espacio. {<br/>} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

