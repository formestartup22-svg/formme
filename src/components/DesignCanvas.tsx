import React, { useRef, useState } from 'react';
import GarmentRenderer from './studio/GarmentRenderer';
import CanvasDrawing from './designer/canvas/CanvasDrawing';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';

interface DesignCanvasProps {
  zoomLevel: number;
  activeTool: string | null;
  penColor: string;
  penSize: number;
  colors: StudioColors;
  patterns: StudioPatterns;
  uploadedPatterns: StudioPatterns;
  fabric: FabricProperties;
  selectedTemplate: string;
  onPatternDrop?: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  availablePatterns?: UploadedPattern[];
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  // Button-related props
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  onButtonResize?: (buttonId: string, scale: number) => void;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
  onButtonDrop?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large', position: { x: number; y: number }) => void;
  // UI
  artboardDark?: boolean;
}

const DesignCanvas = ({
  zoomLevel,
  activeTool,
  penColor,
  penSize,
  colors,
  patterns,
  uploadedPatterns,
  fabric,
  selectedTemplate,
  onPatternDrop,
  getPatternById,
  availablePatterns,
  onPatternUpdate,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  onButtonResize,
  onButtonPlacement,
  onButtonDrop,
  artboardDark
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Initialize drawing functionality
  const {
    drawing,
    drawingPoints,
    drawings,
    isErasing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useCanvasDrawing(activeTool, penColor, penSize);

  console.log('🔍 DesignCanvas DEBUG - received buttons:', buttons);
  console.log('🔍 DesignCanvas DEBUG - buttons count:', buttons.length);
  console.log('🔍 DesignCanvas DEBUG - active tool:', activeTool);

  const handleButtonClick = (buttonId: string) => {
    console.log('🔍 DesignCanvas: Button clicked:', buttonId);
    if (onButtonClick) {
      onButtonClick(buttonId);
    }
  };

  const handleButtonDelete = (buttonId: string) => {
    if (onButtonDelete) {
      onButtonDelete(buttonId);
    }
    console.log('🔍 DesignCanvas: Button deleted:', buttonId);
  };

  const handleButtonDrag = (buttonId: string, newPosition: { x: number; y: number }) => {
    console.log('🔍 DesignCanvas: Button dragged:', buttonId, newPosition);
    if (onButtonDrag) {
      onButtonDrag(buttonId, newPosition);
    }
  };

  const handleButtonResize = (buttonId: string, scale: number) => {
    console.log('🔍 DesignCanvas: Button resized:', buttonId, scale);
    if (onButtonResize) {
      onButtonResize(buttonId, scale);
    }
  };

  // Handle drop events on the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('🔍 DesignCanvas: Drop event received');
    
    const buttonData = e.dataTransfer.getData('application/button-type');
    if (!buttonData || !onButtonDrop) {
      console.log('🔍 DesignCanvas: No button data or handler');
      return;
    }

    const [style, size] = buttonData.split('-') as ['round' | 'square' | 'oval', 'small' | 'medium' | 'large'];
    console.log('🔍 DesignCanvas: Parsed button data:', style, size);

    // Get the SVG element to calculate relative position
    const svgElement = canvasRef.current?.querySelector('svg');
    if (!svgElement) {
      console.log('🔍 DesignCanvas: No SVG element found');
      return;
    }

    const svgRect = svgElement.getBoundingClientRect();
    const dropX = e.clientX - svgRect.left;
    const dropY = e.clientY - svgRect.top;

    // Convert to percentage coordinates
    const percentX = (dropX / svgRect.width) * 100;
    const percentY = (dropY / svgRect.height) * 100;

    // Constrain to SVG bounds
    const constrainedX = Math.max(5, Math.min(95, percentX));
    const constrainedY = Math.max(5, Math.min(95, percentY));

    console.log('🔍 DesignCanvas: Drop position:', { x: constrainedX, y: constrainedY });

    onButtonDrop(style, size, { x: constrainedX, y: constrainedY });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Only enable drawing events when draw/erase tools are active
  const handleDrawingEvents = activeTool === 'draw' || activeTool === 'erase';
  
  console.log('🔍 DesignCanvas: About to pass buttons to GarmentRenderer. Count:', buttons.length);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-background">
      <div 
        ref={canvasRef}
        className={`relative ${/* artboard color */''} rounded-lg shadow-lg p-8 transition-all duration-200 ${ (typeof artboardDark !== 'undefined' && artboardDark) ? 'bg-muted' : 'bg-card'} `}
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          transition: 'transform 0.2s ease-in-out'
        }}
        onMouseDown={handleDrawingEvents ? (e) => handleMouseDown(e, canvasRef, zoomLevel) : undefined}
        onMouseMove={handleDrawingEvents ? (e) => handleMouseMove(e, canvasRef, zoomLevel) : undefined}
        onMouseUp={handleDrawingEvents ? handleMouseUp : undefined}
        onMouseLeave={handleDrawingEvents ? handleMouseUp : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <GarmentRenderer
          selectedTemplate={selectedTemplate}
          colors={colors}
          patterns={patterns}
          uploadedPatterns={uploadedPatterns}
          fabric={fabric}
          className="w-96 h-96"
          onPatternDrop={onPatternDrop}
          getPatternById={getPatternById}
          onPatternUpdate={onPatternUpdate}
          buttons={buttons}
          selectedButtonId={selectedButtonId}
          onButtonClick={handleButtonClick}
          onButtonDelete={handleButtonDelete}
          onButtonDrag={handleButtonDrag}
          onButtonResize={handleButtonResize}
          activeTool={activeTool}
          onButtonPlacement={onButtonPlacement}
        />
        
        {/* Drawing overlay */}
        {(activeTool === 'draw' || activeTool === 'erase') && (
          <CanvasDrawing
            drawings={drawings}
            currentDrawing={{
              isDrawing: drawing,
              points: drawingPoints,
              isErasing: isErasing,
              penColor: penColor,
              penSize: penSize
            }}
          />
        )}
      </div>
      
      {/* Enhanced Debug info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
        <p>Active Tool: {activeTool}</p>
        <p>Buttons Count: {buttons.length}</p>
        <p>Template: {selectedTemplate}</p>
        <p>Button Drop Available: {onButtonDrop ? 'Yes' : 'No'}</p>
        <p>Selected Button: {selectedButtonId || 'None'}</p>
        {activeTool === 'buttons' && (
          <p className="text-green-400">Drop Zone Active</p>
        )}
      </div>
    </div>
  );
};

export default DesignCanvas;
