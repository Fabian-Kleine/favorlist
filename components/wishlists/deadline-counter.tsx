"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(deadline: Date): TimeLeft | null {
  const diff = deadline.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0")
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-7 w-8 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

type DeadlineCounterProps = {
  deadline: Date
  inline?: boolean
}

export function DeadlineCounter({ deadline, inline }: DeadlineCounterProps) {
  const t = useTranslations("deadline")
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    getTimeLeft(deadline)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (!timeLeft) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Clock className="h-3 w-3" />
        {t("passed")}
      </Badge>
    )
  }

  if (inline) {
    return (
      <div className="flex w-full items-center justify-between rounded-lg bg-orange-100/60 px-3 py-2.5 text-sm text-orange-950 dark:bg-orange-950/40 dark:text-orange-200">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          <span>
            {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m
          </span>
        </div>
        <span className="text-xs font-semibold tracking-wide text-orange-500/80 dark:text-orange-400/80 uppercase">
          {t("remaining")}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <Digit value={timeLeft.days} label={t("days")} />
        <span className="mb-3 text-muted-foreground">:</span>
        <Digit value={timeLeft.hours} label={t("hrs")} />
        <span className="mb-3 text-muted-foreground">:</span>
        <Digit value={timeLeft.minutes} label={t("min")} />
        <span className="mb-3 text-muted-foreground">:</span>
        <Digit value={timeLeft.seconds} label={t("sec")} />
      </div>
    </div>
  )
}
