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
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const shareUrl = `${appUrl}/wishlists/${slug}/share`

  function handleShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard!")
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWishlist(id)
        toast.success("Wishlist deleted")
      } catch {
        toast.error("Failed to delete")
      }
    })
    setDeleteOpen(false)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/wishlists/${slug}`} className="hover:underline">
            <CardTitle className="text-base">{title}</CardTitle>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPublic ? (
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Badge variant="secondary" className="text-xs">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        {deadline && (
          <DeadlineCounter deadline={deadline} inline />
        )}

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Link href={`/wishlists/${slug}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 ml-auto text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{title}&rdquo; and all its
                  items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
