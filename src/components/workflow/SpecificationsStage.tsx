import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Ruler, Info } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpecificationsStageProps {
  design: any;
}

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SpecificationsStage = ({ design }: SpecificationsStageProps) => {
  const { setCurrentStage, markStageComplete, workflowData, updateWorkflowData } = useWorkflow();
  
  const [measurements, setMeasurements] = useState({
    chestWidth: workflowData.measurements?.chestWidth || '',
    length: workflowData.measurements?.length || '',
    sleeveLength: workflowData.measurements?.sleeveLength || '',
    shoulderWidth: '',
    hemWidth: '',
  });
  
  const [baseSize, setBaseSize] = useState('M');
  const [sizeRange, setSizeRange] = useState(['S', 'M', 'L', 'XL']);
  const [grading, setGrading] = useState('1'); // inches between sizes

  // Load existing specs
  useEffect(() => {
    const loadSpecs = async () => {
      const { data: specs } = await supabase
        .from('design_specs')
        .select('measurements')
        .eq('design_id', design.id)
        .maybeSingle();

      if (specs?.measurements) {
        const m = specs.measurements as any;
        setMeasurements({
          chestWidth: m.chestWidth || '',
          length: m.length || '',
          sleeveLength: m.sleeveLength || '',
          shoulderWidth: m.shoulderWidth || '',
          hemWidth: m.hemWidth || '',
        });
      }
    };
    loadSpecs();
  }, [design.id]);

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    setCurrentStage('design');
  };

  const handleContinue = async () => {
    // Save measurements to design_specs
    try {
      const { data: existing } = await supabase
        .from('design_specs')
        .select('id')
        .eq('design_id', design.id)
        .maybeSingle();

      const measurementsData = {
        ...measurements,
        baseSize,
        sizeRange,
        grading
      };

      if (existing) {
        await supabase
          .from('design_specs')
          .update({ measurements: measurementsData })
          .eq('design_id', design.id);
      } else {
        await supabase
          .from('design_specs')
          .insert({ design_id: design.id, measurements: measurementsData });
      }

      updateWorkflowData({ measurements });
      markStageComplete('specifications');
      setCurrentStage('fabric-color');
    } catch (error) {
      console.error('Error saving specifications:', error);
      toast.error('Failed to save specifications');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Specifications</h2>
        <p className="text-muted-foreground mt-1">
          Define the measurements and sizing for your garment
        </p>
      </div>

      {/* Measurements Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Key Measurements</CardTitle>
          </div>
          <CardDescription>Enter measurements in inches for your base size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chestWidth">Chest Width</Label>
              <div className="relative">
                <Input
                  id="chestWidth"
                  type="number"
                  value={measurements.chestWidth}
                  onChange={(e) => handleMeasurementChange('chestWidth', e.target.value)}
                  placeholder="22"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="length">Body Length</Label>
              <div className="relative">
                <Input
                  id="length"
                  type="number"
                  value={measurements.length}
                  onChange={(e) => handleMeasurementChange('length', e.target.value)}
                  placeholder="28"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleeveLength">Sleeve Length</Label>
              <div className="relative">
                <Input
                  id="sleeveLength"
                  type="number"
                  value={measurements.sleeveLength}
                  onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
                  placeholder="8.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoulderWidth">Shoulder Width</Label>
              <div className="relative">
                <Input
                  id="shoulderWidth"
                  type="number"
                  value={measurements.shoulderWidth}
                  onChange={(e) => handleMeasurementChange('shoulderWidth', e.target.value)}
                  placeholder="18"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hemWidth">Hem Width</Label>
              <div className="relative">
                <Input
                  id="hemWidth"
                  type="number"
                  value={measurements.hemWidth}
                  onChange={(e) => handleMeasurementChange('hemWidth', e.target.value)}
                  placeholder="22"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Range Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Size Range</CardTitle>
          <CardDescription>Configure the sizes you want to produce</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Size</Label>
              <Select value={baseSize} onValueChange={setBaseSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Measurements above are for this size
              </p>
            </div>

            <div className="space-y-2">
              <Label>Grading (size difference)</Label>
              <Select value={grading} onValueChange={setGrading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5 inches</SelectItem>
                  <SelectItem value="1">1 inch</SelectItem>
                  <SelectItem value="1.5">1.5 inches</SelectItem>
                  <SelectItem value="2">2 inches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label>Sizes to Produce</Label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(size => (
                <Button
                  key={size}
                  variant={sizeRange.includes(size) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSizeRange(prev => 
                      prev.includes(size) 
                        ? prev.filter(s => s !== size)
                        : [...prev, size].sort((a, b) => sizeOptions.indexOf(a) - sizeOptions.indexOf(b))
                    );
                  }}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              Don't have exact measurements? No problem — you can update these later or let your manufacturer help refine them during sample development.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} className="gap-2">
          Continue to Fabric & Color
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SpecificationsStage;
