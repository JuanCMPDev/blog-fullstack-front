"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Github, Loader2, Check, ExternalLink } from "lucide-react"
import { useGitHubImport } from "@/hooks/use-projects"
import type { GitHubRepo } from "@/lib/types"
import { cn } from "@/lib/utils"

interface GitHubImportDialogProps {
  onImportComplete: () => void
}

export function GitHubImportDialog({ onImportComplete }: GitHubImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { repos, isLoading, isImporting, fetchRepos, handleImport } = useGitHubImport()

  useEffect(() => {
    if (open) {
      fetchRepos()
      setSelected(new Set())
    }
  }, [open, fetchRepos])

  const toggleRepo = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    const selectedRepos = repos.filter((r) => selected.has(r.name))
    const result = await handleImport(selectedRepos)
    if (result) {
      setOpen(false)
      onImportComplete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Github className="h-4 w-4" />
          Importar desde GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Importar repositorios
          </DialogTitle>
          <DialogDescription>
            Selecciona los repositorios que quieres importar como proyectos.
            Se crearán como no publicados para que puedas revisarlos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No se encontraron repositorios.
            </p>
          ) : (
            <div className="space-y-2">
              {repos.map((repo) => {
                const isSelected = selected.has(repo.name)
                return (
                  <button
                    type="button"
                    key={repo.name}
                    onClick={() => toggleRepo(repo.name)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/80 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {repo.name}
                          </span>
                          {repo.language && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {repo.topics.slice(0, 4).map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center mt-0.5",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selected.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                `Importar (${selected.size})`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
