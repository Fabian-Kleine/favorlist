import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppNavbar } from "@/components/app-navbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen">
      <AppNavbar user={session.user} />
      <main>{children}</main>
    </div>
  )
}
