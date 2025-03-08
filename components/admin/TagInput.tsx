import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "@/components/common/Tag"
import { X, Plus } from "lucide-react"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  error?: string
}

export function TagInput({ tags, setTags, error = "" }: TagInputProps) {
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div>
      <label htmlFor="tags" className="block text-sm font-medium mb-2">
        Etiquetas
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div key={tag} className="flex items-center">
            <Tag name={tag} />
            <Button type="button" variant="ghost" size="sm" className="ml-1 p-0 h-auto" onClick={() => removeTag(tag)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Añade una etiqueta"
          className="mr-2"
        />
        <Button type="button" onClick={addTag}>
          <Plus className="mr-2 h-4 w-4" /> Añadir
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}

