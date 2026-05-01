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
import { useTranslations } from "next-intl"

type FormData = {
  title: string
  description: string
  deadline: Date | undefined
  isPublic: boolean
}

export function CreateWishlistForm() {
  const t = useTranslations("wishlists.form")
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
          toast.error(t("failedToCreate"))
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("titleLabel")}</Label>
        <Input
          id="title"
          placeholder={t("titlePlaceholder")}
          {...register("title", {
            required: t("titleRequired"),
            maxLength: { value: 100, message: t("titleMax") },
          })}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("descLabel")}</Label>
        <Textarea
          id="description"
          placeholder={t("descPlaceholder")}
          rows={3}
          {...register("description", {
            maxLength: { value: 500, message: t("descMax") },
          })}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{t("deadlineLabel")}</Label>
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              placeholder={t("deadlinePlaceholder")}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium">{t("publicLabel")}</p>
          <p className="text-xs text-muted-foreground">
            {t("publicDesc")}
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
        {isPending ? t("creating") : t("create")}
      </Button>
    </form>
  )
}
