import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, CheckCircle, Download, FileText } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface ShippingStageProps { design: Design; }

const ShippingStage = ({ design }: ShippingStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  return (
    <div>
      <StageHeader icon={Truck} title="Shipping & Logistics" description="Track shipment and confirm delivery." />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <Label className="text-xs mb-1.5 block">Tracking Number</Label>
              <Input placeholder="Enter tracking" value={workflowData.trackingNumber} onChange={(e) => updateWorkflowData({ trackingNumber: e.target.value })} className="h-9 text-sm mb-4" />
              <Button variant={workflowData.deliveryConfirmed ? 'default' : 'outline'} className="w-full gap-2" onClick={() => updateWorkflowData({ deliveryConfirmed: !workflowData.deliveryConfirmed })}>
                <CheckCircle className="w-4 h-4" />{workflowData.deliveryConfirmed ? 'Confirmed ✓' : 'Confirm Delivery'}
              </Button>
            </CardContent>
          </Card>
          <StageNavigation onNext={() => true} nextLabel="Complete" />
        </div>
        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default ShippingStage;
