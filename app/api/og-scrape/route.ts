import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import ogs from "open-graph-scraper"

const schema = z.object({
  url: z.url(),
})

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
}

function isPrivateHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "::1") return true
  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^fc00:/i,
    /^fd[0-9a-f]{2}:/i,
    /^fe80:/i,
  ]
  return privatePatterns.some((p) => p.test(hostname))
}

function resolveImageUrl(src: string, baseUrl: string): string {
  try {
    return new URL(src, baseUrl).href
  } catch {
    return src
  }
}

interface JsonLdEntry {
  "@type"?: string | string[]
  name?: string
  description?: string
  image?: string | string[] | { url?: string }
}

function extractFromJsonLd(
  entries: object[],
  baseUrl: string
): { title: string; description: string; imageUrl: string | null } {
  const result = { title: "", description: "", imageUrl: null as string | null }

  for (const raw of entries) {
    const entry = raw as JsonLdEntry
    const types = Array.isArray(entry["@type"])
      ? entry["@type"]
      : [entry["@type"] ?? ""]
    const isRelevant = types.some((t) =>
      ["Product", "ItemPage", "WebPage"].includes(t)
    )
    if (!isRelevant) continue

    if (!result.title && entry.name) result.title = entry.name
    if (!result.description && entry.description) result.description = entry.description
    if (!result.imageUrl && entry.image) {
      const img = entry.image
      const src =
        typeof img === "string"
          ? img
          : Array.isArray(img)
            ? (img[0] as string)
            : (img as { url?: string }).url ?? ""
      if (src) result.imageUrl = resolveImageUrl(src, baseUrl)
    }

    if (result.title && result.description && result.imageUrl) break
  }

  return result
}

// Extracts the real product image from raw HTML for sites that serve a wrong og:image.
// Tries Amazon-specific patterns first, then falls back to generic product image heuristics.
function extractProductImageFromHtml(html: string): string | null {
  // Amazon: data-old-hires on #landingImage is the highest-resolution product image
  const hiResMatch = html.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/)
    ?? html.match(/data-old-hires=["']([^"']+)["'][^>]*id=["']landingImage["']/)
  if (hiResMatch?.[1]) return hiResMatch[1]

  // Amazon: src on #landingImage (lower res fallback)
  const landingMatch = html.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/)
    ?? html.match(/src=["']([^"']+)["'][^>]*id=["']landingImage["']/)
  if (landingMatch?.[1]) return landingMatch[1]

  // Amazon: colorImages JS variable — picks the hiRes of the first image entry
  const colorImagesMatch = html.match(/"colorImages"\s*:\s*\{[^}]*"initial"\s*:\s*\[([^\]]+)\]/)
  if (colorImagesMatch?.[1]) {
    const hiRes = colorImagesMatch[1].match(/"hiRes"\s*:\s*"([^"]+)"/)
    if (hiRes?.[1]) return hiRes[1]
    const large = colorImagesMatch[1].match(/"large"\s*:\s*"([^"]+)"/)
    if (large?.[1]) return large[1]
  }

  return null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  const { url } = parsed.data

  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  if (isPrivateHostname(hostname)) {
    return NextResponse.json({ error: "Blocked URL" }, { status: 400 })
  }

  try {
    const { result, html } = await ogs({
      url,
      timeout: 10000,
      fetchOptions: { headers: BROWSER_HEADERS },
    })

    let title = result.ogTitle ?? result.twitterTitle ?? result.dcTitle ?? ""
    let description = result.ogDescription ?? result.twitterDescription ?? result.dcDescription ?? ""
    let imageUrl: string | null =
      result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url ?? null

    if (imageUrl) {
      imageUrl = resolveImageUrl(imageUrl, url)
    }

    // JSON-LD fallback for e-commerce sites that omit OG tags
    if (result.jsonLD?.length && (!title || !imageUrl)) {
      const jsonLd = extractFromJsonLd(result.jsonLD, url)
      if (!title && jsonLd.title) title = jsonLd.title
      if (!description && jsonLd.description) description = jsonLd.description
      if (!imageUrl && jsonLd.imageUrl) imageUrl = jsonLd.imageUrl
    }

    // HTML fallback for sites that serve a wrong og:image (e.g. Amazon returns their logo)
    if (html) {
      const htmlImage = extractProductImageFromHtml(html)
      // Replace the OG image if the HTML yields a more specific product image
      if (htmlImage && htmlImage !== imageUrl) {
        imageUrl = htmlImage
      }
    }

    return NextResponse.json({ title, description, imageUrl })
  } catch {
    return NextResponse.json({ error: "Failed to scrape" }, { status: 500 })
  }
}
