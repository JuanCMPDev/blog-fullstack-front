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
    <footer className="bg-background border-t border-border/30 tonal-carving">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-headline font-bold">
              Techno<span className="text-primary">Espacio</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu observatorio digital dedicado a la intersección de la tecnología y el desarrollo de software moderno.
            </p>
            <div className="flex space-x-4 pt-2">
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
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Ecosistema</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Proyectos</Link></li>
              <li><Link href="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cursos</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Soporte</h4>
            <ul className="space-y-2.5">
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/politica-privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Términos de Uso</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Estado</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Todos los sistemas operativos
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TechnoEspacio. El Observatorio Digital.
          </p>
        </div>
      </div>
    </footer>
  )
}
