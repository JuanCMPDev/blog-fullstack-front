import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative py-16 md:py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Explora el Mundo de la informatica
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Descubre experiencias, consejos y conocimientos para tu camino TI.
            </p>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/ejercicios">Explorar Ejercicios</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">Contactame</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
              <img
                src="/placeholder-hero-image.jpg"
                alt="Estudiantes universitarios"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
              <p className="font-semibold">+ de 3 Años</p>
              <p className="text-sm">siguiendo este camino</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

