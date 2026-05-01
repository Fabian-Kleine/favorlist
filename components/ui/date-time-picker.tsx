"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DateTimePickerProps = {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date & time",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const hours = value ? String(value.getHours()).padStart(2, "0") : "12"
  const minutes = value ? String(value.getMinutes()).padStart(2, "0") : "00"

  function handleDaySelect(day: Date | undefined) {
    if (!day) {
      onChange(undefined)
      return
    }
    const next = new Date(day)
    next.setHours(value?.getHours() ?? 12, value?.getMinutes() ?? 0, 0, 0)
    onChange(next)
  }

  function handleTimeChange(part: "hours" | "minutes", raw: string) {
    const num = parseInt(raw, 10)
    if (isNaN(num)) return
    const base = value ?? new Date()
    const next = new Date(base)
    if (part === "hours") {
      next.setHours(Math.min(23, Math.max(0, num)))
    } else {
      next.setMinutes(Math.min(59, Math.max(0, num)))
    }
    onChange(next)
  }

  function handleClear() {
    onChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {value ? (
            format(value, "MMM d, yyyy 'at' h:mm aa")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          initialFocus
        />
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
                className="h-8 w-14 text-center tabular-nums"
                placeholder="HH"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                className="h-8 w-14 text-center tabular-nums"
                placeholder="MM"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
