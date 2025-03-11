import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera una URL completa para un avatar usando CloudFront
 * @param avatarPath Ruta relativa del avatar (ej: "avatars/123-456.webp")
 * @returns URL completa de CloudFront para el avatar
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  // Si no hay avatar, devolver imagen predeterminada
  if (!avatarPath) {
    return '/placeholder-user.jpg';
  }
  
  // Si la ruta ya comienza con http, asumimos que ya es una URL completa
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Si la ruta comienza con '/', eliminamos la barra inicial
  const normalizedPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
  
  // Hardcodeamos la URL de CloudFront para asegurar que funcione
  // Esto es temporal mientras resolvemos el problema con las variables de entorno
  return `https://d20iz9a0oa67fs.cloudfront.net/${normalizedPath}`;
  
  /* 
  // Código comentado para diagnóstico
  // Verificar si la variable de entorno está definida
  const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL;
  console.log('CLOUDFRONT_URL:', process.env.CLOUDFRONT_URL);
  console.log('NEXT_PUBLIC_CLOUDFRONT_URL:', process.env.NEXT_PUBLIC_CLOUDFRONT_URL);
  
  if (!cloudfrontDomain) {
    console.warn('La variable CLOUDFRONT_URL no está definida');
    // Fallback a una URL relativa en el servidor local
    return `/${normalizedPath}`;
  }
  
  // Añadir el protocolo https:// si no está incluido
  let formattedDomain = cloudfrontDomain;
  if (!formattedDomain.startsWith('http')) {
    formattedDomain = `https://${formattedDomain}`;
  }
  
  // Asegurarse de que el dominio no termine con /
  if (formattedDomain.endsWith('/')) {
    formattedDomain = formattedDomain.slice(0, -1);
  }
  
  return `${formattedDomain}/${normalizedPath}`;
  */
}
