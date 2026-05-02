"use client"

import { useOptimistic, useTransition } from "react"
import { addWishlistItem, deleteWishlistItem } from "@/app/actions/items"
import { AddItemDialog } from "./add-item-dialog"
import { OwnerItemRow } from "./owner-item-row"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type Item = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  price?: string | null
  url?: string | null
  claimedByName?: string | null
}

export type AddItemData = {
  url: string | null
  title: string
  description: string | null
  imageUrl: string | null
  price: string | null
}

type OptimisticAction =
  | { type: "add"; item: Item }
  | { type: "remove"; id: string }

function reducer(state: Item[], action: OptimisticAction): Item[] {
  if (action.type === "add") return [...state, action.item]
  if (action.type === "remove") return state.filter((i) => i.id !== action.id)
  return state
}

export function WishlistItemsSection({
  wishlistId,
  initialItems,
}: {
  wishlistId: string
  initialItems: Item[]
}) {
  const t = useTranslations("wishlists")
  const tItems = useTranslations("items")
  const [optimisticItems, updateOptimistic] = useOptimistic(initialItems, reducer)
  const [, startTransition] = useTransition()

  function handleAdd(data: AddItemData) {
    const tempItem: Item = {
      id: `pending-${Date.now()}`,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      url: data.url,
      claimedByName: null,
    }
    startTransition(async () => {
      updateOptimistic({ type: "add", item: tempItem })
      try {
        await addWishlistItem(wishlistId, data)
        toast.success(tItems("added"))
      } catch {
        toast.error(tItems("addFailed"))
      }
    })
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      updateOptimistic({ type: "remove", id: itemId })
      try {
        await deleteWishlistItem(itemId)
        toast.success(tItems("removed"))
      } catch {
        toast.error(tItems("removeFailed"))
      }
    })
  }

  const claimedCount = optimisticItems.filter((i) => i.claimedByName).length

  if (optimisticItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">{t("noItems")}</p>
        <AddItemDialog wishlistId={wishlistId} onAdd={handleAdd} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("items", { count: optimisticItems.length })}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {t("claimed", { count: claimedCount })}
          </Badge>
          <AddItemDialog wishlistId={wishlistId} onAdd={handleAdd} />
        </div>
      </div>
      {optimisticItems.map((item) => (
        <OwnerItemRow
          key={item.id}
          item={item}
          isPending={item.id.startsWith("pending-")}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  )
}
