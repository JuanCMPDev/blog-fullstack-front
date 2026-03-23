interface ExtractImagesResult {
  imagesMarkdown: string
  positionMap: Record<string, string>
}

function extractImages(htmlContent: string, includeBase64Fallback: boolean): ExtractImagesResult {
  const images: { marker: string; markdown: string }[] = []
  const positionMap: Record<string, string> = {}
  let counter = 0

  const imgRegexWithAlt = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g
  let imgMatch: RegExpExecArray | null

  while ((imgMatch = imgRegexWithAlt.exec(htmlContent)) !== null) {
    const src = imgMatch[1]
    const alt = imgMatch[2]

    if (!src || src.trim() === "") continue

    const marker = `__IMG_MARKER_${counter}__`
    images.push({ marker, markdown: `![${alt}](${src})` })
    positionMap[imgMatch[0]] = marker
    counter++
  }

  const imgRegexWithoutAlt = /<img[^>]+src="([^"]+)"[^>]*(?!alt=)[^>]*>/g

  while ((imgMatch = imgRegexWithoutAlt.exec(htmlContent)) !== null) {
    const src = imgMatch[1]
    if (!src || src.trim() === "") continue
    if (Object.keys(positionMap).includes(imgMatch[0])) continue

    const marker = `__IMG_MARKER_${counter}__`
    images.push({ marker, markdown: `![Imagen](${src})` })
    positionMap[imgMatch[0]] = marker
    counter++
  }

  if (includeBase64Fallback) {
    const specificBase64Start = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA"
    if (htmlContent.includes(specificBase64Start) && images.length === 0) {
      const base64StartIndex = htmlContent.indexOf(specificBase64Start)
      let endIndex = htmlContent.indexOf('"', base64StartIndex)
      if (endIndex === -1) {
        endIndex = htmlContent.indexOf("'", base64StartIndex)
      }

      if (endIndex !== -1) {
        const base64Url = htmlContent.substring(base64StartIndex, endIndex)
        const marker = `__IMG_MARKER_${counter}__`
        images.push({ marker, markdown: `![Imagen Base64](${base64Url})` })
        const fakeTag = `<img src="${base64Url}" alt="Base64 Image">`
        positionMap[fakeTag] = marker
      }
    }
  }

  return {
    imagesMarkdown: images.map((item) => item.markdown).join("\n\n"),
    positionMap,
  }
}

function extractText(htmlContent: string, positionMap: Record<string, string>): string {
  let content = htmlContent

  Object.entries(positionMap).forEach(([imgTag, marker]) => {
    content = content.replace(imgTag, marker)
  })

  content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
  content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n")
  content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "$1\n\n")
  content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "$1\n\n")
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "* $1\n")
  content = content.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
  content = content.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
  content = content.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
  content = content.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
  content = content.replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
  content = content.replace(/<[^>]+>/g, "")
  content = content.replace(/&nbsp;/g, " ")
  content = content.replace(/&amp;/g, "&")
  content = content.replace(/&lt;/g, "<")
  content = content.replace(/&gt;/g, ">")
  content = content.replace(/&quot;/g, '"')
  content = content.replace(/&#39;/g, "'")

  Object.values(positionMap).forEach((marker) => {
    if (!content.includes(marker)) {
      content += `\n\n${marker}`
    }
  })

  return content.replace(/\n{3,}/g, "\n\n")
}

export function extractMarkdownFromHtml(
  htmlContent: string,
  options?: { includeBase64Fallback?: boolean }
): string {
  const includeBase64Fallback = options?.includeBase64Fallback ?? false
  const { imagesMarkdown, positionMap } = extractImages(htmlContent, includeBase64Fallback)
  let textContent = extractText(htmlContent, positionMap)

  Object.values(positionMap).forEach((marker, index) => {
    const imageMarkdown = imagesMarkdown.split("\n\n")[index]
    if (imageMarkdown) {
      textContent = textContent.replace(marker, imageMarkdown)
    }
  })

  return textContent
}
