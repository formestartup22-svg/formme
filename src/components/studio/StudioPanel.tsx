import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette, Layers, Shirt, Scissors, Sparkles, PenTool } from 'lucide-react';

import TemplateSelector from './TemplateSelector';
import ImprovedTemplateSelector from './ImprovedTemplateSelector';
import GenderSelector from './GenderSelector';
import PatternUploader from './PatternUploader';
import ButtonPalette from './ButtonPalette';
import FabricHierarchySelector from './FabricHierarchySelector';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern, PatternUploadHook } from '@/hooks/usePatternUpload';
import { getAvailablePartsForTemplate } from '@/utils/garmentUtils';
import { useActiveSubTool } from '@/hooks/useActiveSubTool';

interface StudioPanelProps {
  activeTool: string | null;
  colors: StudioColors;
  patterns: StudioPatterns;
  uploadedPatterns: StudioPatterns;
  selectedFabric: string;
  selectedTemplate: string;
  onColorChange: (part: keyof StudioColors, color: string) => void;
  onPatternChange: (part: keyof StudioPatterns, pattern: string) => void;
  onUploadedPatternChange: (part: keyof StudioPatterns, patternId: string) => void;
  onFabricChange: (fabric: string) => void;
  onTemplateChange: (template: string) => void;
  penColor: string;
  penSize: number;
  onPenColorChange: (color: string) => void;
  onPenSizeChange: (size: number) => void;
  onToolChange: (tool: string | null) => void;
  availablePatterns: UploadedPattern[];
  getPatternById: (id: string) => UploadedPattern | undefined;
  patternUploadHook: PatternUploadHook;
  isProfessional?: boolean;
}

const StudioPanel = ({
  activeTool,
  colors,
  patterns,
  uploadedPatterns,
  selectedFabric,
  selectedTemplate,
  onColorChange,
  onPatternChange,
  onUploadedPatternChange,
  onFabricChange,
  onTemplateChange,
  penColor,
  penSize,
  onPenColorChange,
  onPenSizeChange,
  onToolChange,
  availablePatterns,
  getPatternById,
  patternUploadHook,
  isProfessional
}: StudioPanelProps) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedPatternPart, setSelectedPatternPart] = useState<'body' | 'sleeves' | 'collar'>('body');
  
  // Get available parts for the current template
  const availableParts = getAvailablePartsForTemplate(selectedTemplate);
  console.warn('what are the available parts', availableParts);
  
  const renderTemplatePanel = () => (
    <div className="space-y-6">
      <GenderSelector 
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />
      <ImprovedTemplateSelector
        selectedTemplate={selectedTemplate}
        selectedGender={selectedGender}
        onTemplateChange={onTemplateChange}
      />
    </div>
  );

  const renderFabricPanel = () => (
    <div className="space-y-6">
      <Card className="border border-border shadow-none bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-medium text-foreground">
            <div className="p-2 rounded-full bg-amber-500/15">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            Fabric Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose from our premium fabric collection
          </p>
        </CardHeader>
        <CardContent>
          <FabricHierarchySelector
            selectedFabric={selectedFabric}
            onFabricChange={onFabricChange}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderColorPanel = () => (
    <div className="space-y-6">
      <Card className="border border-border shadow-none bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-medium text-foreground">
            <div className="p-2 rounded-full bg-primary/15">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            Garment Colors
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize each part of your garment with beautiful colors
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Body Color - Always show since all garments have a body */}
          {availableParts.body && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-gray-500" />
                <Label className="text-sm font-medium text-gray-700">Body Color</Label>
              </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
              <div className="relative">
                <Input
                  type="color"
                  value={colors.body}
                  onChange={(e) => onColorChange('body', e.target.value)}
                  className="w-12 h-12 p-0 border-2 border-card rounded-full cursor-pointer shadow-sm overflow-hidden"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={colors.body}
                  onChange={(e) => onColorChange('body', e.target.value)}
                  className="text-sm font-mono border-border focus:border-primary/40 focus:ring-primary/20"
                  placeholder="#ffffff"
                />
                <div className="text-xs text-muted-foreground mt-1">Main garment color</div>
              </div>
            </div>
            </div>
          )}

          {/* Sleeves Color - Only show if garment has sleeves */}
          {availableParts.sleeves && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gray-500" />
                <Label className="text-sm font-medium text-gray-700">Sleeves Color</Label>
              </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
              <div className="relative">
                <Input
                  type="color"
                  value={colors.sleeves}
                  onChange={(e) => onColorChange('sleeves', e.target.value)}
                  className="w-12 h-12 p-0 border-2 border-card rounded-full cursor-pointer shadow-sm overflow-hidden"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={colors.sleeves}
                  onChange={(e) => onColorChange('sleeves', e.target.value)}
                  className="text-sm font-mono border-border focus:border-primary/40 focus:ring-primary/20"
                  placeholder="#ffffff"
                />
                <div className="text-xs text-muted-foreground mt-1">Sleeve accent color</div>
              </div>
            </div>
            </div>
          )}

          {/* Collar Color - Only show if garment has collar */}
          {availableParts.collar && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 rounded-full"></div>
                <Label className="text-sm font-medium text-gray-700">Collar Color</Label>
              </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
              <div className="relative">
                <Input
                  type="color"
                  value={colors.collar}
                  onChange={(e) => onColorChange('collar', e.target.value)}
                  className="w-12 h-12 p-0 border-2 border-card rounded-full cursor-pointer shadow-sm overflow-hidden"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={colors.collar}
                  onChange={(e) => onColorChange('collar', e.target.value)}
                  className="text-sm font-mono border-border focus:border-primary/40 focus:ring-primary/20"
                  placeholder="#ffffff"
                />
                <div className="text-xs text-muted-foreground mt-1">Collar detail color</div>
              </div>
            </div>
            </div>
          )}

          {/* Stripes Color - Only show if garment has stripes */}
          {availableParts.stripesColor && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded"></div>
                <Label className="text-sm font-medium text-gray-700">Stripes Color</Label>
              </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
              <div className="relative">
                <Input
                  type="color"
                  value={colors.stripesColor}
                  onChange={(e) => onColorChange('stripesColor', e.target.value)}
                  className="w-12 h-12 p-0 border-2 border-card rounded-full cursor-pointer shadow-sm overflow-hidden"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={colors.stripesColor}
                  onChange={(e) => onColorChange('stripesColor', e.target.value)}
                  className="text-sm font-mono border-border focus:border-primary/40 focus:ring-primary/20"
                  placeholder="#ffffff"
                />
                <div className="text-xs text-muted-foreground mt-1">Pattern stripe color</div>
              </div>
            </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPatternPanel = () => {
    // Get available parts as array for filtering
    const availablePartsList = Object.entries(availableParts)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([part, _]) => part as 'body' | 'sleeves' | 'collar');

    // Ensure selectedPatternPart is valid for current template
    const validPatternPart = availablePartsList.includes(selectedPatternPart) 
      ? selectedPatternPart 
      : availablePartsList[0] || 'body';

    return (
      <div className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {/* Part selector - Only show available parts */}
            {availablePartsList.length > 1 && (
              <div className="space-y-2">
                <Label>Apply to part:</Label>
                <Select 
                  value={validPatternPart} 
                  onValueChange={(value: 'body' | 'sleeves' | 'collar') => setSelectedPatternPart(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePartsList.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part.charAt(0).toUpperCase() + part.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <PatternUploader 
              selectedPart={validPatternPart}
              onPatternSelect={(patternId: string) => onUploadedPatternChange(validPatternPart, patternId)}
              selectedPatternId={uploadedPatterns[validPatternPart]}
              patternUploadHook={patternUploadHook}
            />
          </TabsContent>
          
          <TabsContent value="apply" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Predefined Patterns</h4>
              {availablePartsList.map((part) => (
                <div key={part} className="space-y-2">
                  <Label className="capitalize">{part} Pattern</Label>
                  <Select 
                    value={patterns[part]} 
                    onValueChange={(value) => onPatternChange(part, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="stripes">Stripes</SelectItem>
                      <SelectItem value="polka-dots">Polka Dots</SelectItem>
                      <SelectItem value="checkerboard">Checkerboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderDrawingPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Drawing Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pen-color">Pen Color</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="pen-color"
                type="color"
                value={penColor}
                onChange={(e) => onPenColorChange(e.target.value)}
                className="w-12 h-8 p-1 border rounded cursor-pointer"
              />
              <Input
                type="text"
                value={penColor}
                onChange={(e) => onPenColorChange(e.target.value)}
                className="flex-1 text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pen-size">Pen Size: {penSize}px</Label>
            <Slider
              id="pen-size"
              min={1}
              max={20}
              step={1}
              value={[penSize]}
              onValueChange={(value) => onPenSizeChange(value[0])}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderButtonPanel = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700 font-medium">
          ✅ Buttons tool is active
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Drag any button below onto the garment to place it
        </p>
      </div>
      <ButtonPalette />
    </div>
  );

  const renderUploadPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upload images, logos, or custom graphics to use in your design.
          </p>
          {/* Upload functionality would go here */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderElementsPanel = () => {
    const { setActiveSubTool } = useActiveSubTool();
    
    return (
      <div className="space-y-6">
        <Card className="border border-border shadow-none bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-medium text-foreground">
              <div className="p-2 rounded-full bg-primary/15">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              Drawing Tools
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your drawing and design tools
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vector Drawing Tool (Pro only) */}
            {isProfessional && (
              <>
                <Button
                  onClick={() => setActiveSubTool('vector')}
                  variant="outline"
                  className="w-full h-16 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">Vector Drawing Studio</div>
                      <div className="text-xs text-muted-foreground">Professional vector design & illustration</div>
                    </div>
                  </div>
                </Button>
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                  💡 <strong>Vector Studio:</strong> Create professional vector graphics with advanced tools for paths, bezier curves, and color fills.
                </div>
              </>
            )}
            {/* Other drawing tools */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                onClick={() => setActiveSubTool('draw')}
                variant="outline"
                className="h-12 flex flex-col items-center justify-center"
              >
                <div className="text-xs font-medium">Freehand</div>
                <div className="text-xs text-muted-foreground">Draw freely</div>
              </Button>
              <Button
                onClick={() => setActiveSubTool('text')}
                variant="outline"
                className="h-12 flex flex-col items-center justify-center"
              >
                <div className="text-xs font-medium">Text</div>
                <div className="text-xs text-muted-foreground">Add text</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  switch (activeTool) {
    case 'templates':
      return renderTemplatePanel();
    case 'fabrics':
      return renderFabricPanel();
    case 'colors':
      return renderColorPanel();
    case 'patterns':
      return renderPatternPanel();
    case 'draw':
    case 'erase':
      return renderDrawingPanel();
    case 'buttons':
      return renderButtonPanel();
    case 'elements':
      return renderElementsPanel();
    case 'upload':
      return renderUploadPanel();
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Select a tool to start customizing</p>
        </div>
      );
  }
};

export default StudioPanel;
