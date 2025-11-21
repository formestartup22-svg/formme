import { useState, useCallback, useRef, useEffect } from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint extends Point {
  type: 'in' | 'out';
}

export interface AnchorPoint extends Point {
  id: string;
  controlIn?: ControlPoint;
  controlOut?: ControlPoint;
  selected?: boolean;
  type?: 'corner' | 'smooth'; // Add point type
}

export interface VectorPath {
  id: string;
  points: AnchorPoint[];
  closed: boolean;
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
  selected?: boolean;
  layerId: string;
}

export interface VectorLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  paths: VectorPath[];
}

export type VectorTool = 'select' | 'pen' | 'bezier' | 'direct-select' | 'connect' | null;

export const useVectorDrawing = () => {
  const [vectorLayers, setVectorLayers] = useState<VectorLayer[]>([
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1,
      paths: []
    }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const [currentTool, setCurrentTool] = useState<VectorTool>('pen');
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([]);
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<VectorPath | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('#a031a0');
  const [fillOpacity, setFillOpacity] = useState(0.6);
  const [isCreatingBezier, setIsCreatingBezier] = useState(false);
  const [bezierStartPoint, setBezierStartPoint] = useState<Point | null>(null);
  
  // Track previous active layer to safely handle in-progress paths on switch
  const prevActiveLayerId = useRef(activeLayerId);
  
  // On layer switch, commit in-progress path to previous layer to avoid loss and prevent cross-layer connections
  useEffect(() => {
    if (prevActiveLayerId.current !== activeLayerId) {
      if (isDrawing && currentPath) {
        const finalPath = {
          ...currentPath,
          // Do not auto-close when switching layers
          closed: currentPath.points.length >= 3 ? currentPath.closed : false,
          fillOpacity: currentPath.closed ? fillOpacity : 0,
        };
        setVectorLayers(prev => prev.map(layer =>
          layer.id === prevActiveLayerId.current
            ? { ...layer, paths: [...layer.paths, finalPath] }
            : layer
        ));
      }
      setCurrentPath(null);
      setIsDrawing(false);
      setSelectedAnchorIds([]);
      setSelectedPathIds([]);
      prevActiveLayerId.current = activeLayerId;
    }
  }, [activeLayerId]);
  
  const dragState = useRef<{
    isDragging: boolean;
    dragType: 'anchor' | 'control-in' | 'control-out' | 'bezier-create' | 'path' | null;
    targetId: string | null;
    targetPathId: string | null;
    startPoint: Point | null;
    originalControlPoint: Point | null;
  }>({
    isDragging: false,
    dragType: null,
    targetId: null,
    targetPathId: null,
    startPoint: null,
    originalControlPoint: null
  });

  // Layer management
  const addLayer = useCallback((name: string = `Layer ${vectorLayers.length + 1}`) => {
    const newLayer: VectorLayer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      paths: []
    };
    setVectorLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    return newLayer.id;
  }, [vectorLayers.length]);

  const deleteLayer = useCallback((layerId: string) => {
    if (vectorLayers.length <= 1) return; // Keep at least one layer
    
    setVectorLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (activeLayerId === layerId) {
      const remainingLayers = vectorLayers.filter(layer => layer.id !== layerId);
      setActiveLayerId(remainingLayers[0]?.id || '');
    }
  }, [vectorLayers, activeLayerId]);

  const updateLayer = useCallback((layerId: string, updates: Partial<VectorLayer>) => {
    setVectorLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  // Add point to existing path at specific position
  const addPointToExistingPath = useCallback((pathId: string, point: Point, insertIndex: number, asBezier: boolean = false) => {
    setVectorLayers(prevLayers => 
      prevLayers.map(layer => ({
        ...layer,
        paths: layer.paths.map(path => {
          if (path.id === pathId) {
            const newAnchor: AnchorPoint = {
              id: `anchor-${Date.now()}`,
              x: point.x,
              y: point.y,
              type: asBezier ? 'smooth' : 'corner'
            };

            // If adding as bezier, automatically add control handles
            if (asBezier) {
              const prevPoint = insertIndex > 0 ? path.points[insertIndex - 1] : null;
              const nextPoint = insertIndex < path.points.length ? path.points[insertIndex] : null;
              
              if (prevPoint && nextPoint) {
                // Calculate control handles based on neighboring points
                const prevDistance = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2));
                const nextDistance = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
                const handleLength = Math.min(prevDistance, nextDistance) * 0.3;
                
                const inAngle = Math.atan2(prevPoint.y - point.y, prevPoint.x - point.x);
                const outAngle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
                
                newAnchor.controlIn = {
                  x: point.x + Math.cos(inAngle) * handleLength,
                  y: point.y + Math.sin(inAngle) * handleLength,
                  type: 'in'
                };
                
                newAnchor.controlOut = {
                  x: point.x + Math.cos(outAngle) * handleLength,
                  y: point.y + Math.sin(outAngle) * handleLength,
                  type: 'out'
                };
              }
            }
            
            const newPoints = [...path.points];
            newPoints.splice(insertIndex, 0, newAnchor);
            
            // Select the newly added point
            setSelectedAnchorIds([newAnchor.id]);
            
            return {
              ...path,
              points: newPoints
            };
          }
          return path;
        })
      }))
    );
  }, []);


  // Path creation and management
  const startPath = useCallback((point: Point) => {
    if (!activeLayerId || (currentTool !== 'pen' && currentTool !== 'bezier')) return;

    const newPath: VectorPath = {
      id: `path-${Date.now()}`,
      points: [{
        id: `anchor-${Date.now()}`,
        x: point.x,
        y: point.y,
        selected: true,
        type: currentTool === 'bezier' ? 'smooth' : 'corner'
      }],
      closed: false,
      stroke: strokeColor,
      strokeWidth,
      fill: fillColor,
      fillOpacity,
      layerId: activeLayerId
    };

    setCurrentPath(newPath);
    setIsDrawing(true);
  }, [activeLayerId, currentTool, strokeColor, strokeWidth, fillColor, fillOpacity]);

  const addPointToPath = useCallback((point: Point, controlOut?: ControlPoint) => {
    if (!currentPath || !isDrawing) return;

    const newAnchor: AnchorPoint = {
      id: `anchor-${Date.now()}`,
      x: point.x,
      y: point.y,
      selected: true,
      type: currentTool === 'bezier' ? 'smooth' : 'corner'
    };

    // For bezier tool, add control points with better spacing
    if (currentTool === 'bezier') {
      const distance = 30; // Control handle distance
      newAnchor.controlIn = { x: point.x - distance, y: point.y, type: 'in' };
      newAnchor.controlOut = controlOut || { x: point.x + distance, y: point.y, type: 'out' };
    }

    setCurrentPath(prev => prev ? {
      ...prev,
      points: [...prev.points.map(p => ({ ...p, selected: false })), newAnchor]
    } : null);
  }, [currentPath, isDrawing, currentTool]);

  const finishPath = useCallback((closed: boolean = false) => {
    if (!currentPath) return;

    // Auto-close path if it has 3+ points and user tries to close
    const shouldAutoClose = closed && currentPath.points.length >= 3;
    const finalPath = { 
      ...currentPath, 
      closed: shouldAutoClose,
      // Ensure fill opacity is applied if path is closed
      fillOpacity: shouldAutoClose ? fillOpacity : 0
    };
    
    setVectorLayers(prev => prev.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, paths: [...layer.paths, finalPath] }
        : layer
    ));

    setCurrentPath(null);
    setIsDrawing(false);
    setSelectedPathIds([finalPath.id]);
  }, [currentPath, activeLayerId, fillOpacity]);

  const deletePath = useCallback((pathId: string) => {
    setVectorLayers(prev => prev.map(layer => ({
      ...layer,
      paths: layer.paths.filter(path => path.id !== pathId)
    })));
    setSelectedPathIds(prev => prev.filter(id => id !== pathId));
  }, []);

  const updatePath = useCallback((pathId: string, updates: Partial<VectorPath>) => {
    setVectorLayers(prev => prev.map(layer => ({
      ...layer,
      paths: layer.paths.map(path => 
        path.id === pathId ? { ...path, ...updates } : path
      )
    })));
  }, []);

  // Anchor point management
  const updateAnchorPoint = useCallback((pathId: string, anchorId: string, updates: Partial<AnchorPoint>) => {
    console.log('updateAnchorPoint called:', { pathId, anchorId, updates });
    setVectorLayers(prev => {
      const newLayers = prev.map(layer => ({
        ...layer,
        paths: layer.paths.map(path => 
          path.id === pathId 
            ? {
                ...path,
                points: path.points.map(point => 
                  point.id === anchorId ? { ...point, ...updates } : point
                )
              }
            : path
        )
      }));
      console.log('New vector layers after anchor update:', newLayers);
      return newLayers;
    });
  }, []);

  // Update anchor of in-progress currentPath (not yet committed to a layer)
  const updateCurrentPathAnchor = useCallback((anchorId: string, updates: Partial<AnchorPoint>) => {
    setCurrentPath(prev => {
      if (!prev) return prev;
      return { ...prev, points: prev.points.map(pt => pt.id === anchorId ? { ...pt, ...updates } : pt) };
    });
  }, []);

  // Convert anchor point to bezier with intelligent curve handles
  const convertToBezier = useCallback((pathId: string, anchorId: string, curveDirection: 'auto' | 'up' | 'down' = 'auto', strength: number = 50) => {
    const path = vectorLayers.find(layer => layer.paths.find(p => p.id === pathId))?.paths.find(p => p.id === pathId);
    if (!path) return;

    const anchorIndex = path.points.findIndex(p => p.id === anchorId);
    if (anchorIndex === -1) return;

    const anchor = path.points[anchorIndex];
    const prevPoint = anchorIndex > 0 ? path.points[anchorIndex - 1] : null;
    const nextPoint = anchorIndex < path.points.length - 1 ? path.points[anchorIndex + 1] : null;

    // Calculate intelligent control handle positions
    let controlInX = anchor.x;
    let controlInY = anchor.y;
    let controlOutX = anchor.x;
    let controlOutY = anchor.y;

    if (prevPoint && nextPoint) {
      // Middle point - create smooth symmetric handles
      const dx = nextPoint.x - prevPoint.x;
      const dy = nextPoint.y - prevPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = Math.min(distance * 0.25, strength);
      
      // Create tangent direction
      const tangentX = dx / distance;
      const tangentY = dy / distance;
      
      // Apply curve direction bias for cloth-like shapes
      let curveBias = 0;
      if (curveDirection === 'up') curveBias = -20;
      else if (curveDirection === 'down') curveBias = 20;
      else {
        // Auto-detect curve direction based on shape context
        curveBias = anchor.y > (prevPoint.y + nextPoint.y) / 2 ? 15 : -15;
      }
      
      controlInX = anchor.x - tangentX * normalizedDistance;
      controlInY = anchor.y - tangentY * normalizedDistance + curveBias;
      controlOutX = anchor.x + tangentX * normalizedDistance;
      controlOutY = anchor.y + tangentY * normalizedDistance + curveBias;
    } else if (prevPoint) {
      // End point - create natural handle towards previous point
      const dx = anchor.x - prevPoint.x;
      const dy = anchor.y - prevPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const handleDistance = Math.min(distance * 0.4, strength);
      
      const tangentX = dx / distance;
      const tangentY = dy / distance;
      
      controlInX = anchor.x - tangentX * handleDistance;
      controlInY = anchor.y - tangentY * handleDistance;
      // Mirror for smooth transition
      controlOutX = anchor.x + tangentX * handleDistance * 0.6;
      controlOutY = anchor.y + tangentY * handleDistance * 0.6;
    } else if (nextPoint) {
      // Start point - create natural handle towards next point
      const dx = nextPoint.x - anchor.x;
      const dy = nextPoint.y - anchor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const handleDistance = Math.min(distance * 0.4, strength);
      
      const tangentX = dx / distance;
      const tangentY = dy / distance;
      
      controlOutX = anchor.x + tangentX * handleDistance;
      controlOutY = anchor.y + tangentY * handleDistance;
      // Mirror for smooth transition
      controlInX = anchor.x - tangentX * handleDistance * 0.6;
      controlInY = anchor.y - tangentY * handleDistance * 0.6;
    }

    // Update the anchor point to smooth type with control handles
    updateAnchorPoint(pathId, anchorId, {
      type: 'smooth',
      controlIn: prevPoint ? { x: controlInX, y: controlInY, type: 'in' } : undefined,
      controlOut: nextPoint ? { x: controlOutX, y: controlOutY, type: 'out' } : undefined
    });
  }, [vectorLayers, updateAnchorPoint]);

  // Update point position and adjust curves
  const updatePointWithCurves = useCallback((pathId: string, anchorId: string, newPosition: Point, originalPosition: Point) => {
    const path = vectorLayers.find(layer => layer.paths.find(p => p.id === pathId))?.paths.find(p => p.id === pathId);
    if (!path) return;

    const anchorIndex = path.points.findIndex(p => p.id === anchorId);
    if (anchorIndex === -1) return;

    const anchor = path.points[anchorIndex];
    const prevPoint = anchorIndex > 0 ? path.points[anchorIndex - 1] : null;
    const nextPoint = anchorIndex < path.points.length - 1 ? path.points[anchorIndex + 1] : null;

    // Calculate vertical movement to determine curve strength
    const deltaY = newPosition.y - originalPosition.y;
    const curveStrength = Math.abs(deltaY) * 0.5;
    
    // Update the anchor position
    const updatedAnchor: Partial<AnchorPoint> = {
      x: newPosition.x,
      y: newPosition.y
    };

    // Add or update control handles if there's significant vertical movement
    if (Math.abs(deltaY) > 5) {
      if (prevPoint && nextPoint) {
        // Middle point - create smooth curve through the point
        const prevDistance = Math.sqrt(Math.pow(anchor.x - prevPoint.x, 2) + Math.pow(anchor.y - prevPoint.y, 2));
        const nextDistance = Math.sqrt(Math.pow(nextPoint.x - anchor.x, 2) + Math.pow(nextPoint.y - anchor.y, 2));
        
        const handleLength = Math.min(prevDistance, nextDistance) * 0.3;
        
        // Calculate handle directions
        const inAngle = Math.atan2(prevPoint.y - anchor.y, prevPoint.x - anchor.x);
        const outAngle = Math.atan2(nextPoint.y - anchor.y, nextPoint.x - anchor.x);
        
        updatedAnchor.controlIn = {
          x: newPosition.x + Math.cos(inAngle) * handleLength,
          y: newPosition.y + Math.sin(inAngle) * handleLength + deltaY * 0.3,
          type: 'in'
        };
        
        updatedAnchor.controlOut = {
          x: newPosition.x + Math.cos(outAngle) * handleLength,
          y: newPosition.y + Math.sin(outAngle) * handleLength + deltaY * 0.3,
          type: 'out'
        };
      } else if (prevPoint) {
        // End point
        const distance = Math.sqrt(Math.pow(anchor.x - prevPoint.x, 2) + Math.pow(anchor.y - prevPoint.y, 2));
        const handleLength = distance * 0.3;
        const angle = Math.atan2(prevPoint.y - anchor.y, prevPoint.x - anchor.x);
        
        updatedAnchor.controlIn = {
          x: newPosition.x + Math.cos(angle) * handleLength,
          y: newPosition.y + Math.sin(angle) * handleLength + deltaY * 0.3,
          type: 'in'
        };
      } else if (nextPoint) {
        // Start point
        const distance = Math.sqrt(Math.pow(nextPoint.x - anchor.x, 2) + Math.pow(nextPoint.y - anchor.y, 2));
        const handleLength = distance * 0.3;
        const angle = Math.atan2(nextPoint.y - anchor.y, nextPoint.x - anchor.x);
        
        updatedAnchor.controlOut = {
          x: newPosition.x + Math.cos(angle) * handleLength,
          y: newPosition.y + Math.sin(angle) * handleLength + deltaY * 0.3,
          type: 'out'
        };
      }
    }

    updateAnchorPoint(pathId, anchorId, updatedAnchor);
  }, [vectorLayers, updateAnchorPoint]);

  // Convert point type between corner and smooth
  const convertPointType = useCallback((pathId: string, anchorId: string, newType: 'corner' | 'smooth') => {
    const path = vectorLayers.find(layer => layer.paths.find(p => p.id === pathId))?.paths.find(p => p.id === pathId);
    if (!path) return;

    const anchorIndex = path.points.findIndex(p => p.id === anchorId);
    if (anchorIndex === -1) return;

    const anchor = path.points[anchorIndex];
    const prevPoint = anchorIndex > 0 ? path.points[anchorIndex - 1] : null;
    const nextPoint = anchorIndex < path.points.length - 1 ? path.points[anchorIndex + 1] : null;

    const updatedAnchor: Partial<AnchorPoint> = { type: newType };

    if (newType === 'smooth') {
      // Add control handles for this anchor
      if (prevPoint && nextPoint) {
        const prevDistance = Math.hypot(anchor.x - prevPoint.x, anchor.y - prevPoint.y);
        const nextDistance = Math.hypot(nextPoint.x - anchor.x, nextPoint.y - anchor.y);
        const handleLength = Math.min(prevDistance, nextDistance) * 0.3;
        const inAngle = Math.atan2(prevPoint.y - anchor.y, prevPoint.x - anchor.x);
        const outAngle = Math.atan2(nextPoint.y - anchor.y, nextPoint.x - anchor.x);
        updatedAnchor.controlIn = { x: anchor.x + Math.cos(inAngle) * handleLength, y: anchor.y + Math.sin(inAngle) * handleLength, type: 'in' };
        updatedAnchor.controlOut = { x: anchor.x + Math.cos(outAngle) * handleLength, y: anchor.y + Math.sin(outAngle) * handleLength, type: 'out' };
      } else if (prevPoint && !nextPoint) {
        const distance = Math.hypot(anchor.x - prevPoint.x, anchor.y - prevPoint.y);
        const handleLength = distance * 0.3;
        const inAngle = Math.atan2(prevPoint.y - anchor.y, prevPoint.x - anchor.x);
        updatedAnchor.controlIn = { x: anchor.x + Math.cos(inAngle) * handleLength, y: anchor.y + Math.sin(inAngle) * handleLength, type: 'in' };
        updatedAnchor.controlOut = { x: anchor.x - Math.cos(inAngle) * handleLength * 0.6, y: anchor.y - Math.sin(inAngle) * handleLength * 0.6, type: 'out' };
      } else if (!prevPoint && nextPoint) {
        const distance = Math.hypot(nextPoint.x - anchor.x, nextPoint.y - anchor.y);
        const handleLength = distance * 0.3;
        const outAngle = Math.atan2(nextPoint.y - anchor.y, nextPoint.x - anchor.x);
        updatedAnchor.controlOut = { x: anchor.x + Math.cos(outAngle) * handleLength, y: anchor.y + Math.sin(outAngle) * handleLength, type: 'out' };
        updatedAnchor.controlIn = { x: anchor.x - Math.cos(outAngle) * handleLength * 0.6, y: anchor.y - Math.sin(outAngle) * handleLength * 0.6, type: 'in' };
      }
    } else {
      // Corner point: remove handles
      updatedAnchor.controlIn = undefined;
      updatedAnchor.controlOut = undefined;
    }

    console.log('About to update anchor point:', { pathId, anchorId, updatedAnchor });
    updateAnchorPoint(pathId, anchorId, updatedAnchor);
    console.log('Anchor point update completed');

    // Critical: also add counterpart handles on neighbors so segments actually curve
    if (newType === 'smooth') {
      if (prevPoint) {
        const distPrev = Math.hypot(anchor.x - prevPoint.x, anchor.y - prevPoint.y);
        const handleLengthPrev = distPrev * 0.3;
        const outAnglePrev = Math.atan2(anchor.y - prevPoint.y, anchor.x - prevPoint.x);
        if (!prevPoint.controlOut) {
          updateAnchorPoint(pathId, prevPoint.id, {
            controlOut: { x: prevPoint.x + Math.cos(outAnglePrev) * handleLengthPrev, y: prevPoint.y + Math.sin(outAnglePrev) * handleLengthPrev, type: 'out' }
          });
        }
      }
      if (nextPoint) {
        const distNext = Math.hypot(nextPoint.x - anchor.x, nextPoint.y - anchor.y);
        const handleLengthNext = distNext * 0.3;
        const inAngleNext = Math.atan2(anchor.y - nextPoint.y, anchor.x - nextPoint.x);
        if (!nextPoint.controlIn) {
          updateAnchorPoint(pathId, nextPoint.id, {
            controlIn: { x: nextPoint.x + Math.cos(inAngleNext) * handleLengthNext, y: nextPoint.y + Math.sin(inAngleNext) * handleLengthNext, type: 'in' }
          });
        }
      }
    }
  }, [vectorLayers, updateAnchorPoint]);

  // Start bezier creation with drag
  const startBezierCreation = useCallback((point: Point) => {
    setIsCreatingBezier(true);
    setBezierStartPoint(point);
    dragState.current = {
      isDragging: true,
      dragType: 'bezier-create',
      targetId: null,
      targetPathId: null,
      startPoint: point,
      originalControlPoint: null
    };
  }, []);

  // Handle bezier creation drag
  const updateBezierCreation = useCallback((currentPoint: Point) => {
    if (!currentPath || currentPath.points.length === 0) return;

    const anchor = currentPath.points[currentPath.points.length - 1];

    anchor.controlOut = {
      x: currentPoint.x,
      y: currentPoint.y,
      type: 'out'
    };

    anchor.controlIn = {
      x: anchor.x * 2 - currentPoint.x,
      y: anchor.y * 2 - currentPoint.y,
      type: 'in'
    };

    anchor.type = 'smooth';

    // Trigger a re-render
    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points]
    });
  }, [currentPath]);

  // Finish bezier creation
  const finishBezierCreation = useCallback((endPoint: Point) => {
    if (!currentPath || !isDrawing) return;

    const distance = 30;
    const newAnchor: AnchorPoint = {
      id: `anchor-${Date.now()}`,
      x: endPoint.x,
      y: endPoint.y,
      type: 'smooth',
      controlIn: {
        x: endPoint.x - distance,
        y: endPoint.y,
        type: 'in'
      },
      controlOut: {
        x: endPoint.x + distance,
        y: endPoint.y,
        type: 'out'
      },
      selected: true
    };

    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points.map(p => ({ ...p, selected: false })), newAnchor]
    });

    setIsCreatingBezier(false);
  }, [currentPath, isDrawing]);

  // Handle drag operations
  const startDrag = useCallback((type: 'anchor' | 'control-in' | 'control-out' | 'bezier-create', targetId: string | null, pathId: string | null, startPoint: Point) => {
    dragState.current = {
      isDragging: true,
      dragType: type,
      targetId,
      targetPathId: pathId,
      startPoint,
      originalControlPoint: null
    };
  }, []);

  const updateDrag = useCallback((currentPoint: Point) => {
    if (!dragState.current.isDragging || !dragState.current.startPoint) return;

    const { dragType, targetId, targetPathId, startPoint } = dragState.current;
    
    if (dragType === 'anchor' && targetId && targetPathId) {
      // Real-time point movement with automatic curve adjustment
      updatePointWithCurves(targetPathId, targetId, currentPoint, startPoint);
    } else if ((dragType === 'control-in' || dragType === 'control-out') && targetId && targetPathId) {
      // Direct control handle manipulation
      const path = vectorLayers.find(layer => layer.paths.find(p => p.id === targetPathId))?.paths.find(p => p.id === targetPathId);
      if (!path) return;

      const anchor = path.points.find(p => p.id === targetId);
      if (!anchor) return;

      const controlKey = dragType === 'control-in' ? 'controlIn' : 'controlOut';
      updateAnchorPoint(targetPathId, targetId, {
        [controlKey]: { x: currentPoint.x, y: currentPoint.y, type: dragType === 'control-in' ? 'in' : 'out' }
      });
    }
  }, [vectorLayers, updatePointWithCurves, updateAnchorPoint]);

  const endDrag = useCallback((endPoint?: Point) => {
    dragState.current = {
      isDragging: false,
      dragType: null,
      targetId: null,
      targetPathId: null,
      startPoint: null,
      originalControlPoint: null
    };
  }, []);

  // Generate SVG path data
  const generatePathData = useCallback((path: VectorPath): string => {
    if (path.points.length === 0) return '';

    let pathData = `M ${path.points[0].x} ${path.points[0].y}`;

    for (let i = 1; i < path.points.length; i++) {
      const current = path.points[i];
      const previous = path.points[i - 1];

      if (previous.controlOut && current.controlIn) {
        // Cubic bezier curve
        pathData += ` C ${previous.controlOut.x} ${previous.controlOut.y}, ${current.controlIn.x} ${current.controlIn.y}, ${current.x} ${current.y}`;
      } else {
        // Straight line
        pathData += ` L ${current.x} ${current.y}`;
      }
    }

    if (path.closed) {
      pathData += ' Z';
    }

    return pathData;
  }, []);

  // Selection management
  const selectPath = useCallback((pathId: string, addToSelection: boolean = false) => {
    if (addToSelection) {
      setSelectedPathIds(prev => 
        prev.includes(pathId) 
          ? prev.filter(id => id !== pathId)
          : [...prev, pathId]
      );
    } else {
      setSelectedPathIds([pathId]);
    }
    setSelectedAnchorIds([]);
  }, []);

  // Apply color to clicked path instantly
  const applyColorToPath = useCallback((pathId: string, color: string, type: 'stroke' | 'fill' = 'fill') => {
    console.log('Applying color to path:', pathId, color, type);
    if (type === 'stroke') {
      updatePath(pathId, { stroke: color });
      setStrokeColor(color);
    } else {
      // Always apply fill with some opacity for visibility
      updatePath(pathId, { fill: color, fillOpacity: Math.max(fillOpacity, 0.3) });
      setFillColor(color);
      setFillOpacity(Math.max(fillOpacity, 0.3));
    }
    selectPath(pathId, false); // Also select the path
  }, [updatePath, selectPath, fillOpacity]);

  // Check if a point is inside a closed path using ray casting algorithm
  const isPointInPath = useCallback((point: Point, path: VectorPath): boolean => {
    if (!path.closed || path.points.length < 3) return false;

    let inside = false;
    const points = path.points;
    
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x;
      const yi = points[i].y;
      const xj = points[j].x;
      const yj = points[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Find paths that contain a given point
  const findPathsContainingPoint = useCallback((point: Point): VectorPath[] => {
    const containingPaths: VectorPath[] = [];
    
    for (const layer of vectorLayers) {
      if (!layer.visible) continue;
      
      for (const path of layer.paths) {
        if (isPointInPath(point, path)) {
          containingPaths.push(path);
        }
      }
    }
    
    // Return paths sorted by area (smallest first for accurate selection)
    return containingPaths.sort((a, b) => {
      const areaA = calculatePathArea(a);
      const areaB = calculatePathArea(b);
      return areaA - areaB;
    });
  }, [vectorLayers, isPointInPath]);

  // Calculate approximate area of a path for sorting
  const calculatePathArea = useCallback((path: VectorPath): number => {
    if (path.points.length < 3) return 0;
    
    let area = 0;
    const points = path.points;
    
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area) / 2;
  }, []);

  // Apply color to path area (for clicking inside closed paths)
  const applyColorToArea = useCallback((point: Point, color: string, type: 'stroke' | 'fill' = 'fill') => {
    console.log('Applying color to area at point:', point, color, type);
    const containingPaths = findPathsContainingPoint(point);
    
    if (containingPaths.length > 0) {
      // Apply color to the smallest containing path (most specific)
      const targetPath = containingPaths[0];
      console.log('Found containing path:', targetPath.id);
      applyColorToPath(targetPath.id, color, type);
      return true;
    }
    
    console.log('No containing paths found');
    return false;
  }, [findPathsContainingPoint, applyColorToPath]);

  const selectAnchor = useCallback((anchorId: string, addToSelection: boolean = false) => {
    if (addToSelection) {
      setSelectedAnchorIds(prev => 
        prev.includes(anchorId) 
          ? prev.filter(id => id !== anchorId)
          : [...prev, anchorId]
      );
    } else {
      setSelectedAnchorIds([anchorId]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPathIds([]);
    setSelectedAnchorIds([]);
  }, []);

  // Get all paths from all layers
  const getAllPaths = useCallback((): VectorPath[] => {
    return vectorLayers.reduce((allPaths, layer) => {
      if (layer.visible) {
        return [...allPaths, ...layer.paths];
      }
      return allPaths;
    }, [] as VectorPath[]);
  }, [vectorLayers]);

  // Convert selected anchors to bezier curves
  const convertSelectedToBezier = useCallback(() => {
    selectedAnchorIds.forEach(anchorId => {
      // Find which path contains this anchor
      const pathWithAnchor = getAllPaths().find(path => 
        path.points.some(point => point.id === anchorId)
      );
      
      if (pathWithAnchor) {
        convertPointType(pathWithAnchor.id, anchorId, 'smooth');
      }
    });
  }, [selectedAnchorIds, getAllPaths, convertPointType]);

  // Connect two points from different paths or extend a path to connect to another point
  const connectPoints = useCallback((sourcePathId: string, sourceAnchorId: string, targetPathId: string, targetAnchorId: string) => {
    console.log('Connecting points:', { sourcePathId, sourceAnchorId, targetPathId, targetAnchorId });
    
    const sourcePath = getAllPaths().find(p => p.id === sourcePathId);
    const targetPath = getAllPaths().find(p => p.id === targetPathId);
    
    if (!sourcePath || !targetPath) {
      console.log('Source or target path not found');
      return false;
    }
    
    const sourceAnchor = sourcePath.points.find(p => p.id === sourceAnchorId);
    const targetAnchor = targetPath.points.find(p => p.id === targetAnchorId);
    
    if (!sourceAnchor || !targetAnchor) {
      console.log('Source or target anchor not found');
      return false;
    }
    
    // Don't connect a point to itself
    if (sourceAnchorId === targetAnchorId) {
      console.log('Cannot connect point to itself');
      return false;
    }
    
    // Create a connecting line
    const connectingPath: VectorPath = {
      id: `path-connect-${Date.now()}`,
      points: [
        {
          id: `anchor-${Date.now()}-start`,
          x: sourceAnchor.x,
          y: sourceAnchor.y,
          type: 'corner'
        },
        {
          id: `anchor-${Date.now()}-end`,
          x: targetAnchor.x,
          y: targetAnchor.y,
          type: 'corner'
        }
      ],
      closed: false,
      stroke: strokeColor,
      strokeWidth,
      fill: fillColor,
      fillOpacity: 0,
      layerId: activeLayerId
    };
    
    console.log('Creating connecting path:', connectingPath);
    
    // Add the connecting path
    setVectorLayers(prev => prev.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, paths: [...layer.paths, connectingPath] }
        : layer
    ));
    
    // Select the new connecting path
    setSelectedPathIds([connectingPath.id]);
    
    console.log('Connection created successfully');
    return true;
  }, [getAllPaths, strokeColor, strokeWidth, fillColor, activeLayerId]);

  return {
    // State
    vectorLayers,
    activeLayerId,
    currentTool,
    selectedPathIds,
    selectedAnchorIds,
    isDrawing,
    currentPath,
    strokeColor,
    strokeWidth,
    fillColor,
    fillOpacity,
    isCreatingBezier,
    bezierStartPoint,
    
    // Layer methods
    addLayer,
    deleteLayer,
    updateLayer,
    setActiveLayerId,
    
    // Tool methods
    setCurrentTool,
    
    // Path methods
    startPath,
    addPointToPath,
    addPointToExistingPath,
    finishPath,
    deletePath,
    updatePath,
    generatePathData,
    
    // Anchor methods
    updateAnchorPoint,
    updateCurrentPathAnchor,
    convertToBezier,
    updatePointWithCurves,
    convertPointType,
    
    // Bezier creation methods
    startBezierCreation,
    updateBezierCreation,
    finishBezierCreation,
    
    // Drag methods
    startDrag,
    updateDrag,
    endDrag,
    
    // Selection methods
    selectPath,
    selectAnchor,
    clearSelection,
    
    // Style methods
    setStrokeColor,
    setStrokeWidth,
    setFillColor,
    setFillOpacity,
    applyColorToPath,
    
    // Area selection methods
    isPointInPath,
    findPathsContainingPoint,
    applyColorToArea,
    
    // Utility methods
    getAllPaths,
    convertSelectedToBezier,

    // Point connection methods
    connectPoints
  };
};
