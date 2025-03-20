import { MetadataRoute } from 'next'

// API URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://technoespacio.com'

async function getPosts() {
  try {
    const response = await fetch(`${baseUrl}/posts/sitemap`, { next: { revalidate: 3600 } })
    if (!response.ok) throw new Error('Failed to fetch posts')
    return await response.json()
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
    return []
  }
}

// Definir interfaz para los posts del sitemap
interface SitemapPost {
  slug: string;
  updatedAt?: string;
  createdAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts() as SitemapPost[]
  
  // Rutas estáticas
  const routes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] as MetadataRoute.Sitemap

  // Añadir rutas dinámicas de posts
  const postRoutes = posts.map((post: SitemapPost) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...postRoutes]
} 