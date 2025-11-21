import React from 'react';
import { MousePointer2, PenLine, Spline, Move, Layers, Link } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useVectorDrawing, VectorTool } from '@/hooks/useVectorDrawing';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VectorToolbarProps {
  className?: string;
  vectorContext?: ReturnType<typeof useVectorDrawing>;
}

const VectorToolbar = ({ className = '', vectorContext }: VectorToolbarProps) => {
  // Use provided context or create new one (fallback)
  const fallbackContext = useVectorDrawing();
  const context = vectorContext || fallbackContext;
  const {
    currentTool,
    setCurrentTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    fillOpacity,
    setFillOpacity,
    selectedPathIds,
    deletePath,
    clearSelection
  } = context;

  const tools = [
    { id: 'select', Icon: MousePointer2, label: 'Select Tool', description: 'Select and move paths' },
    { id: 'direct-select', Icon: Move, label: 'Direct Select', description: 'Select and edit anchor points' },
    { id: 'pen', Icon: PenLine, label: 'Pen Tool', description: 'Draw straight line segments' },
    { id: 'bezier', Icon: Spline, label: 'Bezier Tool', description: 'Draw curves with control handles' },
    { id: 'connect', Icon: Link, label: 'Connect Tool', description: 'Connect points by clicking them' },
  ] as const;

  const handleToolChange = (value: string) => {
    setCurrentTool(value as VectorTool);
    clearSelection();
  };

  const handleDeleteSelected = () => {
    selectedPathIds.forEach(pathId => {
      deletePath(pathId);
    });
  };

  return (
    <div className={`bg-card dark:bg-black border border-border rounded-2xl shadow-sm p-4 space-y-4 text-foreground ${className}`}>
      {/* Vector Tools */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Vector Tools</Label>
        <TooltipProvider delayDuration={100}>
          <ToggleGroup
            type="single"
            value={currentTool || ''}
            onValueChange={handleToolChange}
            className="grid grid-cols-3 gap-1 w-full"
          >
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value={tool.id} 
                    aria-label={tool.label}
                    className="h-10 flex items-center justify-center data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:shadow data-[state=on]:ring-1 data-[state=on]:ring-neutral-700"
                  >
                    <tool.Icon size={16} />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </TooltipProvider>
      </div>

      {/* Stroke Settings */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Stroke</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="text-xs h-8"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Width: {strokeWidth}px</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              max={20}
              min={0.5}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Fill Settings */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Fill</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="text-xs h-8"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Opacity: {Math.round(fillOpacity * 100)}%</Label>
            <Slider
              value={[fillOpacity]}
              onValueChange={(value) => setFillOpacity(value[0])}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {selectedPathIds.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Actions</Label>
          <div className="space-y-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="w-full text-xs"
            >
              Delete Selected ({selectedPathIds.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="w-full text-xs"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted rounded p-3">
        <Label className="text-xs font-medium text-foreground mb-1 block">Quick Guide</Label>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Pen Tool:</strong> Click to add points, double-click to finish</p>
          <p><strong>Bezier:</strong> Creates curves with control handles</p>
          <p><strong>Select:</strong> Click paths to select, Ctrl+click for multi-select</p>
          <p><strong>Direct Select:</strong> Edit individual anchor points</p>
        </div>
      </div>
    </div>
  );
};

export default VectorToolbar;