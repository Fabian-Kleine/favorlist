"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  function setLocale(next: string) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant={locale === "en" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setLocale("en")}
      >
        EN
      </Button>
      <span className="text-xs text-muted-foreground">/</span>
      <Button
        variant={locale === "de" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setLocale("de")}
      >
        DE
      </Button>
    </div>
  )
}
