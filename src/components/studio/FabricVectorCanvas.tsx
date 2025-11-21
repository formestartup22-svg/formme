import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Path, Rect, Circle as FabricCircle } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pen, Square, Circle, Move, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

interface FabricVectorCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

const FabricVectorCanvas = ({ 
  width = 800, 
  height = 600, 
  className = '' 
}: FabricVectorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle' | 'circle'>('select');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
    });

    // Configure drawing brush
    canvas.freeDrawingBrush.color = strokeColor;
    canvas.freeDrawingBrush.width = strokeWidth;

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Handle object modification
    canvas.on('object:modified', () => {
      canvas.renderAll();
    });

    setFabricCanvas(canvas);
    toast.success('Enhanced canvas ready!');

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = strokeColor;
      fabricCanvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [activeTool, strokeColor, strokeWidth, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: fillColor === 'transparent' ? '' : fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'circle') {
      const circle = new FabricCircle({
        left: 100,
        top: 100,
        fill: fillColor === 'transparent' ? '' : fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast('Canvas cleared!');
  };

  const applyColorToSelected = (color: string, type: 'stroke' | 'fill') => {
    if (!fabricCanvas || !selectedObject) {
      if (type === 'stroke') {
        setStrokeColor(color);
      } else {
        setFillColor(color);
      }
      return;
    }

    if (type === 'stroke') {
      selectedObject.set('stroke', color);
      setStrokeColor(color);
    } else {
      selectedObject.set('fill', color === 'transparent' ? '' : color);
      setFillColor(color);
    }
    
    fabricCanvas.renderAll();
  };

  const exportSVG = () => {
    if (!fabricCanvas) return;
    
    const svg = fabricCanvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fabric-design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('SVG exported!');
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Toolbar */}
      <Card className="p-4 w-64 h-fit">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Tools</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolClick('select')}
                className="flex items-center gap-2"
              >
                <MousePointer className="w-4 h-4" />
                Select
              </Button>
              <Button
                variant={activeTool === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolClick('draw')}
                className="flex items-center gap-2"
              >
                <Pen className="w-4 h-4" />
                Draw
              </Button>
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolClick('rectangle')}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Rect
              </Button>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolClick('circle')}
                className="flex items-center gap-2"
              >
                <Circle className="w-4 h-4" />
                Circle
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Stroke</Label>
            <div className="flex gap-2 items-center mb-2">
              <Input
                type="color"
                value={strokeColor}
                onChange={(e) => applyColorToSelected(e.target.value, 'stroke')}
                className="w-12 h-8 p-0 border cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => applyColorToSelected(e.target.value, 'stroke')}
                className="text-sm"
                placeholder="#000000"
              />
            </div>
            <Label className="text-xs">Width: {strokeWidth}px</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(values) => setStrokeWidth(values[0])}
              min={1}
              max={20}
              step={1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Fill</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(e) => applyColorToSelected(e.target.value, 'fill')}
                className="w-12 h-8 p-0 border cursor-pointer"
              />
              <Input
                type="text"
                value={fillColor}
                onChange={(e) => applyColorToSelected(e.target.value, 'fill')}
                className="text-sm"
                placeholder="transparent"
              />
            </div>
          </div>

          {selectedObject && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-green-700">Selected Object</Label>
              <p className="text-xs text-muted-foreground">
                Click colors above to apply to selection
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" size="sm" className="flex-1">
              Clear
            </Button>
            <Button onClick={exportSVG} size="sm" className="flex-1">
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
};

export default FabricVectorCanvas;