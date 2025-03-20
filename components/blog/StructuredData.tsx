import React from 'react'
import { Post } from '@/lib/types'

interface StructuredDataProps {
  post: Post
  url: string
}

// Función para optimizar las imágenes para compartir en redes sociales
const getOptimizedImageUrl = (imageUrl: string, siteUrl: string) => {
  // Si la imagen es relativa, convertirla en absoluta
  if (imageUrl && !imageUrl.startsWith('http')) {
    if (imageUrl.startsWith('/')) {
      imageUrl = `${siteUrl}${imageUrl}`
    } else {
      imageUrl = `${siteUrl}/${imageUrl}`
    }
  }
  
  // Si la imagen ya es servida por un CDN de imágenes (como Cloudinary, Imgix, etc.)
  // podríamos añadir parámetros para optimizarla
  if (imageUrl.includes('cloudinary.com')) {
    // Para Cloudinary: optimizar para datos estructurados
    return imageUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_auto/');
  }
  
  return imageUrl;
}

export function StructuredData({ post, url }: StructuredDataProps) {
  if (!post) return null

  // Optimizar URL de la imagen
  const coverImageUrl = getOptimizedImageUrl(
    post.coverImage || '/og-image.jpg',
    url
  );

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: coverImageUrl,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Techno Espacio',
      url: url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Techno Espacio',
      logo: {
        '@type': 'ImageObject',
        url: `${url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}/post/${post.slug}`,
    },
    keywords: typeof post.tags === 'string' 
      ? post.tags 
      : Array.isArray(post.tags) 
        ? post.tags.join(', ') 
        : '',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${url}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${url}/post/${post.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
} 