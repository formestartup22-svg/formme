import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter } from '@/components/homePage/LandingChrome';
import { AudienceGate } from '@/components/homePage/AudienceGate';
import type { Audience } from '@/components/homePage/theme';

const routeFor: Record<Audience, string> = { brand: '/brands', manufacturer: '/manufacturers' };

const Index = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const exploreAudience = (next: Audience) => {
    navigate(routeFor[next]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="production-page">
      <SEO canonical="/" description="Formme connects brands and apparel manufacturers from tech pack to shipment, with shared production workflows, sample approvals, quality checks, and shipment visibility." />
      <LandingHeader onSwitchAudience={exploreAudience} />
      <AudienceGate onSelect={exploreAudience} prefersReduced={!!prefersReducedMotion} />
      <LandingFooter onSwitchAudience={exploreAudience} />
    </div>
  );
};

export default Index;
