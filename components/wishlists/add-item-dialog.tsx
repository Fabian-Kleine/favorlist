"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Upload } from "lucide-react"
import { addWishlistItem } from "@/app/actions/items"
import { toast } from "sonner"

type FormData = {
  url: string
  title: string
  description: string
  imageUrl: string
  price: string
}

export function AddItemDialog({ wishlistId }: { wishlistId: string }) {
  const [open, setOpen] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  async function handleUrlBlur(url: string) {
    if (!url) return
    try {
      new URL(url)
    } catch {
      return
    }

    setScraping(true)
    try {
      const res = await fetch("/api/og-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) return
      const data = (await res.json()) as {
        title?: string
        description?: string
        imageUrl?: string | null
      }
      if (data.title) setValue("title", data.title)
      if (data.description) setValue("description", data.description)
      if (data.imageUrl) {
        setValue("imageUrl", data.imageUrl)
        setPreviewImage(data.imageUrl)
      }
    } catch {
      // silent fail — user can fill manually
    } finally {
      setScraping(false)
    }
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) {
        toast.error("Upload failed")
        return
      }
      const { url } = (await res.json()) as { url: string }
      setValue("imageUrl", url)
      setPreviewImage(url)
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    try {
      await addWishlistItem(wishlistId, {
        url: data.url || null,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        price: data.price || null,
      })
      toast.success("Item added!")
      reset()
      setPreviewImage(null)
      setOpen(false)
    } catch {
      toast.error("Failed to add item")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">Product URL (optional)</Label>
            <Input
              id="url"
              placeholder="https://example.com/product"
              {...register("url")}
              onBlur={(e) => handleUrlBlur(e.target.value)}
            />
          </div>

          {scraping && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Item name"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 200, message: "Max 200 characters" },
              })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <Input id="price" placeholder="$0.00" {...register("price")} />
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            {previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt="Preview"
                className="h-32 w-full rounded-lg object-cover"
              />
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                {...register("imageUrl")}
                onChange={(e) => setPreviewImage(e.target.value || null)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || scraping}>
              {isSubmitting ? "Adding..." : "Add item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
