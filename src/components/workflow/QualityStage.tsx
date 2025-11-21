import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface QualityStageProps { design: Design; }

const QualityStage = ({ design }: QualityStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  return (
    <div>
      <StageHeader icon={CheckCircle} title="Quality Check" description="Review QC report and approve." />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Button variant={workflowData.qcApproved ? 'default' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ qcApproved: true, qcRejected: false })}>
                  <CheckCircle className="w-4 h-4" />Approve
                </Button>
                <Button variant={workflowData.qcRejected ? 'destructive' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ qcApproved: false, qcRejected: true })}>
                  <XCircle className="w-4 h-4" />Reject
                </Button>
              </div>
            </CardContent>
          </Card>
          <StageNavigation onNext={() => true} nextLabel="Proceed to Shipping" />
        </div>
        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default QualityStage;
