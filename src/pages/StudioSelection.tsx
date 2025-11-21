
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Building2, Zap, Users, Palette, Code, Globe } from 'lucide-react';

const StudioSelection = () => {
  useEffect(() => {
    document.title = 'Select Your Design Studio | formme';
    const desc = 'Choose between Creative Studio and Professional Studio for fashion design.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/studio-selection`);

    // Structured data (FAQ)
    if (!document.getElementById('studio-selection-ld')) {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'studio-selection-ld';
      ld.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which studio should a startup choose?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Start with Creative Studio for fast iteration. Switch to Professional Studio when you need collaboration and integrations.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I switch between studios?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, you can switch anytime from the top navigation without losing your work.',
            },
          },
        ],
      });
      document.head.appendChild(ld);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground/80 border border-border mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs tracking-wide">Startup-ready tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
              Choose your studio
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build a brand from idea to production. Pick the workflow that fits you best—you can switch anytime.
            </p>
          </header>

          {/* Studio options */}
          <section aria-label="Studio options" className="grid gap-6 md:grid-cols-2">
            {/* Creative Studio */}
            <Link to="/designer" className="group">
              <article className="rounded-3xl border border-border bg-card/70 backdrop-blur p-8 md:p-10 transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Creative Studio</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Most popular</span>
                </div>
                <p className="text-muted-foreground mb-6">Intuitive, fast, and perfect for founders validating ideas.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Drag & drop','Templates','3D preview'].map((t)=> (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground/80 border border-border">{t}</span>
                  ))}
                </div>
                <ul className="grid gap-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Rapid iteration—see results instantly</li>
                  <li className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Brand-ready colors and typography</li>
                  <li className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Best for solo creators and small teams</li>
                </ul>
                <Button className="rounded-xl bg-primary text-primary-foreground hover:opacity-90">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </article>
            </Link>

            {/* Professional Studio */}
            <Link to="/professional-studio" className="group">
              <article className="rounded-3xl border border-border bg-card/70 backdrop-blur p-8 md:p-10 transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Professional Studio</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground/80 border border-border">Team-ready</span>
                </div>
                <p className="text-muted-foreground mb-6">Collaborative, scalable, and built for growth.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Collaboration','Automation','Integrations'].map((t)=> (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground/80 border border-border">{t}</span>
                  ))}
                </div>
                <ul className="grid gap-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Roles, permissions and review flows</li>
                  <li className="flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> API & automation hooks for your stack</li>
                  <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Ready for multi-market launches</li>
                </ul>
                <Button variant="outline" className="rounded-xl">
                  Explore Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </article>
            </Link>
          </section>

          {/* Why formme for startups */}
          <section aria-label="Why formme for startups" className="mt-16">
            <h2 className="sr-only">Why formme for startups</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2 text-foreground"><Zap className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Move fast</span></div>
                <p className="text-sm text-muted-foreground">Ship versions in minutes, not days.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2 text-foreground"><Palette className="w-4 h-4 text-primary" /><span className="text-sm font-medium">On-brand</span></div>
                <p className="text-sm text-muted-foreground">Stay consistent with flexible theming.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2 text-foreground"><Users className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Grow together</span></div>
                <p className="text-sm text-muted-foreground">Switch to Pro when collaboration scales.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2 text-foreground"><Globe className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Launch anywhere</span></div>
                <p className="text-sm text-muted-foreground">Built for global storefronts and teams.</p>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section aria-label="Get started" className="text-center mt-14">
            <p className="text-sm text-muted-foreground mb-4">Not sure where to start?</p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/designer">
                <Button className="rounded-xl bg-primary text-primary-foreground hover:opacity-90">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/professional-studio">
                <Button variant="outline" className="rounded-xl">
                  Explore Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Note */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            You can switch studios from the top navigation at any time.
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudioSelection;
