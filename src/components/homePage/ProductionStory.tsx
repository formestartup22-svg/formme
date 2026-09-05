import { ArrowRight, Check, CheckCheck, FileText, Package, Truck } from 'lucide-react';
import { Badge, DetailRows, Progress } from './ProductionUI';

/** The brand's product journey: a clear brief, an approved sample, and order visibility. */
export function ProductionStory() {
  return (
    <div className="production-story" aria-label="Brand collection preview with product specifications, sample approval, and delivery updates">
      <div className="story-brief">
        <span className="story-step"><b>01</b> YOUR DESIGN BRIEF</span>
        <div className="story-card">
          <div className="story-card-heading"><FileText size={15} /><strong>Tech pack</strong><Badge>V.02</Badge></div>
          <div className="story-sketch"><img src="/techpackSketch.png" alt="Hoodie technical drawing" /><span>FM-HOOD-004 / FRONT VIEW</span></div>
          <DetailRows rows={[
            ['Quantity', '600 pieces'], ['Fabric', '420 GSM cotton'],
            ['Color', <span className="story-color" key="black"><i /> Washed black</span>],
            ['Size run', 'XS – XXL'], ['Fit', 'Oversized'],
          ]} />
          <span className="story-approved"><CheckCheck size={13} /> Sample approved</span>
        </div>
      </div>

      <div className="story-garment">
        <div className="story-orbit" aria-hidden="true" />
        <img className="story-hoodie" src="/mockupHoodieFront.png" alt="Black oversized hoodie with its production specifications" fetchPriority="high" />
        <div className="story-annotation story-annotation-fabric"><span>FABRIC</span><strong>420 GSM cotton</strong></div>
        <div className="story-annotation story-annotation-color"><span>COLOR</span><strong>Washed black</strong></div>
        <div className="story-annotation story-annotation-quantity"><span>QUANTITY</span><strong>600 pieces</strong></div>
        <div className="story-order"><img src="/logo-mark.png" alt="" /><div><strong>One connected order</strong><span>#FM-2841 · From brief to delivery</span></div></div>
        <ArrowRight className="story-arrow story-arrow-in" size={18} aria-hidden="true" />
        <ArrowRight className="story-arrow story-arrow-out" size={18} aria-hidden="true" />
      </div>

      <div className="story-output">
        <div className="story-card story-execution">
          <span className="story-step"><b>02</b> SAMPLE APPROVED</span>
          <div className="brand-sample-heading"><span><CheckCheck size={22} /></span><strong>The details,<br />just right.</strong></div>
          {['Fit confirmed', 'Fabric approved', 'Ready for production'].map(stage => <div className="story-stage" key={stage}><Check className="story-done" /><span>{stage}</span></div>)}
          <div className="story-card-footer">Sample review <span>Round 02</span></div>
        </div>
        <div className="story-card story-visibility">
          <span className="story-step"><b>03</b> YOUR ORDER, ON TRACK</span>
          <div className="story-visibility-progress"><span>Production progress</span><strong>72%</strong></div>
          <Progress value={72} label="Brand view of the same hoodie order" />
          <div className="brand-delivery"><Truck size={14} /><span>Expected delivery<strong>18 September</strong></span></div>
          <div className="story-card-footer"><span className="story-live"><i /> Updated by your factory</span><Package size={14} /></div>
        </div>
      </div>
      <span className="story-caption">Your design, approvals, and delivery. One connected order.</span>
    </div>
  );
}
