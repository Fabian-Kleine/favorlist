"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gift, Heart, Star } from "lucide-react"

const ease = [0.25, 0.1, 0.25, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease },
  }
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center">
      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, var(--primary) 18%, transparent), transparent)",
        }}
      />

      <motion.div {...fadeUp(0)}>
        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
          <Star className="h-3 w-3 fill-current" />
          Share wishlists with anyone
        </Badge>
      </motion.div>

      <motion.h1
        {...fadeUp(0.12)}
        className="font-heading max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
      >
        Wishlists your friends
        <span className="text-primary"> actually use</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.24)}
        className="mt-6 max-w-xl text-lg text-muted-foreground"
      >
        Create a wishlist, share the link, and let friends claim items so
        there&apos;s no duplicate gifts. No app download required.
      </motion.p>

      <motion.div
        {...fadeUp(0.36)}
        className="mt-10 flex flex-col gap-3 sm:flex-row"
      >
        <Link href="/login">
          <Button size="lg" className="gap-2">
            Create your wishlist
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#features">
          <Button size="lg" variant="outline">
            See how it works
          </Button>
        </a>
      </motion.div>

      {/* Floating mockup card */}
      <motion.div {...fadeUp(0.48)} className="mt-20 w-full max-w-sm">
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xl shadow-primary/5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Alex&apos;s Birthday List</p>
              <p className="text-xs text-muted-foreground">
                3 items · 1 claimed
              </p>
            </div>
          </div>
          {[
            {
              label: "Wireless Headphones",
              price: "$89",
              claimed: true,
              icon: "🎧",
            },
            {
              label: "Coffee Table Book",
              price: "$35",
              claimed: false,
              icon: "📚",
            },
            {
              label: "Cozy Knit Sweater",
              price: "$62",
              claimed: false,
              icon: "🧣",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="mb-2 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 last:mb-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <span>{item.icon}</span>
                <span
                  className={
                    item.claimed ? "text-muted-foreground line-through" : ""
                  }
                >
                  {item.label}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.price}
                </span>
                {item.claimed ? (
                  <Heart className="h-3.5 w-3.5 fill-current text-primary" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-border" />
                )}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
