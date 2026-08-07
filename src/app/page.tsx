import ShaderShowcase from "@/components/ui/hero";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { Steps } from "@/components/landing/Steps";
import { CTA } from "@/components/landing/CTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <ShaderShowcase />
      <Features />
      <Stats />
      <Steps />
      <CTA />
      <SiteFooter />
    </main>
  );
}
