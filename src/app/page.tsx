import { HeroSection } from "@/components/landing/hero";
import { ValueProps } from "@/components/landing/value-props";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustSignals } from "@/components/landing/trust-signals";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <HeroSection />
      <ValueProps />
      <HowItWorks />
      <TrustSignals />
      <Footer />
    </main>
  );
}
