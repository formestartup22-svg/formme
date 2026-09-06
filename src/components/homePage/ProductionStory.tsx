import { ArrowRight, CheckCheck, FileText } from 'lucide-react';
import { Progress } from './ProductionUI';

/** The brand's product journey: a clear brief, an approved sample, and order visibility. */
export function ProductionStory() {
  return (
    <div className="production-story production-story-simple" aria-label="Example: one order, from design to delivery">
      <div className="story-brief">
        <span className="story-step"><b>01</b> SHARE YOUR DESIGN</span>
        <div className="story-card">
          <div className="story-card-heading"><FileText size={15} /><strong>Your design brief</strong></div>
          <div className="story-sketch"><img src="/techpackSketch.png" alt="Technical drawing for the example hoodie order" /></div>
          <p className="story-explanation">Share your design and requirements with your factory.</p>
          <div className="story-card-footer"><CheckCheck size={13} /><span>Brief shared with factory</span></div>
        </div>
      </div>

      <div className="story-garment">
        <div className="story-orbit" aria-hidden="true" />
        <img className="story-hoodie" src="/mockupHoodieFront.png" alt="Black hoodie connecting the three steps of the example order" fetchPriority="high" />
        <div className="story-order"><img src="/logo-mark.png" alt="" /><div><strong>Your next collection</strong><span>One order. Every step together.</span></div></div>
        <ArrowRight className="story-arrow story-arrow-in" size={18} aria-hidden="true" />
        <ArrowRight className="story-arrow story-arrow-out" size={18} aria-hidden="true" />
      </div>

      <div className="story-output">
        <div className="story-card story-execution">
          <span className="story-step"><b>02</b> APPROVE YOUR SAMPLE</span>
          <div className="brand-sample-heading"><span><CheckCheck size={22} /></span><strong>Approved by you.</strong></div>
          <p className="story-explanation">Review your sample before production begins.</p>
        </div>
        <div className="story-card story-visibility">
          <span className="story-step"><b>03</b> FOLLOW PRODUCTION</span>
          <p className="story-explanation">Your factory shares progress. You see where things stand.</p>
          <div className="story-visibility-progress"><span>Sewing in progress</span><strong>72%</strong></div>
          <Progress value={72} label="Brand view of the same hoodie order" />
          <div className="story-card-footer"><span className="story-live"><i /> Updated by your factory</span></div>
        </div>
      </div>
      <span className="story-caption">Example: one order, from design to delivery.</span>
    </div>
  );
}
