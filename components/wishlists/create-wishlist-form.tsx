"use client"

import { useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { createWishlist } from "@/app/actions/wishlist"
import { toast } from "sonner"

type FormData = {
  title: string
  description: string
  deadline: Date | undefined
  isPublic: boolean
}

export function CreateWishlistForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { isPublic: true, deadline: undefined },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        await createWishlist({
          title: data.title,
          description: data.description || null,
          deadline: data.deadline ? data.deadline.toISOString() : null,
          isPublic: data.isPublic,
        })
      } catch (err) {
        if (
          err instanceof Error &&
          !err.message.includes("NEXT_REDIRECT")
        ) {
          toast.error("Failed to create wishlist")
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Birthday Wishlist 2025"
          {...register("title", {
            required: "Title is required",
            maxLength: { value: 100, message: "Max 100 characters" },
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
          placeholder="Any notes for your friends..."
          rows={3}
          {...register("description", {
            maxLength: { value: 500, message: "Max 500 characters" },
          })}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Deadline (optional)</Label>
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="No deadline set"
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium">Public wishlist</p>
          <p className="text-xs text-muted-foreground">
            Anyone with the link can view this list
          </p>
        </div>
        <Controller
          control={control}
          name="isPublic"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create wishlist"}
      </Button>
    </form>
  )
}
