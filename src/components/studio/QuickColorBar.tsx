import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, Circle, Square, Eye, EyeOff, Lightbulb } from 'lucide-react';
import { useVectorDrawing } from '@/hooks/useVectorDrawing';

interface QuickColorBarProps {
  vectorContext: ReturnType<typeof useVectorDrawing>;
  className?: string;
}

const QuickColorBar = ({ vectorContext, className = '' }: QuickColorBarProps) => {
  const {
    selectedPathIds,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    updatePath,
    vectorLayers
  } = vectorContext;

  const [showQuickColors, setShowQuickColors] = useState(true);

  // Quick access colors
  const quickColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  const applyQuickColor = (color: string, type: 'stroke' | 'fill') => {
    if (selectedPathIds.length === 0) {
      if (type === 'stroke') {
        setStrokeColor(color);
      } else {
        setFillColor(color);
      }
      return;
    }

    selectedPathIds.forEach(pathId => {
      if (type === 'stroke') {
        updatePath(pathId, { stroke: color });
        setStrokeColor(color);
      } else {
        updatePath(pathId, { fill: color, fillOpacity: 1 });
        setFillColor(color);
      }
    });
  };

  if (!showQuickColors) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowQuickColors(true)}
        className={className}
      >
        <Eye className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className={`p-3 border-border/50 shadow-sm bg-background/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Quick Colors</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuickColors(false)}
          className="h-6 w-6 p-0 hover:bg-muted/50"
        >
          <EyeOff className="w-3 h-3" />
        </Button>
      </div>
      
      {selectedPathIds.length > 0 && (
        <div className="text-xs text-muted-foreground mb-2">
          Editing {selectedPathIds.length} selected path{selectedPathIds.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="space-y-2">
        {/* Stroke Colors */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Circle className="w-3 h-3" />
            <span className="text-xs">Stroke</span>
          </div>
          <div className="flex gap-1">
            {quickColors.map((color) => (
              <Button
                key={`stroke-${color}`}
                variant="outline"
                size="sm"
                className="w-6 h-6 p-0 border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => applyQuickColor(color, 'stroke')}
                title={`Apply ${color} to stroke`}
              />
            ))}
          </div>
        </div>

        {/* Fill Colors */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Square className="w-3 h-3" />
            <span className="text-xs">Fill</span>
          </div>
          <div className="flex gap-1">
            {quickColors.map((color) => (
              <Button
                key={`fill-${color}`}
                variant="outline"
                size="sm"
                className="w-6 h-6 p-0 border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => applyQuickColor(color, 'fill')}
                title={`Apply ${color} to fill`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded flex items-center justify-center gap-2">
        <Lightbulb className="w-3 h-3" />
        <span>Double-click a path to apply the current fill • Double-click empty space to close shapes</span>
      </div>
    </Card>
  );
};

export default QuickColorBar;