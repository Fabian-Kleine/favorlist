"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WishlistCard } from "./wishlist-card"
import { deleteWishlist } from "@/app/actions/wishlist"
import { Gift, Plus } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type WishlistRow = {
  id: string
  title: string
  description?: string | null
  slug: string
  isPublic: boolean
  deadline?: Date | null
  itemCount: number
}

export function DashboardWishlists({
  initialWishlists,
}: {
  initialWishlists: WishlistRow[]
}) {
  const t = useTranslations("dashboard")
  const tCard = useTranslations("wishlists.card")
  const [optimisticWishlists, updateOptimistic] = useOptimistic(
    initialWishlists,
    (state: WishlistRow[], id: string) => state.filter((w) => w.id !== id)
  )
  const [, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      updateOptimistic(id)
      try {
        await deleteWishlist(id)
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          toast.error(tCard("deleteFailed"))
        }
      }
    })
  }

  if (optimisticWishlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Gift className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="mb-2 font-semibold">{t("emptyTitle")}</h2>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          {t("emptyDesc")}
        </p>
        <Link href="/wishlists/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("emptyBtn")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {optimisticWishlists.map((row) => (
        <WishlistCard
          key={row.id}
          {...row}
          onDelete={() => handleDelete(row.id)}
        />
      ))}
    </div>
  )
}
