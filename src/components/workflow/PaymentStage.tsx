import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { toast } from 'sonner';

interface PaymentStageProps {
  design: Design;
}

const PaymentStage = ({ design }: PaymentStageProps) => {
  const { workflowData } = useWorkflow();

  const unitCost = 18.50;
  const shipping = 450;
  const taxes = 125;
  const quantity = parseInt(workflowData.quantity) || 0;
  const subtotal = unitCost * quantity;
  const total = subtotal + shipping + taxes;

  const handlePayment = () => {
    toast.success('Payment processed successfully!');
  };

  return (
    <div>
      <StageHeader
        icon={CreditCard}
        title="Make payment"
        description="Review your order costs and complete payment to begin production."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Quantity', value: workflowData.quantity || 'Not set' },
          { label: 'Delivery Date', value: workflowData.deliveryDate || 'Not set' }
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Cost Breakdown */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Cost</span>
                    <span className="font-medium">${unitCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity × {quantity}</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping & Handling</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="font-medium">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Payment Method */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Payment processing will be handled securely. You'll be redirected to complete your payment.
                  </p>
                  <Button onClick={handlePayment} className="w-full gap-2" size="lg">
                    <CreditCard className="w-4 h-4" />
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <StageNavigation 
            onNext={() => true}
            nextLabel="Continue to Production Parameters"
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

export default PaymentStage;
