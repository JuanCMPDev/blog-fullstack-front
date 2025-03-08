import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface TagProps {
  name: string
}

export function Tag({ name }: TagProps) {
  return (
    <Link href={`/search?tags=${encodeURIComponent(name)}`}>
      <Badge
        variant="outline"
        className="bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 cursor-pointer px-3 py-1 rounded-full text-xs font-medium"
      >
        #{name}
      </Badge>
    </Link>
  )
}

