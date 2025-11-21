import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ColorPickerPanelProps {
  selectedPart: 'body' | 'sleeves' | 'collar' | null;
  onColorSelect: (color: string) => void;
  currentColors: {
    body: string;
    sleeves: string;
    collar: string;
  };
}

const ColorPickerPanel = ({ 
  selectedPart, 
  onColorSelect, 
  currentColors 
}: ColorPickerPanelProps) => {
  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#add8e6',
    '#f0e68c', '#dda0dd', '#98fb98', '#f5deb3', '#40e0d0'
  ];

  const partDisplayNames = {
    body: 'Body',
    sleeves: 'Sleeves', 
    collar: 'Collar'
  };

  return (
    <Card className="w-64 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Color Picker</CardTitle>
        {selectedPart ? (
          <p className="text-sm text-muted-foreground">
            Editing: {partDisplayNames[selectedPart]}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click a garment part to edit
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Colors Display */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Colors</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(currentColors).map(([part, color]) => (
              <div key={part} className="text-center">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300 mx-auto mb-1"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs capitalize">{part}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {selectedPart ? `Select ${partDisplayNames[selectedPart]} Color` : 'Colors'}
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 border-2"
                style={{ backgroundColor: color }}
                onClick={() => selectedPart && onColorSelect(color)}
                disabled={!selectedPart}
              />
            ))}
          </div>
        </div>

        {/* Custom Color Input */}
        {selectedPart && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Custom Color</h4>
            <input
              type="color"
              className="w-full h-10 rounded border cursor-pointer"
              onChange={(e) => onColorSelect(e.target.value)}
              value={currentColors[selectedPart]}
            />
          </div>
        )}

        {!selectedPart && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Click on the 3D model to select a part and change its color
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorPickerPanel;