"use server"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { wishlists, wishlistItems } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const wishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  deadline: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
})

export async function createWishlist(
  data: z.infer<typeof wishlistSchema>
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = wishlistSchema.parse(data)
  const slug = nanoid(10)

  await db.insert(wishlists).values({
    userId: session.user.id,
    title: parsed.title,
    description: parsed.description ?? null,
    slug,
    isPublic: parsed.isPublic,
    deadline: parsed.deadline ? new Date(parsed.deadline) : null,
  })

  revalidatePath("/dashboard")
  redirect(`/wishlists/${slug}`)
}

export async function updateWishlist(
  id: string,
  data: Partial<z.infer<typeof wishlistSchema>>
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const wishlist = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)),
  })
  if (!wishlist) throw new Error("Not found")

  await db
    .update(wishlists)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      deadline: data.deadline ? new Date(data.deadline) : null,
      updatedAt: new Date(),
    })
    .where(eq(wishlists.id, id))

  revalidatePath("/dashboard")
  revalidatePath(`/wishlists/${wishlist.slug}`)
  revalidatePath(`/wishlists/${wishlist.slug}/share`)
}

export async function deleteWishlist(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const wishlist = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)),
  })
  if (!wishlist) throw new Error("Not found")

  await db.delete(wishlistItems).where(eq(wishlistItems.wishlistId, id))
  await db.delete(wishlists).where(eq(wishlists.id, id))

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
