import React from 'react';
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingContent } from "@/components/landing-content";
import { LandingFeatures } from "@/components/landing-features";
import { LandingCTA } from "@/components/landing-cta";
import { Footer } from "@/components/footer";
import { CrispProvider } from "@/components/crisp-provider";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800">
      <CrispProvider />
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingContent />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;