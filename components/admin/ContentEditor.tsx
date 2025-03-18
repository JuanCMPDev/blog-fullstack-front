import { Controller, type Control } from "react-hook-form"
import dynamic from "next/dynamic"
import type { PostFormData } from "@/lib/types"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })
import "react-quill-new/dist/quill.snow.css"

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["blockquote", "code-block"],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
}

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "blockquote",
  "code-block",
  "color",
  "background",
]

interface ContentEditorProps {
  control: Control<PostFormData>
  error?: string
}

export function ContentEditor({ control, error = "" }: ContentEditorProps) {
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual")
  
  return (
    <div>
      <label htmlFor="content" className="block text-sm font-medium mb-2">
        Contenido
      </label>
      
      <Tabs
        defaultValue="visual"
        value={editorMode}
        onValueChange={(value) => setEditorMode(value as "visual" | "markdown")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="visual">Editor Visual</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          
          {editorMode === "markdown" && (
            <div className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Usa sintaxis Markdown para dar formato al texto
            </div>
          )}
        </div>
        
        <div className="bg-background border rounded-md">
          <Controller
            name="content"
            control={control}
            render={({ field }) => {
              return (
                <>
                  <TabsContent value="visual" className="m-0">
                    <div className="relative">
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        className="h-[400px]"
                      />
                      <style jsx global>{`
                        .quill {
                          height: 400px;
                        }
                        .ql-container {
                          height: calc(400px - 42px) !important;
                          overflow-y: auto;
                        }
                        .ql-toolbar {
                          position: sticky;
                          top: 0;
                          z-index: 1;
                          background-color: hsl(var(--background));
                          border-bottom: 1px solid hsl(var(--border));
                        }
                      `}</style>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="markdown" className="m-0">
                    <Textarea
                      value={field.value || ""}
                      onChange={(e) => {
                        // Usar el valor directo del textarea
                        field.onChange(e.target.value);
                      }}
                      className="min-h-[400px] resize-y font-mono"
                      placeholder="Escribe tu contenido en formato Markdown..."
                      spellCheck={false}
                    />
                  </TabsContent>
                </>
              );
            }}
          />
        </div>
      </Tabs>
      
      {editorMode === "markdown" && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            <b>Formato Markdown:</b> 
            <span className="ml-1">
              # Título | ## Subtítulo | **negrita** | *cursiva* | - lista | ```código```
            </span>
          </p>
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}

