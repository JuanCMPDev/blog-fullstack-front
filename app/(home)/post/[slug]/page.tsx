import type { Metadata } from "next"
import { PostPageClient } from "./PostPageClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://technoespacio.com"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.technoespacio.com/api/v1"

interface PostData {
  title: string
  excerpt: string
  coverImage: string | null
  tags: string[]
  author: { name: string; nick: string }
  createdAt: string
  updatedAt: string
  slug: string
}

async function getPost(slug: string): Promise<PostData | null> {
  try {
    const res = await fetch(`${API_URL}/posts/slug/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: "Post no encontrado | Techno Espacio" }
  }

  const ogImage = post.coverImage || `${SITE_URL}/tecno-espacio.png`
  const postUrl = `${SITE_URL}/post/${post.slug}`

  return {
    title: `${post.title} | Techno Espacio`,
    description: post.excerpt,
    authors: [{ name: post.author?.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "Techno Espacio",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      site: "@technoespacio",
      creator: "@technoespacio",
    },
  }
}

export default function PostPage() {
  return <PostPageClient />
}
