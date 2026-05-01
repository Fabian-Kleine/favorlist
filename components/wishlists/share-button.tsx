"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

export function ShareButton({ slug, title }: { slug: string; title?: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const url = `${appUrl}/wishlists/${slug}/share`

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title ? `${title} — Favorlist` : "Favorlist wishlist",
          text: title
            ? `Check out ${title} on Favorlist!`
            : "Check out this wishlist on Favorlist!",
          url,
        })
        return
      } catch (err) {
        // User cancelled the share sheet — don't show an error
        if (err instanceof Error && err.name === "AbortError") return
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied!")
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
      <Share2 className="h-3.5 w-3.5" />
      Share
    </Button>
  )
}
