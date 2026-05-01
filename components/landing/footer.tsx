import Link from "next/link"
import { Gift } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading font-semibold text-sm">
          <Gift className="h-4 w-4 text-primary" />
          Favorlist
        </Link>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Favorlist. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
