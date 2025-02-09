// Description: This file contains the configuration for the Quill editor and the schema for the post creation form.
import { z } from "zod"

export const QUILL_CONFIG = {
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
    clipboard: { matchVisual: false }
  },
  formats: [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "blockquote",
    "code-block",
    "color",
    "background"
  ]
}

export const postSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  excerpt: z.string().min(1, "El extracto es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  tags: z.array(z.string()).min(1, "Al menos una etiqueta es requerida"),
  coverImage: z.any().refine((file) => !!file, "La imagen de portada es requerida"),
})