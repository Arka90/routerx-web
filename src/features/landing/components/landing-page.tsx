import { LandingNav } from './sections/nav'
import { Hero } from './sections/hero'
import { HowItWorks } from './sections/how-it-works'
import { Features } from './sections/features'
import { Product } from './sections/product'
import { SelfHost } from './sections/self-host'
import { ClosingCta, Footer } from './sections/footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Product />
        <SelfHost />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  )
}
