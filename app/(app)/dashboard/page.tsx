import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { wishlists, wishlistItems } from "@/db/schema"
import { eq, count, desc } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardWishlists } from "@/components/wishlists/dashboard-wishlists"
import { Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const t = await getTranslations("dashboard")

  const rows = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      description: wishlists.description,
      slug: wishlists.slug,
      isPublic: wishlists.isPublic,
      deadline: wishlists.deadline,
      createdAt: wishlists.createdAt,
      itemCount: count(wishlistItems.id),
    })
    .from(wishlists)
    .leftJoin(wishlistItems, eq(wishlistItems.wishlistId, wishlists.id))
    .where(eq(wishlists.userId, session.user.id))
    .groupBy(wishlists.id)
    .orderBy(desc(wishlists.createdAt))

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/wishlists/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newWishlist")}
          </Button>
        </Link>
      </div>

      <DashboardWishlists initialWishlists={rows} />
    </div>
  )
}
