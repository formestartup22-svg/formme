import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Upload, Save, Palette, FileText } from 'lucide-react';
import * as DXF from '@tarikjabiri/dxf';
import { DxfWriter, point3d } from '@tarikjabiri/dxf';
import VectorDrawingCanvas from './VectorDrawingCanvas';
import VectorToolbar from './VectorToolbar';
import VectorLayersPanel from './VectorLayersPanel';
import VectorColorPicker from './VectorColorPicker';
import VectorMeasurementsPanel from './VectorMeasurementsPanel';
import QuickColorBar from './QuickColorBar';
import { useVectorDrawing } from '@/hooks/useVectorDrawing';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface VectorStudioProps {
  className?: string;
}

const VectorStudio = ({ className = '' }: VectorStudioProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [measurements, setMeasurements] = useState<{ segmentLength?: number; angleDeg?: number; totalPathLength?: number; units?: 'px' }>({});
  
  // Use the shared vector drawing hook instance
  const vectorDrawingContext = useVectorDrawing();
  const {
    vectorLayers,
    getAllPaths,
    generatePathData,
    setStrokeColor,
    strokeColor,
    addLayer,
    deleteLayer,
    updateLayer,
    setActiveLayerId,
  } = vectorDrawingContext;

  const { theme, resolvedTheme } = useTheme();
  useEffect(() => {
    const t = resolvedTheme || theme;
    setStrokeColor(t === 'dark' ? '#ffffff' : '#000000');
  }, [theme, resolvedTheme, setStrokeColor]);

  const handleZoomChange = (delta: number) => {
    setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta)));
  };

  const exportSVG = () => {
    const allPaths = getAllPaths();
    
    if (allPaths.length === 0) {
      toast.error('No paths to export');
      return;
    }

    let svgContent = `<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add each layer
    vectorLayers.forEach(layer => {
      if (!layer.visible || layer.paths.length === 0) return;
      
      svgContent += `<g opacity="${layer.opacity}">`;
      layer.paths.forEach(path => {
        const pathData = generatePathData(path);
        if (pathData) {
          svgContent += `<path d="${pathData}" stroke="${path.stroke}" stroke-width="${path.strokeWidth}" fill="${path.fillOpacity > 0 ? path.fill : 'none'}" fill-opacity="${path.fillOpacity}" />`;
          // Segment length labels
          if (path.points.length > 1) {
            for (let i = 1; i < path.points.length; i++) {
              const a = path.points[i - 1];
              const b = path.points[i];
              const len = Math.hypot(b.x - a.x, b.y - a.y).toFixed(2);
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2 - 6;
              svgContent += `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="10" fill="${path.stroke}">${len}</text>`;
            }
          }
        }
      });
      svgContent += '</g>';
    });
    
    svgContent += '</svg>';

    // Download the SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector-design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('SVG exported successfully!');
  };

  const exportDXF = () => {
    const allPaths = getAllPaths();
    
    if (allPaths.length === 0) {
      toast.error('No paths to export');
      return;
    }

    console.log('Exporting DXF with paths:', allPaths);

    const dxf = new DxfWriter();
    
    // Convert vector paths to DXF entities
    vectorLayers.forEach((layer, layerIndex) => {
      if (!layer.visible || layer.paths.length === 0) return;
      
      console.log(`Processing layer ${layerIndex}:`, layer);
      
      layer.paths.forEach((path, pathIndex) => {
        if (path.points.length < 2) return;
        
        console.log(`Processing path ${pathIndex} with ${path.points.length} points:`, path.points);
        
        // For 2-point paths, use LINE entity
        if (path.points.length === 2) {
          const start = point3d(path.points[0].x, canvasSize.height - path.points[0].y, 0);
          const end = point3d(path.points[1].x, canvasSize.height - path.points[1].y, 0);
          console.log('Adding line:', start, end);
          dxf.addLine(start, end);
        } else {
          // For multi-point paths, use LWPOLYLINE
          const vertices = path.points.map(p => ({
            point: point3d(p.x, canvasSize.height - p.y, 0)
          }));
          console.log('Adding polyline with vertices:', vertices);
          dxf.addLWPolyline(vertices);
        }
      });
    });

    // Generate DXF content
    const dxfString = dxf.stringify();
    console.log('Generated DXF string length:', dxfString.length);
    console.log('DXF preview (first 500 chars):', dxfString.substring(0, 500));
    
    // Download the DXF
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector-design.dxf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('DXF exported successfully!');
  };

  const STORAGE_KEY = 'vector-design';

  const loadFromDesignData = (designData: any) => {
    const savedLayers = Array.isArray(designData?.layers) ? designData.layers : [];
    if (!savedLayers.length) return false;

    // Remove extra current layers, keep the first
    if (vectorLayers.length > 1) {
      for (let i = vectorLayers.length - 1; i >= 1; i--) {
        deleteLayer(vectorLayers[i].id);
      }
    }

    // Ensure we have a base layer to write into
    const baseId = vectorLayers[0]?.id || addLayer(savedLayers[0]?.name || 'Layer 1');
    const baseSaved = savedLayers[0] || { name: 'Layer 1', visible: true, locked: false, opacity: 1, paths: [] };
    const basePaths = (baseSaved.paths || []).map((p: any) => ({ ...p, layerId: baseId }));
    updateLayer(baseId, {
      name: baseSaved.name ?? 'Layer 1',
      visible: baseSaved.visible ?? true,
      locked: baseSaved.locked ?? false,
      opacity: baseSaved.opacity ?? 1,
      paths: basePaths,
    });

    let lastId = baseId;
    for (let i = 1; i < savedLayers.length; i++) {
      const sl = savedLayers[i];
      const newId = addLayer(sl?.name || `Layer ${i + 1}`);
      const newPaths = (sl?.paths || []).map((p: any) => ({ ...p, layerId: newId }));
      updateLayer(newId, {
        visible: sl?.visible ?? true,
        locked: sl?.locked ?? false,
        opacity: sl?.opacity ?? 1,
        paths: newPaths,
      });
      lastId = newId;
    }

    setActiveLayerId(lastId);
    return true;
  };

  const handleSave = () => {
    const designData = {
      layers: vectorLayers,
      canvasSize,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designData));
    toast.success('Design saved locally!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const designData = JSON.parse(saved);
        const ok = loadFromDesignData(designData);
        if (ok) toast.success('Design loaded!');
      } catch (error) {
        toast.error('Failed to load design');
      }
    } else {
      toast.error('No saved design found');
    }
  };

  // Auto-load on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const designData = JSON.parse(saved);
        const ok = loadFromDesignData(designData);
        if (ok) toast.success('Restored your last design');
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on changes (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const designData = { layers: vectorLayers, canvasSize, timestamp: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(designData));
      } catch {
        // ignore
      }
    }, 400);
    return () => clearTimeout(id);
  }, [vectorLayers, canvasSize]);
  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-background to-muted/20 ${className}`}>
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vector Drawing Studio</h2>
              <p className="text-xs text-muted-foreground">Professional vector design and illustration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 px-3 py-1 bg-muted/50 rounded-lg border border-border/50">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleZoomChange(-25)}
                disabled={zoomLevel <= 25}
                className="h-7 w-7 p-0"
              >
                -
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center px-2">
                {zoomLevel}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleZoomChange(25)}
                disabled={zoomLevel >= 400}
                className="h-7 w-7 p-0"
              >
                +
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleLoad} className="h-8">
                <Upload size={14} className="mr-1.5" />
                Load
              </Button>
              <Button size="sm" variant="outline" onClick={handleSave} className="h-8">
                <Save size={14} className="mr-1.5" />
                Save
              </Button>
              <Button size="sm" onClick={exportSVG} className="h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Download size={14} className="mr-1.5" />
                Export SVG
              </Button>
              <Button size="sm" variant="outline" onClick={exportDXF} className="h-8">
                <FileText size={14} className="mr-1.5" />
                Export DXF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools and Layers */}
        <div className="w-80 bg-card/70 backdrop-blur-sm border-r border-border/50 flex flex-col rounded-tr-2xl"> 
          <Tabs defaultValue="tools" className="flex-1 flex flex-col"> 
            <TabsList className="grid w-full grid-cols-3 m-3 bg-muted/50 rounded-xl"> 
              <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger> 
              <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger> 
              <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="flex-1 p-2 m-0">
              <VectorToolbar vectorContext={vectorDrawingContext} />
            </TabsContent>
            
            <TabsContent value="colors" className="flex-1 p-2 m-0 overflow-auto">
              <VectorColorPicker vectorContext={vectorDrawingContext} className="w-full" />
            </TabsContent>
            
            <TabsContent value="layers" className="flex-1 p-2 m-0">
              <VectorLayersPanel vectorContext={vectorDrawingContext} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Quick Color Bar */}
          <div className="p-4 border-b border-border/50 bg-card/60 backdrop-blur-sm">
            <QuickColorBar vectorContext={vectorDrawingContext} />
          </div>
          
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-background rounded-xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm">
              <VectorDrawingCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                zoomLevel={zoomLevel}
                className="block"
                vectorContext={vectorDrawingContext}
                onMeasurementsChange={setMeasurements}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Measurements */}
        <div className="w-80 bg-card/70 backdrop-blur-sm border-l border-border/50 flex flex-col rounded-tl-2xl p-2">
          <VectorMeasurementsPanel vectorContext={vectorDrawingContext} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-background/80 backdrop-blur-sm border-t border-border/50 px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Canvas: {canvasSize.width} × {canvasSize.height}</span>
            <span>Zoom: {zoomLevel}%</span>
            <span>Layers: {vectorLayers.length}</span>
            <span>Paths: {getAllPaths().length}</span>
            {typeof measurements.segmentLength === 'number' && (
              <span className="px-2 py-0.5 rounded bg-muted/60 text-foreground border border-border/50">
                Len: {measurements.segmentLength.toFixed(1)}px • Angle: {measurements.angleDeg?.toFixed(1)}° • Total: {measurements.totalPathLength?.toFixed(1)}px
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Vector Drawing Studio v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorStudio;