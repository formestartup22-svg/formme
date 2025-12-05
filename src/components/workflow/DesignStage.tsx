import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, ArrowRight, Sparkles } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DesignStageProps {
  design: any;
}

const DesignStage = ({ design }: DesignStageProps) => {
  const { setCurrentStage, markStageComplete, updateWorkflowData } = useWorkflow();
  const [designName, setDesignName] = useState(design?.name || '');
  const [description, setDescription] = useState(design?.description || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(design?.design_file_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Only accept SVG files
    if (!file.type.includes('svg')) {
      toast.error('Please upload an SVG file');
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${design.id}/design.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(filePath);

      // Update design record
      await supabase
        .from('designs')
        .update({ design_file_url: publicUrl })
        .eq('id', design.id);

      toast.success('Design uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    } finally {
      setIsUploading(false);
    }
  }, [design?.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    maxFiles: 1
  });

  const handleContinue = async () => {
    if (!previewUrl) {
      toast.error('Please upload your design first');
      return;
    }

    // Update design name if changed
    if (designName !== design?.name) {
      await supabase
        .from('designs')
        .update({ name: designName, description })
        .eq('id', design.id);
    }

    markStageComplete('design');
    setCurrentStage('specifications');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Your Design</h2>
        <p className="text-muted-foreground mt-1">
          Start by uploading your garment design. We'll help you turn it into a production-ready tech pack.
        </p>
      </div>

      {/* Design Upload Area */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              previewUrl && "border-primary/30 bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="w-full max-w-md mx-auto aspect-square bg-background rounded-lg overflow-hidden border border-border">
                  <img 
                    src={previewUrl} 
                    alt="Design preview" 
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isDragActive ? "Drop your design here" : "Drag & drop your design"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    SVG files only • Vector format preserves quality
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Details */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Design Details</CardTitle>
          <CardDescription>Give your design a name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design Name</Label>
            <Input
              id="designName"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="e.g., Summer Linen Shirt"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design vision, target audience, or any special details..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Upload a clean SVG file with clearly defined layers for best results. Our AI will analyze your design to help generate accurate specifications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} className="gap-2" disabled={!previewUrl}>
          Continue to Specifications
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DesignStage;
