import { Metadata } from "next"
import { HeroSection } from "components/marketing/HeroSection"
import { FeaturesShowcase } from "components/marketing/FeaturesShowcase"
import { UseCasesSection } from "components/marketing/UseCasesSection"
import { SocialProofSection } from "components/marketing/SocialProofSection"
import { BenefitsSection } from "components/marketing/BenefitsSection"
import { FinalCTA } from "components/marketing/FinalCTA"

export const metadata: Metadata = {
  title: "TAWĀWUNAK — KSA Collaborative EdTech Platform",
  description:
    "Modern academic–industry collaboration for KSA. Projects, funding, proposals, papers, and AI matchmaking in one place.",
  twitter: { card: "summary_large_image" },
}

export default async function Home() {
  return (
    <main id="main" className="min-h-screen surface-gradient">
      {/* Hero Section - Compelling value proposition */}
      <HeroSection />

      {/* Features Showcase - Interactive tabs */}
      <FeaturesShowcase />

      {/* Use Cases - Role-based solutions */}
      <UseCasesSection />

      {/* Benefits - Why choose us */}
      <BenefitsSection />

      {/* Social Proof - Testimonials, stats, partners */}
      <SocialProofSection />

      {/* Final CTA - Conversion focused */}
      <FinalCTA />
    </main>
  )
}

// FeatureCard moved into ModulesGrid (client) for interactivity
