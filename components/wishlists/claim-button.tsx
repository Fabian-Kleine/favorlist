"use client"

import { useOptimistic, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"
import { claimWishlistItem, unclaimWishlistItem } from "@/app/actions/items"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type ClaimButtonProps = {
  itemId: string
  claimedByUserId: string | null
  claimedByName: string | null
  claimedByImage: string | null
  currentUserId: string | null
}

export function ClaimButton({
  itemId,
  claimedByUserId,
  claimedByName,
  claimedByImage,
  currentUserId,
}: ClaimButtonProps) {
  const t = useTranslations("items")
  const [optimisticClaimer, setOptimisticClaimer] = useOptimistic(claimedByUserId)
  const [isPending, startTransition] = useTransition()

  const isMine = optimisticClaimer === currentUserId
  const isClaimedByOther =
    optimisticClaimer && optimisticClaimer !== currentUserId

  if (isClaimedByOther) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {claimedByImage ? (
          <Image
            src={claimedByImage}
            alt={claimedByName ?? "Claimer"}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-muted" />
        )}
        <span>
          {claimedByName ? t("isOnIt", { name: claimedByName }) : t("someoneIsOnIt")}
        </span>
      </div>
    )
  }

  if (isMine) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setOptimisticClaimer(null)
            try {
              await unclaimWishlistItem(itemId)
            } catch {
              toast.error(t("unclaimFailed"))
            }
          })
        }
      >
        {t("undoClaim")}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      disabled={isPending || !currentUserId}
      onClick={() => {
        if (!currentUserId) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
          return
        }
        startTransition(async () => {
          setOptimisticClaimer(currentUserId)
          try {
            await claimWishlistItem(itemId)
          } catch {
            toast.error(t("claimFailed"))
          }
        })
      }}
    >
      <Gift className="mr-1.5 h-3.5 w-3.5" />
      {currentUserId ? t("illBuyThis") : t("signInToClaim")}
    </Button>
  )
}
