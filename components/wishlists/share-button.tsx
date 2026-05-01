"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function ShareButton({ slug, title }: { slug: string; title?: string }) {
  const t = useTranslations("common")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const url = `${appUrl}/wishlists/${slug}/share`

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title ? t("shareTitle", { title }) : t("shareTitleFallback"),
          text: title ? t("shareText", { title }) : t("shareTextFallback"),
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
      toast.success(t("shareLinkCopied"))
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
      <Share2 className="h-3.5 w-3.5" />
      {t("share")}
    </Button>
  )
}
