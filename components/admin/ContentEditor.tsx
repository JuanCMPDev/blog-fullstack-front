import { Controller, type Control } from "react-hook-form"
import dynamic from "next/dynamic"
import type { PostFormData } from "@/lib/types"

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
  return (
    <div>
      <label htmlFor="content" className="block text-sm font-medium mb-2">
        Contenido
      </label>
      <div className="bg-background border rounded-md">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
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
          )}
        />
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}

