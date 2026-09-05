import { useState } from 'react';
import { ArrowRight, Check, Factory, FileText, Shirt, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Audience } from './theme';

const introFeatures = [
  { icon: FileText, label: 'Shared tech packs & samples' },
  { icon: Factory, label: 'Live production tracking' },
  { icon: Truck, label: 'Quality & shipment visibility' },
];

const gateCopy: Record<Audience, {
  icon: typeof Shirt;
  eyebrow: string;
  heading: string;
  description: string;
  bullets: string[];
  previewLabel: string;
  previewMeta: string;
}> = {
  brand: {
    icon: Shirt,
    eyebrow: 'FOR BRANDS',
    heading: 'I’m a Brand',
    description: 'I want to get apparel produced.',
    bullets: [
      'Connect with vetted manufacturing partners',
      'Approve samples and lock in the details',
      'Track your order from cut to carton',
    ],
    previewLabel: 'Oversized hoodie',
    previewMeta: 'FM-HOOD-004 · 72%',
  },
  manufacturer: {
    icon: Factory,
    eyebrow: 'FOR MANUFACTURERS',
    heading: 'I’m a Manufacturer',
    description: 'I want to manage apparel production.',
    bullets: [
      'Manage every order and production line',
      'Log quality checks and approvals',
      'Keep brands updated automatically',
    ],
    previewLabel: 'Line 04 · Sewing',
    previewMeta: '72% complete',
  },
};

const cardContainerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
const cardItemVariants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const cardContainerVariantsReduced = { hidden: {}, show: { transition: { staggerChildren: 0 } } };
const cardItemVariantsReduced = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } };

const GateCard = ({
  audience, active, dimmed, reduced, onSelect,
}: { audience: Audience; active: boolean; dimmed: boolean; reduced?: boolean; onSelect: (a: Audience) => void }) => {
  const copy = gateCopy[audience];
  const Icon = copy.icon;
  return (
    <motion.div variants={reduced ? cardItemVariantsReduced : cardItemVariants}>
      <button
        type="button"
        onClick={() => onSelect(audience)}
        aria-label={`${copy.heading} — ${copy.description}`}
        className="gate-card"
        data-active={active}
        data-dimmed={dimmed}
      >
        <span className="gate-card-icon"><Icon size={20} /></span>
        <span className="production-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.heading}</h2>
        <p className="gate-card-desc">{copy.description}</p>
        <ul>
          {copy.bullets.map(item => <li key={item}><Check size={14} />{item}</li>)}
        </ul>
        <div className="gate-card-preview">
          <strong>{copy.previewLabel}</strong>
          <span>{copy.previewMeta}</span>
        </div>
        <span className="gate-card-cta">Continue <ArrowRight size={15} /></span>
      </button>
    </motion.div>
  );
};

/**
 * The very first thing a visitor sees: a short introduction to what Formme actually does,
 * then a single choice between the two Formme audiences. Unmounts (via the parent's
 * AnimatePresence) once a choice is made, handing off to the personalized homepage content.
 */
export const AudienceGate = ({ onSelect, prefersReduced }: { onSelect: (a: Audience) => void; prefersReduced: boolean }) => {
  const [pending, setPending] = useState<Audience | null>(null);

  const handleSelect = (a: Audience) => {
    if (pending) return;
    setPending(a);
    window.setTimeout(() => onSelect(a), prefersReduced ? 0 : 420);
  };

  return (
    <section className="gate-section" aria-label="Choose your Formme experience">
      <motion.div
        className="production-container gate-intro"
        initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: pending ? 0.35 : 1, y: 0 }}
        transition={{ duration: prefersReduced ? 0.15 : 0.5, ease: 'easeOut' }}
      >
        <span className="production-eyebrow"><span className="production-dot" /> FASHION PRODUCTION, CONNECTED</span>
        <h1>The operating system<br /><em>connecting fashion production.</em></h1>
        <p>
          Formme brings brands and manufacturers into one shared workspace — tech packs, samples,
          live production tracking, and shipment updates, all in one place instead of scattered
          across emails and spreadsheets.
        </p>
        <div className="gate-features">
          {introFeatures.map(({ icon: Icon, label }) => (
            <span key={label}><Icon size={16} />{label}</span>
          ))}
        </div>
      </motion.div>

      <div className="production-container">
        <p className="gate-prompt">What brings you to Formme?</p>
        <motion.div
          className="gate-cards"
          variants={prefersReduced ? cardContainerVariantsReduced : cardContainerVariants}
          initial="hidden"
          animate="show"
        >
          <GateCard audience="brand" active={pending === 'brand'} dimmed={pending === 'manufacturer'} reduced={prefersReduced} onSelect={handleSelect} />
          <GateCard audience="manufacturer" active={pending === 'manufacturer'} dimmed={pending === 'brand'} reduced={prefersReduced} onSelect={handleSelect} />
        </motion.div>
      </div>
    </section>
  );
};
