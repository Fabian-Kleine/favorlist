"use client"

import { motion } from "framer-motion"
import { Share2, Gift, Link2 } from "lucide-react"

const features = [
  {
    icon: Share2,
    title: "Share with anyone",
    description:
      "Generate a public link and share it via text, email, or social media. No account needed to view.",
  },
  {
    icon: Gift,
    title: "Claim items",
    description:
      "Friends sign in to claim what they're buying. No more awkward conversations about who got what.",
  },
  {
    icon: Link2,
    title: "Auto-fill from URL",
    description:
      "Paste any product URL and we'll automatically pull the title, description, and image for you.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-16 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need
        </h2>
        <p className="mt-4 text-muted-foreground">
          Simple tools to make gift-giving effortless for everyone.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-border/50 bg-card p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
