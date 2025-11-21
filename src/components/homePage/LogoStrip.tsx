import * as React from "react";

interface LogoStripProps {
  speedMs?: number; // duration for one full loop
}

const defaultLogos = [
  "BRAND ONE",
  "BRAND TWO",
  "BRAND THREE",
  "BRAND FOUR",
  "BRAND FIVE",
  "BRAND SIX",
  "BRAND SEVEN",
  "BRAND EIGHT",
];

const LogoStrip: React.FC<LogoStripProps> = ({ speedMs = 28000 }) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md">
      {/* subtle top/bottom highlight */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/30" />
      {/* edge masks */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent" />

      {/* keyframes + pause on hover */}
      <style>{`
        @keyframes logo-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .logo-marquee { animation: logo-scroll ${speedMs}ms linear infinite; }
        .group:hover .logo-marquee { animation-play-state: paused; }
      `}</style>

      <div className="flex items-center whitespace-nowrap py-6">
        <div className="logo-marquee flex items-center gap-12 min-w-max">
          {[...defaultLogos, ...defaultLogos].map((name, i) => (
            <span
              key={i}
              className="text-sm tracking-widest uppercase text-black/50"
              style={{ letterSpacing: "0.08em" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoStrip;
