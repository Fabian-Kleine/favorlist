"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { wishlists, wishlistItems } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"
import { z } from "zod"

const itemSchema = z.object({
  url: z.string().url().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  price: z.string().max(50).optional().nullable(),
})

async function getOwnedWishlist(wishlistId: string, userId: string) {
  return db.query.wishlists.findFirst({
    where: and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)),
  })
}

async function getOwnedItem(itemId: string, userId: string) {
  const item = await db.query.wishlistItems.findFirst({
    where: eq(wishlistItems.id, itemId),
    with: { wishlist: true },
  })
  if (!item || item.wishlist.userId !== userId) return null
  return item
}

export async function addWishlistItem(
  wishlistId: string,
  data: z.infer<typeof itemSchema>
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const wishlist = await getOwnedWishlist(wishlistId, session.user.id)
  if (!wishlist) throw new Error("Not found")

  const parsed = itemSchema.parse(data)
  await db.insert(wishlistItems).values({
    wishlistId,
    url: parsed.url ?? null,
    title: parsed.title,
    description: parsed.description ?? null,
    imageUrl: parsed.imageUrl ?? null,
    price: parsed.price ?? null,
  })

  revalidatePath(`/wishlists/${wishlist.slug}`)
}

export async function deleteWishlistItem(itemId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const item = await getOwnedItem(itemId, session.user.id)
  if (!item) throw new Error("Not found")

  await db.delete(wishlistItems).where(eq(wishlistItems.id, itemId))

  if (item.imageUrl?.includes("blob.vercel-storage.com")) {
    await del(item.imageUrl)
  }

  revalidatePath(`/wishlists/${item.wishlist.slug}`)
}

export async function claimWishlistItem(itemId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const item = await db.query.wishlistItems.findFirst({
    where: eq(wishlistItems.id, itemId),
    with: { wishlist: true },
  })
  if (!item) throw new Error("Not found")
  if (item.claimedByUserId) throw new Error("Already claimed")

  await db
    .update(wishlistItems)
    .set({ claimedByUserId: session.user.id, claimedAt: new Date() })
    .where(eq(wishlistItems.id, itemId))

  revalidatePath(`/wishlists/${item.wishlist.slug}/share`)
}

export async function unclaimWishlistItem(itemId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const item = await db.query.wishlistItems.findFirst({
    where: eq(wishlistItems.id, itemId),
    with: { wishlist: true },
  })
  if (!item) throw new Error("Not found")

  const isOwner = item.wishlist.userId === session.user.id
  const isClaimer = item.claimedByUserId === session.user.id
  if (!isOwner && !isClaimer) throw new Error("Unauthorized")

  await db
    .update(wishlistItems)
    .set({ claimedByUserId: null, claimedAt: null })
    .where(eq(wishlistItems.id, itemId))

  revalidatePath(`/wishlists/${item.wishlist.slug}/share`)
}
