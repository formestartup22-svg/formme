import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useVectorDrawing, Point, AnchorPoint, VectorPath } from '@/hooks/useVectorDrawing';

type CanvasMeasurements = {
  segmentLength?: number;
  angleDeg?: number;
  totalPathLength?: number;
  units?: 'px';
};

interface VectorDrawingCanvasProps {
  width: number;
  height: number;
  zoomLevel: number;
  className?: string;
  vectorContext?: ReturnType<typeof useVectorDrawing>;
  onMeasurementsChange?: (info: CanvasMeasurements) => void;
}

const VectorDrawingCanvas = ({ width, height, zoomLevel, className = '', vectorContext, onMeasurementsChange }: VectorDrawingCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use provided context or create new one (fallback)
  const fallbackContext = useVectorDrawing();
  const context = vectorContext || fallbackContext;
  
  const {
    vectorLayers,
    currentTool,
    selectedPathIds,
    selectedAnchorIds,
    isDrawing,
    currentPath,
    startPath,
    addPointToPath,
    addPointToExistingPath,
    finishPath,
    selectPath,
    selectAnchor,
    clearSelection,
    updateAnchorPoint,
    generatePathData,
    getAllPaths,
    startDrag,
    updateDrag,
    endDrag,
    isCreatingBezier,
    bezierStartPoint,
    startBezierCreation,
    updateBezierCreation,
    finishBezierCreation,
    convertPointType,
    convertToBezier,
    convertSelectedToBezier,
    applyColorToPath,
    applyColorToArea,
    strokeColor,
    fillColor,
    connectPoints
  } = context;

  const [cursorPoint, setCursorPoint] = useState<Point | null>(null);

  const calcDistance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
  const calcAngleDeg = (a: Point, b: Point) => {
    const rad = Math.atan2(b.y - a.y, b.x - a.x);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  };
  const calcPathLength = (anchors: AnchorPoint[]) => {
    let len = 0;
    for (let i = 1; i < anchors.length; i++) {
      len += calcDistance(anchors[i - 1], anchors[i]);
    }
    return len;
  };
  const getAnchorById = (id: string): { anchor: AnchorPoint; pathId: string } | null => {
    for (const layer of vectorLayers) {
      for (const p of layer.paths) {
        const a = p.points.find(pt => pt.id === id);
        if (a) return { anchor: a, pathId: p.id };
      }
    }
    return null;
  };

  // State for point connection mode
  const [connectionMode, setConnectionMode] = useState(false);
  const [firstSelectedPoint, setFirstSelectedPoint] = useState<{pathId: string, anchorId: string} | null>(null);

  // Update connection mode when tool changes
  useEffect(() => {
    if (currentTool === 'connect') {
      setConnectionMode(true);
    } else {
      setConnectionMode(false);
      setFirstSelectedPoint(null);
    }
  }, [currentTool]);

  // Convert mouse coordinates to canvas coordinates
  const getCanvasPoint = useCallback((e: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX / (zoomLevel / 100),
      y: (e.clientY - rect.top) * scaleY / (zoomLevel / 100)
    };
  }, [width, height, zoomLevel]);

  // Calculate the closest point on a line segment
  const getClosestPointOnSegment = useCallback((point: Point, start: Point, end: Point) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return start;
    
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)));
    
    return {
      x: start.x + t * dx,
      y: start.y + t * dy,
      t // parameter for insertion
    };
  }, []);

  // Find path segment clicked and add point
  const findAndAddPointToPath = useCallback((clickPoint: Point) => {
    const threshold = 10; // pixels
    
    for (const path of getAllPaths()) {
      for (let i = 0; i < path.points.length - 1; i++) {
        const start = path.points[i];
        const end = path.points[i + 1];
        
        const closest = getClosestPointOnSegment(clickPoint, start, end);
        const distance = Math.sqrt(
          Math.pow(clickPoint.x - closest.x, 2) + Math.pow(clickPoint.y - closest.y, 2)
        );
        
        if (distance <= threshold) {
          // Add point to this segment, automatically as bezier if using bezier tool
          addPointToExistingPath(path.id, closest, i + 1, currentTool === 'bezier');
          return true;
        }
      }
    }
    return false;
  }, [getAllPaths, getClosestPointOnSegment, addPointToExistingPath, currentTool]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);

    // Check if we clicked on an existing element (this will be handled by the element's own mouseDown)
    const target = e.target as SVGElement;
    if (target.tagName === 'circle') {
      // Let the anchor point handle the click - NEVER create new paths when clicking anchors
      return;
    }

    // Handle clicking on paths
    if (target.tagName === 'path') {
      // For path clicks, let the path handle the click (no auto-point addition)
      return;
    }

    // Check if we clicked inside a closed path for area selection with better color application
    if (currentTool === 'select') {
      console.log('Attempting area color application at point:', point);
      if (applyColorToArea(point, fillColor, 'fill')) {
        console.log('Successfully applied color to area');
        return;
      }
      console.log('No area found for color application');
    }

    // Only handle canvas clicks (empty space) - NEVER when clicking on elements
    if (currentTool === 'pen') {
      if (!isDrawing) {
        startPath(point);
      } else {
        addPointToPath(point);
      }
    } else if (currentTool === 'bezier') {
      // ONLY create new paths when clicking empty space, not on elements
      // And only if we're not already drawing
      if (!isDrawing && !isCreatingBezier) {
        startPath(point); // Start a regular path, bezier curves will be handled by point conversion
      }
    } else if (currentTool === 'select' || currentTool === 'direct-select') {
      // Clear selection when clicking empty space
      clearSelection();
    }
  }, [currentTool, isDrawing, isCreatingBezier, selectedAnchorIds, startPath, addPointToPath, clearSelection, getCanvasPoint, findAndAddPointToPath, applyColorToArea, fillColor]);

  // Handle connection mode clicks
  const handleConnectionClick = useCallback((anchorId: string, pathId: string) => {
    console.log('handleConnectionClick called:', { anchorId, pathId, firstSelectedPoint });
    
    if (!firstSelectedPoint) {
      // First point selected
      setFirstSelectedPoint({ pathId, anchorId });
      console.log('First point selected for connection:', { pathId, anchorId });
    } else {
      // Second point selected, create connection
      console.log('Second point selected, creating connection:', { pathId, anchorId });
      console.log('Calling connectPoints with:', {
        sourcePathId: firstSelectedPoint.pathId,
        sourceAnchorId: firstSelectedPoint.anchorId,
        targetPathId: pathId,
        targetAnchorId: anchorId
      });
      
      const success = connectPoints(firstSelectedPoint.pathId, firstSelectedPoint.anchorId, pathId, anchorId);
      console.log('Connection result:', success);
      
      // Reset connection mode
      setFirstSelectedPoint(null);
      if (currentTool !== 'connect') {
        setConnectionMode(false);
      }
    }
  }, [firstSelectedPoint, connectPoints, currentTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    setCursorPoint(point);
    // Handle other drag operations (removed bezier creation preview)
    updateDrag(point);
  }, [getCanvasPoint, updateDrag]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    
    // Handle drag operations (removed bezier creation completion)
    endDrag(point);
  }, [endDrag, getCanvasPoint]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'pen' || currentTool === 'bezier') {
      if (isDrawing) {
        // Double-click to close the path if it has 3+ points
        finishPath(currentPath && currentPath.points.length >= 3);
      }
    }
  }, [currentTool, isDrawing, finishPath, currentPath]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore shortcuts while typing in inputs/textarea/select or contenteditable
    const t = e.target as HTMLElement | null;
    if (t) {
      const tag = t.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
      if (isEditable) return;
    }
    if (e.key === 'Escape') {
      if (isDrawing) {
        finishPath(false);
      } else if (connectionMode) {
        setConnectionMode(false);
        setFirstSelectedPoint(null);
      }
    } else if (e.key === 'Enter' && isDrawing) {
      finishPath(true); // Close path
    } else if (e.key === 'c' && e.ctrlKey) {
      // Ctrl+C to enter connection mode
      setConnectionMode(!connectionMode);
      setFirstSelectedPoint(null);
      console.log('Connection mode:', !connectionMode);
    }
  }, [isDrawing, finishPath, connectionMode]);

  useEffect(() => {
    if (!onMeasurementsChange) return;
    if (isDrawing && currentPath && cursorPoint) {
      const pts = currentPath.points;
      const last = pts[pts.length - 1];
      const segmentLength = calcDistance(last, cursorPoint);
      const angleDeg = calcAngleDeg(last, cursorPoint);
      const totalPathLength = calcPathLength(pts) + segmentLength;
      onMeasurementsChange({ segmentLength, angleDeg, totalPathLength, units: 'px' });
    } else {
      onMeasurementsChange({});
    }
  }, [cursorPoint, isDrawing, currentPath, onMeasurementsChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Render anchor point
  const renderAnchorPoint = (anchor: AnchorPoint, pathId: string, index: number) => {
    const isSelected = selectedAnchorIds.includes(anchor.id);
    const showControls = isSelected || currentTool === 'direct-select' || currentTool === 'bezier' || anchor.type === 'smooth';
    
    return (
      <g key={anchor.id}>
        {/* Control handles for bezier curves */}
        {showControls && anchor.controlIn && (
          <>
            <line
              x1={anchor.x}
              y1={anchor.y}
              x2={anchor.controlIn.x}
              y2={anchor.controlIn.y}
              stroke="#0088ff"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <circle
              cx={anchor.controlIn.x}
              cy={anchor.controlIn.y}
              r="4"
              fill="#0088ff"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              className="hover:fill-blue-600"
              onMouseDown={(e) => {
                e.stopPropagation();
                if (currentTool === 'direct-select' || currentTool === 'select') {
                  const point = getCanvasPoint(e as any);
                  startDrag('control-in', anchor.id, pathId, point);
                }
              }}
            />
          </>
        )}
        
        {showControls && anchor.controlOut && (
          <>
            <line
              x1={anchor.x}
              y1={anchor.y}
              x2={anchor.controlOut.x}
              y2={anchor.controlOut.y}
              stroke="#0088ff"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <circle
              cx={anchor.controlOut.x}
              cy={anchor.controlOut.y}
              r="4"
              fill="#0088ff"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              className="hover:fill-blue-600"
              onMouseDown={(e) => {
                e.stopPropagation();
                if (currentTool === 'direct-select' || currentTool === 'select') {
                  const point = getCanvasPoint(e as any);
                  startDrag('control-out', anchor.id, pathId, point);
                }
              }}
            />
          </>
        )}
        
        {/* Anchor point */}
        <circle
          cx={anchor.x}
          cy={anchor.y}
          r={isSelected ? "6" : "5"}
          fill={
            (connectionMode || currentTool === 'connect') && firstSelectedPoint?.anchorId === anchor.id 
              ? "#00ff00" 
              : anchor.type === 'smooth' 
                ? "#00ff88" 
                : (isSelected ? "#ff4400" : "#0088ff")
          }
          stroke="white"
          strokeWidth="2"
          style={{ cursor: (connectionMode || currentTool === 'connect') ? 'crosshair' : (currentTool === 'direct-select' ? 'move' : 'pointer') }}
          className="hover:fill-orange-500"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Anchor clicked:', { anchorId: anchor.id, pathId, currentTool, connectionMode });
            
            if (connectionMode || currentTool === 'connect') {
              console.log('Triggering connection click');
              handleConnectionClick(anchor.id, pathId);
            } else if (currentTool === 'bezier') {
              // Convert point to smooth/curved when using bezier tool
              console.log('Converting point to smooth with bezier tool:', { pathId, anchorId: anchor.id, currentType: anchor.type });
              if (anchor.type === 'corner') {
                convertPointType(pathId, anchor.id, 'smooth');
                console.log('Point converted from corner to smooth');
              } else {
                console.log('Point is already smooth, converting back to corner');
                convertPointType(pathId, anchor.id, 'corner');
              }
            } else if (currentTool === 'select' || currentTool === 'direct-select') {
              selectAnchor(anchor.id, e.ctrlKey || e.metaKey);
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            console.log('Anchor mouseDown:', { tool: currentTool, anchorId: anchor.id });
            
            if (currentTool === 'direct-select' || currentTool === 'select') {
              if (!connectionMode) {
                const point = getCanvasPoint(e as any);
                startDrag('anchor', anchor.id, pathId, point);
                selectAnchor(anchor.id, e.ctrlKey || e.metaKey);
              }
            } else if (currentTool === 'bezier') {
              // Do nothing on mousedown so click can toggle curve cleanly
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (currentTool === 'direct-select' || currentTool === 'select') {
              // Double-click to convert between corner and smooth - this curves the connecting lines
              const newType = anchor.type === 'smooth' ? 'corner' : 'smooth';
              convertPointType(pathId, anchor.id, newType);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Right-click to convert to bezier curve with custom curve strength
            if (anchor.type === 'corner') {
              convertToBezier(pathId, anchor.id, 'auto', 60);
            }
          }}
        />
      </g>
    );
  };

  // Render vector path
  const renderPath = (path: VectorPath) => {
    const isSelected = selectedPathIds.includes(path.id);
    const pathData = generatePathData(path);
    
    if (!pathData) return null;

    return (
      <g key={path.id}>
        {/* Main path */}
        <path
          d={pathData}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fill={path.fillOpacity > 0 ? path.fill : 'none'}
          fillOpacity={path.fillOpacity}
          style={{ cursor: 'pointer' }}
          className="vector-path"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Path clicked:', path.id, 'Tool:', currentTool);
            if (currentTool === 'select' || currentTool === 'direct-select') {
              selectPath(path.id, e.ctrlKey || e.metaKey);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            console.log('Path double-clicked:', path.id, 'Fill color:', fillColor);
            // Double-click to quickly apply fill color
            if (currentTool === 'select') {
              applyColorToPath(path.id, fillColor, 'fill');
            }
          }}
        />
        
        {/* Selection highlight */}
        {isSelected && (
          <path
            d={pathData}
            stroke="#ff4400"
            strokeWidth={Math.max(path.strokeWidth + 2, 3)}
            fill="none"
            opacity="0.5"
            pointerEvents="none"
          />
        )}
        
        {/* Anchor points (show when path is selected, using direct-select, or using bezier tool) */}
        {(isSelected || currentTool === 'direct-select' || currentTool === 'bezier') && 
          path.points.map((anchor, index) => renderAnchorPoint(anchor, path.id, index))
        }

        {/* Segment length labels for selected paths */}
        {isSelected && path.points.length > 1 && (
          <g pointerEvents="none">
            {path.points.slice(1).map((pt, idx) => {
              const prev = path.points[idx];
              const len = calcDistance(prev, pt);
              const midX = (prev.x + pt.x) / 2;
              const midY = (prev.y + pt.y) / 2;
              return (
                <text
                  key={`label-${path.id}-${idx}`}
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  className="select-none fill-current text-primary"
                  fontSize={10}
                >
                  {len.toFixed(2)}
                </text>
              );
            })}
          </g>
        )}
      </g>
    );
  };

  const allPaths = getAllPaths();

  return (
    <div 
      ref={canvasRef}
      className={`relative ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Render all paths from visible layers */}
        {vectorLayers.map(layer => {
          if (!layer.visible) return null;
          
          return (
            <g key={layer.id} opacity={layer.opacity}>
              {layer.paths.map(renderPath)}
            </g>
          );
        })}
        
        {/* Render current path being drawn */}
        {currentPath && isDrawing && (
          <g>
            <path
              d={generatePathData(currentPath)}
              stroke={currentPath.stroke}
              strokeWidth={currentPath.strokeWidth}
              fill="none"
              opacity="0.7"
            />
            {currentPath.points.map((anchor, index) => renderAnchorPoint(anchor, currentPath.id, index))}
            {currentPath.points.length > 1 && (
              <g pointerEvents="none">
                {currentPath.points.slice(1).map((pt, idx) => {
                  const prev = currentPath.points[idx];
                  const len = calcDistance(prev, pt);
                  const midX = (prev.x + pt.x) / 2;
                  const midY = (prev.y + pt.y) / 2;
                  return (
                    <text
                      key={`label-current-${idx}`}
                      x={midX}
                      y={midY - 6}
                      textAnchor="middle"
                      className="select-none fill-current text-primary"
                      fontSize={10}
                    >
                      {len.toFixed(2)}
                    </text>
                  );
                })}
              </g>
            )}
          </g>
        )}
      </svg>
      
      {/* Measurements overlay while drawing */}
      {isDrawing && currentPath && cursorPoint && (() => {
        const pts = currentPath.points;
        const last = pts[pts.length - 1];
        const midX = (last.x + cursorPoint.x) / 2;
        const midY = (last.y + cursorPoint.y) / 2;
        const segLen = calcDistance(last, cursorPoint);
        const ang = calcAngleDeg(last, cursorPoint);
        return (
          <div
            className="absolute pointer-events-none select-none text-[11px]"
            style={{ left: midX, top: midY, transform: 'translate(-50%, -120%)' }}
          >
            <div className="px-2 py-1 rounded-md bg-popover/90 text-popover-foreground shadow border border-border">
              {segLen.toFixed(1)} px • {ang.toFixed(1)}°
            </div>
          </div>
        );
      })()}
      
      {/* Instructions overlay */}
      {currentTool === 'pen' && (
        <div className="absolute top-2 left-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
          {isDrawing 
            ? "Click to add points • Double-click to close shape (3+ points) or finish line • Esc to cancel"
            : "Click to start drawing straight lines"
          }
        </div>
      )}
      {currentTool === 'bezier' && (
        <div className="absolute top-2 left-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
          {isDrawing 
            ? "Click to add points • Double-click to close/finish • ✨ Click points after drawing to curve them"
            : "✨ Click existing anchor points to curve connecting lines • Click empty space to start new path"
          }
        </div>
      )}
      {currentTool === 'connect' && (
        <div className="absolute top-2 left-2 bg-green-900/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
          <div className="font-medium">🔗 Connect Mode Active</div>
          <div className="mt-1">
            {firstSelectedPoint 
              ? "Click second point to connect (green point will be connected)"
              : "Click first point to start connection"
            }
          </div>
        </div>
      )}
      {(currentTool === 'direct-select' || currentTool === 'select') && (
        <div className="absolute top-2 left-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
          <div>🎯 Click points to select • 🎨 Click inside shapes to fill • ↕️ Drag to move</div>
          <div className="mt-1">
            📐 <strong>Double-click</strong> point: curve connecting lines ↔ straight lines
          </div>
          <div className="mt-1 text-yellow-300">
            🔗 Press <kbd className="bg-white/20 px-1 rounded">Ctrl+C</kbd> to {connectionMode ? 'exit' : 'enter'} connection mode
            {connectionMode && firstSelectedPoint && <span className="text-green-300"> • Select second point to connect</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VectorDrawingCanvas;
