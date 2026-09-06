import { useLocation } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { BG, LAVENDER, INK, MUTED2, PURPLE } from '@/components/homePage/theme';
import { LandingHeader, LandingFooter } from '@/components/homePage/LandingChrome';
import { VisibilityPreview } from '@/components/homePage/VisibilityPreview';
import '@/components/homePage/production-landing.css';

const ComingSoon = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const feature = searchParams.get('feature');
  if (feature === 'visibility') return <div className="production-page"><SEO title="Supply Chain Visibility — Coming Soon" noindex={true} /><LandingHeader /><VisibilityPreview /><LandingFooter /></div>;

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col" style={{ background: BG, color: INK }}>
      <SEO title="Coming Soon" noindex={true} />
      <LandingHeader />

      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20" style={{ background: LAVENDER }}>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-cormorant font-medium leading-[1.08] mb-6" style={{ color: INK, fontSize: 'clamp(40px, 5vw, 64px)' }}>
            Coming soon.
          </h1>
          <div className="h-px w-16 mx-auto mb-6" style={{ background: PURPLE }} />
          <p className="font-inter leading-relaxed max-w-md mx-auto" style={{ color: MUTED2, fontSize: '15px' }}>
            This page is currently under development. We're working hard to bring you the most advanced tools for fashion production.
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default ComingSoon;
