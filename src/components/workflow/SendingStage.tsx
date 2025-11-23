import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryMessaging } from './FactoryMessaging';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SendingStageProps {
  design: Design;
}

const SendingStage = ({ design }: SendingStageProps) => {
  const { workflowData, updateWorkflowData, markStageComplete } = useWorkflow();
  const navigate = useNavigate();
  const [sending, setSending] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  // Check if order already exists
  React.useEffect(() => {
    const checkExistingOrder = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('design_id', design.id)
        .eq('designer_id', user.id)
        .maybeSingle();

      if (data) {
        setOrderId(data.id);
      }
    };
    checkExistingOrder();
  }, [design.id]);

  const unitCost = 18.50;
  const shipping = 450;
  const quantity = parseInt(workflowData.quantity) || 0;
  const total = (unitCost * quantity) + shipping;

  const handleSendToManufacturer = async () => {
    if (!workflowData.selectedFactory) {
      toast.error('Please select a manufacturer first');
      return false;
    }

    setSending(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          design_id: design.id,
          designer_id: user.id,
          manufacturer_id: workflowData.selectedFactory.id,
          quantity: parseInt(workflowData.quantity) || 0,
          status: 'sent_to_manufacturer',
          notes: `Delivery date: ${workflowData.deliveryDate || 'TBD'}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Check if manufacturer match already exists
      const { data: existingMatch } = await supabase
        .from('manufacturer_matches')
        .select('id')
        .eq('design_id', design.id)
        .eq('manufacturer_id', workflowData.selectedFactory.id)
        .single();

      // Only create match if it doesn't exist
      if (!existingMatch) {
        const { error: matchError } = await supabase
          .from('manufacturer_matches')
          .insert({
            design_id: design.id,
            manufacturer_id: workflowData.selectedFactory.id,
            status: 'pending',
            score: 0
          });

        if (matchError) throw matchError;
      }

      setOrderId(order.id);
      toast.success('Order sent to manufacturer successfully!');
      markStageComplete('sending');
      navigate(`/workflow?designId=${design.id}&stage=waiting`);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send order');
      return false;
    } finally {
      setSending(false);
    }
  };

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
            onNext={handleSendToManufacturer}
            nextLabel={sending ? "Sending..." : "Send to Manufacturer"}
            showBack={true}
          />
        </div>

        <div className="space-y-4">
          <FactoryMessaging designId={design.id} orderId={orderId} />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default SendingStage;
