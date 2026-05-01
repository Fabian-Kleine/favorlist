import { notFound } from "next/navigation"
import { db } from "@/db"
import { wishlists } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DeadlineCounter } from "@/components/wishlists/deadline-counter"
import { ClaimButton } from "@/components/wishlists/claim-button"
import { Gift } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [wishlist, session] = await Promise.all([
    db.query.wishlists.findFirst({
      where: eq(wishlists.slug, slug),
      with: {
        user: true,
        items: {
          orderBy: (items, { asc }) => [
            asc(items.sortOrder),
            asc(items.createdAt),
          ],
          with: {
            claimedBy: true,
          },
        },
      },
    }),
    auth(),
  ])

  if (!wishlist || !wishlist.isPublic) notFound()

  const t = await getTranslations("share")
  const currentUserId = session?.user?.id ?? null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Owner info */}
      <div className="mb-6 flex items-center gap-3">
        {wishlist.user.image ? (
          <Image
            src={wishlist.user.image}
            alt={wishlist.user.name ?? "Owner"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Gift className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{t("wishlistBy")}</p>
          <p className="font-semibold">{wishlist.user.name ?? t("someone")}</p>
        </div>
      </div>

      <h1 className="font-heading mb-2 text-2xl font-bold">{wishlist.title}</h1>
      {wishlist.description && (
        <p className="mb-4 text-sm text-muted-foreground">
          {wishlist.description}
        </p>
      )}

      {wishlist.deadline && (
        <div className="mb-4">
          <DeadlineCounter deadline={wishlist.deadline} />
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("items", { count: wishlist.items.length })}
        </p>
        <Badge variant="secondary">
          {t("claimed", { count: wishlist.items.filter((i) => i.claimedByUserId).length })}
        </Badge>
      </div>

      <Separator className="mb-6" />

      {wishlist.items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          {t("noItems")}
        </div>
      ) : (
        <div className="space-y-3">
          {wishlist.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4"
            >
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`truncate font-medium ${
                        item.claimedByUserId ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.price && (
                    <Badge variant="outline" className="shrink-0 text-xs font-semibold text-foreground">
                      € {item.price}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {t("viewProduct")}
                    </a>
                  )}
                  <div className="ml-auto">
                    <ClaimButton
                      itemId={item.id}
                      claimedByUserId={item.claimedByUserId}
                      claimedByName={item.claimedBy?.name ?? null}
                      claimedByImage={item.claimedBy?.image ?? null}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="text-xs text-muted-foreground">
          {t("poweredBy")}{" "}
          <Link href="/" className="text-primary hover:underline">
            Favorlist
          </Link>
        </p>
      </div>
    </div>
  )
}
