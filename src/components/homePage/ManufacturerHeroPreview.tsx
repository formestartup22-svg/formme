import { useState } from 'react';
import { ArrowUpRight, CheckCheck, ClipboardList, Factory, Layers3, Package, Truck } from 'lucide-react';
import { Badge, Progress } from './ProductionUI';
import { previewOrders } from './productionPreviewData';

/** Factory operations, with the selected line driving the work-order detail. */
export function ManufacturerHeroPreview() {
  const [selectedId, setSelectedId] = useState(previewOrders[0].id);
  const selected = previewOrders.find(order => order.id === selectedId)!;

  return (
    <div className="manufacturer-hero-preview" aria-label="Interactive factory production overview">
      <div className="factory-hero-window">
        <div className="factory-hero-titlebar">
          <span><Factory size={17} /> Factory operations</span>
          <span className="factory-hero-example">Example workspace</span>
        </div>
        <div className="factory-hero-body">
          <div className="factory-hero-heading">
            <div><span>THE PRODUCTION FLOOR</span><h2>Every line. One clear view.</h2></div>
            <span className="factory-hero-icon"><Layers3 size={22} /></span>
          </div>
          <div className="factory-hero-stats">
            <div><span>Active orders</span><strong>03</strong></div>
            <div><span>Pieces planned</span><strong>1,350</strong></div>
            <div><span>Lines running</span><strong>03 <i /></strong></div>
          </div>
          <div className="factory-hero-board" role="group" aria-label="Select a production line">
            <div className="factory-hero-columns"><span>Line / order</span><span>Stage</span><span>Progress</span></div>
            {previewOrders.map(order => (
              <button type="button" key={order.id} aria-pressed={selectedId === order.id} onClick={() => setSelectedId(order.id)}>
                <span><strong>{order.line}</strong><small>{order.product}</small></span>
                <Badge>{order.stage}</Badge>
                <span className="production-progress-label"><Progress value={order.progress} label={`${order.line} completion`} /><span>{order.progress}%</span></span>
              </button>
            ))}
          </div>
          <div className="factory-hero-selection" aria-live="polite">
            <span><ClipboardList size={16} /><strong>{selected.id}</strong></span>
            <span>{selected.quantity} pieces · Target {selected.due}</span>
          </div>
        </div>
      </div>
      <div className="factory-hero-bottom">
        <div className="factory-hero-dispatch"><span className="factory-hero-bottom-icon"><Truck size={19} /></span><div><span>UP NEXT</span><strong>Plan dispatch with confidence.</strong><small>Production and shipment details, together.</small></div><Package size={17} /></div>
        <div className="factory-hero-sync"><CheckCheck size={18} /><span><strong>Brand kept in the loop</strong><small>The same order. The latest progress.</small></span><ArrowUpRight size={15} /></div>
      </div>
    </div>
  );
}
