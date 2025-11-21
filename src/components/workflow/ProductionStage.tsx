import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory as FactoryIcon, Image } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';

interface ProductionStageProps {
  design: Design;
}

const ProductionStage = ({ design }: ProductionStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const handleNext = () => {
    // Allow progression without validation
    return true;
  };

  return (
    <div>
      <StageHeader
        icon={FactoryIcon}
        title="Production Approval"
        description="Sample approved! Factory is now producing your order. Review first batch photos before full production continues."
        contextInfo={[
          { label: 'Quantity', value: `${workflowData.quantity} units` },
          { label: 'Factory', value: workflowData.selectedFactory?.name || '' },
          { label: 'Status', value: 'In Production' }
        ]}
      />

      <div className="space-y-6">
        {/* Lab Dips */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Fabric Color Approval</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['Navy', 'Forest Green', 'Charcoal'].map((color) => (
                  <div key={color} className="space-y-2">
                    <div className="aspect-square bg-muted rounded border" />
                    <p className="text-xs text-center font-medium">{color}</p>
                  </div>
                ))}
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => updateWorkflowData({ labDipsApproved: true })}
                disabled={workflowData.labDipsApproved}
              >
                {workflowData.labDipsApproved ? '✓ Colors Approved' : 'Approve Colors'}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* First Batch */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">First Batch Photos</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {['Front', 'Back', 'Detail', 'Label'].map((view) => (
                  <div key={view} className="space-y-1.5">
                    <div className="aspect-square bg-muted rounded border flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{view}</p>
                  </div>
                ))}
              </div>
              <Button 
                size="sm" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateWorkflowData({ firstBatchApproved: true })}
                disabled={workflowData.firstBatchApproved}
              >
                {workflowData.firstBatchApproved ? '✓ Batch Approved' : 'Approve First Batch'}
              </Button>
            </CardContent>
          </Card>
        </section>

        <StageNavigation
          onNext={handleNext}
          nextLabel="Continue to Quality Check"
        />
      </div>
    </div>
  );
};

export default ProductionStage;
