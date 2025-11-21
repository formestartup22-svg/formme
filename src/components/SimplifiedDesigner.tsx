import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Layers, 
  Type, 
  Upload, 
  Download,
  Pen,
  Eraser,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Square
} from 'lucide-react';
import ThreeDCanvas from './ThreeDCanvas';
import ButtonPalette from './studio/ButtonPalette';
import ButtonElement from './studio/ButtonElement';
import { useCanvasButtons } from '@/hooks/useCanvasButtons';
import { useElementContext } from '@/context/ElementContext';

const SimplifiedDesigner = () => {
  const { modelSettings, updateModelSettings } = useElementContext();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(3);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    buttons,
    selectedButtonId,
    deleteButton,
    selectButton,
    addButton,
  } = useCanvasButtons();

  const tools = [
    { id: 'colors', icon: Palette, label: 'Colors' },
    { id: 'draw', icon: Pen, label: 'Draw' },
    { id: 'erase', icon: Eraser, label: 'Erase' },
    { id: 'buttons', icon: Square, label: 'Buttons' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'upload', icon: Upload, label: 'Upload' },
  ];

  // Simplified drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    console.log('Drop event triggered');
    console.log('Active tool:', activeTool);
    
    if (activeTool !== 'buttons') {
      console.log('Buttons tool not active, ignoring drop');
      return;
    }

    const buttonType = e.dataTransfer.getData('application/button-type');
    console.log('Button type from drag data:', buttonType);
    
    if (!buttonType || !canvasRef.current) {
      console.log('No button type or canvas ref');
      return;
    }

    const [style, size] = buttonType.split('-') as ['round' | 'square' | 'oval', 'small' | 'medium' | 'large'];
    
    // Get canvas dimensions
    const rect = canvasRef.current.getBoundingClientRect();
    console.log('Canvas rect:', rect);
    
    // Calculate relative position
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    console.log('Calculated position:', { x, y });
    
    // Add the button
    const newButtonId = addButton({
      style,
      size,
      color: '#2c3e50',
      position: { 
        x: Math.max(5, Math.min(95, x)), 
        y: Math.max(5, Math.min(95, y)) 
      },
      scale: 1,
      rotation: 0,
    });
    
    console.log('Button added with ID:', newButtonId);
    selectButton(newButtonId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (activeTool !== 'buttons') return;
    
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (activeTool !== 'buttons') return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only hide if actually leaving the canvas
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleButtonClick = (buttonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectButton(selectedButtonId === buttonId ? null : buttonId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && selectedButtonId) {
      selectButton(null);
    }
  };

  const renderToolPanel = () => {
    switch (activeTool) {
      case 'colors':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="body-color">Body Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="body-color"
                  type="color"
                  value={modelSettings.colors.body}
                  onChange={(e) => updateModelSettings({
                    colors: { ...modelSettings.colors, body: e.target.value }
                  })}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={modelSettings.colors.body}
                  onChange={(e) => updateModelSettings({
                    colors: { ...modelSettings.colors, body: e.target.value }
                  })}
                  className="flex-1 text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        );
      
      case 'draw':
      case 'erase':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pen-color">Pen Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="pen-color"
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pen-size">Pen Size: {penSize}px</Label>
              <Slider
                id="pen-size"
                min={1}
                max={20}
                step={1}
                value={[penSize]}
                onValueChange={(value) => setPenSize(value[0])}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'buttons':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700 font-medium">
                ✅ Buttons tool is active
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Drag any button below onto the t-shirt to place it
              </p>
            </div>
            <ButtonPalette />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a tool to start designing</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "secondary" : "ghost"}
              size="sm"
              className={`w-10 h-10 p-0 ${
                activeTool === tool.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => {
                const newTool = activeTool === tool.id ? null : tool.id;
                setActiveTool(newTool);
                console.log('Tool changed to:', newTool);
              }}
              title={tool.label}
            >
              <Icon size={18} />
            </Button>
          );
        })}
        
        <Separator className="my-4 bg-gray-700" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => setZoomLevel(100)}
          title="Reset Zoom"
        >
          <RotateCcw size={18} />
        </Button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <div className="absolute inset-4 bg-white rounded-lg shadow-lg flex items-center justify-center">
            <div 
              ref={canvasRef}
              className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
                isDragOver && activeTool === 'buttons' 
                  ? 'ring-4 ring-blue-300 ring-opacity-50 bg-blue-50' 
                  : ''
              }`}
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={handleCanvasClick}
            >
              {/* Drop indicator */}
              {isDragOver && activeTool === 'buttons' && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-60 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none z-50">
                  <div className="bg-white px-6 py-3 rounded-lg shadow-lg border border-blue-200 flex items-center gap-2">
                    <Square size={16} className="text-blue-600" />
                    <p className="text-blue-600 font-medium text-sm">Drop button here</p>
                  </div>
                </div>
              )}

              {/* T-shirt with buttons */}
              <div className="relative w-96 h-96">
                <div className="pointer-events-none">
                  <ThreeDCanvas />
                </div>
                
                {/* Button elements */}
                {buttons.map((button) => (
                  <div key={button.id}>
                    <div
                      onClick={(e) => handleButtonClick(button.id, e)}
                      className={`absolute cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-105 ${
                        selectedButtonId === button.id 
                          ? 'ring-2 ring-blue-400 ring-opacity-75 z-30' 
                          : 'hover:ring-2 hover:ring-gray-300 hover:ring-opacity-50'
                      }`}
                      style={{ 
                        left: `${button.position.x}%`,
                        top: `${button.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        padding: '4px',
                      }}
                      title={`${button.style} ${button.size} button`}
                    >
                      <ButtonElement
                        size={button.size}
                        style={button.style}
                        color={button.color}
                        position={{ x: 0, y: 0 }}
                        scale={button.scale}
                        rotation={button.rotation}
                      />
                    </div>

                    {/* Delete button */}
                    {selectedButtonId === button.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteButton(button.id);
                        }}
                        className="absolute z-40 pointer-events-auto w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white"
                        style={{
                          left: `${button.position.x}%`,
                          top: `${button.position.y}%`,
                          transform: 'translate(-50%, -50%) translate(12px, -12px)',
                        }}
                        title="Delete button"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-lg shadow-md">
            <span className="text-sm font-medium">{zoomLevel}%</span>
          </div>
        </div>

        {/* Right Panel */}
        {activeTool && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold capitalize">{activeTool}</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTool(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              {renderToolPanel()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedDesigner;
