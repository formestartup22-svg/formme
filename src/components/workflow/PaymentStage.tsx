import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStageProps {
  design: Design;
}

const PaymentStage = ({ design }: PaymentStageProps) => {
  const { workflowData } = useWorkflow();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [design.id]);

  const fetchOrderDetails = async () => {
    const { data: order } = await supabase
      .from('orders')
      .select('*, manufacturers(name)')
      .eq('design_id', design.id)
      .eq('status', 'manufacturer_review')
      .maybeSingle();

    setOrderDetails(order);
  };

  const unitCost = 18.50;
  const shipping = 450;
  const taxes = 125;
  const quantity = orderDetails?.quantity || parseInt(workflowData.quantity) || 100;
  const subtotal = unitCost * quantity;
  const total = subtotal + shipping + taxes;

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          orderId: design.id,
          successUrl: `${window.location.origin}/workflow?designId=${design.id}&stage=production`,
          cancelUrl: `${window.location.origin}/workflow?designId=${design.id}&stage=payment`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StageHeader
        icon={CreditCard}
        title="Make payment"
        description="Review your order costs and complete payment to begin production."
        contextInfo={[
          { label: 'Factory', value: orderDetails?.manufacturers?.name || workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Quantity', value: quantity.toString() },
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
                  <Button 
                    onClick={handlePayment} 
                    className="w-full gap-2" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Proceed to Payment
                      </>
                    )}
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
