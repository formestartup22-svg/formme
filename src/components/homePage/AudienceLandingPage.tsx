import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { LandingHeader, LandingFooter } from './LandingChrome';
import { ProductionLandingExperience } from './ProductionLandingExperience';
import type { Audience } from './theme';

const routeFor: Record<Audience, string> = { brand: '/brands', manufacturer: '/manufacturers' };

const seoCopy: Record<Audience, string> = {
  brand: 'Formme helps brands get apparel produced — connect with vetted manufacturers, approve samples, and track production from tech pack to shipment.',
  manufacturer: 'Formme helps manufacturers run production — manage orders, plan lines, track quality, and keep brands updated automatically.',
};

export const AudienceLandingPage = ({ audience }: { audience: Audience }) => {
  const navigate = useNavigate();

  const switchAudience = (next: Audience) => {
    if (next === audience) return;
    navigate(routeFor[next]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="production-page">
      <SEO canonical={routeFor[audience]} description={seoCopy[audience]} />
      <LandingHeader audience={audience} onSwitchAudience={switchAudience} />
      <ProductionLandingExperience key={audience} audience={audience} />
      <LandingFooter onSwitchAudience={switchAudience} />
    </div>
  );
};
