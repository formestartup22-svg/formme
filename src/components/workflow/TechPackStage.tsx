import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileCheck, Download, Sparkles, Loader2 } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTechPackDialog, setShowTechPackDialog] = useState(false);
  const [generatedTechPack, setGeneratedTechPack] = useState<string>('');

  const handleNext = () => {
    // Allow progression without validation
    return true;
  };

  const handleGenerateTechPack = async () => {
    setIsGenerating(true);
    
    // Simulate tech pack generation (backend integration needed)
    setTimeout(() => {
      const mockTechPack = `TECH PACK - ${design.name}

GARMENT SPECIFICATIONS
- Type: T-Shirt
- Fabric: ${workflowData.fabric || 'Not specified'}
- GSM: ${workflowData.gsm || 'Not specified'}
- Print Type: ${workflowData.print || 'Not specified'}

MEASUREMENTS
- Chest Width: ${workflowData.measurements.chestWidth || 'Not specified'} inches
- Length: ${workflowData.measurements.length || 'Not specified'} inches
- Sleeve Length: ${workflowData.measurements.sleeveLength || 'Not specified'} inches

CONSTRUCTION NOTES
${workflowData.constructionNotes || 'No additional notes'}

---
Note: This is a preview. Connect backend for AI-generated tech packs.`;
      
      setGeneratedTechPack(mockTechPack);
      setShowTechPackDialog(true);
      setIsGenerating(false);
      toast.success('Tech pack preview generated!');
    }, 1500);
  };

  const handleDownloadTechPack = () => {
    const blob = new Blob([generatedTechPack], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name}-TechPack.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Tech pack downloaded!');
  };

  return (
    <div>
      <StageHeader
        icon={FileCheck}
        title="Create Your Tech Pack"
        description="Start by uploading your design and adding measurements. This information will be sent to the factory for production."
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Design Upload */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Design File</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Upload your design sketch or mockup
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or PDF • Max 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Measurements */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Garment Measurements</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'chestWidth', label: 'Chest Width' },
                    { key: 'length', label: 'Length' },
                    { key: 'sleeveLength', label: 'Sleeve Length' }
                  ].map((field) => (
                    <div key={field.key}>
                      <Label className="text-xs mb-1.5 block">{field.label}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={workflowData.measurements[field.key as keyof typeof workflowData.measurements]}
                          onChange={(e) =>
                            updateWorkflowData({
                              measurements: {
                                ...workflowData.measurements,
                                [field.key]: e.target.value
                              }
                            })
                          }
                          className="h-9 text-sm"
                        />
                        <div className="w-16 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                          inches
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Fabric Details */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Fabric Specifications</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Fabric Type</Label>
                    <Input
                      placeholder="e.g., Cotton, Polyester"
                      value={workflowData.fabric}
                      onChange={(e) => updateWorkflowData({ fabric: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">GSM</Label>
                    <Input
                      placeholder="e.g., 180"
                      value={workflowData.gsm}
                      onChange={(e) => updateWorkflowData({ gsm: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Print Type</Label>
                    <Input
                      placeholder="e.g., Screen, DTG"
                      value={workflowData.print}
                      onChange={(e) => updateWorkflowData({ print: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Construction Notes */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Construction Notes</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <Textarea
                  placeholder="Add any special instructions about fabric, stitching, trim, etc..."
                  value={workflowData.constructionNotes}
                  onChange={(e) => updateWorkflowData({ constructionNotes: e.target.value })}
                  className="min-h-[100px] text-sm resize-none"
                />
              </CardContent>
            </Card>
          </section>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleGenerateTechPack}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Tech Pack with AI
                </>
              )}
            </Button>
            {generatedTechPack && (
              <Button variant="outline" className="gap-2" onClick={handleDownloadTechPack}>
                <Download className="w-4 h-4" />
                Download Tech Pack
              </Button>
            )}
          </div>

          <StageNavigation 
            onNext={handleNext}
            nextLabel="Continue to Factory Match"
            showBack={false}
          />
        </div>

        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>

      <Dialog open={showTechPackDialog} onOpenChange={setShowTechPackDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Tech Pack is Ready!</DialogTitle>
            <DialogDescription>
              Review your AI-generated tech pack below. You can download it or send it directly to manufacturers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {generatedTechPack}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowTechPackDialog(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadTechPack} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechPackStage;
