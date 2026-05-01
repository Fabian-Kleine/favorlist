"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

type NavbarProps = {
  user?: {
    name?: string | null
    image?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Favorlist
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
            </>
          ) : (
            <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
