import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateWishlistForm } from "@/components/wishlists/create-wishlist-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function NewWishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const t = await getTranslations("wishlists")

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 inline-block">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back")}
        </Button>
      </Link>

      <h1 className="font-heading mb-6 text-2xl font-bold">
        {t("createTitle")}
      </h1>

      <CreateWishlistForm />
    </div>
  )
}
