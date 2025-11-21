
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCw, ZoomIn, ZoomOut, Move, Save, X } from 'lucide-react';
import { UploadedPattern, CropData } from '@/hooks/usePatternUpload';

interface PatternEditorProps {
  pattern: UploadedPattern;
  onUpdate: (patternId: string, cropData: CropData) => void;
  onClose: () => void;
}

const PatternEditor = ({ pattern, onUpdate, onClose }: PatternEditorProps) => {
  const [cropData, setCropData] = useState<CropData>(
    pattern.cropData || { x: 0, y: 0, scale: 1, rotation: 0 }
  );

  const handleScaleChange = (value: number[]) => {
    setCropData(prev => ({ ...prev, scale: value[0] }));
  };

  const handleRotationChange = (value: number[]) => {
    setCropData(prev => ({ ...prev, rotation: value[0] }));
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number[]) => {
    setCropData(prev => ({ ...prev, [axis]: value[0] }));
  };

  const handleSave = () => {
    onUpdate(pattern.id, cropData);
    onClose();
  };

  const handleReset = () => {
    setCropData({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Edit Pattern</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pattern Preview */}
        <div className="relative w-32 h-32 mx-auto border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <img
            src={pattern.url}
            alt={pattern.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200"
            style={{
              transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
            }}
          />
        </div>

        <div className="text-center">
          <h3 className="font-medium text-gray-900">{pattern.name}</h3>
          <p className="text-xs text-gray-500 mt-1">Adjust how this pattern appears on your design</p>
        </div>

        {/* Scale Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ZoomIn size={14} />
              Scale
            </label>
            <span className="text-xs text-gray-500">{Math.round(cropData.scale * 100)}%</span>
          </div>
          <Slider
            value={[cropData.scale]}
            onValueChange={handleScaleChange}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <RotateCw size={14} />
              Rotation
            </label>
            <span className="text-xs text-gray-500">{Math.round(cropData.rotation)}°</span>
          </div>
          <Slider
            value={[cropData.rotation]}
            onValueChange={handleRotationChange}
            min={0}
            max={360}
            step={15}
            className="w-full"
          />
        </div>

        {/* Position Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Move size={14} />
            Position
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Horizontal</label>
              <span className="text-xs text-gray-500">{Math.round(cropData.x)}px</span>
            </div>
            <Slider
              value={[cropData.x]}
              onValueChange={(value) => handlePositionChange('x', value)}
              min={-100}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-600">Vertical</label>
              <span className="text-xs text-gray-500">{Math.round(cropData.y)}px</span>
            </div>
            <Slider
              value={[cropData.y]}
              onValueChange={(value) => handlePositionChange('y', value)}
              min={-100}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save size={14} className="mr-2" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternEditor;
