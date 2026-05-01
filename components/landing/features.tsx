"use client"

import { motion } from "framer-motion"
import { Share2, Gift, Link2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function Features() {
  const t = useTranslations("landing.features")

  const features = [
    { icon: Share2, title: t("shareTitle"), description: t("shareDesc") },
    { icon: Gift, title: t("claimTitle"), description: t("claimDesc") },
    { icon: Link2, title: t("autofillTitle"), description: t("autofillDesc") },
  ]

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-16 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {t("subheading")}
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
