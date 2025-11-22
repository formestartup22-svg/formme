import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileCheck, Download, Sparkles, Loader2, FileUp } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTechPackDialog, setShowTechPackDialog] = useState(false);
  const [generatedTechPack, setGeneratedTechPack] = useState<string>('');
  const [uploadedTechPack, setUploadedTechPack] = useState<File | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileUrl, setDesignFileUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const designFileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    // Allow progression without validation
    return true;
  };

  const handleGenerateTechPack = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-techpack', {
        body: {
          designData: {
            name: design.name,
            garmentType: 'T-Shirt',
            fabric: workflowData.fabric,
            gsm: workflowData.gsm,
            print: workflowData.print,
            measurements: workflowData.measurements,
            constructionNotes: workflowData.constructionNotes,
            designImageUrl: designFileUrl || null,
          }
        }
      });

      if (error) throw error;

      if (data?.pdfData) {
        // Convert base64 to blob and download
        const byteCharacters = atob(data.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${design.name}-TechPack.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setGeneratedTechPack(data.techPackContent || 'Tech pack generated');
        setShowTechPackDialog(true);
        toast.success('Tech pack PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('Error generating tech pack:', error);
      toast.error('Failed to generate tech pack. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDesignFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${design.id}-design-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      setDesignFile(file);
      setDesignFileUrl(publicUrl);
      toast.success(`Design file "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading design file:', error);
      toast.error('Failed to upload design file');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedTechPack(file);
      toast.success(`Tech pack "${file.name}" uploaded successfully!`);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <StageHeader
        icon={FileCheck}
        title="Create your tech pack"
        description="Start by uploading your design and adding measurements. This information will be sent to the factory for production."
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Design Upload */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Design File</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <input
                  ref={designFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleDesignFileUpload}
                  className="hidden"
                />
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => designFileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    {designFile ? designFile.name : 'Upload your design sketch or mockup'}
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

          {/* Generate & Upload Tech Pack */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Tech Pack Management</h3>
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate a professional tech pack using AI based on your design specifications
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
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
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your existing tech pack document (PDF, DOC, or DOCX)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={handleUploadClick}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <FileUp className="w-4 h-4" />
                    {uploadedTechPack ? uploadedTechPack.name : 'Upload Existing Tech Pack'}
                  </Button>
                </div>

                {generatedTechPack && (
                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    ✓ Tech pack PDF generated and downloaded
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <StageNavigation 
            onNext={handleNext}
            nextLabel="Continue to Find Manufacturer"
            showBack={true}
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
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your tech pack PDF has been downloaded successfully. Check your downloads folder.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowTechPackDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechPackStage;
