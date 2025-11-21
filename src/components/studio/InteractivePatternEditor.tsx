
import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { RotateCw, Move, Square, X, Check } from 'lucide-react';
import { UploadedPattern, CropData } from '@/hooks/usePatternUpload';

interface InteractivePatternEditorProps {
  pattern: UploadedPattern;
  part: 'body' | 'sleeves' | 'collar';
  isActive: boolean;
  onUpdate: (patternId: string, cropData: CropData & { width: number; height: number; x: number; y: number; clipRect?: { x: number; y: number; width: number; height: number } }) => void;
  onClose: () => void;
  containerBounds?: DOMRect;
}

const InteractivePatternEditor = ({
  pattern,
  part,
  isActive,
  onUpdate,
  onClose,
  containerBounds
}: InteractivePatternEditorProps) => {
  const [editMode, setEditMode] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: 200,
    height: 200,
    x: 0,
    y: 0
  });
  
  const [rotation, setRotation] = useState(pattern.cropData?.rotation || 0);
  const [isApplying, setIsApplying] = useState(false);

  // Use default container bounds if not provided
  const bounds = containerBounds || new DOMRect(0, 0, 800, 600);

  useEffect(() => {
    setDimensions({
      width: 200,
      height: 200,
      x: bounds.width * 0.3,
      y: bounds.height * 0.3
    });
    setRotation(pattern.cropData?.rotation || 0);
  }, [pattern, bounds]);

  // Helper function to calculate clipRect coordinates based on current dimensions
  const calculateClipRect = (dims: typeof dimensions) => {
    const svgWidth = 1332.15;
    const svgHeight = 1687.55;
    
    // Convert screen coordinates to SVG coordinates
    const svgX = (dims.x / bounds.width) * svgWidth;
    const svgY = (dims.y / bounds.height) * svgHeight;
    const svgWidth_clip = (dims.width / bounds.width) * svgWidth;
    const svgHeight_clip = (dims.height / bounds.height) * svgHeight;

    console.log('Calculating clipRect:', {
      screenDims: dims,
      containerBounds: { width: bounds.width, height: bounds.height },
      svgCoords: { x: svgX, y: svgY, width: svgWidth_clip, height: svgHeight_clip }
    });

    return {
      x: svgX,
      y: svgY,
      width: svgWidth_clip,
      height: svgHeight_clip
    };
  };

  // Helper function to create crop data
  const createCropData = (dims: typeof dimensions, rot: number = rotation) => {
    const relativeX = (dims.x / bounds.width) * 100;
    const relativeY = (dims.y / bounds.height) * 100;
    const scaleValue = dims.width / 200;

    const clipRect = calculateClipRect(dims);

    console.log('Creating crop data:', {
      dimensions: dims,
      rotation: rot,
      relativePosition: { x: relativeX, y: relativeY },
      scale: scaleValue,
      clipRect
    });

    return {
      ...pattern.cropData,
      x: relativeX - 50,
      y: relativeY - 50,
      width: dims.width,
      height: dims.height,
      rotation: rot,
      scale: scaleValue,
      clipRect: clipRect
    };
  };

  const handleSave = async () => {
    setIsApplying(true);
    
    console.log('=== APPLYING PATTERN CHANGES ===');
    console.log('Final dimensions:', dimensions);
    console.log('Final rotation:', rotation);
    
    const finalCropData = createCropData(dimensions, rotation);
    console.log('Final crop data being applied:', finalCropData);

    // Apply the update with all the captured changes
    onUpdate(pattern.id, finalCropData);
    
    // Delay to allow SVG to re-render
    setTimeout(() => {
      setIsApplying(false);
      setEditMode(false);
      onClose();
    }, 200);
  };

  const handleRotate = () => {
    const newRotation = (rotation + 15) % 360;
    setRotation(newRotation);
    console.log('Rotated to:', newRotation, '(will apply on save)');
  };

  // Handle drag - ONLY update local state, do NOT apply to pattern
  const handleDragStop = (e: any, d: any) => {
    const newDimensions = { ...dimensions, x: d.x, y: d.y };
    setDimensions(newDimensions);
    console.log('Drag stopped at:', newDimensions, '(will apply on save)');
  };

  // Handle resize - ONLY update local state, do NOT apply to pattern
  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newDimensions = {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
      x: position.x,
      y: position.y
    };
    setDimensions(newDimensions);
    console.log('Resize stopped at:', newDimensions, '(will apply on save)');
  };

  if (!isActive) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        width: bounds.width,
        height: bounds.height
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" onClick={onClose} />
      
      {/* Resizable pattern area */}
      <Rnd
        size={{ width: dimensions.width, height: dimensions.height }}
        position={{ x: dimensions.x, y: dimensions.y }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        bounds="parent"
        className="pointer-events-auto"
        minWidth={100}
        minHeight={100}
        lockAspectRatio={false}
        disableDragging={isApplying}
        enableResizing={!isApplying}
      >
        <div 
          className={`w-full h-full border-4 border-blue-500 border-dashed bg-white bg-opacity-20 relative overflow-hidden rounded-lg shadow-lg transition-opacity duration-200 ${isApplying ? 'opacity-50' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <img
            src={pattern.url}
            alt={pattern.name}
            className="w-full h-full object-cover"
            style={{ opacity: 0.9 }}
          />
          
          {/* Corner indicators */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-1.5 -translate-y-1.5 shadow-md" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full translate-x-1.5 -translate-y-1.5 shadow-md" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-1.5 translate-y-1.5 shadow-md" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full translate-x-1.5 translate-y-1.5 shadow-md" />
          
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md">
              {pattern.name} - {part}
            </div>
          </div>

          {/* Loading overlay when applying */}
          {isApplying && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-blue-600">
                Applying to {part}...
              </div>
            </div>
          )}
        </div>
      </Rnd>

      {/* Control buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 pointer-events-auto bg-white rounded-lg shadow-lg p-2">
        <Button size="sm" variant="outline" onClick={handleRotate} title="Rotate 15°" disabled={isApplying}>
          <RotateCw size={16} />
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} title="Cancel" disabled={isApplying}>
          <X size={16} />
        </Button>
        <Button size="sm" onClick={handleSave} title="Apply changes" disabled={isApplying}>
          <Check size={16} />
          <span className="ml-1 text-xs">{isApplying ? 'Applying...' : 'Apply'}</span>
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-md">
          <p className="text-blue-800 text-sm font-medium">
            Drag, resize, and rotate the pattern • Click Apply to save changes to the {part}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractivePatternEditor;
