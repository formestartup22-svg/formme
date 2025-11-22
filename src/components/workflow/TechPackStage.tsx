import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileCheck, Download, Sparkles, Loader2, FileUp, Plus, X } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Design {
  id: string;
  name: string;
  design_file_url: string | null;
}

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTechPackDialog, setShowTechPackDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [generatedTechPackBlob, setGeneratedTechPackBlob] = useState<Blob | null>(null);
  const [uploadedTechPack, setUploadedTechPack] = useState<File | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileUrl, setDesignFileUrl] = useState<string>('');
  const [existingTechPack, setExistingTechPack] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' }
  ]);
  const [fabricSpecs, setFabricSpecs] = useState<Array<{ type: string; details: string }>>([
    { type: '', details: '' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const designFileInputRef = useRef<HTMLInputElement>(null);

  // Load design specs and existing data from database
  useEffect(() => {
    const loadDesignData = async () => {
      try {
        // Load design specs
        const { data: specsData, error: specsError } = await supabase
          .from('design_specs')
          .select('*')
          .eq('design_id', design.id)
          .maybeSingle();

        if (specsError && specsError.code !== 'PGRST116') throw specsError;
        
        if (specsData) {
          const dbMeasurements = typeof specsData.measurements === 'object' && specsData.measurements !== null 
            ? specsData.measurements as any
            : [];
            
          // Convert measurements to array format if needed
          if (Array.isArray(dbMeasurements) && dbMeasurements.length > 0) {
            setMeasurements(dbMeasurements);
          } else if (Object.keys(dbMeasurements).length > 0) {
            // Convert old format to new format
            const converted = Object.entries(dbMeasurements)
              .filter(([_, value]) => value)
              .map(([name, value]) => ({ name, value: String(value) }));
            setMeasurements(converted.length > 0 ? converted : [{ name: '', value: '' }]);
          }

          // Load fabric specs
          if (specsData.fabric_type || specsData.gsm || specsData.print_type) {
            const specs = [];
            if (specsData.fabric_type) specs.push({ type: 'Fabric Type', details: specsData.fabric_type });
            if (specsData.gsm) specs.push({ type: 'GSM', details: specsData.gsm.toString() });
            if (specsData.print_type) specs.push({ type: 'Print Type', details: specsData.print_type });
            setFabricSpecs(specs.length > 0 ? specs : [{ type: '', details: '' }]);
          }
            
          updateWorkflowData({
            constructionNotes: specsData.construction_notes || '',
          });

          if (specsData.artwork_url) {
            setDesignFileUrl(specsData.artwork_url);
          }
        }

        // Check if design file already exists
        if (design.design_file_url) {
          setDesignFileUrl(design.design_file_url);
        }

        // Check for existing tech pack
        const { data: techpackData } = await supabase
          .from('techpacks')
          .select('pdf_url')
          .eq('design_id', design.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (techpackData?.pdf_url) {
          setExistingTechPack(techpackData.pdf_url);
        }
      } catch (error) {
        console.error('Error loading design data:', error);
      }
    };

    loadDesignData();
  }, [design.id, design.design_file_url]);

  const handleNext = () => {
    // Allow progression without validation
    return true;
  };

  const handleGenerateTechPack = async () => {
    setIsGenerating(true);
    try {
      // Save design specs to database first
      const fabricData = fabricSpecs.filter(f => f.type && f.details);
      const fabricType = fabricData.find(f => f.type.toLowerCase().includes('fabric'))?.details || '';
      const gsmData = fabricData.find(f => f.type.toLowerCase().includes('gsm'))?.details || '';
      const printType = fabricData.find(f => f.type.toLowerCase().includes('print'))?.details || '';

      const { error: upsertError } = await supabase
        .from('design_specs')
        .upsert({
          design_id: design.id,
          measurements: measurements.filter(m => m.name && m.value),
          fabric_type: fabricType,
          gsm: gsmData ? parseInt(gsmData) : null,
          print_type: printType,
          construction_notes: workflowData.constructionNotes,
          artwork_url: designFileUrl || null,
        }, {
          onConflict: 'design_id'
        });

      if (upsertError) throw upsertError;

      const { data, error } = await supabase.functions.invoke('generate-techpack', {
        body: {
          designData: {
            name: design.name,
            garmentType: 'T-Shirt',
            fabricSpecs: fabricSpecs.filter(f => f.type && f.details),
            measurements: measurements.filter(m => m.name && m.value),
            constructionNotes: workflowData.constructionNotes,
            designImageUrl: designFileUrl || null,
          }
        }
      });

      if (error) throw error;

      if (data?.pdfData) {
        // Convert base64 to blob
        const byteCharacters = atob(data.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Store blob for later upload
        setGeneratedTechPackBlob(blob);
        setShowConfirmDialog(true);
        toast.success('Tech pack generated successfully!');
      }
    } catch (error) {
      console.error('Error generating tech pack:', error);
      toast.error('Failed to generate tech pack. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmTechPack = async () => {
    if (!generatedTechPackBlob) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to storage with user_id in path
      const fileName = `${user.id}/${design.id}-techpack-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fileName, generatedTechPackBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      // Create techpack record
      const { error: techpackError } = await supabase
        .from('techpacks')
        .insert({
          design_id: design.id,
          pdf_url: publicUrl,
          pdf_file_id: fileName,
          generated_by: 'ai',
        });

      if (techpackError) throw techpackError;

      setExistingTechPack(publicUrl);
      setShowConfirmDialog(false);
      toast.success('Tech pack saved successfully!');
      
      // Download the file
      const url = URL.createObjectURL(generatedTechPackBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${design.name}-TechPack.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving tech pack:', error);
      toast.error('Failed to save tech pack');
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to storage with user_id in path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${design.id}-techpack-${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      // Create techpack record
      const { error: techpackError } = await supabase
        .from('techpacks')
        .insert({
          design_id: design.id,
          pdf_url: publicUrl,
          pdf_file_id: fileName,
          generated_by: 'user-upload',
        });

      if (techpackError) throw techpackError;

      setUploadedTechPack(file);
      setExistingTechPack(publicUrl);
      toast.success(`Tech pack "${file.name}" uploaded and saved successfully!`);
    } catch (error) {
      console.error('Error uploading tech pack:', error);
      toast.error('Failed to upload tech pack');
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
                {designFileUrl ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Design file uploaded</p>
                          <p className="text-xs text-muted-foreground">Click below to change</p>
                        </div>
                      </div>
                      {designFileUrl.match(/\.(jpg|jpeg|png)$/i) && (
                        <img src={designFileUrl} alt="Design preview" className="w-16 h-16 object-cover rounded" />
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => designFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Different File
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => designFileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Upload your design sketch or mockup
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or PDF • Max 10MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Measurements */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Garment Measurements</h3>
            <Card className="border-border">
              <CardContent className="p-6 space-y-3">
                {measurements.map((measurement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Measurement name (e.g., Chest Width)"
                      value={measurement.name}
                      onChange={(e) => {
                        const newMeasurements = [...measurements];
                        newMeasurements[index].name = e.target.value;
                        setMeasurements(newMeasurements);
                      }}
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={measurement.value}
                      onChange={(e) => {
                        const newMeasurements = [...measurements];
                        newMeasurements[index].value = e.target.value;
                        setMeasurements(newMeasurements);
                      }}
                      className="h-9 text-sm w-32"
                    />
                    <div className="w-16 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                      inches
                    </div>
                    {measurements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMeasurements(measurements.filter((_, i) => i !== index));
                        }}
                        className="h-9 w-9 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMeasurements([...measurements, { name: '', value: '' }])}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Measurement
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Fabric Details */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Fabric Specifications</h3>
            <Card className="border-border">
              <CardContent className="p-6 space-y-3">
                {fabricSpecs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Specification type (e.g., Fabric Type, GSM)"
                      value={spec.type}
                      onChange={(e) => {
                        const newSpecs = [...fabricSpecs];
                        newSpecs[index].type = e.target.value;
                        setFabricSpecs(newSpecs);
                      }}
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      placeholder="Details"
                      value={spec.details}
                      onChange={(e) => {
                        const newSpecs = [...fabricSpecs];
                        newSpecs[index].details = e.target.value;
                        setFabricSpecs(newSpecs);
                      }}
                      className="h-9 text-sm flex-1"
                    />
                    {fabricSpecs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFabricSpecs(fabricSpecs.filter((_, i) => i !== index));
                        }}
                        className="h-9 w-9 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFabricSpecs([...fabricSpecs, { type: '', details: '' }])}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Fabric Specification
                </Button>
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
            <div className="space-y-4">
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

              {existingTechPack && (
                <div className="rounded-lg bg-primary/10 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <FileCheck className="w-4 h-4" />
                    Tech pack already uploaded
                  </div>
                  <a 
                    href={existingTechPack} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    View tech pack
                  </a>
                </div>
              )}
            </div>
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

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Tech Pack?</DialogTitle>
            <DialogDescription>
              Your AI-generated tech pack is ready. Would you like to use this tech pack and link it to your design?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTechPack}>
              Yes, Save Tech Pack
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechPackStage;
