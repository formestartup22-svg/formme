import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Factory, CheckCircle, XCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface ProductionStageProps { design: Design; }

const ProductionStage = ({ design }: ProductionStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  return (
    <div>
      <StageHeader icon={Factory} title="Production Approval" description="Review materials and approve production batches." />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea placeholder="Materials list..." value={workflowData.materialsList} onChange={(e) => updateWorkflowData({ materialsList: e.target.value })} className="min-h-[80px] text-sm" />
                <div className="flex gap-3 mt-4">
                  <Button variant={workflowData.materialsApproved ? 'default' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ materialsApproved: true, materialsRejected: false })}>
                    <CheckCircle className="w-4 h-4" />Approve
                  </Button>
                  <Button variant={workflowData.materialsRejected ? 'destructive' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ materialsApproved: false, materialsRejected: true })}>
                    <XCircle className="w-4 h-4" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
          <StageNavigation 
            onNext={() => true} 
            nextLabel="Continue to Quality Check"
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

export default ProductionStage;
