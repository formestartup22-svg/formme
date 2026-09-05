import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter } from '@/components/homePage/LandingChrome';
import { ProductionLandingExperience } from '@/components/homePage/ProductionLandingExperience';
import { AudienceGate } from '@/components/homePage/AudienceGate';
import type { Audience } from '@/components/homePage/theme';

const AUDIENCE_STORAGE_KEY = 'formmeAudience';

const readStoredAudience = (): Audience | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(AUDIENCE_STORAGE_KEY);
    return stored === 'manufacturer' || stored === 'brand' ? stored : null;
  } catch {
    return null;
  }
};

const Index = () => {
  const [audience, setAudienceState] = useState<Audience | null>(readStoredAudience);
  const prefersReducedMotion = useReducedMotion();

  const setAudience = (next: Audience) => {
    setAudienceState(next);
    try {
      window.localStorage.setItem(AUDIENCE_STORAGE_KEY, next);
    } catch {
      // The walkthrough remains usable when browser storage is unavailable.
    }
  };

  const exploreAudience = (next: Audience) => {
    setAudience(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="production-page">
      <SEO canonical="/" description="Formme connects brands and apparel manufacturers from tech pack to shipment, with shared production workflows, sample approvals, quality checks, and shipment visibility." />
      <LandingHeader audience={audience} onSwitchAudience={exploreAudience} />
      {audience ? (
        <ProductionLandingExperience key={audience} audience={audience} />
      ) : (
        <AudienceGate onSelect={exploreAudience} prefersReduced={!!prefersReducedMotion} />
      )}
      <LandingFooter onSwitchAudience={exploreAudience} />
    </div>
  );
};

export default Index;
