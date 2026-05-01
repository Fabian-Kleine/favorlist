"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DeadlineCounter } from "./deadline-counter"
import { Share2, Edit, Trash2, Globe, Lock } from "lucide-react"
import { deleteWishlist } from "@/app/actions/wishlist"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type WishlistCardProps = {
  id: string
  title: string
  description?: string | null
  slug: string
  isPublic: boolean
  deadline?: Date | null
  itemCount: number
}

export function WishlistCard({
  id,
  title,
  description,
  slug,
  isPublic,
  deadline,
  itemCount,
}: WishlistCardProps) {
  const t = useTranslations("wishlists.card")
  const tW = useTranslations("wishlists")
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const shareUrl = `${appUrl}/wishlists/${slug}/share`

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description || undefined,
        url: shareUrl,
      }).catch((err) => {
        if (err.name !== "AbortError") {
          fallbackShare()
        }
      })
    } else {
      fallbackShare()
    }
  }

  function fallbackShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(t("copied"))
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWishlist(id)
        toast.success(t("deleted"))
      } catch {
        toast.error(t("deleteFailed"))
      }
    })
    setDeleteOpen(false)
  }

  return (
    <Card className="flex flex-col rounded-2xl">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/wishlists/${slug}`} className="hover:underline min-w-0">
            <CardTitle className="text-xl font-serif truncate">{title}</CardTitle>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0 bg-secondary/80 px-2.5 py-1 rounded-full">
            {isPublic ? (
              <Globe className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {tW("items", { count: itemCount })}
            </span>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4 px-5 pb-5">
        {deadline && (
          <DeadlineCounter deadline={deadline} inline />
        )}

        <div className="flex w-full items-center gap-2 mt-auto pt-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            {t("share")}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
            <Link href={`/wishlists/${slug}`}>
              <Edit className="h-3.5 w-3.5 shrink-0" />
              {t("edit")}
            </Link>
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteDesc", { title })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
