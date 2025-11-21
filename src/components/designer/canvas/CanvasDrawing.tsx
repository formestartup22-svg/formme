
import React from 'react';

interface CanvasDrawingProps {
  drawings: {points: {x: number, y: number}[], color: string, width: number}[];
  currentDrawing: {
    isDrawing: boolean;
    points: {x: number, y: number}[];
    isErasing: boolean;
    penColor: string;
    penSize: number;
  };
}

const CanvasDrawing = ({ drawings, currentDrawing }: CanvasDrawingProps) => {
  const getSvgPathFromPoints = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      width="100%" 
      height="100%"
      style={{ zIndex: 10 }}
    >
      {/* Render all completed drawings */}
      {drawings.map((drawing, index) => (
        <path 
          key={`drawing-${index}`}
          d={getSvgPathFromPoints(drawing.points)} 
          stroke={drawing.color}
          strokeWidth={drawing.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      
      {/* Render current drawing stroke (only for draw tool) */}
      {currentDrawing.isDrawing && !currentDrawing.isErasing && currentDrawing.points.length > 1 && (
        <path 
          d={getSvgPathFromPoints(currentDrawing.points)} 
          stroke={currentDrawing.penColor}
          strokeWidth={currentDrawing.penSize}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      
      {/* Show eraser cursor when erasing */}
      {currentDrawing.isErasing && currentDrawing.points.length > 0 && (
        <circle
          cx={currentDrawing.points[currentDrawing.points.length - 1]?.x || 0}
          cy={currentDrawing.points[currentDrawing.points.length - 1]?.y || 0}
          r={currentDrawing.penSize * 2}
          fill="rgba(255, 0, 0, 0.2)"
          stroke="rgba(255, 0, 0, 0.5)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}
    </svg>
  );
};

export default CanvasDrawing;
