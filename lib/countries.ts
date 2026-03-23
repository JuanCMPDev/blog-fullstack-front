export const countries = [
  { name: "España", code: "ES", emoji: "🇪🇸" },
  { name: "Estados Unidos", code: "US", emoji: "🇺🇸" },
  { name: "México", code: "MX", emoji: "🇲🇽" },
  { name: "Argentina", code: "AR", emoji: "🇦🇷" },
  { name: "Colombia", code: "CO", emoji: "🇨🇴" },
  { name: "Brasil", code: "BR", emoji: "🇧🇷" },
  { name: "Chile", code: "CL", emoji: "🇨🇱" },
  { name: "Perú", code: "PE", emoji: "🇵🇪" },
  { name: "Ecuador", code: "EC", emoji: "🇪🇨" },
  { name: "Venezuela", code: "VE", emoji: "🇻🇪" },
  { name: "Uruguay", code: "UY", emoji: "🇺🇾" },
  { name: "Paraguay", code: "PY", emoji: "🇵🇾" },
  { name: "Bolivia", code: "BO", emoji: "🇧🇴" },
  { name: "Costa Rica", code: "CR", emoji: "🇨🇷" },
  { name: "Panamá", code: "PA", emoji: "🇵🇦" },
  { name: "Cuba", code: "CU", emoji: "🇨🇺" },
  { name: "Puerto Rico", code: "PR", emoji: "🇵🇷" },
  { name: "República Dominicana", code: "DO", emoji: "🇩🇴" },
  { name: "Honduras", code: "HN", emoji: "🇭🇳" },
  { name: "Guatemala", code: "GT", emoji: "🇬🇹" },
  { name: "El Salvador", code: "SV", emoji: "🇸🇻" },
  { name: "Nicaragua", code: "NI", emoji: "🇳🇮" },
  { name: "Canadá", code: "CA", emoji: "🇨🇦" },
  { name: "Reino Unido", code: "GB", emoji: "🇬🇧" },
  { name: "Francia", code: "FR", emoji: "🇫🇷" },
  { name: "Alemania", code: "DE", emoji: "🇩🇪" },
  { name: "Italia", code: "IT", emoji: "🇮🇹" },
  { name: "Portugal", code: "PT", emoji: "🇵🇹" },
  { name: "Japón", code: "JP", emoji: "🇯🇵" },
  { name: "China", code: "CN", emoji: "🇨🇳" },
  { name: "Corea del Sur", code: "KR", emoji: "🇰🇷" },
  { name: "India", code: "IN", emoji: "🇮🇳" },
  { name: "Australia", code: "AU", emoji: "🇦🇺" },
  { name: "Sudáfrica", code: "ZA", emoji: "🇿🇦" },
  { name: "Egipto", code: "EG", emoji: "🇪🇬" },
  { name: "Turquía", code: "TR", emoji: "🇹🇷" },
  { name: "Rusia", code: "RU", emoji: "🇷🇺" },
  { name: "Filipinas", code: "PH", emoji: "🇵🇭" },
  { name: "Indonesia", code: "ID", emoji: "🇮🇩" },
  { name: "Tailandia", code: "TH", emoji: "🇹🇭" },
  { name: "Pakistán", code: "PK", emoji: "🇵🇰" },
];

export interface ParsedLocation {
  code: string | null
  name: string
  flagUrl: string | null
}

/**
 * Parses a location string into structured data with a flag image URL.
 * Handles all stored formats: code-only ("CO"), emoji+name ("🇨🇴 Colombia"),
 * name-only ("Colombia"), or unrecognized strings.
 * Uses flagcdn.com for flag images (works on all platforms including Windows).
 */
export function parseLocation(location: string | undefined | null): ParsedLocation {
  if (!location || location.trim() === "") {
    return { code: null, name: "", flagUrl: null }
  }

  const trimmed = location.trim()

  // If it's a 2-letter code (e.g. "CO"), look it up
  if (/^[A-Z]{2}$/i.test(trimmed)) {
    const country = countries.find(c => c.code.toUpperCase() === trimmed.toUpperCase())
    if (country) {
      return {
        code: country.code.toLowerCase(),
        name: country.name,
        flagUrl: `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`,
      }
    }
    return { code: null, name: trimmed, flagUrl: null }
  }

  // Try to find a country match (by name or emoji in the string)
  const country = countries.find(
    c => trimmed.includes(c.name) || trimmed.includes(c.emoji)
  )
  if (country) {
    return {
      code: country.code.toLowerCase(),
      name: country.name,
      flagUrl: `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`,
    }
  }

  // Unrecognized - return as-is
  return { code: null, name: trimmed, flagUrl: null }
}
