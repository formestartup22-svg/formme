import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Ruler, Package, Send, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  const [measurements, setMeasurements] = useState({
    chestWidth: '',
    length: '',
    sleeveLength: '',
    shoulderWidth: '',
    neckWidth: ''
  });

  const [hasDesignFile, setHasDesignFile] = useState(false);
  const [hasSizeChart, setHasSizeChart] = useState(false);

  const completionItems = [
    { label: 'Design File', completed: hasDesignFile },
    { label: 'Measurements', completed: Object.values(measurements).some(v => v !== '') },
    { label: 'Size Chart', completed: hasSizeChart },
    { label: 'Construction Notes', completed: false }
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = (completedCount / completionItems.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Tech Pack Completion</h3>
              <p className="text-sm text-muted-foreground">Complete all sections to generate</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completedCount}/{completionItems.length}</div>
              <div className="text-xs text-muted-foreground">Sections</div>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {completionItems.map((item, idx) => (
              <Badge 
                key={idx} 
                variant={item.completed ? "default" : "outline"}
                className="gap-1"
              >
                {item.completed ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {item.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Design File */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Design File</CardTitle>
                  <CardDescription className="text-xs">Upload your sketch or mockup</CardDescription>
                </div>
              </div>
              {hasDesignFile && <CheckCircle className="w-5 h-5 text-primary" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              onClick={() => setHasDesignFile(true)}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 mb-3 transition-colors">
                <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
            <Button className="w-full" onClick={() => setHasDesignFile(true)}>
              {hasDesignFile ? 'Replace File' : 'Upload Design'}
            </Button>
          </CardContent>
        </Card>

        {/* Measurements */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Ruler className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Measurements</CardTitle>
                  <CardDescription className="text-xs">Add garment dimensions</CardDescription>
                </div>
              </div>
              {Object.values(measurements).some(v => v !== '') && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { key: 'chestWidth', label: 'Chest Width' },
                { key: 'length', label: 'Length' },
                { key: 'sleeveLength', label: 'Sleeve Length' }
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
                    {field.label}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={field.key}
                      type="number"
                      placeholder="0"
                      value={measurements[field.key as keyof typeof measurements]}
                      onChange={(e) => setMeasurements(prev => ({
                        ...prev,
                        [field.key]: e.target.value
                      }))}
                      className="flex-1 bg-background"
                    />
                    <div className="w-16 flex items-center justify-center bg-muted rounded-md text-sm text-muted-foreground">
                      inches
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">Add More Measurements</Button>
          </CardContent>
        </Card>

        {/* Size Chart */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Size Chart</CardTitle>
                  <CardDescription className="text-xs">Define size specifications</CardDescription>
                </div>
              </div>
              {hasSizeChart && <CheckCircle className="w-5 h-5 text-primary" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 bg-muted/30 rounded-lg text-center border border-border">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {hasSizeChart ? 'Size chart added' : 'No size chart yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                Create a sizing guide for manufacturers
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setHasSizeChart(true)}
            >
              {hasSizeChart ? 'Edit Size Chart' : 'Create Size Chart'}
            </Button>
          </CardContent>
        </Card>

        {/* Construction Notes */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Construction Notes</CardTitle>
                <CardDescription className="text-xs">Special instructions & details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              className="min-h-[120px] bg-background resize-none"
              placeholder="Add construction details, fabric preferences, trim specifications, stitching requirements..."
            />
            <Button variant="outline" className="w-full">Save Notes</Button>
          </CardContent>
        </Card>
      </div>

      {/* Generate Tech Pack */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Generate & Send Tech Pack</CardTitle>
              <CardDescription>Create a professional tech pack for manufacturers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              className="gap-2"
              disabled={completionPercentage < 100}
            >
              <FileText className="w-4 h-4" />
              Generate PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              disabled={completionPercentage < 100}
            >
              <Send className="w-4 h-4" />
              Send to Factory
            </Button>
          </div>
          {completionPercentage < 100 && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Complete all sections to generate tech pack
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TechPackStage;
