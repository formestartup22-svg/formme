
import { useState, useCallback } from 'react';
import { DrawingTool } from "@/types/elements";

export const useCanvasDrawing = (activeTool: string | null, penColor: string, penSize: number) => {
  const [drawing, setDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([]);
  const [drawings, setDrawings] = useState<{points: {x: number, y: number}[], color: string, width: number, isErased?: boolean}[]>([]);
  const [currentTool, setCurrentTool] = useState<DrawingTool>(null);

  // Set current tool based on active tool
  const updateTool = (tool: DrawingTool) => {
    setCurrentTool(tool);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>, zoomLevel: number) => {
    if (activeTool !== "draw" && activeTool !== "eraser") return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    e.preventDefault();
    setDrawing(true);
    
    const scaleX = canvasRect.width / canvasRef.current.offsetWidth;
    const scaleY = canvasRect.height / canvasRef.current.offsetHeight;
    
    const x = ((e.clientX - canvasRect.left) * scaleX / (zoomLevel / 100));
    const y = ((e.clientY - canvasRect.top) * scaleY / (zoomLevel / 100));
    
    setDrawingPoints([{x, y}]);

    // If erasing, check for existing drawings to erase
    if (activeTool === "eraser") {
      const eraseRadius = penSize * 2;
      setDrawings(prev => prev.map(drawing => {
        if (drawing.isErased) return drawing;
        // Check if any point in the drawing is within erase radius
        const shouldErase = drawing.points.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          return distance <= eraseRadius;
        });
        
        return shouldErase ? { ...drawing, isErased: true } : drawing;
      }));
    }
  }, [activeTool, penSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>, zoomLevel: number) => {
    if (!drawing || (activeTool !== "draw" && activeTool !== "eraser")) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const scaleX = canvasRect.width / canvasRef.current.offsetWidth;
    const scaleY = canvasRect.height / canvasRef.current.offsetHeight;
    
    const x = ((e.clientX - canvasRect.left) * scaleX / (zoomLevel / 100));
    const y = ((e.clientY - canvasRect.top) * scaleY / (zoomLevel / 100));
    
    setDrawingPoints(prev => [...prev, {x, y}]);

    // If erasing, continuously check for drawings to erase
    if (activeTool === "eraser") {
      const eraseRadius = penSize * 2;
      setDrawings(prev => prev.map(drawing => {
        if (drawing.isErased) return drawing;
        
        // Check if any point in the drawing is within erase radius of current position
        const shouldErase = drawing.points.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          return distance <= eraseRadius;
        });
        
        return shouldErase ? { ...drawing, isErased: true } : drawing;
      }));
    }
  }, [drawing, activeTool, penSize]);

  const handleMouseUp = useCallback(() => {
    if (!drawing || (activeTool !== "draw" && activeTool !== "eraser")) return;
    
    setDrawing(false);
    
    // Only add a drawing stroke for the draw tool, not erase
    if (drawingPoints.length > 1 && activeTool === "draw") {
      setDrawings(prev => [...prev, {
        points: [...drawingPoints],
        color: penColor,
        width: penSize,
        isErased: false
      }]);
    }
    
    setDrawingPoints([]);
  }, [drawing, drawingPoints, activeTool, penColor, penSize]);

  // Filter out erased drawings when returning
  const visibleDrawings = drawings.filter(drawing => !drawing.isErased);

  return {
    drawing,
    drawingPoints,
    drawings: visibleDrawings,
    isErasing: activeTool === "eraser",
    currentTool,
    updateTool,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
