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
                    <Label className="text-xs mb-1.5 block">Fabric Type</Label>
                    <Input placeholder="e.g., 100% Cotton" className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">GSM (Weight)</Label>
                    <Input placeholder="e.g., 180 GSM" className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Shrinkage (%)</Label>
                    <Input placeholder="e.g., 3-5%" className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Color Fastness</Label>
                    <Input placeholder="e.g., Grade 4-5" className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Lab Dip Photos</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2 mb-4">
                  <Upload className="w-4 h-4" />Upload Lab Dip Photos
                </Button>
                {labDipPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {labDipPhotos.map((file, idx) => (
                      <div key={idx} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Production Timeline</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs mb-1.5 block">Start Date</Label><Input type="date" className="h-9 text-sm" /></div>
                    <div><Label className="text-xs mb-1.5 block">Expected Completion</Label><Input type="date" className="h-9 text-sm" /></div>
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

          <StageNavigation onNext={() => true} nextLabel="Continue to Sample Development" showBack={true} />
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
