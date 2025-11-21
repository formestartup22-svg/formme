import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Package, CheckCircle, XCircle, Image as ImageIcon, Video } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface SampleStageProps {
  design: Design;
}

const SampleStage = ({ design }: SampleStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const mockSamples = [
    { type: 'image', name: 'Front View' },
    { type: 'image', name: 'Back View' },
    { type: 'image', name: 'Detail Shot' },
    { type: 'video', name: 'Sample Video' },
  ];

  return (
    <div>
      <StageHeader
        icon={Package}
        title="Sample Development"
        description="Review samples provided by the manufacturer and provide feedback."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Quantity', value: workflowData.quantity || 'Not set' }
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Manufacturer Samples</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {mockSamples.map((sample, idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                      {sample.type === 'image' ? <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" /> : <Video className="w-12 h-12 text-muted-foreground mb-2" />}
                      <p className="text-sm font-medium text-center">{sample.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Feedback</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea placeholder="Provide feedback..." value={workflowData.fitNotes} onChange={(e) => updateWorkflowData({ fitNotes: e.target.value })} className="min-h-[120px] text-sm resize-none" />
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button variant={workflowData.sampleApproved ? 'default' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ sampleApproved: true, sampleRejected: false })}>
                    <CheckCircle className="w-4 h-4" />Approve Sample
                  </Button>
                  <Button variant={workflowData.sampleRejected ? 'destructive' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ sampleApproved: false, sampleRejected: true })}>
                    <XCircle className="w-4 h-4" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <StageNavigation 
            onNext={() => true} 
            nextLabel="Continue to Production"
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

export default SampleStage;
