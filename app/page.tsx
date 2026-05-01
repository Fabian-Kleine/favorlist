import { auth } from "@/lib/auth"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default async function HomePage() {
  const session = await auth()

  return (
    <>
      <Navbar user={session?.user} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
