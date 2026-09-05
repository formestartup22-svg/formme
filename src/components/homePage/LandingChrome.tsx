import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Linkedin, Menu, X } from 'lucide-react';
import { BG, BORDER, BORDER_DARK, INK, MUTED2, PURPLE, PURPLE_BG } from './theme';
import type { Audience } from './theme';

export const CONTACT_EMAIL = 'hello@formme.io';
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

export const Logo = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="inline-flex items-center" aria-label="formme">
    <img src="/logo-mark.png" alt="" aria-hidden="true" className="h-[34px] w-auto object-contain -mr-1 flex-shrink-0" style={dark ? { filter: 'brightness(0) invert(1)' } : undefined} />
    <span className="font-cormorant font-medium text-[22px] leading-none" style={{ color: dark ? '#fff' : PURPLE }}>ormme</span>
  </Link>
);

export const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <span
    className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-4"
    style={dark ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' } : { background: PURPLE_BG, color: PURPLE }}
  >
    {children}
  </span>
);

export const SolidButton = ({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) => {
  const cls = 'inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5';
  const style = { background: PURPLE, color: '#fff' };
  if (href) {
    const isExternal = /^(mailto:|tel:|https?:)/.test(href);
    if (isExternal) return <a href={href} className={cls} style={style}>{children}</a>;
    return <Link to={href} className={cls} style={style}>{children}</Link>;
  }
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
};

export const OutlineButton = ({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) => (
  <a
    href={href}
    className="inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5"
    style={dark ? { border: `1px solid ${BORDER_DARK}`, color: '#fff' } : { border: `1px solid ${BORDER}`, color: INK, background: '#fff' }}
  >
    {children}
  </a>
);

const navLinks: { label: string; href: string; route?: boolean; chevron?: boolean }[] = [
  { label: 'Product', href: '#product', chevron: true },
  { label: 'Factories', href: '#factories' },
  { label: 'Brands', href: '#brands' },
  { label: 'Cost Predictor', href: '/cost-predictor', route: true },
  { label: 'Resources', href: '/support', route: true, chevron: true },
  { label: 'Company', href: '/about', route: true, chevron: true },
];

export const LandingHeader = ({
  audience,
  onSwitchAudience,
}: { audience?: Audience | null; onSwitchAudience?: (a: Audience) => void } = {}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('landing-menu-button')?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}` }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 h-16 md:h-[72px]">
        <Logo />

        <nav className="hidden xl:flex items-center gap-5" aria-label="Main navigation">
          {navLinks.map((item) =>
            item.route ? (
              <Link key={item.label} to={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ) : (
              <a key={item.label} href={item.href} onClick={(event) => {
                if (onSwitchAudience && (item.href === '#brands' || item.href === '#factories')) {
                  event.preventDefault();
                  onSwitchAudience(item.href === '#brands' ? 'brand' : 'manufacturer');
                }
              }} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 lg:gap-5">
          {audience && onSwitchAudience && (
            <div className="hidden lg:flex items-center gap-1 text-[12px] font-inter mr-1">
              <button
                onClick={() => onSwitchAudience('brand')}
                aria-pressed={audience === 'brand'}
                className="rounded-full px-2.5 py-1 transition-colors"
                style={{ color: audience === 'brand' ? PURPLE : MUTED2, background: audience === 'brand' ? PURPLE_BG : 'transparent' }}
              >
                For Brands
              </button>
              <span style={{ color: BORDER }}>|</span>
              <button
                onClick={() => onSwitchAudience('manufacturer')}
                aria-pressed={audience === 'manufacturer'}
                className="rounded-full px-2.5 py-1 transition-colors"
                style={{ color: audience === 'manufacturer' ? PURPLE : MUTED2, background: audience === 'manufacturer' ? PURPLE_BG : 'transparent' }}
              >
                For Manufacturers
              </button>
            </div>
          )}
          <Link to="/auth?mode=signin" className="hidden sm:inline text-[13px] font-inter font-medium" style={{ color: INK }}>
            Sign in
          </Link>
          <span className="landing-header-contact"><SolidButton href={CONTACT_HREF}>Get in touch <ArrowRight className="w-3.5 h-3.5" /></SolidButton></span>
          <button
            id="landing-menu-button"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="xl:hidden flex items-center justify-center w-8 h-9 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: PURPLE }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="landing-mobile-navigation" aria-label="Mobile navigation" className="xl:hidden border-t px-6 py-5 bg-white" style={{ borderColor: BORDER }}>
          <div className="grid grid-cols-2 gap-4 text-[13px] font-inter" style={{ color: MUTED2 }}>
            {navLinks.map(item => item.route ? (
              <Link key={item.label} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href} onClick={(event) => {
                setMenuOpen(false);
                if (onSwitchAudience && (item.href === '#brands' || item.href === '#factories')) {
                  event.preventDefault();
                  onSwitchAudience(item.href === '#brands' ? 'brand' : 'manufacturer');
                }
              }}>{item.label}</a>
            ))}
            {onSwitchAudience && (['brand', 'manufacturer'] as Audience[]).map(value => (
              <button key={value} type="button" className="text-left" style={{ color: PURPLE }} onClick={() => { onSwitchAudience(value); setMenuOpen(false); }}>
                {value === 'brand' ? 'For brands' : 'For manufacturers'}
              </button>
            ))}
            <Link to="/auth?mode=signin" onClick={() => setMenuOpen(false)}>Sign in</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

const footerLinks = [
  { label: 'Product', to: '#product' },
  { label: 'Factories', to: '#factories' },
  { label: 'Brands', to: '#brands' },
  { label: 'Cost Predictor', to: '/cost-predictor' },
  { label: 'Resources', to: '/support' },
  { label: 'Company', to: '/about' },
];

export const LandingFooter = ({ onSwitchAudience }: { onSwitchAudience?: (audience: Audience) => void } = {}) => (
  <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
    <div className="mx-auto max-w-[1300px] px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <Logo />
      <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
        {footerLinks.map((l) =>
          l.to.startsWith('/') ? (
            <Link key={l.label} to={l.to} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</Link>
          ) : (
            <a key={l.label} href={l.to} onClick={(event) => {
              if (onSwitchAudience && (l.to === '#brands' || l.to === '#factories')) {
                event.preventDefault();
                onSwitchAudience(l.to === '#brands' ? 'brand' : 'manufacturer');
              }
            }} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</a>
          )
        )}
      </nav>
      <div className="flex items-center gap-5">
        <a href="https://www.linkedin.com/company/formmedesign" target="_blank" rel="noopener noreferrer" aria-label="Formme on LinkedIn" style={{ color: MUTED2 }}>
          <Linkedin className="h-4 w-4" />
        </a>
        <span className="text-[12px] font-inter" style={{ color: MUTED2 }}>© {new Date().getFullYear()} Formme. All rights reserved.</span>
      </div>
    </div>
  </footer>
);
