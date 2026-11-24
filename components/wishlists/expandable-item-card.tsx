"use client"

import { useId, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ExpandableItemCardProps = {
  title: string
  description?: string | null
  imageUrl?: string | null
  /** Thumbnail size in the collapsed state. */
  thumbnailClassName?: string
  /** Extra classes for the title, e.g. strike-through for claimed items. */
  titleClassName?: string
  /** Rendered to the right of the title (price, claimed badge, ...). */
  badges?: ReactNode
  /** Rendered in the footer row next to the expand toggle. */
  actions?: ReactNode
  className?: string
}

const ease = [0.25, 0.1, 0.25, 1] as const

export function ExpandableItemCard({
  title,
  description,
  imageUrl,
  thumbnailClassName = "h-14 w-14",
  titleClassName,
  badges,
  actions,
  className,
}: ExpandableItemCardProps) {
  const t = useTranslations("items")
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()

  const toggle = () => setExpanded((v) => !v)

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Clicking the summary toggles too; the button below is the accessible control. */}
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
          onClick={toggle}
        >
          {imageUrl && !expanded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                "shrink-0 rounded-lg object-cover",
                thumbnailClassName
              )}
            />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-medium",
                expanded ? "break-words" : "truncate",
                titleClassName
              )}
            >
              {title}
            </p>
            {description && !expanded && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {badges && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {badges}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={detailsId}
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-h-96 w-full rounded-lg bg-muted object-contain"
                />
              )}
              {description && (
                <p className="text-sm break-words whitespace-pre-line text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={toggle}
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
          {expanded ? t("hideDetails") : t("showDetails")}
        </Button>
        {actions}
      </div>
    </div>
  )
}
