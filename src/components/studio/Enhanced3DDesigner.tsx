import React, { useState } from 'react';
import Interactive3DGarment from './Interactive3DGarment';
import ColorPickerPanel from './ColorPickerPanel';
import { Card } from '@/components/ui/card';

interface Enhanced3DDesignerProps {
  selectedTemplate?: string;
  initialColors?: {
    body: string;
    sleeves: string;
    collar: string;
  };
}

const Enhanced3DDesigner = ({ 
  selectedTemplate = 'crew-neck-basic',
  initialColors = {
    body: '#ffffff',
    sleeves: '#ffffff', 
    collar: '#ffffff'
  }
}: Enhanced3DDesignerProps) => {
  const [colors, setColors] = useState(initialColors);
  const [selectedPart, setSelectedPart] = useState<'body' | 'sleeves' | 'collar' | null>(null);

  const handlePartClick = (part: 'body' | 'sleeves' | 'collar') => {
    setSelectedPart(part);
  };

  const handleColorChange = (part: 'body' | 'sleeves' | 'collar', color: string) => {
    setColors(prev => ({
      ...prev,
      [part]: color
    }));
  };

  const handleColorSelect = (color: string) => {
    if (selectedPart) {
      handleColorChange(selectedPart, color);
    }
  };

  return (
    <div className="flex gap-6 p-6 h-full">
      {/* 3D Viewer */}
      <Card className="flex-1 p-6">
        <div className="h-[600px]">
          <Interactive3DGarment
            selectedTemplate={selectedTemplate}
            colors={colors}
            onPartClick={handlePartClick}
            selectedPart={selectedPart}
            onColorChange={handleColorChange}
          />
        </div>
      </Card>

      {/* Color Picker Panel */}
      <ColorPickerPanel
        selectedPart={selectedPart}
        onColorSelect={handleColorSelect}
        currentColors={colors}
      />
    </div>
  );
};

export default Enhanced3DDesigner;