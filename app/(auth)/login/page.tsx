import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginCard } from "@/components/auth/login-card"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginCard />
    </div>
  )
}
