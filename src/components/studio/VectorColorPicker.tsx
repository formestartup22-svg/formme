import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useVectorDrawing } from '@/hooks/useVectorDrawing';
import { Palette, CircleDot, Square, Droplet, Pipette } from 'lucide-react';

interface VectorColorPickerProps {
  vectorContext: ReturnType<typeof useVectorDrawing>;
  className?: string;
}

const VectorColorPicker = ({ vectorContext, className = '' }: VectorColorPickerProps) => {
  const {
    selectedPathIds,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    fillOpacity,
    setFillOpacity,
    updatePath,
    vectorLayers
  } = vectorContext;

  const [activeColorType, setActiveColorType] = useState<'stroke' | 'fill'>('fill');

  // Apply color to selected paths or set as default
  const applyColorToSelected = (color: string, type: 'stroke' | 'fill' = activeColorType) => {
    if (selectedPathIds.length === 0) {
      // No paths selected, set as default color
      if (type === 'stroke') {
        setStrokeColor(color);
      } else {
        setFillColor(color);
      }
      return;
    }

    // Apply to selected paths
    selectedPathIds.forEach(pathId => {
      const path = vectorLayers
        .flatMap(layer => layer.paths)
        .find(p => p.id === pathId);
      
      if (path) {
        if (type === 'stroke') {
          updatePath(pathId, { stroke: color });
          setStrokeColor(color);
        } else {
          updatePath(pathId, { 
            fill: color, 
            fillOpacity: path.closed ? Math.max(fillOpacity, 0.1) : 0 
          });
          setFillColor(color);
          if (path.closed) {
            setFillOpacity(Math.max(fillOpacity, 0.1));
          }
        }
      }
    });
  };

  // Apply stroke width to selected paths or set as default
  const applyStrokeWidthToSelected = (width: number) => {
    setStrokeWidth(width);
    selectedPathIds.forEach(pathId => {
      updatePath(pathId, { strokeWidth: width });
    });
  };

  // Apply fill opacity to selected paths or set as default
  const applyFillOpacityToSelected = (opacity: number) => {
    setFillOpacity(opacity);
    selectedPathIds.forEach(pathId => {
      const path = vectorLayers
        .flatMap(layer => layer.paths)
        .find(p => p.id === pathId);
      
      if (path && path.closed) {
        updatePath(pathId, { fillOpacity: opacity });
      }
    });
  };

  // Get selected paths info for UI feedback
  const getSelectedPathsInfo = () => {
    const selectedPaths = vectorLayers
      .flatMap(layer => layer.paths)
      .filter(path => selectedPathIds.includes(path.id));
    
    return selectedPaths.length > 0 ? selectedPaths[0] : null;
  };

  const selectedPath = getSelectedPathsInfo();

  // Quick color presets
  const colorPresets = [
    ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
    ['#ff0000', '#ff6b6b', '#ff9999', '#ffcccc', '#ffe6e6', '#fff2f2'],
    ['#00ff00', '#6bff6b', '#99ff99', '#ccffcc', '#e6ffe6', '#f2fff2'],
    ['#0000ff', '#6b6bff', '#9999ff', '#ccccff', '#e6e6ff', '#f2f2ff'],
    ['#ffff00', '#ffff6b', '#ffff99', '#ffffcc', '#ffffe6', '#fffff2'],
    ['#ff00ff', '#ff6bff', '#ff99ff', '#ffccff', '#ffe6ff', '#fff2ff'],
    ['#00ffff', '#6bffff', '#99ffff', '#ccffff', '#e6ffff', '#f2ffff'],
    ['#ffa500', '#ffb366', '#ffc199', '#ffcfcc', '#ffddcc', '#ffebcc']
  ];

  // Gradient presets
  const gradientPresets = [
    'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    'linear-gradient(45deg, #667eea, #764ba2)', 
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #fa709a, #fee140)'
  ];

  return (
    <Card className={`${className} rounded-2xl border border-border shadow-sm`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Palette className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Vector Colors</span>
        </div>

        {selectedPathIds.length > 0 ? (
          <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-md">
            Editing {selectedPathIds.length} selected path{selectedPathIds.length > 1 ? 's' : ''}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            Select a path to edit colors, or set defaults for new paths
          </div>
        )}

        <Tabs value={activeColorType} onValueChange={(value) => setActiveColorType(value as 'stroke' | 'fill')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stroke" className="text-xs">
              <CircleDot className="w-3 h-3 mr-1" />
              Stroke
            </TabsTrigger>
            <TabsTrigger value="fill" className="text-xs">
              <Square className="w-3 h-3 mr-1" />
              Fill
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stroke" className="space-y-3 mt-3">
            <div>
              <Label className="text-xs font-medium mb-2 block">Stroke Color</Label>
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: strokeColor }}
                  onClick={() => document.getElementById('stroke-color-input')?.click()}
                />
                <div className="flex-1 space-y-1">
                  <Input
                    id="stroke-color-input"
                    type="color"
                    value={strokeColor}
                    onChange={(e) => applyColorToSelected(e.target.value, 'stroke')}
                    className="sr-only"
                  />
                  <Input
                    type="text"
                    value={strokeColor}
                    onChange={(e) => applyColorToSelected(e.target.value, 'stroke')}
                    className="text-xs h-8 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block">Stroke Width: {strokeWidth}px</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => applyStrokeWidthToSelected(value[0])}
                max={20}
                min={0.5}
                step={0.5}
                className="w-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="fill" className="space-y-3 mt-3">
            <div>
              <Label className="text-xs font-medium mb-2 block">Fill Color</Label>
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer hover:scale-105 transition-transform relative overflow-hidden"
                  onClick={() => document.getElementById('fill-color-input')?.click()}
                >
                  <div 
                    className="w-full h-full"
                    style={{ 
                      backgroundColor: fillColor,
                      opacity: fillOpacity 
                    }}
                  />
                  {fillOpacity < 0.1 && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-500">NO</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    id="fill-color-input"
                    type="color"
                    value={fillColor}
                    onChange={(e) => applyColorToSelected(e.target.value, 'fill')}
                    className="sr-only"
                  />
                  <Input
                    type="text"
                    value={fillColor}
                    onChange={(e) => applyColorToSelected(e.target.value, 'fill')}
                    className="text-xs h-8 font-mono"
                    placeholder="#a031a0"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block">Fill Opacity: {Math.round(fillOpacity * 100)}%</Label>
              <Slider
                value={[fillOpacity]}
                onValueChange={(value) => applyFillOpacityToSelected(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Colors */}
        <div>
          <Label className="text-xs font-medium mb-2 block">Quick Colors</Label>
          <div className="grid grid-cols-6 gap-1">
            {colorPresets.flat().map((color, index) => (
              <button
                key={`preset-${index}-${color}`}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => applyColorToSelected(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Gradient Presets */}
        <div>
          <Label className="text-xs font-medium mb-2 block">Gradient Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((gradient, index) => (
              <div
                key={`gradient-${index}`}
                className="h-6 rounded border border-border cursor-pointer hover:scale-105 transition-transform shadow-sm"
                style={{ background: gradient }}
                onClick={() => {
                  // Extract the end color from gradient for solid color application
                  const match = gradient.match(/#[0-9a-fA-F]{6}/g);
                  if (match && match.length > 0) {
                    applyColorToSelected(match[match.length - 1]);
                  }
                }}
                title={`Apply gradient-inspired color`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyColorToSelected('transparent', 'fill')}
            className="flex-1 text-xs"
          >
            <Droplet className="w-3 h-3 mr-1" />
            No Fill
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyColorToSelected('#000000', 'stroke')}
            className="flex-1 text-xs"
          >
            <CircleDot className="w-3 h-3 mr-1" />
            Black Stroke
          </Button>
        </div>

        {/* Context Message */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded text-center">
          💡 Double-click paths to apply current fill color
        </div>
      </CardContent>
    </Card>
  );
};

export default VectorColorPicker;