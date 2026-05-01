"use client"

import Link from "next/link"
import Image from "next/image"
import { Gift, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

type AppNavbarProps = {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AppNavbar({ user }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-heading font-bold"
        >
          <Gift className="h-4 w-4 text-primary" />
          Favorlist
        </Link>

        <div className="flex items-center gap-2">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={28}
              height={28}
              className="rounded-full"
            />
          )}
          <span className="hidden text-sm text-muted-foreground sm:block">
            {user.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
