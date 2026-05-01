"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Create & add items",
    description:
      "Set up your wishlist and add items by pasting URLs or manually. Set a deadline for special occasions.",
  },
  {
    number: "02",
    title: "Share the link",
    description:
      "Copy your unique link and send it to friends or family. They don't need an account to see your list.",
  },
  {
    number: "03",
    title: "Friends claim gifts",
    description:
      "Friends sign in to claim what they're buying. You'll receive no duplicates—everyone sees what's taken.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Up and running in under two minutes.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-6 hidden h-0.5 w-[calc(66%-2rem)] -translate-x-1/2 bg-border sm:block" />

          <div className="grid gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
                  {step.number}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
