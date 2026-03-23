"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Github,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Code2,
  Layers,
  Filter,
} from "lucide-react"
import Image from "next/image"
import { Project, ProjectStatus, ProjectGridSize } from "@/lib/types"
import { cn } from "@/lib/utils"
import { usePublicProjects } from "@/hooks/use-projects"
import { Skeleton } from "@/components/ui/skeleton"

// ── Helpers ───────────────────────────────────────────────────────────

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string; dot: string }
> = {
  [ProjectStatus.IN_DEVELOPMENT]: {
    label: "En desarrollo",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  [ProjectStatus.COMPLETED]: {
    label: "Completado",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  [ProjectStatus.MAINTENANCE]: {
    label: "Mantenimiento",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
}

type FilterType = "all" | ProjectStatus

// ── Componente ProjectCard ────────────────────────────────────────────

function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const status = statusConfig[project.status]
  const isFeatured = project.gridSize === ProjectGridSize.FEATURED

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isFeatured && "md:col-span-2"
      )}
    >
      <div className={cn(isFeatured && "md:flex md:flex-row")}>
        {/* Imagen de proyecto */}
        {project.screenshotUrl && (
          <div
            className={cn(
              "relative overflow-hidden bg-muted shrink-0",
              isFeatured
                ? "h-56 md:h-auto md:w-1/2"
                : "h-44 w-full"
            )}
          >
            <Image
              src={project.screenshotUrl}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={
                isFeatured
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
            />
            <div
              className={cn(
                "absolute inset-0",
                isFeatured
                  ? "bg-gradient-to-r from-transparent via-transparent to-card/80 hidden md:block"
                  : "bg-gradient-to-t from-card via-card/20 to-transparent"
              )}
            />
            {/* Gradient for mobile on featured */}
            {isFeatured && (
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent md:hidden" />
            )}

            {/* Status badge sobre la imagen */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={cn("text-xs", status.color)}>
                <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className={cn("p-5 flex flex-col justify-center", isFeatured ? "md:p-7 md:flex-1" : "")}>
          {!project.screenshotUrl && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className={cn("text-xs", status.color)}>
                <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </Badge>
            </div>
          )}

          <h3
            className={cn(
              "font-bold tracking-tight mb-2 text-foreground",
              isFeatured ? "text-xl md:text-2xl" : "text-lg"
            )}
          >
            {project.name}
          </h3>

          <p
            className={cn(
              "text-muted-foreground leading-relaxed mb-4",
              isFeatured ? "text-sm md:text-base" : "text-sm",
              !isFeatured && "line-clamp-3"
            )}
          >
            {project.description}
          </p>

          {/* Tecnologías */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.technologies.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="text-[11px] font-medium px-2 py-0.5 bg-secondary/70"
              >
                {tech}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            {project.githubUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span className="text-xs">Código</span>
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-primary gap-1.5"
              >
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-xs">Demo</span>
                </a>
              </Button>
            )}
            <div className="ml-auto">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ── Página principal ──────────────────────────────────────────────────

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const { projects, isLoading, error } = usePublicProjects()

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter)

  const projectCount = filteredProjects.length

  return (
    <div className="relative min-h-screen overflow-hidden bg-dot-pattern">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-[35%] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[20%] h-[18rem] w-[18rem] rounded-full bg-primary/10 blur-2xl" />
      </div>

      {/* Hero section */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Comunidad</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight mb-4">
              Nuestros{" "}
              <span className="text-primary">Proyectos</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Proyectos que construimos en nuestros cursos y compartimos con la
              comunidad. Explora el código, aprende de ellos o úsalos como
              punto de partida para tus propias ideas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtros y grid */}
      <section className="relative z-10 container mx-auto px-4 pb-16 md:pb-24">
        {/* Barra de filtros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(
            [
              { key: "all" as FilterType, label: "Todos" },
              { key: ProjectStatus.IN_DEVELOPMENT, label: "En desarrollo" },
              { key: ProjectStatus.COMPLETED, label: "Completados" },
              { key: ProjectStatus.MAINTENANCE, label: "Mantenimiento" },
            ] as const
          ).map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key)}
              className={cn(
                "text-xs rounded-full",
                filter === key
                  ? ""
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {projectCount} proyecto{projectCount !== 1 ? "s" : ""}
          </span>
        </motion.div>

        {/* Bento Masonry Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-1.5 pt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-2">Error al cargar los proyectos</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No hay proyectos con este filtro.
            </p>
          </motion.div>
        )}

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-6 py-3 text-sm text-muted-foreground">
            <Github className="h-4 w-4" />
            <span>Código fuente disponible en</span>
            <a
              href="https://github.com/JuanCMPDev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
