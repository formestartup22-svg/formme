import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ClipboardCheck } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';

interface QualityStageProps {
  design: Design;
}

const QualityStage = ({ design }: QualityStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const qcChecks = [
    { item: 'Measurements accuracy', status: 'pass' },
    { item: 'Stitch quality', status: 'pass' },
    { item: 'Fabric defects', status: 'pass' },
    { item: 'Color consistency', status: 'pass' }
  ];

  const handleNext = () => {
    updateWorkflowData({ qcApproved: true });
    return true;
  };

  return (
    <div>
      <StageHeader
        icon={ClipboardCheck}
        title="Quality Control Review"
        description="Production complete! Factory has conducted quality control. Review the results and approve for shipping."
        contextInfo={[
          { label: 'Quantity', value: `${workflowData.quantity} units` },
          { label: 'Factory', value: workflowData.selectedFactory?.name || '' }
        ]}
      />

      <div className="space-y-6">
        {/* QC Checklist */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Quality Checklist</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-2">
                {qcChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{check.item}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      Passed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Defect Summary */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Defect Summary</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded">
                  <span className="text-sm text-foreground">Acceptable Units</span>
                  <span className="font-bold text-emerald-600">
                    {parseInt(workflowData.quantity) - 5} / {workflowData.quantity} (99%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm text-foreground">Minor Defects</span>
                  <span className="font-medium text-amber-600">5 units</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <StageNavigation
          onNext={handleNext}
          nextLabel="Approve QC & Proceed to Shipping"
        />
      </div>
    </div>
  );
};

export default QualityStage;
