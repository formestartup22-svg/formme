
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface PatternCropperProps {
  imageUrl: string;
  onCropChange: (cropData: CropData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const PatternCropper = ({ imageUrl, onCropChange, onSave, onCancel }: PatternCropperProps) => {
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y });
  }, [cropData.x, cropData.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const newCropData = { ...cropData, x: newX, y: newY };
    setCropData(newCropData);
    onCropChange(newCropData);
  }, [isDragging, dragStart, cropData, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleScaleChange = useCallback((value: number[]) => {
    const newCropData = { ...cropData, scale: value[0] };
    setCropData(newCropData);
    onCropChange(newCropData);
  }, [cropData, onCropChange]);

  const handleRotationChange = useCallback((value: number[]) => {
    const newCropData = { ...cropData, rotation: value[0] };
    setCropData(newCropData);
    onCropChange(newCropData);
  }, [cropData, onCropChange]);

  const handleReset = useCallback(() => {
    const resetData = { x: 0, y: 0, scale: 1, rotation: 0 };
    setCropData(resetData);
    onCropChange(resetData);
  }, [onCropChange]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Crop Pattern</h3>
        
        {/* Preview area */}
        <div 
          ref={containerRef}
          className="relative w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-4 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt="Pattern preview"
            className="absolute select-none pointer-events-none"
            style={{
              transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
              transformOrigin: 'center'
            }}
            draggable={false}
          />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #666 20px, #666 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #666 20px, #666 21px)'
            }} />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <ZoomIn className="w-4 h-4" />
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Scale</label>
              <Slider
                value={[cropData.scale]}
                onValueChange={handleScaleChange}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-sm w-12">{cropData.scale.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-4">
            <RotateCcw className="w-4 h-4" />
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rotation</label>
              <Slider
                value={[cropData.rotation]}
                onValueChange={handleRotationChange}
                min={-180}
                max={180}
                step={15}
                className="w-full"
              />
            </div>
            <span className="text-sm w-12">{cropData.rotation}°</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternCropper;
