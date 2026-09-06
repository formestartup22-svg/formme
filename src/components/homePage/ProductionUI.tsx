import type { ReactNode } from 'react';

export function Progress({ value, label = 'Production progress' }: { value: number; label?: string }) {
  return (
    <span className="production-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}

export function Badge({ children, tone = 'purple' }: { children: ReactNode; tone?: 'purple' | 'green' | 'amber' | 'muted' }) {
  return <span className={`production-badge production-badge-${tone}`}>{children}</span>;
}

export function DetailRows({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="production-details">{rows.map(([label, value]) => (
    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
  ))}</dl>;
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return (
    <div className="production-section-heading">
      <div><span className="production-eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {description && <p>{description}</p>}
    </div>
  );
}
