import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewProductionTimelineStageProps {
  design: Design;
}

const ReviewProductionTimelineStage = ({ design }: ReviewProductionTimelineStageProps) => {
  const { workflowData, currentStage, setCurrentStage, markStageComplete } = useWorkflow();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch order with finalized manufacturer
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            manufacturers (
              name,
              location
            )
          `)
          .eq('design_id', design.id)
          .eq('designer_id', user.id)
          .not('manufacturer_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching order:', error);
          toast.error('Failed to load production timeline');
          return;
        }

        setOrderData(order);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Set up realtime subscription for order updates
    const channel = supabase
      .channel('order-timeline-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        (payload) => {
          setOrderData((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const manufacturerName = orderData?.manufacturers?.name || workflowData.selectedFactory?.name || 'The manufacturer';

  return (
    <div>
      <StageHeader
        icon={CheckCircle}
        title="Review Production Timeline"
        description="Your order has been approved by the manufacturer! Review the production timeline before proceeding to production parameters."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || manufacturerName || 'Not selected' },
          { label: 'Quantity', value: workflowData.quantity || 'Not set' }
        ]}
      />

      <div className="max-w-3xl mx-auto mt-8 space-y-6">
        {/* Order Approved Confirmation */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Order Approved!</h3>
                <p className="text-sm text-muted-foreground">
                  {manufacturerName} has approved your order and will provide the production timeline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Production Timeline</h3>
          </div>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                    <p className="text-sm font-medium">{formatDate(orderData?.production_start_date)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Expected Completion</Label>
                    <p className="text-sm font-medium">{formatDate(orderData?.production_completion_date)}</p>
                  </div>
                </div>
                {orderData?.production_start_date && orderData?.production_completion_date && (
                <div className="mt-6">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(orderData.production_start_date)}</span>
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(orderData.production_completion_date)}</span>
                    </div>
                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-muted">
                      <div className="bg-primary w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Cutting</div>
                      <div className="bg-primary/60 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Sewing</div>
                      <div className="bg-primary/30 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Finishing</div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-between pt-6 border-t mt-8">
          <Button 
            variant="outline" 
            onClick={() => {
              markStageComplete(currentStage);
              setCurrentStage('production');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="gap-2"
          >
            Skip Payment
          </Button>

          <Button 
            onClick={() => {
              markStageComplete(currentStage);
              setCurrentStage('payment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewProductionTimelineStage;
