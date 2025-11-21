
import React, { useRef, useState } from 'react';
import DesignCanvas from '../DesignCanvas';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { Slider } from "@/components/ui/slider";
import { CircleDot, StickyNote, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, MousePointer2, Edit, Text, Eraser } from "lucide-react";
import CanvasDrawing from '../designer/canvas/CanvasDrawing';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';
import { TextElement } from './TextElement';
import { GarmentElement } from './GarmentElement';
import { CanvasElementType as CanvasElement } from '@/types/elements';
import { useActiveSubTool } from '@/hooks/useActiveSubTool';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const PAGES_TOTAL = 1;

const DotGridBg = ({ zoomLevel = 100 }: { zoomLevel?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%" style={{ zIndex: 0 }} >
    <pattern id="dotgrid" x="0" y="0" width={24 * 100 / zoomLevel} height={24 * 100 / zoomLevel} patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.22" fill="hsl(var(--border))" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#dotgrid)" />
  </svg>
);

interface StudioCanvasProps {
  zoomLevel: number;
  activeTool: string | null;
  penColor: string;
  penSize: number;
  colors: StudioColors;
  patterns: StudioPatterns;
  uploadedPatterns: StudioPatterns;
  fabric: FabricProperties;
  selectedTemplate: string;
  isBackMode: boolean;
  onPatternDrop?: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  availablePatterns?: UploadedPattern[];
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  onButtonResize?: (buttonId: string, scale: number) => void;
  onZoomChange?: (zoom: number) => void;
  elements?: CanvasElement[];
  onElementAdd?: (element: CanvasElement) => void;
  onElementUpdate?: (id: string, data: any) => void;
  onElementDelete?: (id: string) => void;
  onElementSelect?: (id: string) => void;
  selectedElementId?: string | null;
}

const StudioCanvas = ({
  zoomLevel,
  activeTool,
  penColor,
  penSize,
  colors,
  patterns,
  uploadedPatterns,
  fabric,
  selectedTemplate,
  isBackMode,
  onPatternDrop,
  getPatternById,
  availablePatterns,
  onPatternUpdate,
  onButtonPlacement,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  onButtonResize,
  onZoomChange,
  elements = [],
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  onElementSelect,
  selectedElementId,
}: StudioCanvasProps) => {
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Clamp zoom
  const effectiveZoom = Math.max(10, Math.min(180, zoomLevel));
  const canvasScale = effectiveZoom / 100;
  const [artboardDark, setArtboardDark] = useState(false);

  // --- DRAWING STATE LOGIC ---
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { subTool, setActiveSubTool } = useActiveSubTool();

  const toolForDrawing = activeTool === 'elements' ? subTool : activeTool;

  // Use the drawing hook (only care about active draw/erase tool)
  const {
    drawing,
    drawingPoints,
    drawings,
    isErasing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useCanvasDrawing(toolForDrawing, artboardDark ? '#ffffff' : penColor, penSize);

  const handleCanvasPointerDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        if (onElementSelect) {
            onElementSelect(null);
        }
    }

    if (activeTool === 'elements') {
      if (subTool === 'text') {
          if (!canvasContainerRef.current || !onElementAdd) return;
          
          const position = {
            x: 150, // Centered position for new text elements
            y: 200,
          };

          const newTextElement: CanvasElement = {
              id: `text-${Date.now()}`,
              name: 'Text',
              category: 'text',
              type: 'text',
              position: position,
              rotation: 0,
              scale: 1,
              zIndex: 1001,
              text: 'Double-click to edit',
              style: {
                  color: '#333333',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  textAlign: 'left',
                  fontFamily: 'Arial',
                  fontSize: `24px`,
              },
              preview: React.createElement('div', {}, 'Double-click to edit')
          };

          onElementAdd(newTextElement);
          setActiveSubTool('select');
          return;
      }
      
      if (subTool === 'select') {
        setIsPanning(true);
        panStartRef.current = {
            x: e.clientX - canvasPosition.x,
            y: e.clientY - canvasPosition.y,
        };
        return;
      }

      handleMouseDown(e, canvasContainerRef, effectiveZoom);
    }
  };
  const handleContainerPointerMove = (e: React.MouseEvent) => {
    if (isPanning) {
        setCanvasPosition({
            x: e.clientX - panStartRef.current.x,
            y: e.clientY - panStartRef.current.y,
        });
        return;
    }
    if (activeTool !== "elements" || subTool === 'text' || !drawing) return;
    handleMouseMove(e, canvasContainerRef, effectiveZoom);
  };
  const handleContainerPointerUp = (e: React.MouseEvent) => {
    if (isPanning) {
        setIsPanning(false);
    }
    if (activeTool !== "elements" || !drawing) return;
    handleMouseUp();
  };

  const handleZoomChange = (value: number | number[]) => {
    if (onZoomChange) {
      if (typeof value === "number") onZoomChange(value);
      else if (Array.isArray(value)) onZoomChange(value[0]);
    }
  };

  const getCursor = () => {
    if (activeTool === 'elements') {
      if (isPanning) return 'grabbing';
      if (drawing) return 'crosshair';
      switch(subTool) {
        case 'select': return 'grab';
        case 'draw': return 'crosshair';
        case 'eraser': return 'grab'; // Using grab for eraser for now
        case 'text': return 'text';
        default: return 'default';
      }
    }
    return 'default';
  }

  const handleNotesClick = () => {
    alert("Notes: This would open a notes sidebar or modal.");
  };

  const handlePrevPage = () => {};
  const handleNextPage = () => {};

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const hasGarmentElements = elements.some(el => el.type === 'garment');
  const designCanvasColors = hasGarmentElements
      ? { ...colors, body: 'transparent', sleeves: 'transparent', collar: 'transparent', stripesColor: 'transparent' }
      : colors;
  const designCanvasPatterns: StudioPatterns = hasGarmentElements 
      ? { body: undefined, sleeves: undefined, collar: undefined, stripesColor: '' }
      : patterns;
  const designCanvasUploadedPatterns: StudioPatterns = hasGarmentElements
      ? { body: undefined, sleeves: undefined, collar: undefined, stripesColor: '' }
      : uploadedPatterns;
  const designCanvasButtons = hasGarmentElements ? [] : buttons;

  const subTools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'draw', icon: Edit, label: 'Draw' },
    { id: 'text', icon: Text, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ] as const;

  return (
    <div 
      className="relative w-full h-full bg-background flex items-center justify-center overflow-hidden"
      style={{
        minHeight: 650, // Give more vertical air
        // Give even more breathing room (like Canva)
        paddingTop: 44, paddingBottom: 44,
        paddingLeft: 68, paddingRight: 68,
      }}
    >
      {/* Dot-grid background */}
      <DotGridBg zoomLevel={effectiveZoom} />
      {/* Centered Canvas Container */}
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
        style={{
          zIndex: 1,
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`
        }}
      >
        <div
          ref={canvasContainerRef}
          id="design-canvas-container"
          className="relative origin-center group"
          style={{
            width: 480,
            height: 480,
            transform: `scale(${canvasScale})`,
            transition: isPanning ? 'none' : "transform 0.2s cubic-bezier(0.59,0.01,0.27,1.05)",
            cursor: getCursor(),
            pointerEvents: activeTool === 'elements' ? "auto" : "all"
          }}
          tabIndex={activeTool === "elements" ? 0 : -1}
          onMouseDown={handleCanvasPointerDown}
          onMouseMove={handleContainerPointerMove}
          onMouseUp={handleContainerPointerUp}
          onMouseLeave={handleContainerPointerUp}
        >
          {/* Main canvas card */}
          <div
            className="relative bg-card rounded-2xl border border-border shadow-[0_4px_16px_0_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden"
            style={{
              width: 480,
              height: 480,
            }}
          >
            {/* Render your design canvas as before */}
            <DesignCanvas
              zoomLevel={effectiveZoom}
              activeTool={activeTool}
              penColor={penColor}
              penSize={penSize}
              colors={designCanvasColors}
              patterns={designCanvasPatterns}
              uploadedPatterns={designCanvasUploadedPatterns}
              fabric={fabric}
              selectedTemplate={hasGarmentElements ? '' : selectedTemplate}
              onPatternDrop={onPatternDrop}
              getPatternById={getPatternById}
              availablePatterns={availablePatterns}
              onPatternUpdate={onPatternUpdate}
              buttons={designCanvasButtons}
              selectedButtonId={selectedButtonId}
              onButtonClick={onButtonClick}
              onButtonDelete={onButtonDelete}
              onButtonDrag={onButtonDrag}
              onButtonResize={onButtonResize}
              onButtonPlacement={onButtonPlacement}
              artboardDark={artboardDark}
            />

            {/* DRAWING OVERLAY: SVG on top of canvas, below text */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
              <CanvasDrawing
                drawings={drawings}
                currentDrawing={{
                  isDrawing: drawing,
                  points: drawingPoints,
                  isErasing: subTool === 'eraser',
                  penColor: artboardDark ? '#ffffff' : penColor,
                  penSize,
                }}
              />
            </div>

            {/* Render Elements on a higher layer */}
            <div className="absolute inset-0" style={{ zIndex: 50, pointerEvents: 'none' }}>
              {elements.map(element => {
                if (element.type === 'text' && onElementUpdate && onElementSelect && onElementDelete) {
                  return (
                    <TextElement
                      key={element.id}
                      element={element}
                      onUpdate={onElementUpdate}
                      onSelect={onElementSelect}
                      onDelete={onElementDelete}
                      isSelected={selectedElementId === element.id}
                      activeSubTool={subTool}
                      setActiveSubTool={setActiveSubTool}
                    />
                  )
                }
                if (element.type === 'garment' && onElementUpdate && onElementSelect && onElementDelete) {
                  return (
                    <GarmentElement
                      key={element.id}
                      element={element}
                      onUpdate={onElementUpdate}
                      onSelect={onElementSelect}
                      onDelete={onElementDelete}
                      isSelected={selectedElementId === element.id}
                      activeSubTool={subTool || 'select'}
                      getPatternById={getPatternById}
                    />
                  )
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Controls Footer, like Canva */}
      <div
        className="
          absolute left-1/2 bottom-16 -translate-x-1/2
          flex items-end justify-center
          pointer-events-none
        "
        style={{ zIndex: 3 }}
      >
        <div className="
          flex flex-row items-center gap-6 pointer-events-auto 
          bg-secondary/90 border border-border rounded-full shadow-lg
          px-4 py-2 h-[64px]
        ">
          {/* Element Tools */}
          <>
            <div className="flex items-center gap-1">
              {subTools.map(tool => (
                  <Button
                      key={tool.id}
                      variant="ghost"
                      size="icon"
                      className={`rounded-full w-10 h-10 ${subTool === tool.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                      onClick={() => setActiveSubTool(tool.id)}
                      title={tool.label}
                  >
                      <tool.icon className="w-5 h-5" />
                  </Button>
              ))}
            </div>
            <span className="h-7 w-[2px] bg-border rounded" />
          </>

          {/* Notes Button */}
          <button
            className="flex flex-row items-center gap-2 px-5 py-2 font-medium rounded-full text-foreground hover:bg-muted border-none bg-transparent transition focus:outline-none focus:ring-2 focus:ring-ring/30"
            style={{marginRight: 14, fontSize: '1.09rem'}}
            onClick={handleNotesClick}
            type="button"
          >
            <StickyNote className="w-[22px] h-[22px]" />
            <span>Notes</span>
          </button>
          {/* Divider */}
          <span className="h-7 w-[2px] bg-border rounded mx-3" />
          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted transition border border-border bg-transparent"
              onClick={() => handleZoomChange(Math.max(10, effectiveZoom - 10))}
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              value={[effectiveZoom]}
              onValueChange={handleZoomChange}
              min={10}
              max={180}
              step={5}
              className="w-40 mx-2"
              aria-label="Zoom slider"
            />
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted transition border border-border bg-transparent"
              onClick={() => handleZoomChange(Math.min(180, effectiveZoom + 10))}
              aria-label="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <span className="text-base w-[46px] text-right ml-2 font-semibold text-foreground tabular-nums">{effectiveZoom}%</span>
          </div>
          {/* Divider */}
          <span className="h-7 w-[2px] bg-border rounded mx-3" />
          {/* Artboard toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Artboard</span>
            <Switch checked={artboardDark} onCheckedChange={setArtboardDark} />
            <span className="text-sm font-medium text-foreground">{artboardDark ? 'Dark' : 'Light'}</span>
          </div>
          {/* Divider */}
          <span className="h-7 w-[2px] bg-border rounded mx-3" />
          {/* Pages */}
          <div className="flex flex-row items-center gap-2 pl-2">
            <CircleDot className="w-4 h-4" />
            <span className="text-sm font-medium text-foreground">Pages</span>
            <button
              className="rounded-full p-2 hover:bg-muted border border-border disabled:opacity-60"
              disabled
              aria-label="Previous Page"
              onClick={handlePrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-bold mx-2 tabular-nums whitespace-nowrap">1 / {PAGES_TOTAL}</span>
            <button
              className="rounded-full p-2 hover:bg-muted border border-border disabled:opacity-60"
              disabled
              aria-label="Next Page"
              onClick={handleNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioCanvas;
