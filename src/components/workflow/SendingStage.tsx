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
        title="Finalize Your Order"
        description={`You've selected ${workflowData.selectedFactory?.name}. Confirm your order details and submit to the factory.`}
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || '' },
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
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-xs mb-1.5 block">Total Quantity</Label>
                  <Input
                    type="number"
                    value={workflowData.quantity}
                    onChange={(e) => updateWorkflowData({ quantity: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Delivery Date</Label>
                  <Input
                    type="date"
                    value={workflowData.deliveryDate}
                    onChange={(e) => updateWorkflowData({ deliveryDate: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Cost</span>
                  <span className="font-medium">${unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity × {quantity}</span>
                  <span className="font-medium">${(unitCost * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span>Total Cost</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

          <StageNavigation
            nextLabel="Submit Order to Factory"
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
