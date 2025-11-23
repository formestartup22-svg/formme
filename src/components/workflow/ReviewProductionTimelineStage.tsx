import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { useNavigate } from 'react-router-dom';

interface ReviewProductionTimelineStageProps {
  design: Design;
}

const ReviewProductionTimelineStage = ({ design }: ReviewProductionTimelineStageProps) => {
  const { workflowData, setCurrentStage, markStageComplete } = useWorkflow();
  const navigate = useNavigate();
  
  const handleSkipPayment = () => {
    markStageComplete('review-timeline');
    setCurrentStage('production-approval');
    navigate(`/workflow?designId=${design.id}&stage=production-approval`);
  };
  
  const handleProceedToPayment = () => {
    markStageComplete('review-timeline');
    setCurrentStage('payment');
    navigate(`/workflow?designId=${design.id}&stage=payment`);
  };

  return (
    <div>
      <StageHeader
        icon={CheckCircle}
        title="Review Production Timeline"
        description="Your order has been approved by the manufacturer! Review the production timeline before proceeding to payment."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
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
                  {workflowData.selectedFactory?.name || 'The manufacturer'} has approved your order and provided the production timeline below.
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
                    <p className="text-sm font-medium">Nov 25, 2025</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Expected Completion</Label>
                    <p className="text-sm font-medium">Dec 20, 2025</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Nov 25</span>
                      <span className="text-xs font-medium text-muted-foreground">Dec 20</span>
                    </div>
                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-muted">
                      <div className="bg-primary w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Cutting</div>
                      <div className="bg-primary/60 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Sewing</div>
                      <div className="bg-primary/30 w-1/3 flex items-center justify-center text-white text-[10px] font-semibold">Finishing</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">5 days</span>
                      <span className="text-xs text-muted-foreground">12 days</span>
                      <span className="text-xs text-muted-foreground">8 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-between pt-6 border-t mt-8">
          <Button 
            variant="outline" 
            onClick={handleSkipPayment}
            className="gap-2"
          >
            Skip Payment for Now
          </Button>
          
          <Button 
            onClick={handleProceedToPayment}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            Proceed to Payment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewProductionTimelineStage;
