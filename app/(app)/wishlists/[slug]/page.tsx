import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import { wishlists } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DeadlineCounter } from "@/components/wishlists/deadline-counter"
import { WishlistItemsSection } from "@/components/wishlists/wishlist-items-section"
import { ArrowLeft, Globe, Lock } from "lucide-react"
import { ShareButton } from "@/components/wishlists/share-button"
import { getTranslations } from "next-intl/server"

export default async function OwnerWishlistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const t = await getTranslations("wishlists")

  const wishlist = await db.query.wishlists.findFirst({
    where: eq(wishlists.slug, slug),
    with: {
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder), asc(items.createdAt)],
        with: {
          claimedBy: true,
        },
      },
    },
  })

  if (!wishlist || wishlist.userId !== session.user.id) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("dashboard")}
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold">
              {wishlist.title}
            </h1>
            {wishlist.isPublic ? (
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
          {wishlist.description && (
            <p className="text-sm text-muted-foreground">{wishlist.description}</p>
          )}
          {wishlist.deadline && (
            <div className="mt-3">
              <DeadlineCounter deadline={wishlist.deadline} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ShareButton slug={slug} title={wishlist.title} />
        </div>
      </div>

      <Separator className="mb-6" />

      <WishlistItemsSection
        wishlistId={wishlist.id}
        initialItems={wishlist.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          price: item.price,
          url: item.url,
          claimedByName: item.claimedBy?.name ?? null,
        }))}
      />
    </div>
  )
}
