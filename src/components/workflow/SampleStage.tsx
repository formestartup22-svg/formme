import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Package, Image as ImageIcon, Video } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface SampleStageProps { design: Design; }

const SampleStage = ({ design }: SampleStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [approvals, setApprovals] = useState({ colour: false, details: false, print: false, size: false, silhouette: false });

  const mockSamples = [
    { type: 'image', name: 'Front View' }, { type: 'image', name: 'Back View' },
    { type: 'image', name: 'Detail Shot' }, { type: 'video', name: 'Sample Video' },
  ];

  const allApproved = Object.values(approvals).every(v => v);

  return (
    <div>
      <StageHeader icon={Package} title="View your design sample" description="Review samples provided by the manufacturer and approve specific aspects before production." contextInfo={[{ label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' }, { label: 'Quantity', value: workflowData.quantity || 'Not set' }]} />
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
            <h3 className="text-sm font-semibold text-foreground mb-3">Sample Approval Checklist</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[{ key: 'colour', label: 'Colour accuracy matches specifications' }, { key: 'details', label: 'Construction details are correct' }, { key: 'print', label: 'Print quality and placement' }, { key: 'size', label: 'Size and measurements' }, { key: 'silhouette', label: 'Overall silhouette and fit' }].map(item => (
                    <div key={item.key} className="flex items-center space-x-3">
                      <Checkbox id={item.key} checked={approvals[item.key as keyof typeof approvals]} onCheckedChange={(checked) => setApprovals(prev => ({ ...prev, [item.key]: checked as boolean }))} />
                      <Label htmlFor={item.key} className="text-sm font-normal cursor-pointer">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Feedback & Notes</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea placeholder="Provide detailed feedback about the sample before production begins..." value={workflowData.fitNotes} onChange={(e) => updateWorkflowData({ fitNotes: e.target.value })} className="min-h-[120px] text-sm resize-none" />
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Communicate with Designer</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea placeholder="Send a message directly to the designer about the sample..." className="min-h-[100px] text-sm resize-none" />
                <Button className="mt-3 w-full">Send Message</Button>
              </CardContent>
            </Card>
          </section>

          <StageNavigation onNext={() => { if (!allApproved) return false; updateWorkflowData({ sampleApproved: true }); return true; }} nextLabel={allApproved ? "Approve & Continue to Quality Check" : "Complete checklist to continue"} showBack={true} />
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
