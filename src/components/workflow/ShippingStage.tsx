import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, MapPin } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';

interface ShippingStageProps {
  design: Design;
}

const ShippingStage = ({ design }: ShippingStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  return (
    <div>
      <StageHeader
        icon={Truck}
        title="Shipping & Delivery"
        description="Quality approved! Your order is being packed and shipped. Track your shipment below."
        contextInfo={[
          { label: 'Quantity', value: `${workflowData.quantity} units` },
          { label: 'Factory', value: workflowData.selectedFactory?.name || '' }
        ]}
      />

      <div className="space-y-6">
        {/* Packing Summary */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Details</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Units</p>
                  <p className="text-2xl font-bold text-foreground">{workflowData.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Boxes</p>
                  <p className="text-2xl font-bold text-foreground">14</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tracking</p>
                  <code className="text-sm font-mono text-foreground">DHL7392847582</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tracking Timeline */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Tracking</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { status: 'Picked up', location: 'Portugal', done: true },
                  { status: 'In transit', location: 'Lisbon Hub', done: true },
                  { status: 'Customs cleared', location: 'Portugal', done: true },
                  { status: 'Out for delivery', location: 'Your city', done: false }
                ].map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      event.done ? 'bg-emerald-600' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        event.done ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {event.status}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    </div>
                    {event.done && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Delivery Confirmation */}
        <section>
          <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Confirm Delivery</h3>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={workflowData.deliveryConfirmed}
                onClick={() => updateWorkflowData({ deliveryConfirmed: true })}
              >
                {workflowData.deliveryConfirmed ? '✓ Delivery Confirmed' : 'Confirm Delivery Received'}
              </Button>
              {workflowData.deliveryConfirmed && (
                <p className="text-xs text-muted-foreground mt-3">
                  Order complete! Thank you for using our platform.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ShippingStage;
