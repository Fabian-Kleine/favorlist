import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import ogs from "open-graph-scraper"

const schema = z.object({
  url: z.string().url(),
})

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
    const { result } = await ogs({ url, timeout: 10000 })
    return NextResponse.json({
      title: result.ogTitle ?? result.twitterTitle ?? "",
      description: result.ogDescription ?? result.twitterDescription ?? "",
      imageUrl:
        result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url ?? null,
    })
  } catch {
    return NextResponse.json({ error: "Failed to scrape" }, { status: 500 })
  }
}
