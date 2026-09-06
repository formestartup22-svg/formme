import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, CheckCheck, Factory, FileCheck2, FileText, Package, Pause, Play, ShieldCheck, Truck } from 'lucide-react';
import type { Audience } from './theme';
import { Badge, DetailRows, Progress, SectionHeading } from './ProductionUI';
import { previewOrders } from './productionPreviewData';

const workflows = {
  brand: [
    { title: 'Start your order', short: 'Tell us what you’re making.', heading: 'Every great product starts with a clear brief.', description: 'Bring your tech pack, quantities, and product details into one shared order.' },
    { title: 'Find your factory', short: 'Connect with the right production partner.', heading: 'A manufacturing partner for what you make.', description: 'Review capabilities, discuss feasibility, and agree on the details before moving forward.' },
    { title: 'Develop & approve', short: 'Get the sample and the details right.', heading: 'Make the decisions before the production run.', description: 'Keep sample feedback, revisions, and approvals attached to the product.' },
    { title: 'Move into production', short: 'Turn the approved sample into your collection.', heading: 'An agreed plan. A clear handoff.', description: 'Confirm your quantities, materials, and production parameters with your factory.' },
    { title: 'Follow every update', short: 'See progress, quality, and shipment status.', heading: 'Know where your order stands.', description: 'Follow factory updates from the production floor through quality checks and shipping.' },
  ],
  manufacturer: [
    { title: 'Review the order', short: 'Check the brief and confirm feasibility.', heading: 'Start with the information your team needs.', description: 'Review the tech pack, flag questions, and confirm what you can produce.' },
    { title: 'Plan your production', short: 'Align materials, capacity, and delivery dates.', heading: 'Give every order a place on the floor.', description: 'Bring line assignments and production requirements together before work begins.' },
    { title: 'Run the floor', short: 'Track each stage and share progress.', heading: 'Keep the floor moving. Keep the brand informed.', description: 'Record production progress against the order so the whole team has the same view.' },
    { title: 'Check the quality', short: 'Capture inspections and resolve issues.', heading: 'Keep quality part of the workflow.', description: 'Document inspections, share evidence, and resolve feedback with the brand.' },
    { title: 'Prepare to ship', short: 'Connect packing, dispatch, and delivery.', heading: 'A clear handoff, all the way to shipment.', description: 'Keep packing details and shipment information with the order for both teams to follow.' },
  ],
};

function GarmentSummary() {
  return (
    <div className="workflow-garment">
      <img src="/techpackSketch.png" alt="Technical sketch of the oversized hoodie" loading="lazy" />
      <div><strong>Oversized hoodie</strong><span>FM-HOOD-004 · Washed black</span></div>
      <Badge>600 pieces</Badge>
    </div>
  );
}

function QualityPreview({ manufacturer = false }: { manufacturer?: boolean }) {
  return (
    <div className="workflow-quality">
      <div className="workflow-quality-header"><ShieldCheck size={20} /><div><strong>{manufacturer ? 'Pre-shipment inspection' : 'Sample review · Round 02'}</strong><span>{manufacturer ? 'Inspection report / FM-HOOD-004' : 'Comments and approvals, kept with the order'}</span></div><Badge tone="green">{manufacturer ? 'Passed' : 'Approved'}</Badge></div>
      {['Measurements within tolerance', 'Fabric and finish confirmed', manufacturer ? 'Stitching and construction checked' : 'Revised cuff approved'].map(item => (
        <div className="workflow-check" key={item}><Check size={15} /><span>{item}</span><span>Confirmed</span></div>
      ))}
      <div className="workflow-note"><FileCheck2 size={16} /><span>{manufacturer ? 'Inspection photos and report shared with the brand.' : '“The revised fit looks great. Ready for production.”'}</span></div>
    </div>
  );
}

function LinePlan() {
  return (
    <div className="workflow-line-plan">
      <div className="workflow-table-head"><span>Line / style</span><span>Stage</span><span>Progress</span></div>
      {previewOrders.map(order => (
        <div className="workflow-plan-row" key={order.id}>
          <div><strong>{order.line}</strong><span>{order.product}</span></div>
          <Badge>{order.stage}</Badge>
          <div className="production-progress-label"><Progress value={order.progress} label={`${order.line} progress`} /><span>{order.progress}%</span></div>
        </div>
      ))}
      <div className="workflow-note"><Factory size={16} /> Three active lines. Every order connected to its brand.</div>
    </div>
  );
}

function StageProgress() {
  return (
    <div className="workflow-stage-progress">
      <div className="workflow-progress-heading"><span>FM-HOOD-004 · {previewOrders[0].line}</span><Badge tone="green">On track</Badge></div>
      {[
        { label: 'Cutting', value: 100 }, { label: 'Sewing', value: 72 },
        { label: 'Finishing', value: 0 }, { label: 'Quality', value: 0 }, { label: 'Packing', value: 0 },
      ].map(stage => (
        <div className="workflow-stage-row" key={stage.label}><span>{stage.label}</span><Progress value={stage.value} label={`${stage.label} progress`} /><span>{stage.value === 0 ? 'Upcoming' : `${stage.value}%`}</span></div>
      ))}
      <div className="workflow-note"><CheckCheck size={16} /> Factory updates are visible in the brand workspace.</div>
    </div>
  );
}

function WorkflowPreview({ audience, step }: { audience: Audience; step: number }) {
  if (audience === 'manufacturer') {
    if (step === 1) return <LinePlan />;
    if (step === 2) return <StageProgress />;
    if (step === 3) return <QualityPreview manufacturer />;
    if (step === 4) return <><GarmentSummary /><DetailRows rows={[
      ['Quality check', <Badge tone="green" key="qc"><Check size={12} /> Passed</Badge>],
      ['Packing list', '600 pieces / 30 cartons'], ['Shipment status', 'Ready for dispatch'], ['Delivery details', 'Shared with brand'],
    ]} /><div className="workflow-note"><Truck size={16} /> Dispatch details stay with the production order.</div></>;
    return <><GarmentSummary /><DetailRows rows={[
      ['Tech pack', <span className="production-confirmed" key="pack"><FileText size={14} /> Available for review</span>],
      ['Requested quantity', '600 pieces'], ['Fabric', '420 GSM cotton'], ['Target delivery', '18 Sep'],
    ]} /><div className="workflow-note"><FileCheck2 size={16} /> Confirm feasibility and clarify production requirements.</div></>;
  }
  if (step === 1) return (
    <div className="workflow-factory-match">
      <img src="/factory.jpg" alt="Apparel manufacturing workspace" loading="lazy" />
      <div><span className="production-eyebrow">MANUFACTURING PARTNER</span><h4>Built for your product.</h4><p>Discuss construction, materials, and capacity with your factory before you commit.</p><div className="workflow-tags"><Badge>Cotton knits</Badge><Badge>Cut & sew</Badge><Badge>Sampling</Badge></div></div>
    </div>
  );
  if (step === 2) return <QualityPreview />;
  if (step === 3) return <><GarmentSummary /><DetailRows rows={[
    ['Sample', <Badge tone="green" key="approved"><Check size={12} /> Approved</Badge>],
    ['Production quantity', '600 pieces'], ['Size run', 'XS – XXL'], ['Production parameters', 'Agreed with factory'],
  ]} /><div className="workflow-note"><Package size={16} /> The approved product and production plan stay connected.</div></>;
  if (step === 4) return <StageProgress />;
  return <><GarmentSummary /><DetailRows rows={[
    ['Tech pack', <span className="production-confirmed" key="upload"><Check size={14} /> Uploaded</span>],
    ['Quantity', '600 pieces'], ['Target delivery', '18 Sep'], ['Fabric', '420 GSM cotton'],
  ]} /><div className="workflow-note"><FileText size={16} /> One brief for your brand and manufacturing partner.</div></>;
}

function WorkflowSteps({ audience }: { audience: Audience }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const tourRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const directionRef = useRef(1);
  const inView = useInView(tourRef, { amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const animated = audience === 'brand' && reducedMotion === false;
  const running = animated && playing && inView && pageVisible && !hovered && !focused;
  const entries = workflows[audience];

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame: number;
    let previous: number | null = null;
    const tick = (time: number) => {
      if (previous !== null) elapsedRef.current += time - previous;
      previous = time;
      if (elapsedRef.current >= 7000) {
        elapsedRef.current = 0;
        directionRef.current = 1;
        setStep(current => (current + 1) % entries.length);
      }
      tourRef.current?.style.setProperty('--workflow-progress', String(elapsedRef.current / 7000));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, entries.length]);

  const selectStep = (next: number) => {
    setPlaying(false);
    elapsedRef.current = 0;
    directionRef.current = next === (step - 1 + entries.length) % entries.length ? -1 : next >= step ? 1 : -1;
    tourRef.current?.style.setProperty('--workflow-progress', '0');
    setStep(next);
  };

  return (
    <div className={`workflow-tour${animated ? ' workflow-tour-brand' : ''}`} ref={tourRef} data-playing={running}>
      {animated && <div className="workflow-playback">
        <span><i className={running ? 'is-playing' : ''} />{!playing ? 'Paused · explore at your pace' : hovered || focused ? 'Paused while you explore' : 'A guided look at your workflow'}</span>
        <button type="button" aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'} onClick={() => setPlaying(current => !current)}>
          {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Play'}
        </button>
      </div>}
    <div className="workflow-layout"
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    >
      <div className="workflow-step-list" role="group" aria-label={`${audience === 'brand' ? 'Brand' : 'Manufacturer'} workflow steps`}>
        {entries.map((entry, index) => (
          <button type="button" key={entry.title} id={`workflow-step-${index}`} aria-pressed={step === index} aria-controls="workflow-preview" onClick={() => selectStep(index)}>
            <span className="workflow-step-number">0{index + 1}</span>
            <span><strong>{entry.title}</strong><small>{entry.short}</small></span>
            <ArrowRight size={15} />
            {animated && step === index && <span className="workflow-step-timer" aria-hidden="true"><span /></span>}
          </button>
        ))}
      </div>
      <div className="workflow-preview" id="workflow-preview" role="region" aria-labelledby={`workflow-step-${step}`}>
        <div className="workflow-preview-top"><span><i /> {audience === 'brand' ? 'BRAND WORKSPACE' : 'FACTORY WORKSPACE'}</span><span>Example order · 0{step + 1} / 05</span></div>
        <div className="workflow-preview-content" key={`${audience}-${step}`} data-direction={directionRef.current}>
          <h3>{entries[step].heading}</h3><p>{entries[step].description}</p>
          <WorkflowPreview audience={audience} step={step} />
        </div>
        <div className="workflow-preview-footer"><span>From tech pack to shipment.</span><button type="button" onClick={() => selectStep((step + 1) % entries.length)}>{step === 4 ? 'Back to the beginning' : 'Explore the next step'} <ArrowRight size={15} /></button></div>
      </div>
    </div>
    </div>
  );
}

export function WorkflowShowcase({ audience }: { audience: Audience }) {
  return (
    <section className="production-section workflow-section" id="product" aria-label="How Formme works">
      <div className="production-container">
        <SectionHeading
          eyebrow={audience === 'brand' ? 'HOW IT WORKS FOR BRANDS' : 'HOW IT WORKS FOR MANUFACTURERS'}
          title={<>From {audience === 'brand' ? 'idea to delivery.' : 'order to shipment.'}<br /><em>Every step, connected.</em></>}
          description={audience === 'brand' ? 'Follow an example order through five steps. Select a step to see what you and your factory work on together.' : 'Review the brief, plan the work, and coordinate production through quality and dispatch. Explore your factory workflow, step by step.'}
        />
        <WorkflowSteps key={audience} audience={audience} />
        <div className="workflow-connection"><span>FACTORY OPERATIONS</span><i /><span className="workflow-formme">formme</span><i /><span>BRAND VISIBILITY</span></div>
      </div>
    </section>
  );
}
