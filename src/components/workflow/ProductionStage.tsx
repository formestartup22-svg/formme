import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Factory, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { toast } from 'sonner';

interface ProductionStageProps { design: Design; }

const ProductionStage = ({ design }: ProductionStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [labDipPhotos, setLabDipPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setLabDipPhotos(prev => [...prev, ...files]);
      toast.success(`${files.length} photo(s) uploaded`);
    }
  };

  return (
    <div>
      <StageHeader 
        icon={Factory} 
        title="Review production parameters" 
        description="Factory uploads fabric details, lab dips, and production timeline for your approval before production begins."
        contextInfo={[
          { label: 'Factory', value: workflowData.selectedFactory?.name || 'Not selected' },
          { label: 'Quantity', value: workflowData.quantity || 'Not set' }
        ]}
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Fabric Specifications</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Fabric Type</Label>
                    <p className="text-sm font-medium">100% Cotton</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">GSM (Weight)</Label>
                    <p className="text-sm font-medium">180 GSM</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Shrinkage (%)</Label>
                    <p className="text-sm font-medium">3-5%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Color Fastness</Label>
                    <p className="text-sm font-medium">Grade 4-5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Lab Dip Photos</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button variant={workflowData.materialsApproved ? 'default' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ materialsApproved: true, materialsRejected: false })}>
                    <CheckCircle className="w-4 h-4" />Approve Production Parameters
                  </Button>
                  <Button variant={workflowData.materialsRejected ? 'destructive' : 'outline'} className="flex-1 gap-2" onClick={() => updateWorkflowData({ materialsApproved: false, materialsRejected: true })}>
                    <XCircle className="w-4 h-4" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <StageNavigation onNext={() => true} nextLabel="Continue to Sample Production" showBack={true} />
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
