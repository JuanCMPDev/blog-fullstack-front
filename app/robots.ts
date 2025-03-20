import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://technoespacio.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/signin/', 
        '/signup/',
        '/settings/',
        '/profile/',
        '/reset-password/'
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
} 