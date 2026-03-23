import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTypewriter } from "@/hooks/useTypewritter"
import {
  BookOpen,
  ArrowRight,
  Terminal,
  Braces,
  Code,
  Cpu,
  Globe,
  Layers,
  Zap,
  Binary,
  Brackets,
  Smartphone,
  Bot,
  Wifi,
  MonitorSmartphone,
  Sparkles,
  BrainCircuit,
  Rocket,
  type LucideIcon,
} from "lucide-react"

interface FloatingSymbol {
  Icon: LucideIcon
  className: string
}

const floatingSymbols: FloatingSymbol[] = [
  // Large icons — scattered around edges
  { Icon: BrainCircuit, className: "top-10 right-[14%] h-16 w-16 animate-float" },
  { Icon: Braces,       className: "bottom-14 left-[8%] h-14 w-14 animate-float-delayed" },
  { Icon: Bot,          className: "top-[45%] right-[6%] h-12 w-12 animate-float-slow" },
  { Icon: Cpu,          className: "top-[18%] left-[12%] h-14 w-14 animate-float-slow" },
  { Icon: Globe,        className: "bottom-[22%] right-[12%] h-12 w-12 animate-float" },
  // Medium icons — fill the middle space
  { Icon: Smartphone,   className: "top-[30%] left-[5%] h-10 w-10 animate-float-delayed" },
  { Icon: Sparkles,     className: "top-[15%] right-[28%] h-10 w-10 animate-float-slow" },
  { Icon: Layers,       className: "bottom-[30%] left-[20%] h-10 w-10 animate-float" },
  { Icon: Wifi,         className: "top-[60%] left-[4%] h-9 w-9 animate-float-slow" },
  { Icon: Zap,          className: "bottom-10 right-[30%] h-9 w-9 animate-float-delayed" },
  { Icon: Rocket,       className: "top-[25%] right-[5%] h-9 w-9 animate-float" },
  // Small accents — corners and gaps
  { Icon: Binary,       className: "top-[70%] right-[18%] h-7 w-7 animate-float-delayed" },
  { Icon: Brackets,     className: "top-6 left-[25%] h-7 w-7 animate-float-slow" },
  { Icon: MonitorSmartphone, className: "bottom-[15%] left-[30%] h-6 w-6 animate-float" },
  { Icon: Code,         className: "top-[50%] left-[15%] h-6 w-6 animate-float-delayed" },
  { Icon: Terminal,     className: "bottom-6 left-[45%] h-7 w-7 animate-float-slow" },
  { Icon: Bot,          className: "top-[8%] left-[40%] h-6 w-6 animate-float" },
  { Icon: Zap,          className: "top-[40%] right-[22%] h-6 w-6 animate-float-slow" },
]

export function Hero() {
  const typewriterText = useTypewriter(
    ['tecnología', 'inteligencia artificial', 'desarrollo web', 'gadgets y tendencias'],
    150, 100, 2000
  );

  return (
    <div className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated gradient background — more visible in light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-600/15 dark:from-primary/15 dark:via-purple-600/10 dark:to-blue-900/20 animate-gradient-shift" />
      <div className="absolute inset-0 bg-dot-pattern opacity-60 dark:opacity-50" />

      {/* Extra gradient orbs for light mode depth */}
      <div className="absolute top-0 right-[20%] h-[20rem] w-[20rem] rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-[10%] h-[16rem] w-[16rem] rounded-full bg-purple-400/10 dark:bg-purple-600/5 blur-3xl" />

      {/* Floating decorative symbols */}
      {floatingSymbols.map(({ Icon, className }, i) => (
        <div
          key={i}
          className={`absolute hidden md:block ${className} opacity-[0.08] dark:opacity-[0.07]`}
          style={{
            // Stagger animation slightly per icon for more organic feel
            animationDelay: `${(i * 0.4) % 5}s`,
          }}
        >
          <Icon className="h-full w-full text-primary" />
        </div>
      ))}

      {/* Mobile: show fewer floating icons */}
      <div className="absolute top-8 right-6 md:hidden animate-float opacity-[0.06]">
        <BrainCircuit className="h-10 w-10 text-primary" />
      </div>
      <div className="absolute bottom-12 left-6 md:hidden animate-float-delayed opacity-[0.06]">
        <Smartphone className="h-8 w-8 text-primary" />
      </div>
      <div className="absolute top-[40%] right-4 md:hidden animate-float-slow opacity-[0.06]">
        <Bot className="h-7 w-7 text-primary" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Main heading */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
            <span className="block">Explora.</span>
            <span className="block text-primary text-glow">
              {typewriterText}
              <span className="animate-blink">|</span>
            </span>
            <span className="block">Evoluciona.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Noticias, cursos, tutoriales y proyectos sobre el mundo tech.
            Desde IA y desarrollo web hasta gadgets y tendencias digitales.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base px-8 py-3 font-semibold">
              <Link href="/courses" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Explorar Cursos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base px-8 py-3 font-semibold border-primary/30 hover:bg-primary/10">
              <Link href="/projects">Ver Proyectos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
