import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface SendingStageProps {
  design: Design;
}

const SendingStage = ({ design }: SendingStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const unitCost = 18.50;
  const shipping = 450;
  const quantity = parseInt(workflowData.quantity) || 0;
  const total = (unitCost * quantity) + shipping;

  return (
    <div>
      <StageHeader
        icon={Send}
        title="Confirm your order"
        description="Review your finalized order details and confirm before proceeding to payment."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Location', value: workflowData.selectedFactory?.location || '' },
          { label: 'Lead Time', value: workflowData.selectedFactory?.leadTime || '' }
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
        {/* Order Summary */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Details</h3>
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Factory Name</Label>
                  <p className="text-sm font-medium">{workflowData.selectedFactory?.name || 'Not selected'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Location</Label>
                  <p className="text-sm font-medium">{workflowData.selectedFactory?.location || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Fabric Type</Label>
                  <p className="text-sm font-medium">{workflowData.fabric || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">GSM</Label>
                  <p className="text-sm font-medium">{workflowData.gsm || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Total Quantity</Label>
                  <Input
                    type="number"
                    value={workflowData.quantity}
                    onChange={(e) => updateWorkflowData({ quantity: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Estimated Delivery</Label>
                  <Input
                    type="date"
                    value={workflowData.deliveryDate}
                    onChange={(e) => updateWorkflowData({ deliveryDate: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Lead Time</Label>
                  <p className="text-sm font-medium">{workflowData.selectedFactory?.leadTime || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

          <StageNavigation 
            onNext={() => true}
            nextLabel="Continue to Payment"
            showBack={true}
          />
        </div>

        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default SendingStage;
