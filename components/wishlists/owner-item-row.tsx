"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink } from "lucide-react"
import { deleteWishlistItem } from "@/app/actions/items"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { ExpandableItemCard } from "./expandable-item-card"

type OwnerItemRowProps = {
  item: {
    id: string
    title: string
    description?: string | null
    imageUrl?: string | null
    price?: string | null
    url?: string | null
    claimedByName?: string | null
  }
  onDelete?: () => void
  isPending?: boolean
}

export function OwnerItemRow({
  item,
  onDelete,
  isPending: isOptimisticPending,
}: OwnerItemRowProps) {
  const t = useTranslations("items")
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (onDelete) {
      onDelete()
      return
    }
    startTransition(async () => {
      try {
        await deleteWishlistItem(item.id)
        toast.success(t("removed"))
      } catch {
        toast.error(t("removeFailed"))
      }
    })
  }

  return (
    <ExpandableItemCard
      title={item.title}
      description={item.description}
      imageUrl={item.imageUrl}
      className={cn("transition-opacity", isOptimisticPending && "opacity-60")}
      badges={
        <>
          {item.price && (
            <Badge
              variant="outline"
              className="text-xs font-semibold text-foreground"
            >
              € {item.price}
            </Badge>
          )}
          {item.claimedByName && (
            <Badge className="text-xs">
              {t("claimedBy", { name: item.claimedByName })}
            </Badge>
          )}
        </>
      }
      actions={
        <>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
              >
                <ExternalLink className="h-3 w-3" />
                {t("view")}
              </Button>
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2 text-xs text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      }
    />
  )
}
