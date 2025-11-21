
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { useActiveSubTool } from '@/hooks/useActiveSubTool';

interface DrawingOptionsPanelProps {
  penColor: string;
  onPenColorChange: (color: string) => void;
  penSize: number;
  onPenSizeChange: (size: number) => void;
}

const DrawingOptionsPanel = ({ penColor, onPenColorChange, penSize, onPenSizeChange }: DrawingOptionsPanelProps) => {
  const { subTool } = useActiveSubTool();

  if (subTool !== 'draw' && subTool !== 'eraser') {
    return null;
  }

  return (
    <div className="absolute left-20 top-36 z-40 bg-card rounded-lg shadow-lg border border-border p-3 w-52">
      {subTool === 'draw' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="pen-color" className="text-sm font-medium text-foreground">Pen Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 p-0.5 rounded-md border border-border bg-card">
                <Input
                  id="pen-color"
                  type="color"
                  value={penColor}
                  onChange={(e) => onPenColorChange(e.target.value)}
                  className="w-full h-full p-0 border-none rounded-[3px] cursor-pointer"
                />
              </div>
              <div className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md w-full text-muted-foreground border border-border">{penColor.toUpperCase()}</div>
            </div>
          </div>
          <div>
            <Label htmlFor="pen-size" className="text-sm font-medium text-foreground">Pen Size ({penSize}px)</Label>
            <Slider
              id="pen-size"
              min={1}
              max={50}
              step={1}
              value={[penSize]}
              onValueChange={(value) => onPenSizeChange(value[0])}
              className="mt-2"
            />
          </div>
        </div>
      )}
      
      {subTool === 'eraser' && (
        <div className="space-y-3">
           <div>
              <Label htmlFor="eraser-size" className="text-sm font-medium text-foreground">Eraser Size ({penSize}px)</Label>
              <Slider
                id="eraser-size"
                min={1}
                max={50}
                step={1}
                value={[penSize]}
                onValueChange={(value) => onPenSizeChange(value[0])}
                className="mt-2"
              />
            </div>
        </div>
      )}
    </div>
  );
};

export default DrawingOptionsPanel;
