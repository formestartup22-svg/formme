
import React, { useState, useRef } from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { useTshirtDrop } from '@/hooks/useTshirtDrop';
import InteractivePatternEditor from '../InteractivePatternEditor';
import SVGButtonElement from '../SVGButtonElement';
import TShirt3d from '../3d/TShirt3d'; // Create this next

interface TshirtSVGProps {
  className?: string;
  bodyColor?: string;
  sleevesColor?: string;
  collarColor?: string;
  bodyPattern?: string;
  sleevesPattern?: string;
  collarPattern?: string;
  bodyUploadedPattern?: string;
  sleevesUploadedPattern?: string;
  collarUploadedPattern?: string;
  fabric?: FabricProperties;
  onPatternDrop?: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  // Button-related props
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  activeTool?: string | null;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
}

const TshirtSVG = ({ 
  className = "", 
  bodyColor = "#ffffff",
  sleevesColor = "#ffffff", 
  collarColor = "#ffffff",
  bodyPattern = '',
  sleevesPattern = '',
  collarPattern = '',
  bodyUploadedPattern,
  sleevesUploadedPattern,
  collarUploadedPattern,
  fabric,
  onPatternDrop,
  getPatternById,
  onPatternUpdate,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  activeTool,
  onButtonPlacement
}: TshirtSVGProps) => {
  const [activePatternEditor, setActivePatternEditor] = useState<{
    patternId: string;
    part: 'body' | 'sleeves' | 'collar';
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up drop zones for each part with proper handlers
  const { isOver: isBodyOver, canDrop: canBodyDrop, drop: bodyDrop } = useTshirtDrop('body', onPatternDrop || (() => {}));
  const { isOver: isSleevesOver, canDrop: canSleevesDrop, drop: sleevesDrop } = useTshirtDrop('sleeves', onPatternDrop || (() => {}));
  const { isOver: isCollarOver, canDrop: canCollarDrop, drop: collarDrop } = useTshirtDrop('collar', onPatternDrop || (() => {}));
  
  console.log('=== TshirtSVG Debug ===');
  console.log('bodyUploadedPattern:', bodyUploadedPattern);
  console.log('bodyPattern:', bodyPattern);
  console.log('getPatternById function exists:', !!getPatternById);
  console.log('activePatternEditor:', activePatternEditor);
  console.log('🔍 TshirtSVG: Received buttons:', buttons);
  console.log('🔍 TshirtSVG: Buttons count:', buttons.length);
  
  // Get uploaded pattern URL
  const getPatternUrl = (patternId: string) => {
    if (!patternId || !getPatternById) return null;
    const pattern = getPatternById(patternId);
    console.log(`Pattern lookup for ${patternId}:`, pattern ? 'FOUND' : 'NOT FOUND');
    return pattern?.url || null;
  };

  // Handle pattern click for editing
  const handlePatternClick = (patternId: string, part: 'body' | 'sleeves' | 'collar') => {
    if (patternId && getPatternById) {
      // Check if pattern actually exists before setting as active
      const pattern = getPatternById(patternId);
      if (pattern) {
        console.log('Setting active pattern editor for:', patternId);
        setActivePatternEditor({ patternId, part });
      } else {
        console.warn('Pattern not found for editing:', patternId);
        setActivePatternEditor(null);
      }
    }
  };

  const handlePatternUpdate = (patternId: string, cropData: any) => {
    if (onPatternUpdate) {
      onPatternUpdate(patternId, cropData);
    }
    setActivePatternEditor(null);
  };

  // Get the current active pattern, with safety checks
  const getActivePattern = () => {
    if (!activePatternEditor || !getPatternById) {
      return null;
    }
    
    const pattern = getPatternById(activePatternEditor.patternId);
    if (!pattern) {
      console.warn('Active pattern no longer exists, clearing editor');
      setActivePatternEditor(null);
      return null;
    }
    
    return pattern;
  };
  
  // Create predefined pattern definitions
  const createPredefinedPattern = (patternType: string, part: string) => {
    switch (patternType) {
      case 'stripes':
        return (
          <pattern 
            id={`predefined-stripes-${part}`}
            patternUnits="userSpaceOnUse" 
            width="20" 
            height="20"
          >
            <rect width="20" height="10" fill={part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor} />
            <rect y="10" width="20" height="10" fill="#000000" opacity="0.3" />
          </pattern>
        );
      case 'polka-dots':
        return (
          <pattern 
            id={`predefined-polka-dots-${part}`}
            patternUnits="userSpaceOnUse" 
            width="30" 
            height="30"
          >
            <rect width="30" height="30" fill={part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor} />
            <circle cx="15" cy="15" r="5" fill="#000000" opacity="0.4" />
          </pattern>
        );
      case 'checkerboard':
        return (
          <pattern 
            id={`predefined-checkerboard-${part}`}
            patternUnits="userSpaceOnUse" 
            width="40" 
            height="40"
          >
            <rect width="20" height="20" fill={part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor} />
            <rect x="20" y="20" width="20" height="20" fill={part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor} />
            <rect x="20" y="0" width="20" height="20" fill="#000000" opacity="0.3" />
            <rect x="0" y="20" width="20" height="20" fill="#000000" opacity="0.3" />
          </pattern>
        );
      default:
        return null;
    }
  };
  
  // Function to get the fill value for each part
  const getFillValue = (part: 'body' | 'sleeves' | 'collar') => {
    const color = part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor;
    const uploadedPatternId = part === 'body' ? bodyUploadedPattern : part === 'sleeves' ? sleevesUploadedPattern : collarUploadedPattern;
    const predefinedPattern = part === 'body' ? bodyPattern : part === 'sleeves' ? sleevesPattern : collarPattern;
    
    // Priority: Uploaded pattern > Predefined pattern > Solid color
    if (uploadedPatternId) {
      const patternUrl = getPatternUrl(uploadedPatternId);
      if (patternUrl) {
        console.log(`✅ Using uploaded pattern for ${part}`);
        return `url(#pattern-${part}-${uploadedPatternId})`;
      }
    }
    
    if (predefinedPattern) {
      console.log(`✅ Using predefined pattern for ${part}: ${predefinedPattern}`);
      return `url(#predefined-${predefinedPattern}-${part})`;
    }
    
    console.log(`✅ Using solid color for ${part}: ${color}`);
    return color;
  };

  // Helper function to get drop zone styles
  const getDropZoneStyle = (isOver: boolean, canDrop: boolean) => {
    if (isOver && canDrop) {
      return { filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' };
    }
    if (canDrop) {
      return { filter: 'brightness(1.05)' };
    }
    return {};
  };

  // Get the active pattern safely
  const activePattern = getActivePattern();

  // Handle button placement when canvas is clicked in button mode
  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'buttons' && onButtonPlacement) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - svgRect.left;
      const clickY = e.clientY - svgRect.top;
      
      // Convert to percentage coordinates
      const percentX = (clickX / svgRect.width) * 100;
      const percentY = (clickY / svgRect.height) * 100;
      
      // Constrain to SVG bounds
      const constrainedX = Math.max(5, Math.min(95, percentX));
      const constrainedY = Math.max(5, Math.min(95, percentY));
      
      console.log('🔍 TshirtSVG: SVG clicked in button mode at:', { x: constrainedX, y: constrainedY });
      
      // Default to medium round button
      onButtonPlacement('round', 'medium');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1" 
        viewBox="0 0 1332.15 1687.55"
        className={className}
        onClick={handleSVGClick}
        style={{ cursor: activeTool === 'buttons' ? 'crosshair' : 'default' }}
      >
        <defs>
          {/* Uploaded pattern definitions - larger scale for better visibility */}
          {bodyUploadedPattern && getPatternUrl(bodyUploadedPattern) && (
            <pattern 
              id={`pattern-body-${bodyUploadedPattern}`}
              patternUnits="userSpaceOnUse" 
              width="400" 
              height="400"
            >
              <image 
                xlinkHref={getPatternUrl(bodyUploadedPattern)!}
                x="0"
                y="0"
                width="400" 
                height="400" 
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )}
          
          {sleevesUploadedPattern && getPatternUrl(sleevesUploadedPattern) && (
            <pattern 
              id={`pattern-sleeves-${sleevesUploadedPattern}`}
              patternUnits="userSpaceOnUse" 
              width="400" 
              height="400"
            >
              <image 
                xlinkHref={getPatternUrl(sleevesUploadedPattern)!}
                x="0"
                y="0"
                width="400" 
                height="400" 
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )}
          
          {collarUploadedPattern && getPatternUrl(collarUploadedPattern) && (
            <pattern 
              id={`pattern-collar-${collarUploadedPattern}`}
              patternUnits="userSpaceOnUse" 
              width="400" 
              height="400"
            >
              <image 
                xlinkHref={getPatternUrl(collarUploadedPattern)!}
                x="0"
                y="0"
                width="400" 
                height="400" 
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )}

          {/* Predefined pattern definitions */}
          {bodyPattern && createPredefinedPattern(bodyPattern, 'body')}
          {sleevesPattern && createPredefinedPattern(sleevesPattern, 'sleeves')}
          {collarPattern && createPredefinedPattern(collarPattern, 'collar')}
          
        <style>
        {`
        .st0 {
            fill: none;
            stroke: #000;
            strokeMiterlimit: 10;
            strokeWidth: 5px;
        } `}
        </style>
    </defs>
    <g id="LEFT_SLEEVE">
        <g>
        <path className="st0" d="M1047.31,722.01c-.09,6.85-.13,13.7-.11,20.56.02,18.46.41,36.96,1.26,55.51,0,0,49.92,13.12,97.75-13.23,47.84-26.35,66-44.71,93.32-36.22-3.02-31.85-6.98-63.15-10.92-95.41-6.34-47.97-13.58-92.32-24.44-139.39-.91-1.81-2.72-3.62-2.72-5.43-.91-10.86-3.62-20.82-6.34-31.68-4.53-14.48-7.24-28.06-11.77-42.54-12.67-39.83-24.44-76.94-47.07-113.14-1.81-1.81-2.72-3.62-4.53-6.34-1.1-1.48-2.21-2.94-3.38-4.35l-.35.29c-13.47,64.71-28.86,128.97-56.91,189.62-9.05,19.91-13.58,40.73-15.39,62.45-3.33,41.42-6.16,82.58-7.58,123.77l-.84,35.54Z"/>
        <path className="st0" d="M1239.54,748.62c1.14,11.94,2.15,23.95,2.97,36.11,0,0-35.97,2.88-68.55,24.38-32.29,21.3-107.49,29.35-121.66,20.2-2.71-12.5-3.83-31.24-3.83-31.24,0,0,49.92,13.12,97.75-13.23,47.84-26.35,66-44.71,93.32-36.22Z"/>
        </g>
    </g>
    <g id="HEM">
        <path className="st0" d="M667.08,1557.17c-143.46,4.38-312.79-14.34-366.67-22.88-33.38-5.3-38.08-12.26-36.3-51.91,140.1,38.46,336.1,37.15,402.96,35.38,66.87,1.77,262.87,3.08,402.95-35.38,1.79,39.65-2.91,46.61-36.29,51.91-53.88,8.54-223.21,27.26-366.67,22.88Z"/>
    </g>
    <g id="COLLAR_ROUND">
        <path d="M864.56,144.94c-1.67-.54-3.45.37-3.99,2.03-.05.15-2.16,6.51-6.85,16.44l-31.31-18.09c2.85-8.94,3.83-14.8,3.92-15.34.28-1.73-.9-3.35-2.63-3.63-1.73-.28-3.35.9-3.63,2.63-.02.14-1.08,6.48-4.31,16.17l-10.12-13.34c-.75-1-2.17-1.19-3.17-.44-1,.76-1.19,2.17-.44,3.17l11.37,14.99c.17.23.39.4.62.55-1.37,3.69-3.02,7.72-5,11.98l-10.48-26.12c-.46-1.16-1.78-1.72-2.94-1.26-1.16.47-1.72,1.78-1.26,2.94l12,29.93c-1.22,2.39-2.54,4.83-3.97,7.31l-14.22-36.2c-.46-1.16-1.77-1.74-2.93-1.28-1.16.46-1.74,1.77-1.28,2.93l14.33,36.49c-1.16.32-2.88.78-5.11,1.34l-14.73-39.45c-.44-1.17-1.74-1.77-2.91-1.33-1.17.44-1.77,1.74-1.33,2.91l14.55,38.96c-1.61.39-3.38.8-5.3,1.24l-15.12-40.6c-.44-1.17-1.74-1.77-2.91-1.33-1.17.44-1.77,1.74-1.33,2.91l14.9,40.01c-1.99.43-4.09.88-6.33,1.34l-13.69-40.77c-.4-1.18-1.68-1.82-2.87-1.42-1.18.4-1.82,1.68-1.42,2.87l13.51,40.23c-2.14.42-4.38.85-6.7,1.28-.01-.1-.02-.2-.04-.3l-10.69-42.48c-.31-1.21-1.53-1.95-2.75-1.64-1.21.3-1.95,1.53-1.64,2.75l10.69,42.47c-2.28.4-4.63.8-7.05,1.2l-9.3-42.59c-.27-1.22-1.48-1.99-2.69-1.73-1.22.27-1.99,1.47-1.73,2.69l9.25,42.34c-2.36.37-4.78.73-7.26,1.09l-8.65-41.31c-.26-1.22-1.46-2.01-2.68-1.75-1.22.26-2.01,1.46-1.75,2.68l8.59,41.01c-2.87.39-5.81.77-8.82,1.13l-6.18-43.66c-.18-1.24-1.31-2.1-2.56-1.92-1.24.18-2.1,1.32-1.92,2.56l6.16,43.55c-2.4.27-4.84.53-7.31.78-.39.04-.78.07-1.17.11l-2.19-43.96c-.06-1.25-1.1-2.2-2.37-2.15-1.25.06-2.21,1.12-2.15,2.37l2.2,44.15c-2.61.23-5.26.46-7.99.67l-1.66-44.87c-.05-1.25-1.12-2.22-2.34-2.18-1.25.05-2.22,1.1-2.18,2.35l1.66,45.03c-2.49.17-5.03.32-7.61.46l.26-45.09c0-1.25-1-2.27-2.25-2.28h-.01c-1.24,0-2.26,1-2.26,2.25l-.26,45.35c-2.72.13-5.48.24-8.28.33l.43-45.18c.01-1.25-.99-2.27-2.24-2.28h-.02c-1.24,0-2.25,1-2.26,2.24l-.43,45.34c-2.47.06-4.95.1-7.48.13l1.96-44.89c.05-1.25-.91-2.3-2.16-2.36-1.23-.04-2.3.91-2.36,2.16l-1.97,45.11c-1.88,0-3.77,0-5.68-.02l1.38-43.99c.04-1.25-.94-2.29-2.19-2.33-1.24-.04-2.29.94-2.33,2.19l-1.38,44.07c-3.22-.06-6.48-.15-9.77-.27l4.72-44.75c.13-1.24-.77-2.36-2.01-2.49-1.25-.13-2.36.77-2.49,2.01l-4.75,45.04c-2.6-.12-5.22-.27-7.85-.43l6.78-45.41c.18-1.24-.67-2.39-1.9-2.57-1.23-.19-2.39.67-2.57,1.9l-6.83,45.78c-2.49-.18-4.99-.38-7.51-.6l7.71-43.67c.22-1.23-.6-2.4-1.84-2.62-1.23-.22-2.4.6-2.62,1.84l-7.78,44.04c-2.25-.22-4.51-.46-6.78-.71l6.24-43.4c.18-1.24-.68-2.38-1.92-2.56-1.23-.18-2.38.68-2.56,1.92l-6.26,43.53c-2.63-.32-5.27-.68-7.92-1.05l8.17-43.25c.23-1.23-.58-2.41-1.8-2.64-1.22-.23-2.41.57-2.64,1.8l-8.21,43.45c-1.9-.29-3.8-.59-5.71-.91l8.65-44.87c.24-1.23-.57-2.41-1.79-2.65-1.23-.24-2.41.57-2.65,1.79l-8.67,44.96c-3.22-.57-6.44-1.18-9.68-1.83l12.87-40.83c.38-1.19-.29-2.46-1.48-2.84-1.19-.38-2.46.29-2.84,1.48l-13,41.26c-2.51-.54-5.02-1.1-7.53-1.69l14.94-39.32c.44-1.17-.14-2.48-1.31-2.92-1.17-.44-2.47.14-2.92,1.31l-15.14,39.84c-2.57-.64-5.14-1.3-7.71-2l15.69-37.47c.48-1.15-.06-2.48-1.21-2.96-1.15-.48-2.48.06-2.96,1.21l-15.91,37.98c-1.53-.44-3.06-.89-4.59-1.35l12.94-35.97c.42-1.18-.19-2.47-1.36-2.9-1.18-.42-2.47.19-2.9,1.36l-13.01,36.18c-.36-.11-.71-.14-1.07-.13-.99-1.72-1.93-3.42-2.83-5.1l10.53-30.89c.4-1.18-.23-2.47-1.41-2.87-1.19-.4-2.47.23-2.87,1.41l-9.11,26.73c-1.39-2.85-2.64-5.61-3.77-8.25l6.38-21.19c.36-1.2-.32-2.46-1.51-2.82-1.2-.36-2.46.32-2.82,1.51l-4.76,15.79c-4.83-12.69-6.51-21.45-6.54-21.62-.32-1.72-1.96-2.86-3.69-2.54-1.72.32-2.86,1.97-2.54,3.69.09.5,1,5.28,3.33,12.73l-33,20.95c-3.84-8.58-5.59-13.97-5.64-14.11-.53-1.67-2.31-2.59-3.98-2.05-1.67.53-2.59,2.31-2.06,3.98.49,1.52,12.25,37.73,43.21,73.96,18.21,21.31,39.3,38.12,62.67,49.95,27.39,13.86,57.97,20.88,91,20.88,2.2,0,4.42-.03,6.65-.09,35.54-1,68.3-9.37,97.37-24.87,23.26-12.4,44.2-29.36,62.25-50.42,30.7-35.81,42.21-70.56,42.68-72.02.54-1.66-.37-3.45-2.03-3.99ZM851.74,167.49c-1.11,2.22-2.32,4.58-3.66,7.06l-29.29-19.08c.79-2.01,1.51-3.94,2.16-5.77l30.79,17.8ZM842.49,184.33l-27.78-19.4c.83-1.78,1.61-3.51,2.33-5.21l28.84,18.79c-1.07,1.89-2.19,3.83-3.39,5.81ZM836.32,194.07l-26.75-19.05c1.12-2.02,2.16-4.01,3.14-5.97l27.41,19.14c-1.21,1.92-2.47,3.89-3.8,5.87ZM830.02,203.07l-26.3-18.26c1.27-1.96,2.46-3.91,3.6-5.84l26.46,18.84c-1.21,1.74-2.46,3.49-3.76,5.26ZM821.8,213.63l-23.7-20.67c.31-.42.62-.82.92-1.24.75-1.05,1.49-2.09,2.2-3.13l26.09,18.11c-1.76,2.3-3.59,4.61-5.51,6.93ZM813.57,223.04l-22.11-21.67c1.33-1.57,2.62-3.17,3.89-4.8l23.53,20.52c-1.69,1.96-3.46,3.95-5.31,5.95ZM795.72,240.26l-20.04-22.89c1.42-1.24,2.83-2.5,4.21-3.8l21.41,21.72c-1.8,1.66-3.66,3.31-5.58,4.96ZM785.81,248.25l-19.1-23.65c1.88-1.39,3.72-2.83,5.52-4.31l20.03,22.87c-2.08,1.71-4.23,3.41-6.45,5.09ZM774.81,256.04l-16.77-25.45c1.69-1.08,3.34-2.19,4.98-3.33l19.15,23.7c-2.38,1.72-4.83,3.42-7.36,5.09ZM763.71,262.86l-14.51-27.05c.46-.25.93-.49,1.39-.75,1.21-.68,2.42-1.38,3.61-2.09l16.81,25.51c-2.37,1.49-4.8,2.95-7.3,4.37ZM752.27,268.9l-13.26-28.02c2.09-.95,4.15-1.93,6.18-2.96l14.56,27.14c-2.43,1.32-4.93,2.6-7.48,3.85ZM742.4,273.4l-13.01-28.54c1.84-.69,3.66-1.42,5.46-2.17l13.33,28.16c-1.9.87-3.83,1.72-5.78,2.55ZM729.41,278.37l-10.09-30.08c1.96-.6,3.89-1.23,5.8-1.89l13.08,28.71c-2.87,1.14-5.8,2.23-8.8,3.26ZM717.87,281.96l-8.39-30.96c1.85-.45,3.69-.93,5.5-1.44l10.14,30.22c-2.38.76-4.79,1.49-7.25,2.17ZM703.7,285.39l-5.49-32c2.3-.42,4.59-.87,6.84-1.36l8.43,31.1c-3.2.82-6.46,1.57-9.79,2.26ZM665.78,256.68c.28,0,.55-.01.83-.02,1.66-.05,3.3-.13,4.94-.22l1.96,33.01c-2.33.16-4.69.28-7.08.37l-.64-33.14ZM676.06,256.15c2.35-.17,4.67-.37,6.98-.61l2.4,32.8c-2.44.29-4.92.55-7.43.76l-1.95-32.96ZM687.54,255.02c2.09-.26,4.17-.55,6.22-.88l5.51,32.11c-3.05.56-6.16,1.06-9.33,1.51l-2.4-32.74ZM666.41,250.33c-51.66,1.62-92.78-15.22-122.42-50.06,41.83,9.45,82.45,12.44,117.1,12.44,19.3,0,36.76-.93,51.54-2.18,34.56-2.94,60.52-8.1,71.7-10.59-28.24,31.87-67.82,48.82-117.92,50.39ZM611.56,285.02l12.89-31.5c1.77.34,3.56.65,5.36.94l-8.33,32.54c-3.34-.57-6.65-1.23-9.92-1.97ZM598.55,281.6l13.41-30.98c2.63.72,5.29,1.38,7.98,1.97l-12.84,31.37c-2.88-.73-5.73-1.51-8.55-2.36ZM587.16,277.71l16.05-29.77c1.44.49,2.9.96,4.37,1.41l-13.36,30.87c-2.38-.79-4.73-1.62-7.06-2.5ZM573.66,271.99l17.45-28.75c2.55,1.12,5.14,2.18,7.78,3.16l-15.98,29.65c-3.12-1.27-6.2-2.63-9.25-4.07ZM634.31,255.12c1.16.15,2.32.3,3.49.43l-3.15,33.27c-2.92-.31-5.82-.68-8.69-1.1l8.35-32.6ZM642.31,256c2.63.23,5.28.41,7.96.54l-2.36,33.25c-2.94-.12-5.86-.31-8.75-.55l3.15-33.24ZM552.16,259.92l20.77-26.31c1.4.88,2.82,1.73,4.25,2.56l-18.28,27.95c-2.27-1.35-4.51-2.76-6.73-4.21ZM541.83,252.67l22.38-24.96c1.61,1.18,3.25,2.32,4.91,3.43l-20.72,26.25c-2.21-1.52-4.4-3.09-6.57-4.72ZM532.28,244.99l22.71-24.64c1.83,1.59,3.7,3.13,5.6,4.62l-22.35,24.93c-2.01-1.59-4-3.22-5.97-4.91ZM522.58,236.1l25.03-22.62c1.31,1.31,2.64,2.59,4,3.85l-22.74,24.68c-2.13-1.91-4.22-3.89-6.29-5.91ZM508.95,221.57c-.74-.86-1.47-1.73-2.18-2.59l26.5-21.95c1.25,1.65,2.52,3.28,3.82,4.86l-25.62,22.54c-.84-.95-1.68-1.89-2.51-2.86ZM497.84,207.5l28.01-21.08c1.48,2.31,3.06,4.63,4.73,6.95l-26.66,22.09c-2.12-2.67-4.15-5.33-6.07-7.96ZM491.16,197.85l29.13-20.67c1,1.78,2.05,3.58,3.15,5.39l-28.23,21.25c-1.41-2.01-2.75-4-4.05-5.97ZM485.53,188.86l29.45-21.92c.98,2.04,2.02,4.12,3.14,6.24l-29.41,20.87c-1.11-1.75-2.16-3.48-3.18-5.18ZM479.11,177.42l31.6-20.07c.72,1.75,1.49,3.55,2.32,5.39l-29.8,22.19c-1.48-2.59-2.86-5.1-4.12-7.51ZM713.92,198.14c40.52-4.07,71.36-11.39,82.92-14.4-.95,1.42-1.93,2.85-2.96,4.28-1.09,1.51-2.2,2.97-3.33,4.43-.56-.18-1.17-.22-1.78-.06-.3.08-30.84,7.95-76.83,11.84-42.4,3.59-106.98,4.45-173.91-11.86-.13-.03-.25-.04-.38-.05-.22-.3-.45-.59-.67-.89-1.79-2.44-3.47-4.89-5.06-7.32,43.27,12.85,87.23,16.9,125.43,16.9,20.95,0,40.17-1.22,56.59-2.87ZM506.9,147.22c.63,1.84,1.33,3.79,2.12,5.85l-31.98,20.31c-.97-1.92-1.86-3.76-2.68-5.49l32.54-20.67ZM514.49,227.78l25.5-22.44c1.45,1.67,2.94,3.3,4.45,4.89l-25.08,22.67c-1.64-1.67-3.27-3.38-4.87-5.12ZM562.83,266.39l18.31-28c.22.12.43.24.64.35,1.71.9,3.44,1.76,5.19,2.6l-17.39,28.65c-2.28-1.15-4.53-2.35-6.76-3.6ZM652.44,289.94l2.35-33.24c1.67.04,3.34.07,5.03.07.47,0,.95,0,1.43-.01l.64,33.19c-3.17.06-6.33.07-9.45,0ZM804.6,232.19l-21.46-21.78c1.83-1.83,3.61-3.71,5.34-5.63l21.99,21.55c-1.88,1.95-3.83,3.9-5.87,5.86Z"/>
    </g>
    <g id="SHADING">
        <g>
        <g>
            <path d="M1064.55,1091.61c-1.36,0-2.47-1.08-2.5-2.43v-.04c-.43-7.27-10.56-178.43-28.09-206.69-.73-1.17-.37-2.71.81-3.44,1.17-.73,2.71-.37,3.44.81,17.88,28.83,27.76,190.67,28.83,209.03v.1s.01.1.01.15c0,1.38-1.12,2.51-2.5,2.51Z"/>
            <path d="M1065,1293.14c-1.38,0-2.5-1.12-2.5-2.5v-.56c-.9-68.82-9.9-105.58-19.43-144.49-6.36-25.98-12.94-52.85-17.18-90.39-10.34-91.65-22.26-143.4-22.38-143.91-.31-1.34.52-2.69,1.87-3,1.35-.31,2.69.52,3,1.87.12.51,12.1,52.51,22.47,144.48,4.2,37.22,10.74,63.93,17.06,89.76,9.6,39.2,18.66,76.23,19.56,145.65v.59c0,1.38-1.11,2.5-2.49,2.5Z"/>
            <path d="M270.39,1091.61c-1.38,0-2.5-1.11-2.5-2.49v-.02s0-.09,0-.14c.41-7.31,10.34-179.33,28.83-209.15.73-1.17,2.27-1.53,3.44-.81,1.17.73,1.54,2.27.81,3.44-17.78,28.68-27.93,204.12-28.08,206.78-.06,1.32-1.16,2.38-2.5,2.38Z"/>
            <path d="M269.93,1293.14c-1.38,0-2.5-1.12-2.5-2.5v-.2c.88-69.66,9.96-106.75,19.57-146.01,6.33-25.84,12.87-52.56,17.07-89.8,10.38-91.97,22.35-143.97,22.47-144.48.31-1.34,1.66-2.18,3-1.87,1.34.31,2.18,1.66,1.87,3-.12.51-12.03,52.26-22.38,143.91-4.24,37.55-10.81,64.43-17.18,90.43-9.54,38.98-18.55,75.79-19.43,144.85v.17c0,1.38-1.12,2.5-2.5,2.5Z"/>
        </g>
        <path d="M1099.17,711.24c-4.61,4.86-19.88,5.26-26.55,6l-23.57,1.68c-.05,0-.1,0-.15.02-11.54,1.05-23.24,1.76-34.1,5.86-3.54,1.46-6.99,3.49-8.85,7.05.92-4.06,4.32-7.11,7.7-9.28,3.47-2.24,7.28-3.81,11.1-5.16,7.92-2.65,16.05-4.38,24.25-5.69,7.57-1.22,15.21-2.09,22.77-3.02,4.96-.68,10.92-1.16,15.96-2.26-.07-.02-.14-.04-.21-.05-11.1-2.72-22.85-3.46-34.35-4.56-1.32-.11-2.65-.23-3.97-.33-14.34-1.19-28.77-2.17-43.25-3.61,9.74-1.38,26.54-2.88,43.42-3.16,18.75-.31,37.6.89,46.99,5.43,4.15,2.08,6.38,7.32,2.81,11.09Z"/>
        <path d="M238.9,711.24c4.61,4.86,19.88,5.26,26.55,6l23.57,1.68c.05,0,.1,0,.15.02,11.54,1.05,23.24,1.76,34.1,5.86,3.54,1.46,6.99,3.49,8.85,7.05-.92-4.06-4.32-7.11-7.7-9.28-3.47-2.24-7.28-3.81-11.1-5.16-7.92-2.65-16.05-4.38-24.25-5.69-7.57-1.22-15.21-2.09-22.77-3.02-4.96-.68-10.92-1.16-15.96-2.26.07-.02.14-.04.21-.05,11.1-2.72,22.85-3.46,34.35-4.56,1.32-.11,2.65-.23,3.97-.33,14.34-1.19,28.77-2.17,43.25-3.61-9.74-1.38-26.54-2.88-43.42-3.16-18.75-.31-37.6.89-46.99,5.43-4.15,2.08-6.38,7.32-2.81,11.09Z"/>
        </g>
    </g>
    <g id="RIGHT_SLEEVE">
        <g>
        <path className="st0" d="M285.15,667.9c-.08-1.7-.16-3.39-.24-5.06-.05-1.1-.11-2.21-.17-3.29-.02-.33-.04-.68-.05-1-.1-1.84-.2-3.65-.31-5.43-.07-1.27-.15-2.51-.23-3.74-.13-1.86-.25-3.7-.38-5.5-4.62-64.7.6-96.9-24.95-152.52-31.44-68.4-52.69-180.72-52.69-180.72,0,0-81,90.15-113.66,464.48,0,0,31.38-11.52,42.48,3.27,11.09,14.79,54.05,40.15,151.12,10.14.05-1.56.1-3.15.15-4.78.03-1.11.06-2.24.09-3.39.03-1.35.06-2.72.1-4.1.04-1.91.08-3.86.11-5.85.02-.66.03-1.32.04-1.99,0-.66.03-1.34.04-2.01.02-1.78.05-3.59.06-5.41.04-3,.06-6.03.07-9.11,0-1.89.02-3.79.02-5.71l-1.59-78.27Z"/>
        <path className="st0" d="M286.07,788.51c-.72,21.57-2.02,37.13-3.84,40.55,0,0,0,0,0,.03-5.32,9.82-55.8,6.14-93.66,7.06-37.9.92-48.69-2.15-56.39-18.8-7.7-16.64-42.52-7.55-42.52-7.55.9-11.83,1.84-23.39,2.82-34.69,0,0,31.38-11.52,42.48,3.27,11.09,14.79,54.05,40.15,151.12,10.14Z"/>
        </g>
    </g>
    <g id="TORSO">
        <path className="st0" d="M1047.31,722.01c-.09,6.85-.13,13.7-.11,20.56.02,18.46.41,36.96,1.26,55.51,0,0,1.12,18.74,3.83,31.24-.13-.08-.25-.17-.37-.25,0,0,.49,1.39,1.28,3.93,3.37,10.89,12.17,42.9,11.05,76.65-.74,22.2-.63,94.14-.39,182.56h0c.18,62.85.43,134.01.48,201.53.02,15.5.02,30.8,0,45.76-.05,70.98,4.43,115.02,5.68,142.9-140.09,38.46-336.08,37.15-402.95,35.38-66.86,1.77-262.86,3.08-402.96-35.38,1.26-27.88,5.73-71.91,5.68-142.9-.05-80.23.28-170.12.5-247.41v-.05c.24-88.33.34-160.21-.4-182.39-1.37-40.98,11.92-79.42,12.32-80.55,0-.02,0-.03,0-.03,1.82-3.42,3.11-18.98,3.84-40.55.05-1.56.11-3.15.15-4.78.03-1.11.06-2.24.09-3.39.04-1.35.07-2.72.1-4.1.04-1.91.08-3.86.11-5.85.02-.66.03-1.32.04-1.99,0-.66.03-1.34.04-2.01.02-1.78.05-3.59.06-5.41.04-3,.06-6.03.07-9.11,0-1.89.02-3.79.02-5.71l-1.59-78.27c-.08-1.7-.16-3.39-.24-5.06-.05-1.1-.11-2.21-.17-3.29-.02-.33-.04-.68-.05-1-.1-1.84-.2-3.65-.31-5.43-.07-1.27-.15-2.51-.23-3.74-.13-1.86-.25-3.7-.38-5.5-4.62-64.7.6-96.9-24.95-152.52-31.44-68.4-52.69-180.72-52.69-180.72,39.46-38.43,187.86-122.76,259.84-162.67l38.83-21.29.33-.18c.33-.18.51-.27.51-.27,0,0,.04.02.11.05,3.82,1.28,106.38,35.16,253.26,14.94l.16-.03c22.94-3.16,46.96-7.64,71.86-13.78,6.61,2.36,12.26,6.91,19.25,10.79,5.2,2.4,10.22,4.98,15.22,7.65l5.65,3.07c4.44,2.43,8.92,4.91,13.52,7.39,3.62,2.72,7.24,4.53,10.86,7.24,76.03,42.54,145.73,81.46,218.14,133.96,2.72,2.72,5.43,5.43,9.05,7.24,2.15,1.61,3.98,3.54,5.68,5.6l-.35.29c-13.47,64.71-28.86,128.97-56.91,189.62-9.05,19.91-13.58,40.73-15.39,62.45-3.33,41.42-6.16,82.58-7.58,123.77"/>
    </g>
    </svg>

        {/* Interactive Pattern Editor Overlay - only render if pattern exists */}
        {activePatternEditor && activePattern && (
            <InteractivePatternEditor
            pattern={activePattern}
            part={activePatternEditor.part}
            isActive={true}
            onUpdate={handlePatternUpdate}
            onClose={() => setActivePatternEditor(null)}
            containerBounds={containerRef.current?.getBoundingClientRect() || new DOMRect()}
            />
        )}
        </div>
  );
};

export default TshirtSVG;
