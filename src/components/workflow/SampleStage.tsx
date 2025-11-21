import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Package } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';

interface SampleStageProps {
  design: Design;
}

const SampleStage = ({ design }: SampleStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const handleNext = () => {
    updateWorkflowData({ sampleApproved: true });
    return true;
  };

  return (
    <div>
      <StageHeader
        icon={Package}
        title="Review Sample"
        description={`${workflowData.selectedFactory?.name} has completed your sample. Upload fit photos and provide feedback before approving for production.`}
        contextInfo={[
          { label: 'Quantity', value: `${workflowData.quantity} units` },
          { label: 'Factory', value: workflowData.selectedFactory?.name || '' }
        ]}
      />

      <div className="space-y-6">
        {/* Fit Photos */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Fit Photos</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Upload photos of the sample
                </p>
                <p className="text-xs text-muted-foreground">
                  Front, back, and side views recommended
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fit Notes */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Fit Notes & Feedback</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <Textarea
                placeholder="Add notes about fit, sizing, adjustments needed, or approval..."
                value={workflowData.fitNotes}
                onChange={(e) => updateWorkflowData({ fitNotes: e.target.value })}
                className="min-h-[120px] text-sm resize-none"
              />
            </CardContent>
          </Card>
        </section>

        <StageNavigation
          onNext={handleNext}
          nextLabel="Approve Sample & Begin Production"
        />
      </div>
    </div>
  );
};

export default SampleStage;
