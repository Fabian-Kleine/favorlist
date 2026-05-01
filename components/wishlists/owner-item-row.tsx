"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink } from "lucide-react"
import { deleteWishlistItem } from "@/app/actions/items"
import { toast } from "sonner"

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
}

export function OwnerItemRow({ item }: OwnerItemRowProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWishlistItem(item.id)
        toast.success("Item removed")
      } catch {
        toast.error("Failed to remove item")
      }
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {item.price && (
              <Badge variant="secondary" className="text-xs">
                {item.price}
              </Badge>
            )}
            {item.claimedByName && (
              <Badge className="text-xs">
                Claimed by {item.claimedByName}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                <ExternalLink className="h-3 w-3" />
                View
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
        </div>
      </div>
    </div>
  )
}
