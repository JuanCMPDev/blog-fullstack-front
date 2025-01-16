import Link from 'next/link'
import { Facebook, Linkedin, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Mi Blog Dev</h3>
            <p className="text-sm text-muted-foreground">
              Compartiendo conocimientos y experiencias.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/ejercicios" className="text-sm hover:text-primary transition-colors">Ejercicios</Link></li>
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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mi Blog Universitario. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

