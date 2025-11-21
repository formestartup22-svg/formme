
import React, { useState, useRef } from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { useTshirtDrop } from '@/hooks/useTshirtDrop';
import InteractivePatternEditor from '../InteractivePatternEditor';
import SVGButtonElement from '../SVGButtonElement';
import TShirt3d from '../3d/TShirt3d'; // Create this next

interface SweaterSVGProps {
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

const SweaterSVG = ({ 
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
}: SweaterSVGProps) => {
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
	viewBox="0 0 512 512"
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
          
          
        </defs>
		<g transform="scale(0.4) translate(-1100, -120)">
		<g
   id="FRONT">
			<g
   id="Waistband">
				
					<path
            ref={bodyDrop}
            className="st3" 
            fill={getFillValue('body')} 
            style={{
              ...getDropZoneStyle(isBodyOver, canBodyDrop),
              cursor: bodyUploadedPattern ? 'pointer' : 'default'
            }}
            onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}
   stroke="#231F20"
   stroke-width="2"
   stroke-miterlimit="10"
   d="      M1454,1100c-1,5.3-4,13.7-5,19c3,13.8,7.6,21.7,8,41c0.3,14.1,0.4,32.9-1,44c11.6,6.4,21.8,7,29,9c14.1,4,22,4.8,38,6      c9.1,0.7,30.1,1.7,39,2c27.3,0.9,39.4,3.1,59,4c22.8,1,13.6-0.3,55,0c24.8,0.2,24.7,1.6,53,2c21.6,0.3,28.4,0.2,62,0      c38-0.2,47.1-4.3,76-5c57.1-1.3,48.7-1.5,66-1c3.3,0.1,19.1-1.3,43-4c6-0.7,21.9-3.3,33-7c6-2,21.3-9.2,26-12      c1.8-24.7-4.3-33.2-1-44c4-13,3.4-15.6,6-28c1.6-7.8-3.9-13-2-17c-193,0-383,0-576,0C1459.3,1106,1456.7,1103,1454,1100z" />
				<g
   id="Rib_00000057148675176758967590000013862995902538125244_">
					<defs
   id="defs1">
						<path
   id="Fiill"
   d="M1454.1,1100c-1,5.3-4,13.7-5,19c3,13.8,7.6,21.7,8,41c0.3,14.1,0.4,32.9-1,44c11.6,6.4,21.8,7,29,9        c14.1,4,22,4.8,38,6c9.1,0.7,30.1,1.7,39,2c27.3,0.9,39.4,3.1,59,4c22.8,1,13.6-0.3,55,0c24.8,0.2,24.7,1.6,53,2        c21.6,0.3,28.4,0.2,62,0c38-0.2,47.1-4.3,76-5c57.1-1.3,48.7-1.5,66-1c3.3,0.1,19.1-1.3,43-4c6-0.7,21.9-3.3,33-7        c6-2,21.3-9.2,26-12c1.8-24.7-4.3-33.2-1-44c4-13,3.4-15.6,6-28c1.6-7.8-3.9-13-2-17c-193,0-383,0-576,0        C1459.4,1106,1456.8,1103,1454.1,1100z" />
					</defs>
					<clipPath
   id="Fiill_00000127002996309174620700000005317497645765455796_">
						<use
   xlinkHref="#Fiill"
   overflow="visible"
   id="use1" />
					</clipPath>
					<g
   clip-path="url(#Fiill_00000127002996309174620700000005317497645765455796_)"
   id="g135">
						<g
   id="g134">
							<g
   id="g133">
								<g
   id="g4">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1443.1"
   y1="1036.2"
   x2="1443.1"
   y2="1313.4"
   id="line1" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1449.2"
   y1="1036.2"
   x2="1449.2"
   y2="1313.4"
   id="line2" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1455.2"
   y1="1036"
   x2="1455.2"
   y2="1313.3"
   id="line3" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1461.3"
   y1="1036.1"
   x2="1461.3"
   y2="1313.3"
   id="line4" />
								</g>
								<g
   id="g8">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1461.7"
   y1="1036.2"
   x2="1461.7"
   y2="1313.4"
   id="line5" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1467.8"
   y1="1036.2"
   x2="1467.8"
   y2="1313.4"
   id="line6" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1473.8"
   y1="1036"
   x2="1473.8"
   y2="1313.3"
   id="line7" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1479.9"
   y1="1036.1"
   x2="1479.9"
   y2="1313.3"
   id="line8" />
								</g>
								<g
   id="g12">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1480.3"
   y1="1036.2"
   x2="1480.3"
   y2="1313.4"
   id="line9" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1486.4"
   y1="1036.2"
   x2="1486.4"
   y2="1313.4"
   id="line10" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1492.4"
   y1="1036"
   x2="1492.4"
   y2="1313.3"
   id="line11" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1498.5"
   y1="1036.1"
   x2="1498.5"
   y2="1313.3"
   id="line12" />
								</g>
								<g
   id="g16">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1498.9"
   y1="1036.2"
   x2="1498.9"
   y2="1313.4"
   id="line13" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1505"
   y1="1036.2"
   x2="1505"
   y2="1313.4"
   id="line14" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1511"
   y1="1036"
   x2="1511"
   y2="1313.3"
   id="line15" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1517.2"
   y1="1036.1"
   x2="1517.2"
   y2="1313.3"
   id="line16" />
								</g>
								<g
   id="g20">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1517.5"
   y1="1036.2"
   x2="1517.5"
   y2="1313.4"
   id="line17" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1523.7"
   y1="1036.2"
   x2="1523.7"
   y2="1313.4"
   id="line18" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1529.6"
   y1="1036"
   x2="1529.6"
   y2="1313.3"
   id="line19" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1535.8"
   y1="1036.1"
   x2="1535.8"
   y2="1313.3"
   id="line20" />
								</g>
								<g
   id="g24">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1536.1"
   y1="1036.2"
   x2="1536.1"
   y2="1313.4"
   id="line21" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1542.3"
   y1="1036.2"
   x2="1542.3"
   y2="1313.4"
   id="line22" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1548.3"
   y1="1036"
   x2="1548.3"
   y2="1313.3"
   id="line23" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1554.4"
   y1="1036.1"
   x2="1554.4"
   y2="1313.3"
   id="line24" />
								</g>
								<g
   id="g28">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1554.8"
   y1="1036.2"
   x2="1554.8"
   y2="1313.4"
   id="line25" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1560.9"
   y1="1036.2"
   x2="1560.9"
   y2="1313.4"
   id="line26" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1566.9"
   y1="1036"
   x2="1566.9"
   y2="1313.3"
   id="line27" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1573"
   y1="1036.1"
   x2="1573"
   y2="1313.3"
   id="line28" />
								</g>
								<g
   id="g32">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1573.4"
   y1="1036.2"
   x2="1573.4"
   y2="1313.4"
   id="line29" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1579.5"
   y1="1036.2"
   x2="1579.5"
   y2="1313.4"
   id="line30" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1585.5"
   y1="1036"
   x2="1585.5"
   y2="1313.3"
   id="line31" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1591.6"
   y1="1036.1"
   x2="1591.6"
   y2="1313.3"
   id="line32" />
								</g>
								<g
   id="g36">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1592"
   y1="1036.2"
   x2="1592"
   y2="1313.4"
   id="line33" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1598.1"
   y1="1036.2"
   x2="1598.1"
   y2="1313.4"
   id="line34" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1604.1"
   y1="1036"
   x2="1604.1"
   y2="1313.3"
   id="line35" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1610.3"
   y1="1036.1"
   x2="1610.3"
   y2="1313.3"
   id="line36" />
								</g>
								<g
   id="g40">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1610.6"
   y1="1036.2"
   x2="1610.6"
   y2="1313.4"
   id="line37" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1616.8"
   y1="1036.2"
   x2="1616.8"
   y2="1313.4"
   id="line38" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1622.7"
   y1="1036"
   x2="1622.7"
   y2="1313.3"
   id="line39" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1628.9"
   y1="1036.1"
   x2="1628.9"
   y2="1313.3"
   id="line40" />
								</g>
								<g
   id="g44">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1629.2"
   y1="1036.2"
   x2="1629.2"
   y2="1313.4"
   id="line41" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1635.4"
   y1="1036.2"
   x2="1635.4"
   y2="1313.4"
   id="line42" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1641.3"
   y1="1036"
   x2="1641.3"
   y2="1313.3"
   id="line43" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1647.5"
   y1="1036.1"
   x2="1647.5"
   y2="1313.3"
   id="line44" />
								</g>
								<g
   id="g48">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1647.9"
   y1="1036.2"
   x2="1647.9"
   y2="1313.4"
   id="line45" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1654"
   y1="1036.2"
   x2="1654"
   y2="1313.4"
   id="line46" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1660"
   y1="1036"
   x2="1660"
   y2="1313.3"
   id="line47" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1666.1"
   y1="1036.1"
   x2="1666.1"
   y2="1313.3"
   id="line48" />
								</g>
								<g
   id="g52">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1666.5"
   y1="1036.2"
   x2="1666.5"
   y2="1313.4"
   id="line49" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1672.6"
   y1="1036.2"
   x2="1672.6"
   y2="1313.4"
   id="line50" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1678.6"
   y1="1036"
   x2="1678.6"
   y2="1313.3"
   id="line51" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1684.7"
   y1="1036.1"
   x2="1684.7"
   y2="1313.3"
   id="line52" />
								</g>
								<g
   id="g56">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1685.1"
   y1="1036.2"
   x2="1685.1"
   y2="1313.4"
   id="line53" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1691.2"
   y1="1036.2"
   x2="1691.2"
   y2="1313.4"
   id="line54" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1697.2"
   y1="1036"
   x2="1697.2"
   y2="1313.3"
   id="line55" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1703.3"
   y1="1036.1"
   x2="1703.3"
   y2="1313.3"
   id="line56" />
								</g>
								<g
   id="g60">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1703.7"
   y1="1036.2"
   x2="1703.7"
   y2="1313.4"
   id="line57" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1709.9"
   y1="1036.2"
   x2="1709.9"
   y2="1313.4"
   id="line58" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1715.8"
   y1="1036"
   x2="1715.8"
   y2="1313.3"
   id="line59" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1722"
   y1="1036.1"
   x2="1722"
   y2="1313.3"
   id="line60" />
								</g>
								<g
   id="g64">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1722.3"
   y1="1036.2"
   x2="1722.3"
   y2="1313.4"
   id="line61" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1728.5"
   y1="1036.2"
   x2="1728.5"
   y2="1313.4"
   id="line62" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1734.4"
   y1="1036"
   x2="1734.4"
   y2="1313.3"
   id="line63" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1740.6"
   y1="1036.1"
   x2="1740.6"
   y2="1313.3"
   id="line64" />
								</g>
								<g
   id="g68">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1741"
   y1="1036.2"
   x2="1741"
   y2="1313.4"
   id="line65" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1747.1"
   y1="1036.2"
   x2="1747.1"
   y2="1313.4"
   id="line66" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1753.1"
   y1="1036"
   x2="1753.1"
   y2="1313.3"
   id="line67" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1759.2"
   y1="1036.1"
   x2="1759.2"
   y2="1313.3"
   id="line68" />
								</g>
								<g
   id="g72">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1759.6"
   y1="1036.2"
   x2="1759.6"
   y2="1313.4"
   id="line69" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1765.7"
   y1="1036.2"
   x2="1765.7"
   y2="1313.4"
   id="line70" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1771.7"
   y1="1036"
   x2="1771.7"
   y2="1313.3"
   id="line71" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1777.8"
   y1="1036.1"
   x2="1777.8"
   y2="1313.3"
   id="line72" />
								</g>
								<g
   id="g76">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1778.2"
   y1="1036.2"
   x2="1778.2"
   y2="1313.4"
   id="line73" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1784.3"
   y1="1036.2"
   x2="1784.3"
   y2="1313.4"
   id="line74" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1790.3"
   y1="1036"
   x2="1790.3"
   y2="1313.3"
   id="line75" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1796.4"
   y1="1036.1"
   x2="1796.4"
   y2="1313.3"
   id="line76" />
								</g>
								<g
   id="g80">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1796.8"
   y1="1036.2"
   x2="1796.8"
   y2="1313.4"
   id="line77" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1803"
   y1="1036.2"
   x2="1803"
   y2="1313.4"
   id="line78" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1808.9"
   y1="1036"
   x2="1808.9"
   y2="1313.3"
   id="line79" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1815.1"
   y1="1036.1"
   x2="1815.1"
   y2="1313.3"
   id="line80" />
								</g>
								<g
   id="g84">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1815.4"
   y1="1036.2"
   x2="1815.4"
   y2="1313.4"
   id="line81" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1821.6"
   y1="1036.2"
   x2="1821.6"
   y2="1313.4"
   id="line82" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1827.5"
   y1="1036"
   x2="1827.5"
   y2="1313.3"
   id="line83" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1833.7"
   y1="1036.1"
   x2="1833.7"
   y2="1313.3"
   id="line84" />
								</g>
								<g
   id="g88">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1834.1"
   y1="1036.2"
   x2="1834.1"
   y2="1313.4"
   id="line85" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1840.2"
   y1="1036.2"
   x2="1840.2"
   y2="1313.4"
   id="line86" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1846.2"
   y1="1036"
   x2="1846.2"
   y2="1313.3"
   id="line87" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1852.3"
   y1="1036.1"
   x2="1852.3"
   y2="1313.3"
   id="line88" />
								</g>
								<g
   id="g92">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1852.7"
   y1="1036.2"
   x2="1852.7"
   y2="1313.4"
   id="line89" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1858.8"
   y1="1036.2"
   x2="1858.8"
   y2="1313.4"
   id="line90" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1864.8"
   y1="1036"
   x2="1864.8"
   y2="1313.3"
   id="line91" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1870.9"
   y1="1036.1"
   x2="1870.9"
   y2="1313.3"
   id="line92" />
								</g>
								<g
   id="g96">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1871.3"
   y1="1036.2"
   x2="1871.3"
   y2="1313.4"
   id="line93" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1877.4"
   y1="1036.2"
   x2="1877.4"
   y2="1313.4"
   id="line94" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1883.4"
   y1="1036"
   x2="1883.4"
   y2="1313.3"
   id="line95" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1889.5"
   y1="1036.1"
   x2="1889.5"
   y2="1313.3"
   id="line96" />
								</g>
								<g
   id="g100">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1889.9"
   y1="1036.2"
   x2="1889.9"
   y2="1313.4"
   id="line97" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1896.1"
   y1="1036.2"
   x2="1896.1"
   y2="1313.4"
   id="line98" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1902"
   y1="1036"
   x2="1902"
   y2="1313.3"
   id="line99" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1908.2"
   y1="1036.1"
   x2="1908.2"
   y2="1313.3"
   id="line100" />
								</g>
								<g
   id="g104">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1908.5"
   y1="1036.2"
   x2="1908.5"
   y2="1313.4"
   id="line101" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1914.7"
   y1="1036.2"
   x2="1914.7"
   y2="1313.4"
   id="line102" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1920.6"
   y1="1036"
   x2="1920.6"
   y2="1313.3"
   id="line103" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1926.8"
   y1="1036.1"
   x2="1926.8"
   y2="1313.3"
   id="line104" />
								</g>
								<g
   id="g108">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1927.2"
   y1="1036.2"
   x2="1927.2"
   y2="1313.4"
   id="line105" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1933.3"
   y1="1036.2"
   x2="1933.3"
   y2="1313.4"
   id="line106" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1939.3"
   y1="1036"
   x2="1939.3"
   y2="1313.3"
   id="line107" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1945.4"
   y1="1036.1"
   x2="1945.4"
   y2="1313.3"
   id="line108" />
								</g>
								<g
   id="g112">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1945.8"
   y1="1036.2"
   x2="1945.8"
   y2="1313.4"
   id="line109" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1951.9"
   y1="1036.2"
   x2="1951.9"
   y2="1313.4"
   id="line110" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1957.9"
   y1="1036"
   x2="1957.9"
   y2="1313.3"
   id="line111" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1964"
   y1="1036.1"
   x2="1964"
   y2="1313.3"
   id="line112" />
								</g>
								<g
   id="g116">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1964.4"
   y1="1036.2"
   x2="1964.4"
   y2="1313.4"
   id="line113" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1970.5"
   y1="1036.2"
   x2="1970.5"
   y2="1313.4"
   id="line114" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1976.5"
   y1="1036"
   x2="1976.5"
   y2="1313.3"
   id="line115" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1982.6"
   y1="1036.1"
   x2="1982.6"
   y2="1313.3"
   id="line116" />
								</g>
								<g
   id="g120">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1983"
   y1="1036.2"
   x2="1983"
   y2="1313.4"
   id="line117" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1989.1"
   y1="1036.2"
   x2="1989.1"
   y2="1313.4"
   id="line118" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="1995.1"
   y1="1036"
   x2="1995.1"
   y2="1313.3"
   id="line119" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2001.3"
   y1="1036.1"
   x2="2001.3"
   y2="1313.3"
   id="line120" />
								</g>
								<g
   id="g124">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2001.6"
   y1="1036.2"
   x2="2001.6"
   y2="1313.4"
   id="line121" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2007.8"
   y1="1036.2"
   x2="2007.8"
   y2="1313.4"
   id="line122" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2013.7"
   y1="1036"
   x2="2013.7"
   y2="1313.3"
   id="line123" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2019.9"
   y1="1036.1"
   x2="2019.9"
   y2="1313.3"
   id="line124" />
								</g>
								<g
   id="g128">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2020.2"
   y1="1036.2"
   x2="2020.2"
   y2="1313.4"
   id="line125" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2026.4"
   y1="1036.2"
   x2="2026.4"
   y2="1313.4"
   id="line126" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2032.4"
   y1="1036"
   x2="2032.4"
   y2="1313.3"
   id="line127" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2038.5"
   y1="1036.1"
   x2="2038.5"
   y2="1313.3"
   id="line128" />
								</g>
								<g
   id="g132">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2038.9"
   y1="1036.2"
   x2="2038.9"
   y2="1313.4"
   id="line129" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2045"
   y1="1036.2"
   x2="2045"
   y2="1313.4"
   id="line130" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2051"
   y1="1036"
   x2="2051"
   y2="1313.3"
   id="line131" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.375"
   stroke-miterlimit="10"
   x1="2057.1"
   y1="1036.1"
   x2="2057.1"
   y2="1313.3"
   id="line132" />
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
			<g
   id="Body_00000066475407723294424520000005860035959793645224_">
				<path
	ref={bodyDrop}
	className="st3" 
	fill={getFillValue('body')} 
	style={{
		...getDropZoneStyle(isBodyOver, canBodyDrop),
		cursor: bodyUploadedPattern ? 'pointer' : 'default'
	}}
	onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}
   stroke="#231F20"
   stroke-width="2"
   stroke-miterlimit="10"
   d="M1406,447c15.6,116.9,25.9,217.1,33,296      c12.1,135.1,14.2,203.5,14,262c-0.1,45.7-2.6,86.9-4,114c15,6,22.6,9,45,12c39.2,5.2,76.4,6,130,8c14.9,0.6,30.1-2,91-1      c154.2,2.6,192.7-0.3,265-6c38-3,50.5-8.5,60-11c0.6-6.5-0.6-17.2,0-29c2.9-54.9-2.4-101.3-4-131c-1.7-31.3-3.5-75.2,1-133      c11.9-153.7,50.5-203.2,51-350c0.1-34.5-1.6-68.6-23-100c-15.3-22.5-38.9-38.7-86-71c-16.2-11.1-35.1-23.1-63-45      c-12-9.4-21.6-17.5-28-23c-13.9,17.5-38.9,43-77,56c-67.9,23.2-149-2.8-208-65c-26.7,10.1-77.1,33.2-123,83      C1432.3,364.8,1413.5,419.2,1406,447z"
   id="path135" />
				<g
   id="No_Fill_00000023961108650779763500000003814601335789684371_">
					<defs
   id="defs135">
						<path
   id="SVGID_00000182489242466306190420000017672850875873949576_"
   d="M1405.9,447.8c15.6,116.9,25.9,217.1,33,296        c12.1,135.1,14.2,203.5,14,262c-0.1,45.7-2.6,86.9-4,114c15,6,22.6,9,45,12c39.2,5.2,76.4,6,130,8c14.9,0.6,30.1-2,91-1        c154.2,2.6,192.7-0.3,265-6c38-3,50.5-8.5,60-11c0.6-6.5-0.6-17.2,0-29c2.9-54.9-2.4-101.3-4-131c-1.7-31.3-3.5-75.2,1-133        c11.9-153.7,50.5-203.2,51-350c0.1-34.5-1.6-68.6-23-100c-15.3-22.5-38.9-38.7-86-71c-16.2-11.1-35.1-23.1-63-45        c-12-9.4-21.6-17.5-28-23c-13.9,17.5-38.9,43-77,56c-67.9,23.2-149-2.8-208-65c-26.7,10.1-77.1,33.2-123,83        C1432.1,365.6,1413.4,420,1405.9,447.8z" />
					</defs>
					<clipPath
   id="SVGID_00000134225643552151101190000001929809485296274323_">
						<use
   xlinkHref="#SVGID_00000182489242466306190420000017672850875873949576_"
   overflow="visible"
   id="use135" />
					</clipPath>
					<g
   clip-path="url(#SVGID_00000134225643552151101190000001929809485296274323_)"
   id="g1079">
						<path
   fill="none"
   stroke="#000000"
   stroke-width="1.0178"
   stroke-miterlimit="10"
   d="M2144.8,393.6        c-34.3,42.1-68.5,84.1-102.8,126.2c-23.6,87.9-44.9,194.1-55,315.5c-13.3,160.3-3,299.7,13.2,409.2c79.1,0,158.1,0,237.2,0        c0-285.3,0-570.7,0-856C2206.6,390.2,2175.7,391.9,2144.8,393.6z"
   id="path136" />
						<g
   id="g1078">
							<g
   id="g1077">
								<g
   id="g1076">
									<g
   id="g137">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1999.4,1238.6 1997.4,1240.8             1999.4,1243.1 2001.4,1240.8           "
   id="polygon136" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1999.4,1242.9 1997.5,1245             1999.4,1247.3 2001.4,1245.1           "
   id="polygon137" />
									</g>
									<g
   id="g139">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.7,1238.6 2001.7,1240.8             2003.7,1243 2005.7,1240.8           "
   id="polygon138" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.7,1242.9 2001.8,1245             2003.7,1247.3 2005.7,1245.1           "
   id="polygon139" />
									</g>
									<g
   id="g141">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2008,1238.6 2006.1,1240.7             2008,1243 2010,1240.8           "
   id="polygon140" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2008,1242.9 2006.1,1245             2008.1,1247.3 2010.1,1245.1           "
   id="polygon141" />
									</g>
									<g
   id="g143">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012.3,1238.6 2010.4,1240.7             2012.3,1243 2014.3,1240.8           "
   id="polygon142" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012.4,1242.8 2010.4,1245             2012.4,1247.3 2014.4,1245           "
   id="polygon143" />
									</g>
									<g
   id="g145">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2016.6,1238.5 2014.7,1240.7             2016.7,1243 2018.7,1240.8           "
   id="polygon144" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2016.7,1242.8 2014.7,1245             2016.7,1247.3 2018.7,1245           "
   id="polygon145" />
									</g>
									<g
   id="g147">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021,1238.5 2019,1240.7             2021,1243 2023,1240.7           "
   id="polygon146" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021,1242.8 2019,1244.9             2021,1247.2 2023,1245           "
   id="polygon147" />
									</g>
									<g
   id="g149">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.3,1238.5 2023.3,1240.7             2025.3,1242.9 2027.3,1240.7           "
   id="polygon148" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.3,1242.8 2023.3,1244.9             2025.3,1247.2 2027.3,1245           "
   id="polygon149" />
									</g>
									<g
   id="g151">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029.6,1238.5 2027.6,1240.6             2029.6,1242.9 2031.6,1240.7           "
   id="polygon150" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029.6,1242.8 2027.7,1244.9             2029.6,1247.2 2031.6,1245           "
   id="polygon151" />
									</g>
									<g
   id="g153">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2033.9,1238.5 2031.9,1240.6             2033.9,1242.9 2035.9,1240.7           "
   id="polygon152" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2033.9,1242.7 2032,1244.9             2033.9,1247.2 2036,1244.9           "
   id="polygon153" />
									</g>
									<g
   id="g155">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2038.2,1238.4 2036.3,1240.6             2038.2,1242.9 2040.2,1240.7           "
   id="polygon154" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2038.2,1242.7 2036.3,1244.9             2038.3,1247.2 2040.3,1244.9           "
   id="polygon155" />
									</g>
									<g
   id="g157">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.5,1238.4 2040.6,1240.6             2042.6,1242.9 2044.6,1240.6           "
   id="polygon156" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.6,1242.7 2040.6,1244.8             2042.6,1247.1 2044.6,1244.9           "
   id="polygon157" />
									</g>
									<g
   id="g159">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.8,1238.4 2044.9,1240.5             2046.9,1242.8 2048.9,1240.6           "
   id="polygon158" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.9,1242.7 2044.9,1244.8             2046.9,1247.1 2048.9,1244.9           "
   id="polygon159" />
									</g>
									<g
   id="g161">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.2,1238.4 2049.2,1240.5             2051.2,1242.8 2053.2,1240.6           "
   id="polygon160" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.2,1242.7 2049.2,1244.8             2051.2,1247.1 2053.2,1244.9           "
   id="polygon161" />
									</g>
									<g
   id="g163">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.5,1238.4 2053.5,1240.5             2055.5,1242.8 2057.5,1240.6           "
   id="polygon162" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.5,1242.6 2053.6,1244.8             2055.5,1247.1 2057.5,1244.8           "
   id="polygon163" />
									</g>
									<g
   id="g165">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.8,1238.3 2057.8,1240.5             2059.8,1242.8 2061.8,1240.5           "
   id="polygon164" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.8,1242.6 2057.9,1244.8             2059.8,1247 2061.8,1244.8           "
   id="polygon165" />
									</g>
									<g
   id="g167">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2064.1,1238.3 2062.2,1240.5             2064.1,1242.8 2066.1,1240.5           "
   id="polygon166" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2064.1,1242.6 2062.2,1244.7             2064.2,1247 2066.2,1244.8           "
   id="polygon167" />
									</g>
									<g
   id="g169">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2068.4,1238.3 2066.5,1240.4             2068.4,1242.7 2070.4,1240.5           "
   id="polygon168" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2068.5,1242.6 2066.5,1244.7             2068.5,1247 2070.5,1244.8           "
   id="polygon169" />
									</g>
									<g
   id="g171">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2072.7,1238.3 2070.8,1240.4             2072.8,1242.7 2074.8,1240.5           "
   id="polygon170" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2072.8,1242.5 2070.8,1244.7             2072.8,1247 2074.8,1244.8           "
   id="polygon171" />
									</g>
									<g
   id="g173">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2077.1,1238.3 2075.1,1240.4             2077.1,1242.7 2079.1,1240.5           "
   id="polygon172" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2077.1,1242.5 2075.1,1244.7             2077.1,1247 2079.1,1244.7           "
   id="polygon173" />
									</g>
									<g
   id="g175">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2081.4,1238.2 2079.4,1240.4             2081.4,1242.7 2083.4,1240.4           "
   id="polygon174" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2081.4,1242.5 2079.4,1244.7             2081.4,1246.9 2083.4,1244.7           "
   id="polygon175" />
									</g>
									<g
   id="g177">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2085.7,1238.2 2083.7,1240.4             2085.7,1242.7 2087.7,1240.4           "
   id="polygon176" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2085.7,1242.5 2083.8,1244.6             2085.7,1246.9 2087.7,1244.7           "
   id="polygon177" />
									</g>
									<g
   id="g179">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2090,1238.2 2088,1240.3             2090,1242.6 2092,1240.4           "
   id="polygon178" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2090,1242.5 2088.1,1244.6             2090,1246.9 2092,1244.7           "
   id="polygon179" />
									</g>
									<g
   id="g181">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2094.3,1238.2 2092.4,1240.3             2094.3,1242.6 2096.3,1240.4           "
   id="polygon180" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2094.3,1242.4 2092.4,1244.6             2094.4,1246.9 2096.4,1244.7           "
   id="polygon181" />
									</g>
									<g
   id="g183">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2098.6,1238.2 2096.7,1240.3             2098.7,1242.6 2100.7,1240.4           "
   id="polygon182" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2098.7,1242.4 2096.7,1244.6             2098.7,1246.9 2100.7,1244.6           "
   id="polygon183" />
									</g>
									<g
   id="g185">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2102.9,1238.1 2101,1240.3             2103,1242.6 2105,1240.3           "
   id="polygon184" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2103,1242.4 2101,1244.6             2103,1246.8 2105,1244.6           "
   id="polygon185" />
									</g>
									<g
   id="g187">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2107.3,1238.1 2105.3,1240.3             2107.3,1242.6 2109.3,1240.3           "
   id="polygon186" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2107.3,1242.4 2105.3,1244.5             2107.3,1246.8 2109.3,1244.6           "
   id="polygon187" />
									</g>
									<g
   id="g189">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2111.6,1238.1 2109.6,1240.2             2111.6,1242.5 2113.6,1240.3           "
   id="polygon188" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2111.6,1242.4 2109.7,1244.5             2111.6,1246.8 2113.6,1244.6           "
   id="polygon189" />
									</g>
									<g
   id="g191">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2115.9,1238.1 2113.9,1240.2             2115.9,1242.5 2117.9,1240.3           "
   id="polygon190" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2115.9,1242.3 2114,1244.5             2115.9,1246.8 2117.9,1244.6           "
   id="polygon191" />
									</g>
									<g
   id="g193">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2120.2,1238.1 2118.3,1240.2             2120.2,1242.5 2122.2,1240.3           "
   id="polygon192" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2120.2,1242.3 2118.3,1244.5             2120.3,1246.8 2122.3,1244.5           "
   id="polygon193" />
									</g>
									<g
   id="g195">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2124.5,1238 2122.6,1240.2             2124.5,1242.5 2126.5,1240.2           "
   id="polygon194" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2124.5,1242.3 2122.6,1244.5             2124.6,1246.7 2126.6,1244.5           "
   id="polygon195" />
									</g>
									<g
   id="g197">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2128.8,1238 2126.9,1240.2             2128.9,1242.5 2130.9,1240.2           "
   id="polygon196" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2128.9,1242.3 2126.9,1244.4             2128.9,1246.7 2130.9,1244.5           "
   id="polygon197" />
									</g>
									<g
   id="g199">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2133.2,1238 2131.2,1240.1             2133.2,1242.4 2135.2,1240.2           "
   id="polygon198" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2133.2,1242.3 2131.2,1244.4             2133.2,1246.7 2135.2,1244.5           "
   id="polygon199" />
									</g>
									<g
   id="g201">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2137.5,1238 2135.5,1240.1             2137.5,1242.4 2139.5,1240.2           "
   id="polygon200" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2137.5,1242.2 2135.5,1244.4             2137.5,1246.7 2139.5,1244.5           "
   id="polygon201" />
									</g>
									<g
   id="g203">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2141.8,1238 2139.8,1240.1             2141.8,1242.4 2143.8,1240.2           "
   id="polygon202" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2141.8,1242.2 2139.9,1244.4             2141.8,1246.7 2143.8,1244.4           "
   id="polygon203" />
									</g>
									<g
   id="g205">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2146.1,1237.9 2144.1,1240.1             2146.1,1242.4 2148.1,1240.1           "
   id="polygon204" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2146.1,1242.2 2144.2,1244.4             2146.1,1246.6 2148.1,1244.4           "
   id="polygon205" />
									</g>
									<g
   id="g207">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2150.4,1237.9 2148.5,1240.1             2150.4,1242.3 2152.4,1240.1           "
   id="polygon206" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2150.4,1242.2 2148.5,1244.3             2150.5,1246.6 2152.5,1244.4           "
   id="polygon207" />
									</g>
									<g
   id="g209">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2154.7,1237.9 2152.8,1240             2154.7,1242.3 2156.7,1240.1           "
   id="polygon208" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2154.8,1242.2 2152.8,1244.3             2154.8,1246.6 2156.8,1244.4           "
   id="polygon209" />
									</g>
									<g
   id="g211">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2159,1237.9 2157.1,1240             2159.1,1242.3 2161.1,1240.1           "
   id="polygon210" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2159.1,1242.1 2157.1,1244.3             2159.1,1246.6 2161.1,1244.4           "
   id="polygon211" />
									</g>
									<g
   id="g213">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2163.4,1237.8 2161.4,1240             2163.4,1242.3 2165.4,1240.1           "
   id="polygon212" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2163.4,1242.1 2161.4,1244.3             2163.4,1246.6 2165.4,1244.3           "
   id="polygon213" />
									</g>
									<g
   id="g215">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2167.7,1237.8 2165.7,1240             2167.7,1242.3 2169.7,1240           "
   id="polygon214" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2167.7,1242.1 2165.7,1244.3             2167.7,1246.5 2169.7,1244.3           "
   id="polygon215" />
									</g>
									<g
   id="g217">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2172,1237.8 2170,1240             2172,1242.2 2174,1240           "
   id="polygon216" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2172,1242.1 2170.1,1244.2             2172,1246.5 2174,1244.3           "
   id="polygon217" />
									</g>
									<g
   id="g219">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2176.3,1237.8 2174.4,1239.9             2176.3,1242.2 2178.3,1240           "
   id="polygon218" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2176.3,1242.1 2174.4,1244.2             2176.4,1246.5 2178.4,1244.3           "
   id="polygon219" />
									</g>
									<g
   id="g221">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2180.6,1237.8 2178.7,1239.9             2180.6,1242.2 2182.6,1240           "
   id="polygon220" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2180.6,1242 2178.7,1244.2             2180.7,1246.5 2182.7,1244.2           "
   id="polygon221" />
									</g>
									<g
   id="g223">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2184.9,1237.7 2183,1239.9             2185,1242.2 2187,1240           "
   id="polygon222" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2185,1242 2183,1244.2             2185,1246.5 2187,1244.2           "
   id="polygon223" />
									</g>
									<g
   id="g225">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2189.2,1237.7 2187.3,1239.9             2189.3,1242.2 2191.3,1239.9           "
   id="polygon224" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2189.3,1242 2187.3,1244.1             2189.3,1246.4 2191.3,1244.2           "
   id="polygon225" />
									</g>
									<g
   id="g227">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2193.6,1237.7 2191.6,1239.9             2193.6,1242.1 2195.6,1239.9           "
   id="polygon226" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2193.6,1242 2191.6,1244.1             2193.6,1246.4 2195.6,1244.2           "
   id="polygon227" />
									</g>
									<g
   id="g229">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2197.9,1237.7 2195.9,1239.8             2197.9,1242.1 2199.9,1239.9           "
   id="polygon228" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2197.9,1242 2196,1244.1             2197.9,1246.4 2199.9,1244.2           "
   id="polygon229" />
									</g>
									<g
   id="g231">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2202.2,1237.7 2200.2,1239.8             2202.2,1242.1 2204.2,1239.9           "
   id="polygon230" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2202.2,1241.9 2200.3,1244.1             2202.2,1246.4 2204.2,1244.1           "
   id="polygon231" />
									</g>
									<g
   id="g233">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2206.5,1237.6 2204.6,1239.8             2206.5,1242.1 2208.5,1239.9           "
   id="polygon232" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2206.5,1241.9 2204.6,1244.1             2206.6,1246.4 2208.6,1244.1           "
   id="polygon233" />
									</g>
									<g
   id="g235">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2210.8,1237.6 2208.9,1239.8             2210.8,1242.1 2212.8,1239.8           "
   id="polygon234" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2210.9,1241.9 2208.9,1244             2210.9,1246.3 2212.9,1244.1           "
   id="polygon235" />
									</g>
									<g
   id="g237">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2215.1,1237.6 2213.2,1239.8             2215.2,1242 2217.2,1239.8           "
   id="polygon236" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2215.2,1241.9 2213.2,1244             2215.2,1246.3 2217.2,1244.1           "
   id="polygon237" />
									</g>
									<g
   id="g239">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2219.5,1237.6 2217.5,1239.7             2219.5,1242 2221.5,1239.8           "
   id="polygon238" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2219.5,1241.9 2217.5,1244             2219.5,1246.3 2221.5,1244.1           "
   id="polygon239" />
									</g>
									<g
   id="g241">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,1237.6 2221.8,1239.7             2223.8,1242 2225.8,1239.8           "
   id="polygon240" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,1241.8 2221.8,1244             2223.8,1246.3 2225.8,1244           "
   id="polygon241" />
									</g>
									<g
   id="g243">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.1,1235.2 2228.3,1237.2             2230.6,1235.2 2228.3,1233.2           "
   id="polygon242" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.4,1235.2 2232.6,1237.2             2234.8,1235.2 2232.6,1233.2           "
   id="polygon243" />
									</g>
									<g
   id="g245">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.1,1230.9 2228.3,1232.8             2230.5,1230.9 2228.3,1228.9           "
   id="polygon244" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.4,1230.9 2232.5,1232.8             2234.8,1230.8 2232.6,1228.8           "
   id="polygon245" />
									</g>
									<g
   id="g247">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.1,1226.5 2228.2,1228.5             2230.5,1226.5 2228.3,1224.5           "
   id="polygon246" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.4,1226.5 2232.5,1228.5             2234.8,1226.5 2232.6,1224.5           "
   id="polygon247" />
									</g>
									<g
   id="g249">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.1,1222.2 2228.2,1224.2             2230.5,1222.2 2228.3,1220.2           "
   id="polygon248" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.3,1222.2 2232.5,1224.1             2234.8,1222.2 2232.6,1220.1           "
   id="polygon249" />
									</g>
									<g
   id="g251">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226,1217.9 2228.2,1219.8             2230.5,1217.8 2228.3,1215.8           "
   id="polygon250" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.3,1217.8 2232.5,1219.8             2234.8,1217.8 2232.5,1215.8           "
   id="polygon251" />
									</g>
									<g
   id="g253">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226,1213.5 2228.2,1215.5             2230.5,1213.5 2228.2,1211.5           "
   id="polygon252" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.3,1213.5 2232.5,1215.5             2234.7,1213.5 2232.5,1211.5           "
   id="polygon253" />
									</g>
									<g
   id="g255">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226,1209.2 2228.2,1211.1             2230.4,1209.2 2228.2,1207.1           "
   id="polygon254" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.3,1209.1 2232.4,1211.1             2234.7,1209.1 2232.5,1207.1           "
   id="polygon255" />
									</g>
									<g
   id="g257">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226,1204.8 2228.1,1206.8             2230.4,1204.8 2228.2,1202.8           "
   id="polygon256" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.3,1204.8 2232.4,1206.8             2234.7,1204.8 2232.5,1202.8           "
   id="polygon257" />
									</g>
									<g
   id="g259">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226,1200.5 2228.1,1202.5             2230.4,1200.5 2228.2,1198.5           "
   id="polygon258" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.2,1200.5 2232.4,1202.4             2234.7,1200.4 2232.4,1198.4           "
   id="polygon259" />
									</g>
									<g
   id="g261">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.9,1196.1 2228.1,1198.1             2230.4,1196.1 2228.2,1194.1           "
   id="polygon260" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.2,1196.1 2232.4,1198.1             2234.7,1196.1 2232.4,1194.1           "
   id="polygon261" />
									</g>
									<g
   id="g263">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.9,1191.8 2228.1,1193.8             2230.4,1191.8 2228.1,1189.8           "
   id="polygon262" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.2,1191.8 2232.3,1193.7             2234.6,1191.8 2232.4,1189.7           "
   id="polygon263" />
									</g>
									<g
   id="g265">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.9,1187.5 2228.1,1189.4             2230.3,1187.4 2228.1,1185.4           "
   id="polygon264" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.2,1187.4 2232.3,1189.4             2234.6,1187.4 2232.4,1185.4           "
   id="polygon265" />
									</g>
									<g
   id="g267">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.9,1183.1 2228,1185.1             2230.3,1183.1 2228.1,1181.1           "
   id="polygon266" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.2,1183.1 2232.3,1185.1             2234.6,1183.1 2232.4,1181.1           "
   id="polygon267" />
									</g>
									<g
   id="g269">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.9,1178.8 2228,1180.7             2230.3,1178.8 2228.1,1176.7           "
   id="polygon268" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.1,1178.8 2232.3,1180.7             2234.6,1178.7 2232.3,1176.7           "
   id="polygon269" />
									</g>
									<g
   id="g271">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.8,1174.4 2228,1176.4             2230.3,1174.4 2228.1,1172.4           "
   id="polygon270" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.1,1174.4 2232.3,1176.4             2234.6,1174.4 2232.3,1172.4           "
   id="polygon271" />
									</g>
									<g
   id="g273">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.8,1170.1 2228,1172.1             2230.3,1170.1 2228,1168.1           "
   id="polygon272" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.1,1170.1 2232.2,1172             2234.5,1170 2232.3,1168           "
   id="polygon273" />
									</g>
									<g
   id="g275">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.8,1165.8 2228,1167.7             2230.2,1165.7 2228,1163.7           "
   id="polygon274" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.1,1165.7 2232.2,1167.7             2234.5,1165.7 2232.3,1163.7           "
   id="polygon275" />
									</g>
									<g
   id="g277">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.8,1161.4 2227.9,1163.4             2230.2,1161.4 2228,1159.4           "
   id="polygon276" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230.1,1161.4 2232.2,1163.3             2234.5,1161.4 2232.3,1159.4           "
   id="polygon277" />
									</g>
									<g
   id="g279">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.8,1157.1 2227.9,1159             2230.2,1157.1 2228,1155           "
   id="polygon278" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230,1157 2232.2,1159             2234.5,1157 2232.2,1155           "
   id="polygon279" />
									</g>
									<g
   id="g281">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.7,1152.7 2227.9,1154.7             2230.2,1152.7 2228,1150.7           "
   id="polygon280" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230,1152.7 2232.2,1154.7             2234.5,1152.7 2232.2,1150.7           "
   id="polygon281" />
									</g>
									<g
   id="g283">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.7,1148.4 2227.9,1150.4             2230.2,1148.4 2227.9,1146.4           "
   id="polygon282" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230,1148.4 2232.1,1150.3             2234.4,1148.3 2232.2,1146.3           "
   id="polygon283" />
									</g>
									<g
   id="g285">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.7,1144 2227.9,1146             2230.1,1144 2227.9,1142           "
   id="polygon284" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230,1144 2232.1,1146             2234.4,1144 2232.2,1142           "
   id="polygon285" />
									</g>
									<g
   id="g287">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.7,1139.7 2227.8,1141.7             2230.1,1139.7 2227.9,1137.7           "
   id="polygon286" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2230,1139.7 2232.1,1141.6             2234.4,1139.7 2232.2,1137.6           "
   id="polygon287" />
									</g>
									<g
   id="g289">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.7,1135.4 2227.8,1137.3             2230.1,1135.3 2227.9,1133.3           "
   id="polygon288" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.9,1135.3 2232.1,1137.3             2234.4,1135.3 2232.1,1133.3           "
   id="polygon289" />
									</g>
									<g
   id="g291">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.6,1131 2227.8,1133             2230.1,1131 2227.8,1129           "
   id="polygon290" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.9,1131 2232.1,1133             2234.3,1131 2232.1,1129           "
   id="polygon291" />
									</g>
									<g
   id="g293">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.6,1126.7 2227.8,1128.6             2230.1,1126.7 2227.8,1124.6           "
   id="polygon292" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.9,1126.7 2232,1128.6             2234.3,1126.6 2232.1,1124.6           "
   id="polygon293" />
									</g>
									<g
   id="g295">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.6,1122.3 2227.7,1124.3             2230,1122.3 2227.8,1120.3           "
   id="polygon294" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.9,1122.3 2232,1124.3             2234.3,1122.3 2232.1,1120.3           "
   id="polygon295" />
									</g>
									<g
   id="g297">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.6,1118 2227.7,1120             2230,1118 2227.8,1116           "
   id="polygon296" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.9,1118 2232,1119.9             2234.3,1117.9 2232.1,1115.9           "
   id="polygon297" />
									</g>
									<g
   id="g299">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.6,1113.7 2227.7,1115.6             2230,1113.6 2227.8,1111.6           "
   id="polygon298" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.8,1113.6 2232,1115.6             2234.3,1113.6 2232,1111.6           "
   id="polygon299" />
									</g>
									<g
   id="g301">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.5,1109.3 2227.7,1111.3             2230,1109.3 2227.7,1107.3           "
   id="polygon300" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.8,1109.3 2232,1111.2             2234.2,1109.3 2232,1107.2           "
   id="polygon301" />
									</g>
									<g
   id="g303">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.5,1105 2227.7,1106.9             2230,1104.9 2227.7,1102.9           "
   id="polygon302" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.8,1104.9 2231.9,1106.9             2234.2,1104.9 2232,1102.9           "
   id="polygon303" />
									</g>
									<g
   id="g305">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.5,1100.6 2227.6,1102.6             2229.9,1100.6 2227.7,1098.6           "
   id="polygon304" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.8,1100.6 2231.9,1102.6             2234.2,1100.6 2232,1098.6           "
   id="polygon305" />
									</g>
									<g
   id="g307">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.5,1096.3 2227.6,1098.2             2229.9,1096.3 2227.7,1094.2           "
   id="polygon306" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.7,1096.3 2231.9,1098.2             2234.2,1096.2 2232,1094.2           "
   id="polygon307" />
									</g>
									<g
   id="g309">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.5,1091.9 2227.6,1093.9             2229.9,1091.9 2227.7,1089.9           "
   id="polygon308" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.7,1091.9 2231.9,1093.9             2234.2,1091.9 2231.9,1089.9           "
   id="polygon309" />
									</g>
									<g
   id="g311">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.4,1087.6 2227.6,1089.6             2229.9,1087.6 2227.6,1085.6           "
   id="polygon310" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.7,1087.6 2231.9,1089.5             2234.1,1087.6 2231.9,1085.5           "
   id="polygon311" />
									</g>
									<g
   id="g313">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.4,1083.3 2227.6,1085.2             2229.9,1083.2 2227.6,1081.2           "
   id="polygon312" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.7,1083.2 2231.8,1085.2             2234.1,1083.2 2231.9,1081.2           "
   id="polygon313" />
									</g>
									<g
   id="g315">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.4,1078.9 2227.5,1080.9             2229.8,1078.9 2227.6,1076.9           "
   id="polygon314" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.7,1078.9 2231.8,1080.9             2234.1,1078.9 2231.9,1076.9           "
   id="polygon315" />
									</g>
									<g
   id="g317">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.4,1074.6 2227.5,1076.5             2229.8,1074.6 2227.6,1072.5           "
   id="polygon316" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.6,1074.5 2231.8,1076.5             2234.1,1074.5 2231.9,1072.5           "
   id="polygon317" />
									</g>
									<g
   id="g319">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.4,1070.2 2227.5,1072.2             2229.8,1070.2 2227.6,1068.2           "
   id="polygon318" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.6,1070.2 2231.8,1072.2             2234.1,1070.2 2231.8,1068.2           "
   id="polygon319" />
									</g>
									<g
   id="g321">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.3,1065.9 2227.5,1067.9             2229.8,1065.9 2227.5,1063.9           "
   id="polygon320" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.6,1065.9 2231.8,1067.8             2234,1065.8 2231.8,1063.8           "
   id="polygon321" />
									</g>
									<g
   id="g323">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.3,1061.5 2227.5,1063.5             2229.7,1061.5 2227.5,1059.5           "
   id="polygon322" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.6,1061.5 2231.7,1063.5             2234,1061.5 2231.8,1059.5           "
   id="polygon323" />
									</g>
									<g
   id="g325">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.3,1057.2 2227.4,1059.2             2229.7,1057.2 2227.5,1055.2           "
   id="polygon324" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.6,1057.2 2231.7,1059.1             2234,1057.2 2231.8,1055.1           "
   id="polygon325" />
									</g>
									<g
   id="g327">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.3,1052.9 2227.4,1054.8             2229.7,1052.8 2227.5,1050.8           "
   id="polygon326" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.5,1052.8 2231.7,1054.8             2234,1052.8 2231.8,1050.8           "
   id="polygon327" />
									</g>
									<g
   id="g329">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.2,1048.5 2227.4,1050.5             2229.7,1048.5 2227.5,1046.5           "
   id="polygon328" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.5,1048.5 2231.7,1050.5             2234,1048.5 2231.7,1046.5           "
   id="polygon329" />
									</g>
									<g
   id="g331">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.2,1044.2 2227.4,1046.1             2229.7,1044.2 2227.4,1042.1           "
   id="polygon330" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.5,1044.2 2231.7,1046.1             2233.9,1044.1 2231.7,1042.1           "
   id="polygon331" />
									</g>
									<g
   id="g333">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.2,1039.8 2227.4,1041.8             2229.6,1039.8 2227.4,1037.8           "
   id="polygon332" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.5,1039.8 2231.6,1041.8             2233.9,1039.8 2231.7,1037.8           "
   id="polygon333" />
									</g>
									<g
   id="g335">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.2,1035.5 2227.3,1037.5             2229.6,1035.5 2227.4,1033.5           "
   id="polygon334" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.5,1035.5 2231.6,1037.4             2233.9,1035.4 2231.7,1033.4           "
   id="polygon335" />
									</g>
									<g
   id="g337">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.2,1031.2 2227.3,1033.1             2229.6,1031.1 2227.4,1029.1           "
   id="polygon336" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.4,1031.1 2231.6,1033.1             2233.9,1031.1 2231.6,1029.1           "
   id="polygon337" />
									</g>
									<g
   id="g339">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.1,1026.8 2227.3,1028.8             2229.6,1026.8 2227.4,1024.8           "
   id="polygon338" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.4,1026.8 2231.6,1028.7             2233.9,1026.8 2231.6,1024.8           "
   id="polygon339" />
									</g>
									<g
   id="g341">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.1,1022.5 2227.3,1024.4             2229.6,1022.5 2227.3,1020.4           "
   id="polygon340" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.4,1022.4 2231.5,1024.4             2233.8,1022.4 2231.6,1020.4           "
   id="polygon341" />
									</g>
									<g
   id="g343">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.1,1018.1 2227.3,1020.1             2229.5,1018.1 2227.3,1016.1           "
   id="polygon342" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.4,1018.1 2231.5,1020.1             2233.8,1018.1 2231.6,1016.1           "
   id="polygon343" />
									</g>
									<g
   id="g345">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.1,1013.8 2227.2,1015.8             2229.5,1013.8 2227.3,1011.8           "
   id="polygon344" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.4,1013.8 2231.5,1015.7             2233.8,1013.7 2231.6,1011.7           "
   id="polygon345" />
									</g>
									<g
   id="g347">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225.1,1009.4 2227.2,1011.4             2229.5,1009.4 2227.3,1007.4           "
   id="polygon346" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.3,1009.4 2231.5,1011.4             2233.8,1009.4 2231.5,1007.4           "
   id="polygon347" />
									</g>
									<g
   id="g349">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225,1005.1 2227.2,1007.1             2229.5,1005.1 2227.3,1003.1           "
   id="polygon348" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.3,1005.1 2231.5,1007             2233.8,1005.1 2231.5,1003           "
   id="polygon349" />
									</g>
									<g
   id="g351">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225,1000.8 2227.2,1002.7             2229.5,1000.7 2227.2,998.7           "
   id="polygon350" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.3,1000.7 2231.4,1002.7             2233.7,1000.7 2231.5,998.7           "
   id="polygon351" />
									</g>
									<g
   id="g353">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225,996.4 2227.2,998.4             2229.4,996.4 2227.2,994.4           "
   id="polygon352" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.3,996.4 2231.4,998.4             2233.7,996.4 2231.5,994.4           "
   id="polygon353" />
									</g>
									<g
   id="g355">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225,992.1 2227.1,994             2229.4,992.1 2227.2,990           "
   id="polygon354" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.3,992.1 2231.4,994             2233.7,992 2231.5,990           "
   id="polygon355" />
									</g>
									<g
   id="g357">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2225,987.7 2227.1,989.7             2229.4,987.7 2227.2,985.7           "
   id="polygon356" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.2,987.7 2231.4,989.7             2233.7,987.7 2231.4,985.7           "
   id="polygon357" />
									</g>
									<g
   id="g359">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.9,983.4 2227.1,985.4             2229.4,983.4 2227.2,981.4           "
   id="polygon358" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.2,983.4 2231.4,985.3             2233.7,983.3 2231.4,981.3           "
   id="polygon359" />
									</g>
									<g
   id="g361">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.9,979.1 2227.1,981             2229.4,979 2227.1,977           "
   id="polygon360" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.2,979 2231.3,981             2233.6,979 2231.4,977           "
   id="polygon361" />
									</g>
									<g
   id="g363">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.9,974.7 2227.1,976.7             2229.3,974.7 2227.1,972.7           "
   id="polygon362" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.2,974.7 2231.3,976.6             2233.6,974.7 2231.4,972.6           "
   id="polygon363" />
									</g>
									<g
   id="g365">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.9,970.4 2227,972.3             2229.3,970.3 2227.1,968.3           "
   id="polygon364" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.2,970.3 2231.3,972.3             2233.6,970.3 2231.4,968.3           "
   id="polygon365" />
									</g>
									<g
   id="g367">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.9,966 2227,968             2229.3,966 2227.1,964           "
   id="polygon366" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.1,966 2231.3,968             2233.6,966 2231.3,964           "
   id="polygon367" />
									</g>
									<g
   id="g369">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.8,961.7 2227,963.6             2229.3,961.7 2227,959.6           "
   id="polygon368" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.1,961.7 2231.3,963.6             2233.5,961.6 2231.3,959.6           "
   id="polygon369" />
									</g>
									<g
   id="g371">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.8,957.3 2227,959.3             2229.3,957.3 2227,955.3           "
   id="polygon370" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.1,957.3 2231.2,959.3             2233.5,957.3 2231.3,955.3           "
   id="polygon371" />
									</g>
									<g
   id="g373">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.8,953 2226.9,955             2229.2,953 2227,951           "
   id="polygon372" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.1,953 2231.2,954.9             2233.5,953 2231.3,950.9           "
   id="polygon373" />
									</g>
									<g
   id="g375">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.8,948.7 2226.9,950.6             2229.2,948.6 2227,946.6           "
   id="polygon374" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229.1,948.6 2231.2,950.6             2233.5,948.6 2231.3,946.6           "
   id="polygon375" />
									</g>
									<g
   id="g377">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.8,944.3 2226.9,946.3             2229.2,944.3 2227,942.3           "
   id="polygon376" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229,944.3 2231.2,946.3             2233.5,944.3 2231.2,942.3           "
   id="polygon377" />
									</g>
									<g
   id="g379">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.7,940 2226.9,941.9             2229.2,940 2226.9,937.9           "
   id="polygon378" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229,939.9 2231.2,941.9             2233.4,939.9 2231.2,937.9           "
   id="polygon379" />
									</g>
									<g
   id="g381">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.7,935.6 2226.9,937.6             2229.2,935.6 2226.9,933.6           "
   id="polygon380" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229,935.6 2231.1,937.6             2233.4,935.6 2231.2,933.6           "
   id="polygon381" />
									</g>
									<g
   id="g383">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.7,931.3 2226.8,933.3             2229.1,931.3 2226.9,929.3           "
   id="polygon382" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2229,931.3 2231.1,933.2             2233.4,931.2 2231.2,929.2           "
   id="polygon383" />
									</g>
									<g
   id="g385">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.7,926.9 2226.8,928.9             2229.1,926.9 2226.9,924.9           "
   id="polygon384" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.9,926.9 2231.1,928.9             2233.4,926.9 2231.2,924.9           "
   id="polygon385" />
									</g>
									<g
   id="g387">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.7,922.6 2226.8,924.6             2229.1,922.6 2226.9,920.6           "
   id="polygon386" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.9,922.6 2231.1,924.5             2233.4,922.6 2231.1,920.5           "
   id="polygon387" />
									</g>
									<g
   id="g389">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.6,918.3 2226.8,920.2             2229.1,918.2 2226.8,916.2           "
   id="polygon388" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.9,918.2 2231.1,920.2             2233.3,918.2 2231.1,916.2           "
   id="polygon389" />
									</g>
									<g
   id="g391">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.6,913.9 2226.8,915.9             2229.1,913.9 2226.8,911.9           "
   id="polygon390" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.9,913.9 2231,915.9             2233.3,913.9 2231.1,911.9           "
   id="polygon391" />
									</g>
									<g
   id="g393">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.6,909.6 2226.7,911.5             2229,909.6 2226.8,907.5           "
   id="polygon392" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.9,909.6 2231,911.5             2233.3,909.5 2231.1,907.5           "
   id="polygon393" />
									</g>
									<g
   id="g395">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.6,905.2 2226.7,907.2             2229,905.2 2226.8,903.2           "
   id="polygon394" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.8,905.2 2231,907.2             2233.3,905.2 2231.1,903.2           "
   id="polygon395" />
									</g>
									<g
   id="g397">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.6,900.9 2226.7,902.9             2229,900.9 2226.8,898.9           "
   id="polygon396" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.8,900.9 2231,902.8             2233.3,900.8 2231,898.8           "
   id="polygon397" />
									</g>
									<g
   id="g399">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.5,896.6 2226.7,898.5             2229,896.5 2226.7,894.5           "
   id="polygon398" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.8,896.5 2231,898.5             2233.2,896.5 2231,894.5           "
   id="polygon399" />
									</g>
									<g
   id="g401">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.5,892.2 2226.7,894.2             2228.9,892.2 2226.7,890.2           "
   id="polygon400" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.8,892.2 2230.9,894.1             2233.2,892.2 2231,890.2           "
   id="polygon401" />
									</g>
									<g
   id="g403">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.5,887.9 2226.6,889.8             2228.9,887.9 2226.7,885.8           "
   id="polygon402" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.8,887.8 2230.9,889.8             2233.2,887.8 2231,885.8           "
   id="polygon403" />
									</g>
									<g
   id="g405">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.5,883.5 2226.6,885.5             2228.9,883.5 2226.7,881.5           "
   id="polygon404" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.7,883.5 2230.9,885.5             2233.2,883.5 2231,881.5           "
   id="polygon405" />
									</g>
									<g
   id="g407">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.5,879.2 2226.6,881.2             2228.9,879.2 2226.7,877.2           "
   id="polygon406" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.7,879.2 2230.9,881.1             2233.2,879.1 2230.9,877.1           "
   id="polygon407" />
									</g>
									<g
   id="g409">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.4,874.8 2226.6,876.8             2228.9,874.8 2226.6,872.8           "
   id="polygon408" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.7,874.8 2230.9,876.8             2233.1,874.8 2230.9,872.8           "
   id="polygon409" />
									</g>
									<g
   id="g411">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.4,870.5 2226.6,872.5             2228.8,870.5 2226.6,868.5           "
   id="polygon410" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.7,870.5 2230.8,872.4             2233.1,870.5 2230.9,868.4           "
   id="polygon411" />
									</g>
									<g
   id="g413">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.4,866.2 2226.5,868.1             2228.8,866.1 2226.6,864.1           "
   id="polygon412" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.7,866.1 2230.8,868.1             2233.1,866.1 2230.9,864.1           "
   id="polygon413" />
									</g>
									<g
   id="g415">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.4,861.8 2226.5,863.8             2228.8,861.8 2226.6,859.8           "
   id="polygon414" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.6,861.8 2230.8,863.8             2233.1,861.8 2230.8,859.8           "
   id="polygon415" />
									</g>
									<g
   id="g417">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.3,857.5 2226.5,859.4             2228.8,857.5 2226.6,855.4           "
   id="polygon416" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.6,857.4 2230.8,859.4             2233.1,857.4 2230.8,855.4           "
   id="polygon417" />
									</g>
									<g
   id="g419">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.3,853.1 2226.5,855.1             2228.8,853.1 2226.5,851.1           "
   id="polygon418" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.6,853.1 2230.7,855.1             2233,853.1 2230.8,851.1           "
   id="polygon419" />
									</g>
									<g
   id="g421">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.3,848.8 2226.5,850.8             2228.7,848.8 2226.5,846.8           "
   id="polygon420" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.6,848.8 2230.7,850.7             2233,848.7 2230.8,846.7           "
   id="polygon421" />
									</g>
									<g
   id="g423">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.3,844.5 2226.4,846.4             2228.7,844.4 2226.5,842.4           "
   id="polygon422" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.6,844.4 2230.7,846.4             2233,844.4 2230.8,842.4           "
   id="polygon423" />
									</g>
									<g
   id="g425">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.3,840.1 2226.4,842.1             2228.7,840.1 2226.5,838.1           "
   id="polygon424" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.5,840.1 2230.7,842             2233,840.1 2230.7,838           "
   id="polygon425" />
									</g>
									<g
   id="g427">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.2,835.8 2226.4,837.7             2228.7,835.7 2226.5,833.7           "
   id="polygon426" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.5,835.7 2230.7,837.7             2233,835.7 2230.7,833.7           "
   id="polygon427" />
									</g>
									<g
   id="g429">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.2,831.4 2226.4,833.4             2228.7,831.4 2226.4,829.4           "
   id="polygon428" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.5,831.4 2230.6,833.4             2232.9,831.4 2230.7,829.4           "
   id="polygon429" />
									</g>
									<g
   id="g431">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.2,827.1 2226.4,829             2228.6,827.1 2226.4,825           "
   id="polygon430" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.5,827.1 2230.6,829             2232.9,827 2230.7,825           "
   id="polygon431" />
									</g>
									<g
   id="g433">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.2,822.7 2226.3,824.7             2228.6,822.7 2226.4,820.7           "
   id="polygon432" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.5,822.7 2230.6,824.7             2232.9,822.7 2230.7,820.7           "
   id="polygon433" />
									</g>
									<g
   id="g435">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.2,818.4 2226.3,820.4             2228.6,818.4 2226.4,816.4           "
   id="polygon434" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.4,818.4 2230.6,820.3             2232.9,818.4 2230.6,816.3           "
   id="polygon435" />
									</g>
									<g
   id="g437">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.1,814.1 2226.3,816             2228.6,814 2226.4,812           "
   id="polygon436" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.4,814 2230.6,816             2232.9,814 2230.6,812           "
   id="polygon437" />
									</g>
									<g
   id="g439">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.1,809.7 2226.3,811.7             2228.6,809.7 2226.3,807.7           "
   id="polygon438" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.4,809.7 2230.5,811.7             2232.8,809.7 2230.6,807.7           "
   id="polygon439" />
									</g>
									<g
   id="g441">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.1,805.4 2226.3,807.3             2228.5,805.4 2226.3,803.3           "
   id="polygon440" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.4,805.3 2230.5,807.3             2232.8,805.3 2230.6,803.3           "
   id="polygon441" />
									</g>
									<g
   id="g443">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.1,801 2226.2,803             2228.5,801 2226.3,799           "
   id="polygon442" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.4,801 2230.5,803             2232.8,801 2230.6,799           "
   id="polygon443" />
									</g>
									<g
   id="g445">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224.1,796.7 2226.2,798.7             2228.5,796.7 2226.3,794.7           "
   id="polygon444" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.3,796.7 2230.5,798.6             2232.8,796.6 2230.5,794.6           "
   id="polygon445" />
									</g>
									<g
   id="g447">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224,792.3 2226.2,794.3             2228.5,792.3 2226.2,790.3           "
   id="polygon446" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.3,792.3 2230.5,794.3             2232.8,792.3 2230.5,790.3           "
   id="polygon447" />
									</g>
									<g
   id="g449">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224,788 2226.2,790             2228.5,788 2226.2,786           "
   id="polygon448" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.3,788 2230.4,789.9             2232.7,788 2230.5,785.9           "
   id="polygon449" />
									</g>
									<g
   id="g451">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224,783.7 2226.1,785.6             2228.4,783.6 2226.2,781.6           "
   id="polygon450" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.3,783.6 2230.4,785.6             2232.7,783.6 2230.5,781.6           "
   id="polygon451" />
									</g>
									<g
   id="g453">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224,779.3 2226.1,781.3             2228.4,779.3 2226.2,777.3           "
   id="polygon452" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.3,779.3 2230.4,781.3             2232.7,779.3 2230.5,777.3           "
   id="polygon453" />
									</g>
									<g
   id="g455">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2224,775 2226.1,776.9             2228.4,775 2226.2,772.9           "
   id="polygon454" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.2,775 2230.4,776.9             2232.7,774.9 2230.4,772.9           "
   id="polygon455" />
									</g>
									<g
   id="g457">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.9,770.6 2226.1,772.6             2228.4,770.6 2226.1,768.6           "
   id="polygon456" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.2,770.6 2230.4,772.6             2232.6,770.6 2230.4,768.6           "
   id="polygon457" />
									</g>
									<g
   id="g459">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.9,766.3 2226.1,768.3             2228.4,766.3 2226.1,764.3           "
   id="polygon458" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.2,766.3 2230.3,768.2             2232.6,766.2 2230.4,764.2           "
   id="polygon459" />
									</g>
									<g
   id="g461">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.9,762 2226,763.9             2228.3,761.9 2226.1,759.9           "
   id="polygon460" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.2,761.9 2230.3,763.9             2232.6,761.9 2230.4,759.9           "
   id="polygon461" />
									</g>
									<g
   id="g463">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.9,757.6 2226,759.6             2228.3,757.6 2226.1,755.6           "
   id="polygon462" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.1,757.6 2230.3,759.5             2232.6,757.6 2230.4,755.6           "
   id="polygon463" />
									</g>
									<g
   id="g465">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.9,753.3 2226,755.2             2228.3,753.2 2226.1,751.2           "
   id="polygon464" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.1,753.2 2230.3,755.2             2232.6,753.2 2230.3,751.2           "
   id="polygon465" />
									</g>
									<g
   id="g467">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,748.9 2226,750.9             2228.3,748.9 2226,746.9           "
   id="polygon466" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.1,748.9 2230.3,750.9             2232.5,748.9 2230.3,746.9           "
   id="polygon467" />
									</g>
									<g
   id="g469">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,744.6 2226,746.6             2228.3,744.6 2226,742.6           "
   id="polygon468" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.1,744.6 2230.2,746.5             2232.5,744.5 2230.3,742.5           "
   id="polygon469" />
									</g>
									<g
   id="g471">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,740.2 2225.9,742.2             2228.2,740.2 2226,738.2           "
   id="polygon470" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228.1,740.2 2230.2,742.2             2232.5,740.2 2230.3,738.2           "
   id="polygon471" />
									</g>
									<g
   id="g473">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,735.9 2225.9,737.9             2228.2,735.9 2226,733.9           "
   id="polygon472" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228,735.9 2230.2,737.8             2232.5,735.9 2230.3,733.8           "
   id="polygon473" />
									</g>
									<g
   id="g475">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.8,731.6 2225.9,733.5             2228.2,731.5 2226,729.5           "
   id="polygon474" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228,731.5 2230.2,733.5             2232.5,731.5 2230.2,729.5           "
   id="polygon475" />
									</g>
									<g
   id="g477">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.7,727.2 2225.9,729.2             2228.2,727.2 2225.9,725.2           "
   id="polygon476" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228,727.2 2230.2,729.2             2232.4,727.2 2230.2,725.2           "
   id="polygon477" />
									</g>
									<g
   id="g479">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.7,722.9 2225.9,724.8             2228.1,722.9 2225.9,720.8           "
   id="polygon478" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228,722.8 2230.1,724.8             2232.4,722.8 2230.2,720.8           "
   id="polygon479" />
									</g>
									<g
   id="g481">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.7,718.5 2225.8,720.5             2228.1,718.5 2225.9,716.5           "
   id="polygon480" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2228,718.5 2230.1,720.5             2232.4,718.5 2230.2,716.5           "
   id="polygon481" />
									</g>
									<g
   id="g483">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.7,714.2 2225.8,716.2             2228.1,714.2 2225.9,712.2           "
   id="polygon482" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.9,714.2 2230.1,716.1             2232.4,714.1 2230.2,712.1           "
   id="polygon483" />
									</g>
									<g
   id="g485">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.7,709.9 2225.8,711.8             2228.1,709.8 2225.9,707.8           "
   id="polygon484" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.9,709.8 2230.1,711.8             2232.4,709.8 2230.1,707.8           "
   id="polygon485" />
									</g>
									<g
   id="g487">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.6,705.5 2225.8,707.5             2228.1,705.5 2225.8,703.5           "
   id="polygon486" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.9,705.5 2230.1,707.4             2232.3,705.5 2230.1,703.4           "
   id="polygon487" />
									</g>
									<g
   id="g489">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.6,701.2 2225.8,703.1             2228,701.1 2225.8,699.1           "
   id="polygon488" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.9,701.1 2230,703.1             2232.3,701.1 2230.1,699.1           "
   id="polygon489" />
									</g>
									<g
   id="g491">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.6,696.8 2225.7,698.8             2228,696.8 2225.8,694.8           "
   id="polygon490" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.9,696.8 2230,698.8             2232.3,696.8 2230.1,694.8           "
   id="polygon491" />
									</g>
									<g
   id="g493">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.6,692.5 2225.7,694.4             2228,692.5 2225.8,690.4           "
   id="polygon492" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.8,692.5 2230,694.4             2232.3,692.4 2230,690.4           "
   id="polygon493" />
									</g>
									<g
   id="g495">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.5,688.1 2225.7,690.1             2228,688.1 2225.8,686.1           "
   id="polygon494" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.8,688.1 2230,690.1             2232.3,688.1 2230,686.1           "
   id="polygon495" />
									</g>
									<g
   id="g497">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.5,683.8 2225.7,685.8             2228,683.8 2225.7,681.8           "
   id="polygon496" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.8,683.8 2229.9,685.7             2232.2,683.8 2230,681.7           "
   id="polygon497" />
									</g>
									<g
   id="g499">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.5,679.5 2225.7,681.4             2227.9,679.4 2225.7,677.4           "
   id="polygon498" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.8,679.4 2229.9,681.4             2232.2,679.4 2230,677.4           "
   id="polygon499" />
									</g>
									<g
   id="g501">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.5,675.1 2225.6,677.1             2227.9,675.1 2225.7,673.1           "
   id="polygon500" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.8,675.1 2229.9,677.1             2232.2,675.1 2230,673.1           "
   id="polygon501" />
									</g>
									<g
   id="g503">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.5,670.8 2225.6,672.7             2227.9,670.8 2225.7,668.7           "
   id="polygon502" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.7,670.7 2229.9,672.7             2232.2,670.7 2229.9,668.7           "
   id="polygon503" />
									</g>
									<g
   id="g505">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.4,666.4 2225.6,668.4             2227.9,666.4 2225.7,664.4           "
   id="polygon504" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.7,666.4 2229.9,668.4             2232.2,666.4 2229.9,664.4           "
   id="polygon505" />
									</g>
									<g
   id="g507">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.4,662.1 2225.6,664.1             2227.9,662.1 2225.6,660.1           "
   id="polygon506" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.7,662.1 2229.8,664             2232.1,662 2229.9,660           "
   id="polygon507" />
									</g>
									<g
   id="g509">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.4,657.7 2225.6,659.7             2227.8,657.7 2225.6,655.7           "
   id="polygon508" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.7,657.7 2229.8,659.7             2232.1,657.7 2229.9,655.7           "
   id="polygon509" />
									</g>
									<g
   id="g511">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.4,653.4 2225.5,655.4             2227.8,653.4 2225.6,651.4           "
   id="polygon510" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.7,653.4 2229.8,655.3             2232.1,653.4 2229.9,651.3           "
   id="polygon511" />
									</g>
									<g
   id="g513">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.4,649.1 2225.5,651             2227.8,649 2225.6,647           "
   id="polygon512" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.6,649 2229.8,651             2232.1,649 2229.8,647           "
   id="polygon513" />
									</g>
									<g
   id="g515">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.3,644.7 2225.5,646.7             2227.8,644.7 2225.6,642.7           "
   id="polygon514" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.6,644.7 2229.8,646.7             2232.1,644.7 2229.8,642.7           "
   id="polygon515" />
									</g>
									<g
   id="g517">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.3,640.4 2225.5,642.3             2227.8,640.4 2225.5,638.3           "
   id="polygon516" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.6,640.4 2229.7,642.3             2232,640.3 2229.8,638.3           "
   id="polygon517" />
									</g>
									<g
   id="g519">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.3,636 2225.5,638             2227.7,636 2225.5,634           "
   id="polygon518" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.6,636 2229.7,638             2232,636 2229.8,634           "
   id="polygon519" />
									</g>
									<g
   id="g521">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.3,631.7 2225.4,633.7             2227.7,631.7 2225.5,629.7           "
   id="polygon520" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.6,631.7 2229.7,633.6             2232,631.6 2229.8,629.6           "
   id="polygon521" />
									</g>
									<g
   id="g523">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.3,627.4 2225.4,629.3             2227.7,627.3 2225.5,625.3           "
   id="polygon522" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.5,627.3 2229.7,629.3             2232,627.3 2229.7,625.3           "
   id="polygon523" />
									</g>
									<g
   id="g525">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.2,623 2225.4,625             2227.7,623 2225.4,621           "
   id="polygon524" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.5,623 2229.7,624.9             2232,623 2229.7,620.9           "
   id="polygon525" />
									</g>
									<g
   id="g527">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.2,618.7 2225.4,620.6             2227.7,618.6 2225.4,616.6           "
   id="polygon526" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.5,618.6 2229.6,620.6             2231.9,618.6 2229.7,616.6           "
   id="polygon527" />
									</g>
									<g
   id="g529">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.2,614.3 2225.3,616.3             2227.6,614.3 2225.4,612.3           "
   id="polygon528" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.5,614.3 2229.6,616.3             2231.9,614.3 2229.7,612.3           "
   id="polygon529" />
									</g>
									<g
   id="g531">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.2,610 2225.3,611.9             2227.6,610 2225.4,608           "
   id="polygon530" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.5,610 2229.6,611.9             2231.9,609.9 2229.7,607.9           "
   id="polygon531" />
									</g>
									<g
   id="g533">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.2,605.6 2225.3,607.6             2227.6,605.6 2225.4,603.6           "
   id="polygon532" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.4,605.6 2229.6,607.6             2231.9,605.6 2229.6,603.6           "
   id="polygon533" />
									</g>
									<g
   id="g535">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.1,601.3 2225.3,603.3             2227.6,601.3 2225.3,599.3           "
   id="polygon534" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.4,601.3 2229.6,603.2             2231.8,601.3 2229.6,599.2           "
   id="polygon535" />
									</g>
									<g
   id="g537">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.1,597 2225.3,598.9             2227.6,596.9 2225.3,594.9           "
   id="polygon536" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.4,596.9 2229.5,598.9             2231.8,596.9 2229.6,594.9           "
   id="polygon537" />
									</g>
									<g
   id="g539">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.1,592.6 2225.2,594.6             2227.5,592.6 2225.3,590.6           "
   id="polygon538" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.4,592.6 2229.5,594.6             2231.8,592.6 2229.6,590.6           "
   id="polygon539" />
									</g>
									<g
   id="g541">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.1,588.3 2225.2,590.2             2227.5,588.3 2225.3,586.2           "
   id="polygon540" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.3,588.2 2229.5,590.2             2231.8,588.2 2229.6,586.2           "
   id="polygon541" />
									</g>
									<g
   id="g543">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223.1,583.9 2225.2,585.9             2227.5,583.9 2225.3,581.9           "
   id="polygon542" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.3,583.9 2229.5,585.9             2231.8,583.9 2229.5,581.9           "
   id="polygon543" />
									</g>
									<g
   id="g545">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223,579.6 2225.2,581.6             2227.5,579.6 2225.2,577.6           "
   id="polygon544" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.3,579.6 2229.5,581.5             2231.7,579.5 2229.5,577.5           "
   id="polygon545" />
									</g>
									<g
   id="g547">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223,575.3 2225.2,577.2             2227.5,575.2 2225.2,573.2           "
   id="polygon546" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.3,575.2 2229.4,577.2             2231.7,575.2 2229.5,573.2           "
   id="polygon547" />
									</g>
									<g
   id="g549">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223,570.9 2225.1,572.9             2227.4,570.9 2225.2,568.9           "
   id="polygon548" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.3,570.9 2229.4,572.8             2231.7,570.9 2229.5,568.8           "
   id="polygon549" />
									</g>
									<g
   id="g551">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223,566.6 2225.1,568.5             2227.4,566.5 2225.2,564.5           "
   id="polygon550" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.2,566.5 2229.4,568.5             2231.7,566.5 2229.5,564.5           "
   id="polygon551" />
									</g>
									<g
   id="g553">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2223,562.2 2225.1,564.2             2227.4,562.2 2225.2,560.2           "
   id="polygon552" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.2,562.2 2229.4,564.2             2231.7,562.2 2229.4,560.2           "
   id="polygon553" />
									</g>
									<g
   id="g555">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.9,557.9 2225.1,559.8             2227.4,557.9 2225.1,555.8           "
   id="polygon554" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.2,557.9 2229.4,559.8             2231.6,557.8 2229.4,555.8           "
   id="polygon555" />
									</g>
									<g
   id="g557">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.9,553.5 2225.1,555.5             2227.3,553.5 2225.1,551.5           "
   id="polygon556" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.2,553.5 2229.3,555.5             2231.6,553.5 2229.4,551.5           "
   id="polygon557" />
									</g>
									<g
   id="g559">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.9,549.2 2225,551.2             2227.3,549.2 2225.1,547.2           "
   id="polygon558" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.2,549.2 2229.3,551.1             2231.6,549.2 2229.4,547.1           "
   id="polygon559" />
									</g>
									<g
   id="g561">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.9,544.9 2225,546.8             2227.3,544.8 2225.1,542.8           "
   id="polygon560" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.1,544.8 2229.3,546.8             2231.6,544.8 2229.4,542.8           "
   id="polygon561" />
									</g>
									<g
   id="g563">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.9,540.5 2225,542.5             2227.3,540.5 2225.1,538.5           "
   id="polygon562" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.1,540.5 2229.3,542.5             2231.6,540.5 2229.3,538.5           "
   id="polygon563" />
									</g>
									<g
   id="g565">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.8,536.2 2225,538.1             2227.3,536.2 2225,534.1           "
   id="polygon564" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.1,536.1 2229.3,538.1             2231.5,536.1 2229.3,534.1           "
   id="polygon565" />
									</g>
									<g
   id="g567">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.8,531.8 2225,533.8             2227.2,531.8 2225,529.8           "
   id="polygon566" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.1,531.8 2229.2,533.8             2231.5,531.8 2229.3,529.8           "
   id="polygon567" />
									</g>
									<g
   id="g569">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.8,527.5 2224.9,529.5             2227.2,527.5 2225,525.5           "
   id="polygon568" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227.1,527.5 2229.2,529.4             2231.5,527.4 2229.3,525.4           "
   id="polygon569" />
									</g>
									<g
   id="g571">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.8,523.1 2224.9,525.1             2227.2,523.1 2225,521.1           "
   id="polygon570" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227,523.1 2229.2,525.1             2231.5,523.1 2229.2,521.1           "
   id="polygon571" />
									</g>
									<g
   id="g573">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.7,518.8 2224.9,520.8             2227.2,518.8 2225,516.8           "
   id="polygon572" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227,518.8 2229.2,520.7             2231.5,518.8 2229.2,516.7           "
   id="polygon573" />
									</g>
									<g
   id="g575">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.7,514.5 2224.9,516.4             2227.2,514.4 2224.9,512.4           "
   id="polygon574" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227,514.4 2229.1,516.4             2231.4,514.4 2229.2,512.4           "
   id="polygon575" />
									</g>
									<g
   id="g577">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.7,510.1 2224.9,512.1             2227.1,510.1 2224.9,508.1           "
   id="polygon576" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227,510.1 2229.1,512.1             2231.4,510.1 2229.2,508.1           "
   id="polygon577" />
									</g>
									<g
   id="g579">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.7,505.8 2224.8,507.7             2227.1,505.8 2224.9,503.7           "
   id="polygon578" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2227,505.8 2229.1,507.7             2231.4,505.7 2229.2,503.7           "
   id="polygon579" />
									</g>
									<g
   id="g581">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.7,501.4 2224.8,503.4             2227.1,501.4 2224.9,499.4           "
   id="polygon580" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.9,501.4 2229.1,503.4             2231.4,501.4 2229.1,499.4           "
   id="polygon581" />
									</g>
									<g
   id="g583">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.6,497.1 2224.8,499.1             2227.1,497.1 2224.9,495.1           "
   id="polygon582" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.9,497.1 2229.1,499             2231.4,497 2229.1,495           "
   id="polygon583" />
									</g>
									<g
   id="g585">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.6,492.8 2224.8,494.7             2227.1,492.7 2224.8,490.7           "
   id="polygon584" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.9,492.7 2229,494.7             2231.3,492.7 2229.1,490.7           "
   id="polygon585" />
									</g>
									<g
   id="g587">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.6,488.4 2224.8,490.4             2227,488.4 2224.8,486.4           "
   id="polygon586" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.9,488.4 2229,490.3             2231.3,488.4 2229.1,486.3           "
   id="polygon587" />
									</g>
									<g
   id="g589">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.6,484.1 2224.7,486             2227,484 2224.8,482           "
   id="polygon588" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.9,484 2229,486             2231.3,484 2229.1,482           "
   id="polygon589" />
									</g>
									<g
   id="g591">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.6,479.7 2224.7,481.7             2227,479.7 2224.8,477.7           "
   id="polygon590" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.8,479.7 2229,481.7             2231.3,479.7 2229,477.7           "
   id="polygon591" />
									</g>
									<g
   id="g593">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.5,475.4 2224.7,477.3             2227,475.4 2224.8,473.4           "
   id="polygon592" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.8,475.4 2229,477.3             2231.3,475.3 2229,473.3           "
   id="polygon593" />
									</g>
									<g
   id="g595">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.5,471 2224.7,473             2227,471 2224.7,469           "
   id="polygon594" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.8,471 2228.9,473             2231.2,471 2229,469           "
   id="polygon595" />
									</g>
									<g
   id="g597">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.5,466.7 2224.7,468.7             2226.9,466.7 2224.7,464.7           "
   id="polygon596" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.8,466.7 2228.9,468.6             2231.2,466.7 2229,464.6           "
   id="polygon597" />
									</g>
									<g
   id="g599">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.5,462.4 2224.6,464.3             2226.9,462.3 2224.7,460.3           "
   id="polygon598" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.8,462.3 2228.9,464.3             2231.2,462.3 2229,460.3           "
   id="polygon599" />
									</g>
									<g
   id="g601">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.5,458 2224.6,460             2226.9,458 2224.7,456           "
   id="polygon600" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.7,458 2228.9,460             2231.2,458 2228.9,456           "
   id="polygon601" />
									</g>
									<g
   id="g603">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.4,453.7 2224.6,455.6             2226.9,453.7 2224.6,451.6           "
   id="polygon602" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.7,453.6 2228.9,455.6             2231.2,453.6 2228.9,451.6           "
   id="polygon603" />
									</g>
									<g
   id="g605">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.4,449.3 2224.6,451.3             2226.9,449.3 2224.6,447.3           "
   id="polygon604" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.7,449.3 2228.8,451.3             2231.1,449.3 2228.9,447.3           "
   id="polygon605" />
									</g>
									<g
   id="g607">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.4,445 2224.5,447             2226.8,445 2224.6,443           "
   id="polygon606" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.7,445 2228.8,446.9             2231.1,444.9 2228.9,442.9           "
   id="polygon607" />
									</g>
									<g
   id="g609">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.4,440.7 2224.5,442.6             2226.8,440.6 2224.6,438.6           "
   id="polygon608" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.7,440.6 2228.8,442.6             2231.1,440.6 2228.9,438.6           "
   id="polygon609" />
									</g>
									<g
   id="g611">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.4,436.3 2224.5,438.3             2226.8,436.3 2224.6,434.3           "
   id="polygon610" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.6,436.3 2228.8,438.2             2231.1,436.3 2228.8,434.2           "
   id="polygon611" />
									</g>
									<g
   id="g613">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.3,432 2224.5,433.9             2226.8,431.9 2224.5,429.9           "
   id="polygon612" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.6,431.9 2228.8,433.9             2231,431.9 2228.8,429.9           "
   id="polygon613" />
									</g>
									<g
   id="g615">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.3,427.6 2224.5,429.6             2226.8,427.6 2224.5,425.6           "
   id="polygon614" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.6,427.6 2228.7,429.6             2231,427.6 2228.8,425.6           "
   id="polygon615" />
									</g>
									<g
   id="g617">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.3,423.3 2224.4,425.2             2226.7,423.3 2224.5,421.2           "
   id="polygon616" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.6,423.3 2228.7,425.2             2231,423.2 2228.8,421.2           "
   id="polygon617" />
									</g>
									<g
   id="g619">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.3,418.9 2224.4,420.9             2226.7,418.9 2224.5,416.9           "
   id="polygon618" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.5,418.9 2228.7,420.9             2231,418.9 2228.8,416.9           "
   id="polygon619" />
									</g>
									<g
   id="g621">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.3,414.6 2224.4,416.6             2226.7,414.6 2224.5,412.6           "
   id="polygon620" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.5,414.6 2228.7,416.5             2231,414.5 2228.7,412.5           "
   id="polygon621" />
									</g>
									<g
   id="g623">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.2,410.3 2224.4,412.2             2226.7,410.2 2224.4,408.2           "
   id="polygon622" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.5,410.2 2228.7,412.2             2230.9,410.2 2228.7,408.2           "
   id="polygon623" />
									</g>
									<g
   id="g625">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.2,405.9 2224.4,407.9             2226.7,405.9 2224.4,403.9           "
   id="polygon624" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.5,405.9 2228.6,407.9             2230.9,405.9 2228.7,403.9           "
   id="polygon625" />
									</g>
									<g
   id="g627">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.2,401.6 2224.3,403.5             2226.6,401.6 2224.4,399.5           "
   id="polygon626" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.5,401.5 2228.6,403.5             2230.9,401.5 2228.7,399.5           "
   id="polygon627" />
									</g>
									<g
   id="g629">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.2,397.2 2224.3,399.2             2226.6,397.2 2224.4,395.2           "
   id="polygon628" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.4,397.2 2228.6,399.2             2230.9,397.2 2228.7,395.2           "
   id="polygon629" />
									</g>
									<g
   id="g631">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2222.2,392.9 2224.3,394.9             2226.6,392.9 2224.4,390.9           "
   id="polygon630" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2226.4,392.9 2228.6,394.8             2230.9,392.8 2228.6,390.8           "
   id="polygon631" />
									</g>
									<g
   id="g633">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2219.8,390.6 2221.7,388.4             2219.6,386.2 2217.7,388.5           "
   id="polygon632" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2219.6,386.4 2221.4,384.1             2219.3,381.9 2217.4,384.3           "
   id="polygon633" />
									</g>
									<g
   id="g635">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2215.5,390.9 2217.4,388.6             2215.3,386.5 2213.4,388.8           "
   id="polygon634" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2215.3,386.6 2217.1,384.4             2215,382.2 2213.1,384.5           "
   id="polygon635" />
									</g>
									<g
   id="g637">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2211.3,391.1 2213.1,388.9             2211,386.7 2209.1,389           "
   id="polygon636" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2211,386.9 2212.8,384.6             2210.7,382.4 2208.9,384.8           "
   id="polygon637" />
									</g>
									<g
   id="g639">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2207,391.4 2208.8,389.1             2206.7,387 2204.8,389.3           "
   id="polygon638" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2206.7,387.1 2208.5,384.9             2206.4,382.7 2204.6,385           "
   id="polygon639" />
									</g>
									<g
   id="g641">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2202.7,391.7 2204.5,389.4             2202.4,387.2 2200.5,389.6           "
   id="polygon640" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2202.4,387.4 2204.2,385.1             2202.2,383 2200.3,385.3           "
   id="polygon641" />
									</g>
									<g
   id="g643">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2198.4,391.9 2200.2,389.7             2198.1,387.5 2196.3,389.8           "
   id="polygon642" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2198.1,387.7 2199.9,385.4             2197.9,383.2 2196,385.6           "
   id="polygon643" />
									</g>
									<g
   id="g645">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2194.1,392.2 2195.9,389.9             2193.8,387.7 2192,390.1           "
   id="polygon644" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2193.8,387.9 2195.7,385.7             2193.6,383.5 2191.7,385.8           "
   id="polygon645" />
									</g>
									<g
   id="g647">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2189.8,392.4 2191.6,390.2             2189.6,388 2187.7,390.3           "
   id="polygon646" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2189.6,388.2 2191.4,385.9             2189.3,383.7 2187.4,386.1           "
   id="polygon647" />
									</g>
									<g
   id="g649">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2185.5,392.7 2187.3,390.4             2185.3,388.3 2183.4,390.6           "
   id="polygon648" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2185.3,388.4 2187.1,386.2             2185,384 2183.1,386.3           "
   id="polygon649" />
									</g>
									<g
   id="g651">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2181.2,392.9 2183.1,390.7             2181,388.5 2179.1,390.8           "
   id="polygon650" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2181,388.7 2182.8,386.4             2180.7,384.2 2178.8,386.6           "
   id="polygon651" />
									</g>
									<g
   id="g653">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2177,393.2 2178.8,390.9             2176.7,388.8 2174.8,391.1           "
   id="polygon652" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2176.7,388.9 2178.5,386.7             2176.4,384.5 2174.6,386.8           "
   id="polygon653" />
									</g>
									<g
   id="g655">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2172.7,393.5 2174.5,391.2             2172.4,389 2170.5,391.4           "
   id="polygon654" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2172.4,389.2 2174.2,386.9             2172.1,384.8 2170.3,387.1           "
   id="polygon655" />
									</g>
									<g
   id="g657">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2168.4,393.7 2170.2,391.5             2168.1,389.3 2166.2,391.6           "
   id="polygon656" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2168.1,389.4 2169.9,387.2             2167.8,385 2166,387.4           "
   id="polygon657" />
									</g>
									<g
   id="g659">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2164.1,394 2165.9,391.7             2163.8,389.5 2162,391.9           "
   id="polygon658" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2163.8,389.7 2165.6,387.5             2163.6,385.3 2161.7,387.6           "
   id="polygon659" />
									</g>
									<g
   id="g661">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2159.8,394.2 2161.6,392             2159.5,389.8 2157.7,392.1           "
   id="polygon660" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2159.5,390 2161.4,387.7             2159.3,385.5 2157.4,387.9           "
   id="polygon661" />
									</g>
									<g
   id="g663">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2155.5,394.5 2157.3,392.2             2155.2,390.1 2153.4,392.4           "
   id="polygon662" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2155.2,390.2 2157.1,388             2155,385.8 2153.1,388.1           "
   id="polygon663" />
									</g>
									<g
   id="g665">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2151.2,394.7 2153,392.5             2151,390.3 2149.1,392.6           "
   id="polygon664" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2151,390.5 2152.8,388.2             2150.7,386 2148.8,388.4           "
   id="polygon665" />
									</g>
									<g
   id="g667">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2146.9,395 2148.8,392.7             2146.7,390.6 2144.8,392.9           "
   id="polygon666" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2146.7,390.7 2148.5,388.5             2146.4,386.3 2144.5,388.6           "
   id="polygon667" />
									</g>
									<g
   id="g669">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2142.6,395.3 2144.5,393             2142.4,390.8 2140.5,393.2           "
   id="polygon668" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2142.4,391 2144.2,388.7             2142.1,386.6 2140.3,388.9           "
   id="polygon669" />
									</g>
									<g
   id="g671">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2138.4,395.5 2140.2,393.3             2138.1,391.1 2136.2,393.4           "
   id="polygon670" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2138.1,391.2 2139.9,389             2137.8,386.8 2136,389.2           "
   id="polygon671" />
									</g>
									<g
   id="g673">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2134.8,397.4 2134.2,394.5             2131.2,394.7 2131.8,397.7           "
   id="polygon672" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2131.4,394.8 2130.9,392             2127.8,392.1 2128.4,395.1           "
   id="polygon673" />
									</g>
									<g
   id="g675">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2132.1,400.8 2131.6,398             2128.6,398.2 2129.2,401.1           "
   id="polygon674" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2128.7,398.3 2128.2,395.4             2125.2,395.6 2125.7,398.6           "
   id="polygon675" />
									</g>
									<g
   id="g677">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2129.6,404.3 2129,401.4             2126,401.6 2126.6,404.6           "
   id="polygon676" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2126.1,401.7 2125.6,398.9             2122.6,399.1 2123.1,402           "
   id="polygon677" />
									</g>
									<g
   id="g679">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2127,407.8 2126.4,404.9             2123.4,405.1 2124,408.1           "
   id="polygon678" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2123.5,405.2 2123,402.4             2120,402.6 2120.6,405.5           "
   id="polygon679" />
									</g>
									<g
   id="g681">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2124.4,411.2 2123.9,408.4             2120.8,408.6 2121.4,411.5           "
   id="polygon680" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2121,408.7 2120.4,405.8             2117.4,406.1 2118,409           "
   id="polygon681" />
									</g>
									<g
   id="g683">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2121.9,414.7 2121.3,411.9             2118.3,412.1 2118.9,415           "
   id="polygon682" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2118.4,412.2 2117.8,409.3             2114.8,409.6 2115.4,412.5           "
   id="polygon683" />
									</g>
									<g
   id="g685">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2119.3,418.2 2118.7,415.4             2115.7,415.6 2116.3,418.5           "
   id="polygon684" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2115.8,415.7 2115.3,412.8             2112.3,413.1 2112.9,416           "
   id="polygon685" />
									</g>
									<g
   id="g687">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2116.8,421.7 2116.2,418.9             2113.2,419.1 2113.8,422.1           "
   id="polygon686" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2113.3,419.2 2112.7,416.4             2109.7,416.6 2110.3,419.6           "
   id="polygon687" />
									</g>
									<g
   id="g689">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2114.2,425.2 2113.7,422.4             2110.6,422.6 2111.3,425.6           "
   id="polygon688" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2110.8,422.7 2110.2,419.9             2107.2,420.1 2107.8,423.1           "
   id="polygon689" />
									</g>
									<g
   id="g691">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2111.7,428.7 2111.1,425.9             2108.1,426.2 2108.7,429.1           "
   id="polygon690" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2108.2,426.3 2107.6,423.4             2104.6,423.7 2105.3,426.6           "
   id="polygon691" />
									</g>
									<g
   id="g693">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2109.2,432.3 2108.6,429.4             2105.6,429.7 2106.2,432.6           "
   id="polygon692" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2105.7,429.8 2105.1,426.9             2102.1,427.2 2102.7,430.1           "
   id="polygon693" />
									</g>
									<g
   id="g695">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2106.7,435.8 2106.1,432.9             2103.1,433.2 2103.7,436.1           "
   id="polygon694" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2103.2,433.3 2102.6,430.5             2099.6,430.7 2100.2,433.7           "
   id="polygon695" />
									</g>
									<g
   id="g697">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2104.1,439.3 2103.6,436.5             2100.5,436.7 2101.2,439.7           "
   id="polygon696" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2100.7,436.8 2100.1,434             2097.1,434.2 2097.7,437.2           "
   id="polygon697" />
									</g>
									<g
   id="g699">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2101.6,442.8 2101,440             2098,440.2 2098.6,443.2           "
   id="polygon698" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2098.1,440.3 2097.6,437.5             2094.5,437.8 2095.2,440.7           "
   id="polygon699" />
									</g>
									<g
   id="g701">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2099.1,446.4 2098.5,443.5             2095.5,443.8 2096.1,446.7           "
   id="polygon700" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2095.6,443.9 2095,441             2092,441.3 2092.6,444.2           "
   id="polygon701" />
									</g>
									<g
   id="g703">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2096.6,449.9 2096,447             2093,447.3 2093.6,450.2           "
   id="polygon702" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2093.1,447.4 2092.5,444.5             2089.5,444.8 2090.1,447.7           "
   id="polygon703" />
									</g>
									<g
   id="g705">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2094,453.4 2093.4,450.6             2090.4,450.8 2091,453.7           "
   id="polygon704" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2090.6,450.9 2090,448.1             2087,448.3 2087.6,451.2           "
   id="polygon705" />
									</g>
									<g
   id="g707">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2091.5,456.9 2090.9,454.1             2087.9,454.3 2088.5,457.3           "
   id="polygon706" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2088,454.4 2087.4,451.6             2084.4,451.8 2085,454.8           "
   id="polygon707" />
									</g>
									<g
   id="g709">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2088.9,460.4 2088.4,457.6             2085.3,457.8 2085.9,460.8           "
   id="polygon708" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2085.5,457.9 2084.9,455.1             2081.9,455.3 2082.5,458.2           "
   id="polygon709" />
									</g>
									<g
   id="g711">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2086.4,464 2085.8,461.1             2082.8,461.3 2083.4,464.3           "
   id="polygon710" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2082.9,461.4 2082.3,458.6             2079.3,458.8 2079.9,461.7           "
   id="polygon711" />
									</g>
									<g
   id="g713">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2083.8,467.5 2083.2,464.6             2080.2,464.8 2080.8,467.8           "
   id="polygon712" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2080.3,464.9 2079.8,462.1             2076.8,462.3 2077.3,465.2           "
   id="polygon713" />
									</g>
									<g
   id="g715">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2081.2,470.9 2080.6,468.1             2077.6,468.3 2078.2,471.2           "
   id="polygon714" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2077.7,468.4 2077.2,465.5             2074.2,465.7 2074.8,468.7           "
   id="polygon715" />
									</g>
									<g
   id="g717">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2078.6,474.4 2078,471.6             2075,471.8 2075.6,474.7           "
   id="polygon716" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2075.1,471.9 2074.6,469             2071.6,469.2 2072.1,472.1           "
   id="polygon717" />
									</g>
									<g
   id="g719">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2075.9,477.9 2075.4,475             2072.4,475.2 2072.9,478.2           "
   id="polygon718" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2072.5,475.3 2072,472.5             2069,472.6 2069.5,475.6           "
   id="polygon719" />
									</g>
									<g
   id="g721">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2073.3,481.4 2072.8,478.5             2069.8,478.7 2070.3,481.6           "
   id="polygon720" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2069.9,478.8 2069.4,475.9             2066.4,476.1 2066.9,479           "
   id="polygon721" />
									</g>
									<g
   id="g723">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2070.6,484.8 2070.1,481.9             2067.1,482.1 2067.6,485           "
   id="polygon722" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2067.2,482.2 2066.7,479.3             2063.7,479.5 2064.2,482.4           "
   id="polygon723" />
									</g>
									<g
   id="g725">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2067.9,488.2 2067.5,485.4             2064.4,485.5 2064.9,488.5           "
   id="polygon724" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2064.6,485.6 2064.1,482.7             2061.1,482.9 2061.6,485.8           "
   id="polygon725" />
									</g>
									<g
   id="g727">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2065.2,491.7 2064.8,488.8             2061.7,488.9 2062.2,491.9           "
   id="polygon726" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2061.9,489 2061.4,486.1             2058.4,486.2 2058.9,489.2           "
   id="polygon727" />
									</g>
									<g
   id="g729">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.5,495.1 2062,492.2             2059,492.3 2059.5,495.2           "
   id="polygon728" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.1,492.4 2058.7,489.5             2055.7,489.6 2056.2,492.6           "
   id="polygon729" />
									</g>
									<g
   id="g731">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.7,498.4 2059.3,495.6             2056.3,495.6 2056.7,498.6           "
   id="polygon730" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.4,495.7 2056,492.9             2053,492.9 2053.4,495.9           "
   id="polygon731" />
									</g>
									<g
   id="g733">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.9,501.8 2056.5,498.9             2053.5,499 2053.9,502           "
   id="polygon732" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.6,499.1 2053.2,496.2             2050.2,496.2 2050.7,499.2           "
   id="polygon733" />
									</g>
									<g
   id="g735">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054.1,505.2 2053.8,502.3             2050.7,502.3 2051.1,505.3           "
   id="polygon734" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050.9,502.4 2050.5,499.5             2047.5,499.5 2047.9,502.5           "
   id="polygon735" />
									</g>
									<g
   id="g737">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.3,508.5 2051,505.6             2047.9,505.6 2048.3,508.6           "
   id="polygon736" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048,505.7 2047.7,502.8             2044.7,502.8 2045,505.8           "
   id="polygon737" />
									</g>
									<g
   id="g739">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048.4,511.8 2048.1,508.9             2045.1,508.9 2045.4,511.9           "
   id="polygon738" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2045.2,509 2044.9,506.1             2041.9,506.1 2042.2,509           "
   id="polygon739" />
									</g>
									<g
   id="g741">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2045.6,515.1 2045.3,512.2             2042.2,512.1 2042.5,515.1           "
   id="polygon740" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.3,512.2 2042,509.4             2039,509.3 2039.3,512.3           "
   id="polygon741" />
									</g>
									<g
   id="g742">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2042.6,518.3l-0.3-2.9l-3-0.1l0.2,1.5            c0.1,0.4,0.3,0.8,0.5,1.1c0.5,0,0.8,0.2,1.2,0.4L2042.6,518.3z"
   id="path741" />
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2039.5,515.5l-0.3-2.9l-3-0.1l0.2,1.5            c-0.1,0.7-0.2,1.3-0.2,1.9c0.7-0.2,1.3-0.3,1.8-0.4L2039.5,515.5z"
   id="path742" />
									</g>
									<g
   id="g744">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2041.7,520.2l-0.8-1.2l-0.1-0.2            l-0.1-0.1c-0.1-0.1-0.2-0.1-0.2-0.2c-0.2-0.1-0.3-0.3-0.4-0.4c-0.4,0-0.8,0.1-1.3,0.3l-1.4,0.7l1.7,2.5L2041.7,520.2z"
   id="path743" />
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2037.5,519.2l-0.8-1.2            c-0.3-0.4-0.5-1-0.7-1.6c-0.2,0.1-0.5,0.3-0.7,0.5l-0.4,0.3l-0.2,0.2l-0.2,0.1l-1.4,0.7l1.7,2.5L2037.5,519.2z"
   id="path744" />
									</g>
									<g
   id="g745">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2040.6,524.4 2039,522             2036.3,523.3 2038,525.8           "
   id="polygon744" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2036.5,523.4 2034.9,521             2032.2,522.3 2033.8,524.8           "
   id="polygon745" />
									</g>
									<g
   id="g747">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2039.6,528.6 2038,526.2             2035.3,527.5 2036.9,530           "
   id="polygon746" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2035.4,527.6 2033.8,525.2             2031.1,526.5 2032.8,529           "
   id="polygon747" />
									</g>
									<g
   id="g749">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2038.5,532.8 2036.9,530.4             2034.2,531.7 2035.9,534.2           "
   id="polygon748" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2034.4,531.8 2032.8,529.4             2030.1,530.7 2031.7,533.2           "
   id="polygon749" />
									</g>
									<g
   id="g751">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2037.5,537 2035.9,534.6             2033.2,535.9 2034.8,538.4           "
   id="polygon750" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2033.3,536 2031.7,533.6             2029,534.9 2030.7,537.4           "
   id="polygon751" />
									</g>
									<g
   id="g753">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2036.4,541.2 2034.8,538.8             2032.1,540.2 2033.8,542.7           "
   id="polygon752" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2032.3,540.2 2030.7,537.8             2028,539.1 2029.6,541.6           "
   id="polygon753" />
									</g>
									<g
   id="g755">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2035.4,545.4 2033.8,543             2031.1,544.4 2032.8,546.9           "
   id="polygon754" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2031.2,544.4 2029.6,542             2026.9,543.4 2028.6,545.8           "
   id="polygon755" />
									</g>
									<g
   id="g757">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2034.4,549.6 2032.7,547.2             2030,548.6 2031.7,551.1           "
   id="polygon756" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2030.2,548.6 2028.6,546.2             2025.9,547.6 2027.6,550.1           "
   id="polygon757" />
									</g>
									<g
   id="g759">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2033.3,553.8 2031.7,551.4             2029,552.8 2030.7,555.3           "
   id="polygon758" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029.2,552.8 2027.6,550.4             2024.9,551.8 2026.6,554.3           "
   id="polygon759" />
									</g>
									<g
   id="g761">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2032.3,558 2030.7,555.6             2028,557 2029.7,559.5           "
   id="polygon760" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2028.2,557.1 2026.6,554.6             2023.9,556 2025.5,558.5           "
   id="polygon761" />
									</g>
									<g
   id="g763">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2031.3,562.3 2029.7,559.8             2027,561.2 2028.7,563.7           "
   id="polygon762" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2027.2,561.3 2025.5,558.9             2022.8,560.2 2024.5,562.7           "
   id="polygon763" />
									</g>
									<g
   id="g765">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2030.3,566.5 2028.7,564.1             2026,565.4 2027.7,567.9           "
   id="polygon764" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2026.2,565.5 2024.5,563.1             2021.8,564.5 2023.5,566.9           "
   id="polygon765" />
									</g>
									<g
   id="g767">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029.3,570.7 2027.7,568.3             2025,569.7 2026.7,572.1           "
   id="polygon766" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.2,569.7 2023.5,567.3             2020.8,568.7 2022.5,571.2           "
   id="polygon767" />
									</g>
									<g
   id="g769">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2028.3,574.9 2026.7,572.5             2024,573.9 2025.7,576.4           "
   id="polygon768" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2024.2,573.9 2022.5,571.5             2019.9,572.9 2021.6,575.4           "
   id="polygon769" />
									</g>
									<g
   id="g771">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2027.4,579.1 2025.7,576.7             2023,578.1 2024.8,580.6           "
   id="polygon770" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2023.2,578.2 2021.6,575.7             2018.9,577.2 2020.6,579.6           "
   id="polygon771" />
									</g>
									<g
   id="g773">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2026.4,583.3 2024.7,580.9             2022.1,582.3 2023.8,584.8           "
   id="polygon772" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2022.2,582.4 2020.6,580             2017.9,581.4 2019.6,583.8           "
   id="polygon773" />
									</g>
									<g
   id="g775">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.4,587.5 2023.8,585.1             2021.1,586.6 2022.8,589           "
   id="polygon774" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021.3,586.6 2019.6,584.2             2016.9,585.6 2018.7,588.1           "
   id="polygon775" />
									</g>
									<g
   id="g777">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2024.5,591.8 2022.8,589.4             2020.2,590.8 2021.9,593.2           "
   id="polygon776" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2020.3,590.8 2018.7,588.4             2016,589.9 2017.7,592.3           "
   id="polygon777" />
									</g>
									<g
   id="g779">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2023.5,596 2021.9,593.6             2019.2,595 2020.9,597.5           "
   id="polygon778" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2019.4,595.1 2017.7,592.7             2015,594.1 2016.8,596.6           "
   id="polygon779" />
									</g>
									<g
   id="g781">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2022.6,600.2 2020.9,597.8             2018.3,599.2 2020,601.7           "
   id="polygon780" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2018.4,599.3 2016.8,596.9             2014.1,598.3 2015.8,600.8           "
   id="polygon781" />
									</g>
									<g
   id="g783">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021.7,604.4 2020,602.1             2017.3,603.5 2019.1,605.9           "
   id="polygon782" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2017.5,603.5 2015.8,601.1             2013.2,602.6 2014.9,605           "
   id="polygon783" />
									</g>
									<g
   id="g785">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2020.8,608.7 2019.1,606.3             2016.4,607.7 2018.2,610.2           "
   id="polygon784" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2016.6,607.8 2014.9,605.4             2012.2,606.8 2014,609.3           "
   id="polygon785" />
									</g>
									<g
   id="g787">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2019.8,612.9 2018.2,610.5             2015.5,612 2017.3,614.4           "
   id="polygon786" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2015.7,612 2014,609.6             2011.3,611.1 2013.1,613.5           "
   id="polygon787" />
									</g>
									<g
   id="g789">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2018.9,617.1 2017.3,614.8             2014.6,616.2 2016.3,618.6           "
   id="polygon788" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2014.8,616.2 2013.1,613.9             2010.4,615.3 2012.2,617.8           "
   id="polygon789" />
									</g>
									<g
   id="g791">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2018,621.3 2016.4,619             2013.7,620.4 2015.5,622.9           "
   id="polygon790" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2013.9,620.5 2012.2,618.1             2009.5,619.6 2011.3,622           "
   id="polygon791" />
									</g>
									<g
   id="g793">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2017.2,625.6 2015.5,623.2             2012.8,624.7 2014.6,627.1           "
   id="polygon792" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2013,624.7 2011.3,622.4             2008.6,623.8 2010.4,626.3           "
   id="polygon793" />
									</g>
									<g
   id="g795">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2016.3,629.8 2014.6,627.5             2012,628.9 2013.7,631.4           "
   id="polygon794" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012.1,629 2010.4,626.6             2007.8,628.1 2009.5,630.5           "
   id="polygon795" />
									</g>
									<g
   id="g797">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2015.4,634.1 2013.7,631.7             2011.1,633.2 2012.9,635.6           "
   id="polygon796" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2011.2,633.2 2009.5,630.9             2006.9,632.3 2008.7,634.8           "
   id="polygon797" />
									</g>
									<g
   id="g799">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2014.6,638.3 2012.9,636             2010.2,637.4 2012,639.8           "
   id="polygon798" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2010.4,637.5 2008.7,635.1             2006,636.6 2007.8,639           "
   id="polygon799" />
									</g>
									<g
   id="g801">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2013.7,642.5 2012,640.2             2009.4,641.7 2011.2,644.1           "
   id="polygon800" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2009.5,641.7 2007.8,639.4             2005.2,640.9 2007,643.3           "
   id="polygon801" />
									</g>
									<g
   id="g803">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012.9,646.8 2011.2,644.4             2008.5,645.9 2010.3,648.3           "
   id="polygon802" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2008.7,646 2007,643.6             2004.4,645.1 2006.1,647.5           "
   id="polygon803" />
									</g>
									<g
   id="g805">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012.1,651 2010.3,648.7             2007.7,650.2 2009.5,652.6           "
   id="polygon804" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2007.9,650.2 2006.2,647.9             2003.5,649.4 2005.3,651.8           "
   id="polygon805" />
									</g>
									<g
   id="g807">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2011.2,655.3 2009.5,652.9             2006.9,654.4 2008.7,656.8           "
   id="polygon806" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2007,654.5 2005.3,652.1             2002.7,653.7 2004.5,656.1           "
   id="polygon807" />
									</g>
									<g
   id="g809">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2010.4,659.5 2008.7,657.2             2006.1,658.7 2007.9,661.1           "
   id="polygon808" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2006.2,658.7 2004.5,656.4             2001.9,657.9 2003.7,660.3           "
   id="polygon809" />
									</g>
									<g
   id="g811">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2009.6,663.8 2007.9,661.5             2005.3,663 2007.1,665.4           "
   id="polygon810" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2005.4,663 2003.7,660.7             2001.1,662.2 2002.9,664.6           "
   id="polygon811" />
									</g>
									<g
   id="g813">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2008.9,668 2007.1,665.7             2004.5,667.2 2006.3,669.6           "
   id="polygon812" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2004.7,667.3 2002.9,664.9             2000.3,666.5 2002.1,668.9           "
   id="polygon813" />
									</g>
									<g
   id="g815">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2008.1,672.3 2006.3,670             2003.7,671.5 2005.5,673.9           "
   id="polygon814" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.9,671.5 2002.1,669.2             1999.5,670.7 2001.3,673.1           "
   id="polygon815" />
									</g>
									<g
   id="g817">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2007.3,676.5 2005.5,674.2             2002.9,675.8 2004.8,678.1           "
   id="polygon816" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.1,675.8 2001.3,673.5             1998.7,675 2000.6,677.4           "
   id="polygon817" />
									</g>
									<g
   id="g819">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2006.5,680.8 2004.8,678.5             2002.2,680 2004,682.4           "
   id="polygon818" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2002.3,680.1 2000.6,677.8             1998,679.3 1999.8,681.7           "
   id="polygon819" />
									</g>
									<g
   id="g821">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2005.8,685.1 2004,682.8             2001.4,684.3 2003.3,686.7           "
   id="polygon820" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2001.6,684.3 1999.8,682             1997.2,683.6 1999.1,685.9           "
   id="polygon821" />
									</g>
									<g
   id="g823">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2005.1,689.3 2003.3,687             2000.7,688.6 2002.5,690.9           "
   id="polygon822" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2000.9,688.6 1999.1,686.3             1996.5,687.9 1998.3,690.2           "
   id="polygon823" />
									</g>
									<g
   id="g825">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2004.3,693.6 2002.6,691.3             2000,692.8 2001.8,695.2           "
   id="polygon824" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2000.1,692.9 1998.3,690.6             1995.7,692.1 1997.6,694.5           "
   id="polygon825" />
									</g>
									<g
   id="g827">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.6,697.9 2001.8,695.6             1999.2,697.1 2001.1,699.5           "
   id="polygon826" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1999.4,697.2 1997.6,694.9             1995,696.4 1996.9,698.8           "
   id="polygon827" />
									</g>
									<g
   id="g829">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2002.9,702.1 2001.1,699.8             1998.5,701.4 2000.4,703.8           "
   id="polygon828" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1998.7,701.4 1996.9,699.1             1994.3,700.7 1996.2,703.1           "
   id="polygon829" />
									</g>
									<g
   id="g831">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2002.2,706.4 2000.4,704.1             1997.8,705.7 1999.7,708           "
   id="polygon830" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1998,705.7 1996.2,703.4             1993.6,705 1995.5,707.4           "
   id="polygon831" />
									</g>
									<g
   id="g833">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2001.5,710.7 1999.7,708.4             1997.1,710 1999,712.3           "
   id="polygon832" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1997.3,710 1995.5,707.7             1992.9,709.3 1994.8,711.6           "
   id="polygon833" />
									</g>
									<g
   id="g835">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2000.8,714.9 1999,712.7             1996.4,714.2 1998.3,716.6           "
   id="polygon834" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.6,714.3 1994.8,712             1992.2,713.6 1994.1,715.9           "
   id="polygon835" />
									</g>
									<g
   id="g837">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2000.1,719.2 1998.3,716.9             1995.8,718.5 1997.6,720.9           "
   id="polygon836" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1995.9,718.6 1994.1,716.3             1991.5,717.9 1993.4,720.2           "
   id="polygon837" />
									</g>
									<g
   id="g839">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1999.5,723.5 1997.7,721.2             1995.1,722.8 1997,725.1           "
   id="polygon838" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1995.3,722.8 1993.5,720.6             1990.9,722.2 1992.8,724.5           "
   id="polygon839" />
									</g>
									<g
   id="g841">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1998.8,727.8 1997,725.5             1994.5,727.1 1996.3,729.4           "
   id="polygon840" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994.6,727.1 1992.8,724.9             1990.2,726.5 1992.1,728.8           "
   id="polygon841" />
									</g>
									<g
   id="g843">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1998.2,732 1996.4,729.8             1993.8,731.4 1995.7,733.7           "
   id="polygon842" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994,731.4 1992.1,729.1             1989.6,730.8 1991.5,733.1           "
   id="polygon843" />
									</g>
									<g
   id="g845">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1997.5,736.3 1995.7,734.1             1993.1,735.7 1995.1,738           "
   id="polygon844" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1993.3,735.7 1991.5,733.4             1988.9,735 1990.8,737.4           "
   id="polygon845" />
									</g>
									<g
   id="g847">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.9,740.6 1995.1,738.3             1992.5,740 1994.4,742.3           "
   id="polygon846" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.7,740 1990.9,737.7             1988.3,739.3 1990.2,741.7           "
   id="polygon847" />
									</g>
									<g
   id="g849">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.3,744.9 1994.5,742.6             1991.9,744.2 1993.8,746.6           "
   id="polygon848" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.1,744.3 1990.2,742             1987.7,743.6 1989.6,746           "
   id="polygon849" />
									</g>
									<g
   id="g851">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1995.7,749.2 1993.9,746.9             1991.3,748.5 1993.2,750.8           "
   id="polygon850" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.5,748.6 1989.6,746.3             1987.1,747.9 1989,750.3           "
   id="polygon851" />
									</g>
									<g
   id="g853">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1995.1,753.4 1993.3,751.2             1990.7,752.8 1992.6,755.1           "
   id="polygon852" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.9,752.9 1989,750.6             1986.5,752.3 1988.4,754.6           "
   id="polygon853" />
									</g>
									<g
   id="g855">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994.5,757.7 1992.7,755.5             1990.1,757.1 1992,759.4           "
   id="polygon854" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.3,757.2 1988.4,754.9             1985.9,756.6 1987.8,758.9           "
   id="polygon855" />
									</g>
									<g
   id="g857">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1993.9,762 1992.1,759.8             1989.5,761.4 1991.5,763.7           "
   id="polygon856" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.7,761.5 1987.8,759.2             1985.3,760.9 1987.2,763.2           "
   id="polygon857" />
									</g>
									<g
   id="g859">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1993.4,766.3 1991.5,764.1             1989,765.7 1990.9,768           "
   id="polygon858" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.1,765.7 1987.3,763.5             1984.7,765.2 1986.7,767.5           "
   id="polygon859" />
									</g>
									<g
   id="g861">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.8,770.6 1990.9,768.4             1988.4,770 1990.3,772.3           "
   id="polygon860" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.6,770 1986.7,767.8             1984.2,769.5 1986.1,771.8           "
   id="polygon861" />
									</g>
									<g
   id="g863">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.2,774.9 1990.4,772.7             1987.8,774.3 1989.8,776.6           "
   id="polygon862" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988,774.3 1986.1,772.1             1983.6,773.8 1985.5,776.1           "
   id="polygon863" />
									</g>
									<g
   id="g865">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.7,779.2 1989.8,777             1987.3,778.6 1989.2,780.9           "
   id="polygon864" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.4,778.6 1985.6,776.4             1983,778.1 1985,780.4           "
   id="polygon865" />
									</g>
									<g
   id="g867">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.2,783.5 1989.3,781.2             1986.8,782.9 1988.7,785.2           "
   id="polygon866" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.9,782.9 1985,780.7             1982.5,782.4 1984.5,784.7           "
   id="polygon867" />
									</g>
									<g
   id="g869">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.6,787.8 1988.8,785.5             1986.2,787.2 1988.2,789.5           "
   id="polygon868" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.4,787.3 1984.5,785             1982,786.7 1984,789           "
   id="polygon869" />
									</g>
									<g
   id="g871">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.1,792.1 1988.2,789.8             1985.7,791.5 1987.7,793.8           "
   id="polygon870" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.9,791.6 1984,789.3             1981.5,791 1983.4,793.3           "
   id="polygon871" />
									</g>
									<g
   id="g873">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.6,796.4 1987.7,794.1             1985.2,795.8 1987.2,798.1           "
   id="polygon872" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.4,795.9 1983.5,793.7             1981,795.3 1982.9,797.6           "
   id="polygon873" />
									</g>
									<g
   id="g875">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.1,800.6 1987.2,798.4             1984.7,800.1 1986.6,802.4           "
   id="polygon874" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.8,800.2 1983,798             1980.4,799.7 1982.4,801.9           "
   id="polygon875" />
									</g>
									<g
   id="g877">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.6,804.9 1986.7,802.7             1984.2,804.4 1986.2,806.7           "
   id="polygon876" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.3,804.5 1982.4,802.3             1979.9,804 1981.9,806.2           "
   id="polygon877" />
									</g>
									<g
   id="g879">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.1,809.2 1986.2,807.1             1983.7,808.8 1985.7,811           "
   id="polygon878" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.9,808.8 1982,806.6             1979.5,808.3 1981.4,810.5           "
   id="polygon879" />
									</g>
									<g
   id="g881">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.6,813.6 1985.7,811.4             1983.2,813.1 1985.2,815.3           "
   id="polygon880" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.4,813.1 1981.5,810.9             1979,812.6 1981,814.9           "
   id="polygon881" />
									</g>
									<g
   id="g883">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.2,817.9 1985.3,815.7             1982.8,817.4 1984.7,819.6           "
   id="polygon882" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.9,817.4 1981,815.2             1978.5,816.9 1980.5,819.2           "
   id="polygon883" />
									</g>
									<g
   id="g885">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.7,822.2 1984.8,820             1982.3,821.7 1984.3,823.9           "
   id="polygon884" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.4,821.7 1980.5,819.5             1978,821.2 1980,823.5           "
   id="polygon885" />
									</g>
									<g
   id="g886">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1986.2,826.4            c-0.6-0.7-1.3-1.4-1.9-2.2l-2.5,1.7l2,2.2L1986.2,826.4z"
   id="path885" />
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1982,826l-1.9-2.2            c-0.8,0.6-1.7,1.1-2.5,1.7l2,2.3L1982,826z"
   id="path886" />
									</g>
									<g
   id="g887">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.8,830.7 1983.9,828.6             1981.4,830.3 1983.4,832.5           "
   id="polygon886" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.6,830.3 1979.6,828.2             1977.2,829.9 1979.2,832.2           "
   id="polygon887" />
									</g>
									<g
   id="g889">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.5,835 1983.5,832.9             1981.1,834.6 1983.1,836.8           "
   id="polygon888" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.2,834.7 1979.2,832.5             1976.8,834.3 1978.9,836.5           "
   id="polygon889" />
									</g>
									<g
   id="g891">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.2,839.3 1983.2,837.2             1980.8,839 1982.8,841.1           "
   id="polygon890" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.9,839 1978.9,836.9             1976.5,838.7 1978.6,840.9           "
   id="polygon891" />
									</g>
									<g
   id="g893">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.9,843.5 1982.9,841.5             1980.5,843.3 1982.6,845.4           "
   id="polygon892" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.6,843.3 1978.6,841.2             1976.2,843 1978.3,845.2           "
   id="polygon893" />
									</g>
									<g
   id="g895">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.7,847.8 1982.6,845.8             1980.2,847.6 1982.4,849.7           "
   id="polygon894" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,847.6 1978.4,845.5             1976,847.4 1978.1,849.5           "
   id="polygon895" />
									</g>
									<g
   id="g897">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.5,852.1 1982.4,850.1             1980,851.9 1982.2,854.1           "
   id="polygon896" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.2,852 1978.2,849.9             1975.8,851.8 1977.9,853.9           "
   id="polygon897" />
									</g>
									<g
   id="g899">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.3,856.5 1982.2,854.4             1979.8,856.3 1982,858.4           "
   id="polygon898" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980,856.3 1978,854.2             1975.6,856.1 1977.7,858.2           "
   id="polygon899" />
									</g>
									<g
   id="g901">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.1,860.8 1982,858.7             1979.7,860.6 1981.8,862.7           "
   id="polygon900" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.8,860.6 1977.8,858.6             1975.4,860.5 1977.6,862.6           "
   id="polygon901" />
									</g>
									<g
   id="g903">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984,865.1 1981.9,863             1979.5,864.9 1981.7,867           "
   id="polygon902" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.7,865 1977.6,862.9             1975.3,864.8 1977.4,866.9           "
   id="polygon903" />
									</g>
									<g
   id="g905">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.8,869.4 1981.8,867.4             1979.4,869.3 1981.6,871.4           "
   id="polygon904" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.6,869.3 1977.5,867.3             1975.1,869.2 1977.3,871.2           "
   id="polygon905" />
									</g>
									<g
   id="g907">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.7,873.7 1981.6,871.7             1979.3,873.6 1981.4,875.7           "
   id="polygon906" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.4,873.6 1977.4,871.6             1975,873.5 1977.2,875.6           "
   id="polygon907" />
									</g>
									<g
   id="g909">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.6,878.1 1981.5,876             1979.2,877.9 1981.3,880           "
   id="polygon908" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.3,878 1977.2,875.9             1974.9,877.8 1977.1,879.9           "
   id="polygon909" />
									</g>
									<g
   id="g911">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.5,882.4 1981.4,880.4             1979.1,882.3 1981.2,884.3           "
   id="polygon910" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.2,882.3 1977.1,880.3             1974.8,882.2 1977,884.3           "
   id="polygon911" />
									</g>
									<g
   id="g913">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.4,886.7 1981.3,884.7             1979,886.6 1981.1,888.7           "
   id="polygon912" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.1,886.6 1977,884.6             1974.7,886.5 1976.8,888.6           "
   id="polygon913" />
									</g>
									<g
   id="g915">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.3,891.1 1981.2,889             1978.8,890.9 1981,893           "
   id="polygon914" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979,891 1976.9,888.9             1974.6,890.8 1976.7,892.9           "
   id="polygon915" />
									</g>
									<g
   id="g917">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.2,895.4 1981.1,893.4             1978.7,895.3 1980.9,897.4           "
   id="polygon916" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.9,895.3 1976.8,893.3             1974.5,895.2 1976.6,897.2           "
   id="polygon917" />
									</g>
									<g
   id="g919">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983,899.8 1980.9,897.7             1978.6,899.6 1980.7,901.7           "
   id="polygon918" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.8,899.6 1976.7,897.6             1974.3,899.5 1976.5,901.6           "
   id="polygon919" />
									</g>
									<g
   id="g921">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.9,904.1 1980.8,902.1             1978.4,903.9 1980.6,906           "
   id="polygon920" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.6,904 1976.5,901.9             1974.2,903.8 1976.3,905.9           "
   id="polygon921" />
									</g>
									<g
   id="g923">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.7,908.4 1980.6,906.4             1978.3,908.3 1980.4,910.4           "
   id="polygon922" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.4,908.3 1976.4,906.2             1974,908.1 1976.1,910.2           "
   id="polygon923" />
									</g>
									<g
   id="g925">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.5,912.8 1980.5,910.7             1978.1,912.6 1980.2,914.7           "
   id="polygon924" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.3,912.6 1976.2,910.6             1973.8,912.4 1976,914.5           "
   id="polygon925" />
									</g>
									<g
   id="g927">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.4,917.1 1980.3,915.1             1977.9,916.9 1980.1,919.1           "
   id="polygon926" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.1,917 1976,914.9             1973.7,916.8 1975.8,918.9           "
   id="polygon927" />
									</g>
									<g
   id="g929">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.2,921.5 1980.1,919.4             1977.7,921.3 1979.9,923.4           "
   id="polygon928" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.9,921.3 1975.8,919.2             1973.5,921.1 1975.6,923.2           "
   id="polygon929" />
									</g>
									<g
   id="g931">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982,925.8 1979.9,923.7             1977.5,925.6 1979.7,927.7           "
   id="polygon930" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.7,925.6 1975.7,923.6             1973.3,925.4 1975.4,927.5           "
   id="polygon931" />
									</g>
									<g
   id="g933">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.8,930.1 1979.7,928.1             1977.4,929.9 1979.5,932           "
   id="polygon932" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.5,929.9 1975.5,927.9             1973.1,929.8 1975.2,931.9           "
   id="polygon933" />
									</g>
									<g
   id="g935">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.6,934.5 1979.6,932.4             1977.2,934.3 1979.3,936.4           "
   id="polygon934" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.3,934.3 1975.3,932.2             1972.9,934.1 1975,936.2           "
   id="polygon935" />
									</g>
									<g
   id="g937">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.4,938.8 1979.4,936.7             1977,938.6 1979.1,940.7           "
   id="polygon936" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.2,938.6 1975.1,936.5             1972.7,938.4 1974.9,940.5           "
   id="polygon937" />
									</g>
									<g
   id="g939">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.2,943.1 1979.2,941             1976.8,942.9 1979,945           "
   id="polygon938" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977,942.9 1974.9,940.9             1972.5,942.8 1974.7,944.9           "
   id="polygon939" />
									</g>
									<g
   id="g941">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.1,947.4 1979,945.4             1976.6,947.3 1978.8,949.4           "
   id="polygon940" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.8,947.3 1974.7,945.2             1972.4,947.1 1974.5,949.2           "
   id="polygon941" />
									</g>
									<g
   id="g943">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.9,951.7 1978.9,949.7             1976.5,951.6 1978.6,953.7           "
   id="polygon942" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.7,951.6 1974.6,949.6             1972.2,951.4 1974.4,953.5           "
   id="polygon943" />
									</g>
									<g
   id="g945">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.8,956.1 1978.7,954             1976.3,955.9 1978.5,958           "
   id="polygon944" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.5,955.9 1974.4,953.9             1972.1,955.8 1974.2,957.9           "
   id="polygon945" />
									</g>
									<g
   id="g947">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.7,960.4 1978.6,958.4             1976.2,960.3 1978.4,962.3           "
   id="polygon946" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.4,960.3 1974.3,958.2             1971.9,960.1 1974.1,962.2           "
   id="polygon947" />
									</g>
									<g
   id="g949">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.5,964.7 1978.5,962.7             1976.1,964.6 1978.3,966.7           "
   id="polygon948" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.3,964.6 1974.2,962.6             1971.8,964.5 1974,966.6           "
   id="polygon949" />
									</g>
									<g
   id="g951">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.5,969 1978.4,967             1976,968.9 1978.2,971           "
   id="polygon950" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.2,968.9 1974.1,966.9             1971.7,968.9 1973.9,970.9           "
   id="polygon951" />
									</g>
									<g
   id="g953">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,973.3 1978.3,971.3             1976,973.3 1978.2,975.3           "
   id="polygon952" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,973.3 1974,971.3             1971.7,973.2 1973.9,975.3           "
   id="polygon953" />
									</g>
									<g
   id="g955">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,977.6 1978.2,975.6             1975.9,977.6 1978.1,979.6           "
   id="polygon954" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,977.6 1974,975.6             1971.6,977.6 1973.9,979.6           "
   id="polygon955" />
									</g>
									<g
   id="g957">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,981.9 1978.2,980             1975.9,981.9 1978.1,984           "
   id="polygon956" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,981.9 1973.9,980             1971.6,981.9 1973.9,984           "
   id="polygon957" />
									</g>
									<g
   id="g959">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.3,986.3 1978.2,984.3             1975.9,986.3 1978.1,988.3           "
   id="polygon958" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,986.3 1973.9,984.3             1971.6,986.3 1973.9,988.3           "
   id="polygon959" />
									</g>
									<g
   id="g961">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.3,990.6 1978.2,988.6             1975.9,990.6 1978.1,992.6           "
   id="polygon960" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,990.6 1973.9,988.6             1971.6,990.6 1973.8,992.6           "
   id="polygon961" />
									</g>
									<g
   id="g963">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.3,994.9 1978.2,993             1975.9,994.9 1978.1,997           "
   id="polygon962" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,994.9 1973.9,993             1971.6,995 1973.8,997           "
   id="polygon963" />
									</g>
									<g
   id="g965">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,999.3 1978.2,997.3             1975.9,999.3 1978.2,1001.3           "
   id="polygon964" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,999.3 1973.9,997.3             1971.6,999.3 1973.9,1001.3           "
   id="polygon965" />
									</g>
									<g
   id="g967">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,1003.6 1978.2,1001.6             1975.9,1003.6 1978.2,1005.6           "
   id="polygon966" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,1003.6 1974,1001.7             1971.7,1003.6 1973.9,1005.7           "
   id="polygon967" />
									</g>
									<g
   id="g969">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,1007.9 1978.3,1006             1976,1007.9 1978.2,1009.9           "
   id="polygon968" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.1,1008 1974,1006             1971.7,1008 1973.9,1010           "
   id="polygon969" />
									</g>
									<g
   id="g971">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.4,1012.2 1978.3,1010.3             1976,1012.3 1978.2,1014.3           "
   id="polygon970" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.2,1012.3 1974,1010.3             1971.7,1012.3 1974,1014.3           "
   id="polygon971" />
									</g>
									<g
   id="g973">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.5,1016.6 1978.3,1014.6             1976.1,1016.6 1978.3,1018.6           "
   id="polygon972" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.2,1016.6 1974.1,1014.7             1971.8,1016.7 1974,1018.7           "
   id="polygon973" />
									</g>
									<g
   id="g975">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.6,1020.9 1978.4,1018.9             1976.1,1020.9 1978.4,1022.9           "
   id="polygon974" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.3,1021 1974.1,1019             1971.9,1021 1974.1,1023           "
   id="polygon975" />
									</g>
									<g
   id="g977">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.6,1025.2 1978.5,1023.3             1976.2,1025.3 1978.5,1027.3           "
   id="polygon976" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.4,1025.3 1974.2,1023.4             1971.9,1025.4 1974.2,1027.3           "
   id="polygon977" />
									</g>
									<g
   id="g979">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.7,1029.5 1978.5,1027.6             1976.3,1029.6 1978.5,1031.6           "
   id="polygon978" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.4,1029.6 1974.3,1027.7             1972,1029.7 1974.2,1031.7           "
   id="polygon979" />
									</g>
									<g
   id="g981">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.8,1033.9 1978.6,1031.9             1976.3,1034 1978.6,1035.9           "
   id="polygon980" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.5,1034 1974.3,1032             1972.1,1034.1 1974.3,1036           "
   id="polygon981" />
									</g>
									<g
   id="g983">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.9,1038.2 1978.7,1036.3             1976.5,1038.3 1978.7,1040.3           "
   id="polygon982" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.6,1038.3 1974.4,1036.4             1972.2,1038.4 1974.5,1040.4           "
   id="polygon983" />
									</g>
									<g
   id="g985">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981,1042.5 1978.8,1040.6             1976.6,1042.6 1978.8,1044.6           "
   id="polygon984" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.7,1042.6 1974.5,1040.7             1972.3,1042.7 1974.6,1044.7           "
   id="polygon985" />
									</g>
									<g
   id="g987">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.1,1046.8 1978.9,1044.9             1976.7,1047 1978.9,1048.9           "
   id="polygon986" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.8,1047 1974.6,1045             1972.4,1047.1 1974.7,1049           "
   id="polygon987" />
									</g>
									<g
   id="g989">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.2,1051.2 1979,1049.3             1976.8,1051.3 1979.1,1053.2           "
   id="polygon988" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.9,1051.3 1974.8,1049.4             1972.5,1051.4 1974.8,1053.4           "
   id="polygon989" />
									</g>
									<g
   id="g991">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.4,1055.5 1979.2,1053.6             1976.9,1055.6 1979.2,1057.6           "
   id="polygon990" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.1,1055.6 1974.9,1053.7             1972.7,1055.8 1974.9,1057.7           "
   id="polygon991" />
									</g>
									<g
   id="g993">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.5,1059.8 1979.3,1057.9             1977.1,1060 1979.4,1061.9           "
   id="polygon992" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.2,1060 1975,1058.1             1972.8,1060.1 1975.1,1062.1           "
   id="polygon993" />
									</g>
									<g
   id="g995">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.7,1064.1 1979.5,1062.2             1977.2,1064.3 1979.5,1066.2           "
   id="polygon994" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.4,1064.3 1975.2,1062.4             1973,1064.5 1975.2,1066.4           "
   id="polygon995" />
									</g>
									<g
   id="g997">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.8,1068.5 1979.6,1066.6             1977.4,1068.6 1979.7,1070.6           "
   id="polygon996" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.5,1068.6 1975.3,1066.7             1973.1,1068.8 1975.4,1070.7           "
   id="polygon997" />
									</g>
									<g
   id="g999">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982,1072.8 1979.8,1070.9             1977.6,1073 1979.9,1074.9           "
   id="polygon998" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.7,1073 1975.5,1071.1             1973.3,1073.1 1975.6,1075.1           "
   id="polygon999" />
									</g>
									<g
   id="g1001">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.2,1077.1 1980,1075.2             1977.7,1077.3 1980,1079.2           "
   id="polygon1000" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.9,1077.3 1975.7,1075.4             1973.5,1077.5 1975.8,1079.4           "
   id="polygon1001" />
									</g>
									<g
   id="g1003">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.4,1081.4 1980.1,1079.5             1977.9,1081.6 1980.2,1083.5           "
   id="polygon1002" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.1,1081.6 1975.9,1079.7             1973.7,1081.8 1976,1083.7           "
   id="polygon1003" />
									</g>
									<g
   id="g1005">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.5,1085.7 1980.3,1083.9             1978.1,1085.9 1980.4,1087.9           "
   id="polygon1004" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.3,1085.9 1976.1,1084.1             1973.8,1086.2 1976.2,1088.1           "
   id="polygon1005" />
									</g>
									<g
   id="g1007">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.8,1090.1 1980.5,1088.2             1978.3,1090.3 1980.7,1092.2           "
   id="polygon1006" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.5,1090.3 1976.3,1088.4             1974.1,1090.5 1976.4,1092.4           "
   id="polygon1007" />
									</g>
									<g
   id="g1009">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983,1094.4 1980.8,1092.5             1978.6,1094.6 1980.9,1096.5           "
   id="polygon1008" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.7,1094.6 1976.5,1092.7             1974.3,1094.8 1976.6,1096.7           "
   id="polygon1009" />
									</g>
									<g
   id="g1011">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.2,1098.7 1981,1096.8             1978.8,1098.9 1981.1,1100.8           "
   id="polygon1010" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979,1098.9 1976.7,1097.1             1974.5,1099.2 1976.9,1101.1           "
   id="polygon1011" />
									</g>
									<g
   id="g1013">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.5,1103 1981.2,1101.2             1979,1103.3 1981.4,1105.2           "
   id="polygon1012" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.2,1103.3 1976.9,1101.4             1974.8,1103.5 1977.1,1105.4           "
   id="polygon1013" />
									</g>
									<g
   id="g1015">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.7,1107.3 1981.5,1105.5             1979.3,1107.6 1981.6,1109.5           "
   id="polygon1014" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.5,1107.6 1977.2,1105.7             1975,1107.9 1977.4,1109.7           "
   id="polygon1015" />
									</g>
									<g
   id="g1017">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984,1111.6 1981.7,1109.8             1979.6,1111.9 1981.9,1113.8           "
   id="polygon1016" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1979.7,1111.9 1977.5,1110.1             1975.3,1112.2 1977.6,1114.1           "
   id="polygon1017" />
									</g>
									<g
   id="g1019">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.3,1116 1982,1114.1             1979.8,1116.2 1982.2,1118.1           "
   id="polygon1018" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980,1116.2 1977.7,1114.4             1975.6,1116.5 1977.9,1118.4           "
   id="polygon1019" />
									</g>
									<g
   id="g1021">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.5,1120.3 1982.3,1118.5             1980.1,1120.6 1982.5,1122.4           "
   id="polygon1020" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.3,1120.6 1978,1118.7             1975.8,1120.9 1978.2,1122.7           "
   id="polygon1021" />
									</g>
									<g
   id="g1023">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.8,1124.6 1982.6,1122.8             1980.4,1124.9 1982.8,1126.8           "
   id="polygon1022" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.6,1124.9 1978.3,1123.1             1976.2,1125.2 1978.5,1127.1           "
   id="polygon1023" />
									</g>
									<g
   id="g1025">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.1,1128.9 1982.9,1127.1             1980.7,1129.2 1983.1,1131.1           "
   id="polygon1024" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980.9,1129.2 1978.6,1127.4             1976.5,1129.5 1978.8,1131.4           "
   id="polygon1025" />
									</g>
									<g
   id="g1027">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.5,1133.2 1983.2,1131.4             1981,1133.5 1983.4,1135.4           "
   id="polygon1026" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.2,1133.5 1978.9,1131.7             1976.8,1133.9 1979.1,1135.7           "
   id="polygon1027" />
									</g>
									<g
   id="g1029">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.8,1137.5 1983.5,1135.7             1981.4,1137.9 1983.7,1139.7           "
   id="polygon1028" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.5,1137.9 1979.2,1136.1             1977.1,1138.2 1979.5,1140.1           "
   id="polygon1029" />
									</g>
									<g
   id="g1031">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.1,1141.8 1983.8,1140             1981.7,1142.2 1984.1,1144           "
   id="polygon1030" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.9,1142.2 1979.6,1140.4             1977.5,1142.5 1979.8,1144.4           "
   id="polygon1031" />
									</g>
									<g
   id="g1033">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.5,1146.1 1984.2,1144.4             1982.1,1146.5 1984.4,1148.3           "
   id="polygon1032" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.2,1146.5 1979.9,1144.7             1977.8,1146.9 1980.2,1148.7           "
   id="polygon1033" />
									</g>
									<g
   id="g1035">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.8,1150.5 1984.5,1148.7             1982.4,1150.8 1984.8,1152.7           "
   id="polygon1034" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.6,1150.8 1980.3,1149             1978.2,1151.2 1980.5,1153           "
   id="polygon1035" />
									</g>
									<g
   id="g1037">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.2,1154.8 1984.9,1153             1982.8,1155.2 1985.2,1157           "
   id="polygon1036" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983,1155.1 1980.6,1153.4             1978.5,1155.5 1980.9,1157.4           "
   id="polygon1037" />
									</g>
									<g
   id="g1039">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.6,1159.1 1985.3,1157.3             1983.2,1159.5 1985.6,1161.3           "
   id="polygon1038" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.4,1159.5 1981,1157.7             1978.9,1159.9 1981.3,1161.7           "
   id="polygon1039" />
									</g>
									<g
   id="g1041">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988,1163.4 1985.7,1161.6             1983.6,1163.8 1986,1165.6           "
   id="polygon1040" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.8,1163.8 1981.4,1162             1979.3,1164.2 1981.7,1166           "
   id="polygon1041" />
									</g>
									<g
   id="g1043">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.4,1167.7 1986.1,1165.9             1984,1168.1 1986.4,1169.9           "
   id="polygon1042" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.2,1168.1 1981.8,1166.3             1979.7,1168.5 1982.1,1170.3           "
   id="polygon1043" />
									</g>
									<g
   id="g1045">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.8,1172 1986.5,1170.2             1984.4,1172.4 1986.8,1174.2           "
   id="polygon1044" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.6,1172.4 1982.3,1170.7             1980.2,1172.9 1982.6,1174.6           "
   id="polygon1045" />
									</g>
									<g
   id="g1047">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.3,1176.3 1986.9,1174.5             1984.9,1176.7 1987.3,1178.5           "
   id="polygon1046" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985,1176.7 1982.7,1175             1980.6,1177.2 1983,1179           "
   id="polygon1047" />
									</g>
									<g
   id="g1049">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.7,1180.6 1987.4,1178.8             1985.3,1181 1987.7,1182.8           "
   id="polygon1048" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.5,1181 1983.1,1179.3             1981.1,1181.5 1983.5,1183.3           "
   id="polygon1049" />
									</g>
									<g
   id="g1051">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.2,1184.9 1987.8,1183.2             1985.8,1185.4 1988.2,1187.1           "
   id="polygon1050" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.9,1185.3 1983.6,1183.6             1981.5,1185.8 1983.9,1187.6           "
   id="polygon1051" />
									</g>
									<g
   id="g1053">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.7,1189.2 1988.3,1187.5             1986.2,1189.7 1988.7,1191.4           "
   id="polygon1052" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.4,1189.7 1984.1,1187.9             1982,1190.1 1984.4,1191.9           "
   id="polygon1053" />
									</g>
									<g
   id="g1055">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.1,1193.5 1988.8,1191.8             1986.7,1194 1989.2,1195.7           "
   id="polygon1054" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1986.9,1194 1984.6,1192.2             1982.5,1194.5 1984.9,1196.2           "
   id="polygon1055" />
									</g>
									<g
   id="g1057">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.6,1197.8 1989.3,1196.1             1987.2,1198.3 1989.7,1200           "
   id="polygon1056" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.4,1198.3 1985,1196.6             1983,1198.8 1985.4,1200.5           "
   id="polygon1057" />
									</g>
									<g
   id="g1059">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.2,1202.1 1989.8,1200.4             1987.7,1202.6 1990.2,1204.3           "
   id="polygon1058" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987.9,1202.6 1985.5,1200.9             1983.5,1203.1 1986,1204.8           "
   id="polygon1059" />
									</g>
									<g
   id="g1061">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.7,1206.3 1990.3,1204.7             1988.3,1206.9 1990.7,1208.6           "
   id="polygon1060" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.4,1206.9 1986.1,1205.2             1984,1207.4 1986.5,1209.2           "
   id="polygon1061" />
									</g>
									<g
   id="g1063">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1993.2,1210.6 1990.8,1208.9             1988.8,1211.2 1991.3,1212.9           "
   id="polygon1062" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989,1211.2 1986.6,1209.5             1984.6,1211.7 1987,1213.5           "
   id="polygon1063" />
									</g>
									<g
   id="g1065">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1993.8,1214.9 1991.4,1213.2             1989.4,1215.5 1991.8,1217.2           "
   id="polygon1064" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.5,1215.5 1987.1,1213.8             1985.1,1216.1 1987.6,1217.8           "
   id="polygon1065" />
									</g>
									<g
   id="g1067">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994.3,1219.2 1992,1217.5             1989.9,1219.8 1992.4,1221.5           "
   id="polygon1066" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.1,1219.8 1987.7,1218.1             1985.7,1220.4 1988.2,1222.1           "
   id="polygon1067" />
									</g>
									<g
   id="g1069">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994.9,1223.5 1992.5,1221.8             1990.5,1224.1 1993,1225.8           "
   id="polygon1068" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.7,1224.1 1988.3,1222.4             1986.3,1224.7 1988.8,1226.4           "
   id="polygon1069" />
									</g>
									<g
   id="g1071">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1995.5,1227.8 1993.1,1226.1             1991.1,1228.4 1993.6,1230.1           "
   id="polygon1070" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.3,1228.4 1988.9,1226.7             1986.9,1229 1989.4,1230.7           "
   id="polygon1071" />
									</g>
									<g
   id="g1073">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.1,1232 1993.7,1230.4             1991.7,1232.7 1994.2,1234.3           "
   id="polygon1072" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.9,1232.7 1989.5,1231             1987.5,1233.3 1990,1235           "
   id="polygon1073" />
									</g>
									<g
   id="g1075">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.7,1236.3 1994.3,1234.7             1992.4,1237 1994.8,1238.6           "
   id="polygon1074" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.5,1236.9 1990.1,1235.3             1988.1,1237.6 1990.6,1239.3           "
   id="polygon1075" />
									</g>
								</g>
							</g>
						</g>
					</g>
					<g
   clip-path="url(#SVGID_00000134225643552151101190000001929809485296274323_)"
   id="g2038">
						<path
   fill="none"
   stroke="#000000"
   stroke-width="1.0178"
   stroke-miterlimit="10"
   d="M1345.2,409.6        c34.3,42.1,68.5,84.1,102.8,126.2c23.6,87.9,44.9,194.1,55,315.5c13.3,160.3,3,299.7-13.2,409.2c-79.1,0-158.1,0-237.2,0        c0-285.3,0-570.7,0-856C1283.4,406.2,1314.3,407.9,1345.2,409.6z"
   id="path1079" />
						<g
   id="g2037">
							<g
   id="g2036">
								<g
   id="g2035">
									<g
   id="g1080">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.6,1263.3 1492.6,1261.2             1490.6,1258.9 1488.6,1261.1           "
   id="polygon1079" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.6,1259.1 1492.6,1256.9             1490.6,1254.6 1488.6,1256.8           "
   id="polygon1080" />
									</g>
									<g
   id="g1082">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1486.3,1263.3 1488.3,1261.2             1486.3,1258.9 1484.3,1261.1           "
   id="polygon1081" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1486.3,1259 1488.3,1256.9             1486.3,1254.6 1484.3,1256.8           "
   id="polygon1082" />
									</g>
									<g
   id="g1084">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1482,1263.3 1483.9,1261.2             1482,1258.8 1480,1261.1           "
   id="polygon1083" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1482,1259 1484,1256.9             1482,1254.6 1480,1256.8           "
   id="polygon1084" />
									</g>
									<g
   id="g1086">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.7,1263.3 1479.6,1261.1             1477.7,1258.8 1475.7,1261           "
   id="polygon1085" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.7,1259 1479.6,1256.9             1477.7,1254.6 1475.7,1256.8           "
   id="polygon1086" />
									</g>
									<g
   id="g1088">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.3,1263.2 1475.3,1261.1             1473.4,1258.8 1471.3,1261           "
   id="polygon1087" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.4,1259 1475.3,1256.8             1473.4,1254.5 1471.4,1256.7           "
   id="polygon1088" />
									</g>
									<g
   id="g1090">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469,1263.2 1471,1261.1             1469,1258.8 1467,1261           "
   id="polygon1089" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469,1259 1471,1256.8             1469.1,1254.5 1467,1256.7           "
   id="polygon1090" />
									</g>
									<g
   id="g1092">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464.7,1263.2 1466.7,1261.1             1464.7,1258.8 1462.7,1261           "
   id="polygon1091" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464.7,1258.9 1466.7,1256.8             1464.7,1254.5 1462.7,1256.7           "
   id="polygon1092" />
									</g>
									<g
   id="g1094">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1460.4,1263.2 1462.4,1261.1             1460.4,1258.7 1458.4,1261           "
   id="polygon1093" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1460.4,1258.9 1462.4,1256.8             1460.4,1254.5 1458.4,1256.7           "
   id="polygon1094" />
									</g>
									<g
   id="g1096">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1456.1,1263.2 1458,1261             1456.1,1258.7 1454.1,1260.9           "
   id="polygon1095" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1456.1,1258.9 1458.1,1256.8             1456.1,1254.5 1454.1,1256.7           "
   id="polygon1096" />
									</g>
									<g
   id="g1098">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1451.8,1263.1 1453.7,1261             1451.8,1258.7 1449.8,1260.9           "
   id="polygon1097" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1451.8,1258.9 1453.7,1256.7             1451.8,1254.4 1449.8,1256.6           "
   id="polygon1098" />
									</g>
									<g
   id="g1100">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1447.4,1263.1 1449.4,1261             1447.5,1258.7 1445.4,1260.9           "
   id="polygon1099" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1447.5,1258.9 1449.4,1256.7             1447.5,1254.4 1445.5,1256.6           "
   id="polygon1100" />
									</g>
									<g
   id="g1102">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.1,1263.1 1445.1,1261             1443.2,1258.7 1441.1,1260.9           "
   id="polygon1101" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.1,1258.8 1445.1,1256.7             1443.2,1254.4 1441.1,1256.6           "
   id="polygon1102" />
									</g>
									<g
   id="g1104">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.8,1263.1 1440.8,1261             1438.8,1258.6 1436.8,1260.9           "
   id="polygon1103" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.8,1258.8 1440.8,1256.7             1438.8,1254.4 1436.8,1256.6           "
   id="polygon1104" />
									</g>
									<g
   id="g1106">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.5,1263.1 1436.5,1260.9             1434.5,1258.6 1432.5,1260.8           "
   id="polygon1105" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.5,1258.8 1436.5,1256.7             1434.5,1254.4 1432.5,1256.6           "
   id="polygon1106" />
									</g>
									<g
   id="g1108">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1430.2,1263 1432.2,1260.9             1430.2,1258.6 1428.2,1260.8           "
   id="polygon1107" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1430.2,1258.8 1432.2,1256.6             1430.2,1254.3 1428.2,1256.5           "
   id="polygon1108" />
									</g>
									<g
   id="g1110">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1425.9,1263 1427.8,1260.9             1425.9,1258.6 1423.9,1260.8           "
   id="polygon1109" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1425.9,1258.8 1427.9,1256.6             1425.9,1254.3 1423.9,1256.5           "
   id="polygon1110" />
									</g>
									<g
   id="g1112">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1421.6,1263 1423.5,1260.9             1421.6,1258.6 1419.6,1260.8           "
   id="polygon1111" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1421.6,1258.7 1423.5,1256.6             1421.6,1254.3 1419.6,1256.5           "
   id="polygon1112" />
									</g>
									<g
   id="g1114">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1417.2,1263 1419.2,1260.9             1417.3,1258.5 1415.2,1260.8           "
   id="polygon1113" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1417.2,1258.7 1419.2,1256.6             1417.3,1254.3 1415.2,1256.5           "
   id="polygon1114" />
									</g>
									<g
   id="g1116">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1412.9,1263 1414.9,1260.8             1412.9,1258.5 1410.9,1260.7           "
   id="polygon1115" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1412.9,1258.7 1414.9,1256.6             1413,1254.3 1410.9,1256.5           "
   id="polygon1116" />
									</g>
									<g
   id="g1118">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1408.6,1262.9 1410.6,1260.8             1408.6,1258.5 1406.6,1260.7           "
   id="polygon1117" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1408.6,1258.7 1410.6,1256.5             1408.6,1254.2 1406.6,1256.4           "
   id="polygon1118" />
									</g>
									<g
   id="g1120">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1404.3,1262.9 1406.3,1260.8             1404.3,1258.5 1402.3,1260.7           "
   id="polygon1119" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1404.3,1258.6 1406.3,1256.5             1404.3,1254.2 1402.3,1256.4           "
   id="polygon1120" />
									</g>
									<g
   id="g1122">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1400,1262.9 1401.9,1260.8             1400,1258.5 1398,1260.7           "
   id="polygon1121" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1400,1258.6 1402,1256.5             1400,1254.2 1398,1256.4           "
   id="polygon1122" />
									</g>
									<g
   id="g1124">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1395.7,1262.9 1397.6,1260.7             1395.7,1258.4 1393.7,1260.7           "
   id="polygon1123" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1395.7,1258.6 1397.6,1256.5             1395.7,1254.2 1393.7,1256.4           "
   id="polygon1124" />
									</g>
									<g
   id="g1126">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1391.3,1262.9 1393.3,1260.7             1391.4,1258.4 1389.3,1260.6           "
   id="polygon1125" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1391.4,1258.6 1393.3,1256.5             1391.4,1254.1 1389.4,1256.4           "
   id="polygon1126" />
									</g>
									<g
   id="g1128">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1387,1262.8 1389,1260.7             1387,1258.4 1385,1260.6           "
   id="polygon1127" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1387,1258.6 1389,1256.4             1387.1,1254.1 1385,1256.3           "
   id="polygon1128" />
									</g>
									<g
   id="g1130">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1382.7,1262.8 1384.7,1260.7             1382.7,1258.4 1380.7,1260.6           "
   id="polygon1129" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1382.7,1258.5 1384.7,1256.4             1382.7,1254.1 1380.7,1256.3           "
   id="polygon1130" />
									</g>
									<g
   id="g1132">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1378.4,1262.8 1380.4,1260.7             1378.4,1258.4 1376.4,1260.6           "
   id="polygon1131" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1378.4,1258.5 1380.4,1256.4             1378.4,1254.1 1376.4,1256.3           "
   id="polygon1132" />
									</g>
									<g
   id="g1134">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1374.1,1262.8 1376.1,1260.6             1374.1,1258.3 1372.1,1260.5           "
   id="polygon1133" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1374.1,1258.5 1376.1,1256.4             1374.1,1254.1 1372.1,1256.3           "
   id="polygon1134" />
									</g>
									<g
   id="g1136">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1369.8,1262.8 1371.7,1260.6             1369.8,1258.3 1367.8,1260.5           "
   id="polygon1135" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1369.8,1258.5 1371.7,1256.4             1369.8,1254 1367.8,1256.3           "
   id="polygon1136" />
									</g>
									<g
   id="g1138">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1365.4,1262.7 1367.4,1260.6             1365.5,1258.3 1363.4,1260.5           "
   id="polygon1137" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1365.5,1258.5 1367.4,1256.3             1365.5,1254 1363.5,1256.2           "
   id="polygon1138" />
									</g>
									<g
   id="g1140">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1361.1,1262.7 1363.1,1260.6             1361.2,1258.3 1359.1,1260.5           "
   id="polygon1139" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1361.1,1258.4 1363.1,1256.3             1361.2,1254 1359.1,1256.2           "
   id="polygon1140" />
									</g>
									<g
   id="g1142">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1356.8,1262.7 1358.8,1260.6             1356.8,1258.3 1354.8,1260.5           "
   id="polygon1141" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1356.8,1258.4 1358.8,1256.3             1356.9,1254 1354.8,1256.2           "
   id="polygon1142" />
									</g>
									<g
   id="g1144">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1352.5,1262.7 1354.5,1260.5             1352.5,1258.2 1350.5,1260.4           "
   id="polygon1143" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1352.5,1258.4 1354.5,1256.3             1352.5,1254 1350.5,1256.2           "
   id="polygon1144" />
									</g>
									<g
   id="g1146">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1348.2,1262.7 1350.2,1260.5             1348.2,1258.2 1346.2,1260.4           "
   id="polygon1145" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1348.2,1258.4 1350.2,1256.3             1348.2,1253.9 1346.2,1256.2           "
   id="polygon1146" />
									</g>
									<g
   id="g1148">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1343.9,1262.6 1345.8,1260.5             1343.9,1258.2 1341.9,1260.4           "
   id="polygon1147" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1343.9,1258.4 1345.9,1256.2             1343.9,1253.9 1341.9,1256.1           "
   id="polygon1148" />
									</g>
									<g
   id="g1150">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1339.6,1262.6 1341.5,1260.5             1339.6,1258.2 1337.6,1260.4           "
   id="polygon1149" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1339.6,1258.3 1341.5,1256.2             1339.6,1253.9 1337.6,1256.1           "
   id="polygon1150" />
									</g>
									<g
   id="g1152">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1335.2,1262.6 1337.2,1260.5             1335.3,1258.2 1333.2,1260.4           "
   id="polygon1151" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1335.3,1258.3 1337.2,1256.2             1335.3,1253.9 1333.3,1256.1           "
   id="polygon1152" />
									</g>
									<g
   id="g1154">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1330.9,1262.6 1332.9,1260.4             1330.9,1258.1 1328.9,1260.3           "
   id="polygon1153" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1330.9,1258.3 1332.9,1256.2             1331,1253.9 1328.9,1256.1           "
   id="polygon1154" />
									</g>
									<g
   id="g1156">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1326.6,1262.6 1328.6,1260.4             1326.6,1258.1 1324.6,1260.3           "
   id="polygon1155" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1326.6,1258.3 1328.6,1256.2             1326.6,1253.8 1324.6,1256.1           "
   id="polygon1156" />
									</g>
									<g
   id="g1158">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1322.3,1262.5 1324.3,1260.4             1322.3,1258.1 1320.3,1260.3           "
   id="polygon1157" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1322.3,1258.3 1324.3,1256.1             1322.3,1253.8 1320.3,1256           "
   id="polygon1158" />
									</g>
									<g
   id="g1160">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1318,1262.5 1319.9,1260.4             1318,1258.1 1316,1260.3           "
   id="polygon1159" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1318,1258.2 1320,1256.1             1318,1253.8 1316,1256           "
   id="polygon1160" />
									</g>
									<g
   id="g1162">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1313.7,1262.5 1315.6,1260.4             1313.7,1258.1 1311.7,1260.3           "
   id="polygon1161" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1313.7,1258.2 1315.6,1256.1             1313.7,1253.8 1311.7,1256           "
   id="polygon1162" />
									</g>
									<g
   id="g1164">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1309.3,1262.5 1311.3,1260.3             1309.4,1258 1307.3,1260.2           "
   id="polygon1163" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1309.4,1258.2 1311.3,1256.1             1309.4,1253.8 1307.4,1256           "
   id="polygon1164" />
									</g>
									<g
   id="g1166">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1305,1262.5 1307,1260.3             1305.1,1258 1303,1260.2           "
   id="polygon1165" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1305,1258.2 1307,1256             1305.1,1253.7 1303,1256           "
   id="polygon1166" />
									</g>
									<g
   id="g1168">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1300.7,1262.4 1302.7,1260.3             1300.7,1258 1298.7,1260.2           "
   id="polygon1167" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1300.7,1258.2 1302.7,1256             1300.7,1253.7 1298.7,1255.9           "
   id="polygon1168" />
									</g>
									<g
   id="g1170">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1296.4,1262.4 1298.4,1260.3             1296.4,1258 1294.4,1260.2           "
   id="polygon1169" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1296.4,1258.1 1298.4,1256             1296.4,1253.7 1294.4,1255.9           "
   id="polygon1170" />
									</g>
									<g
   id="g1172">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1292.1,1262.4 1294.1,1260.3             1292.1,1258 1290.1,1260.2           "
   id="polygon1171" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1292.1,1258.1 1294.1,1256             1292.1,1253.7 1290.1,1255.9           "
   id="polygon1172" />
									</g>
									<g
   id="g1174">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1287.8,1262.4 1289.7,1260.2             1287.8,1257.9 1285.8,1260.1           "
   id="polygon1173" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1287.8,1258.1 1289.8,1256             1287.8,1253.7 1285.8,1255.9           "
   id="polygon1174" />
									</g>
									<g
   id="g1176">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1283.5,1262.3 1285.4,1260.2             1283.5,1257.9 1281.4,1260.1           "
   id="polygon1175" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1283.5,1258.1 1285.4,1255.9             1283.5,1253.6 1281.5,1255.8           "
   id="polygon1176" />
									</g>
									<g
   id="g1178">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1279.1,1262.3 1281.1,1260.2             1279.2,1257.9 1277.1,1260.1           "
   id="polygon1177" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1279.1,1258.1 1281.1,1255.9             1279.2,1253.6 1277.1,1255.8           "
   id="polygon1178" />
									</g>
									<g
   id="g1180">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1274.8,1262.3 1276.8,1260.2             1274.8,1257.9 1272.8,1260.1           "
   id="polygon1179" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1274.8,1258 1276.8,1255.9             1274.9,1253.6 1272.8,1255.8           "
   id="polygon1180" />
									</g>
									<g
   id="g1182">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1270.5,1262.3 1272.5,1260.2             1270.5,1257.9 1268.5,1260.1           "
   id="polygon1181" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1270.5,1258 1272.5,1255.9             1270.5,1253.6 1268.5,1255.8           "
   id="polygon1182" />
									</g>
									<g
   id="g1184">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1266.2,1262.3 1268.2,1260.1             1266.2,1257.8 1264.2,1260           "
   id="polygon1183" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1266.2,1258 1268.2,1255.9             1266.2,1253.6 1264.2,1255.8           "
   id="polygon1184" />
									</g>
									<g
   id="g1186">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.2,1251.2 1257.3,1253.2             1259.6,1251.2 1257.4,1249.2           "
   id="polygon1185" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.4,1251.2 1261.6,1253.2             1263.9,1251.2 1261.7,1249.2           "
   id="polygon1186" />
									</g>
									<g
   id="g1188">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.2,1246.8 1257.3,1248.8             1259.6,1246.9 1257.4,1244.8           "
   id="polygon1187" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.4,1246.8 1261.6,1248.8             1263.9,1246.9 1261.7,1244.8           "
   id="polygon1188" />
									</g>
									<g
   id="g1190">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.2,1242.5 1257.3,1244.5             1259.6,1242.5 1257.4,1240.5           "
   id="polygon1189" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.5,1242.5 1261.6,1244.5             1263.9,1242.5 1261.7,1240.5           "
   id="polygon1190" />
									</g>
									<g
   id="g1192">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.2,1238.2 1257.3,1240.1             1259.7,1238.2 1257.4,1236.1           "
   id="polygon1191" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.5,1238.2 1261.6,1240.1             1263.9,1238.2 1261.7,1236.1           "
   id="polygon1192" />
									</g>
									<g
   id="g1194">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.2,1233.8 1257.4,1235.8             1259.7,1233.8 1257.5,1231.8           "
   id="polygon1193" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.5,1233.8 1261.6,1235.8             1263.9,1233.8 1261.7,1231.8           "
   id="polygon1194" />
									</g>
									<g
   id="g1196">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.3,1229.5 1257.4,1231.4             1259.7,1229.5 1257.5,1227.5           "
   id="polygon1195" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.5,1229.5 1261.7,1231.5             1264,1229.5 1261.8,1227.5           "
   id="polygon1196" />
									</g>
									<g
   id="g1198">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.3,1225.1 1257.4,1227.1             1259.7,1225.1 1257.5,1223.1           "
   id="polygon1197" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.5,1225.1 1261.7,1227.1             1264,1225.2 1261.8,1223.1           "
   id="polygon1198" />
									</g>
									<g
   id="g1200">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.3,1220.8 1257.4,1222.8             1259.7,1220.8 1257.5,1218.8           "
   id="polygon1199" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.6,1220.8 1261.7,1222.8             1264,1220.8 1261.8,1218.8           "
   id="polygon1200" />
									</g>
									<g
   id="g1202">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.3,1216.4 1257.4,1218.4             1259.8,1216.5 1257.5,1214.4           "
   id="polygon1201" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.6,1216.5 1261.7,1218.4             1264,1216.5 1261.8,1214.4           "
   id="polygon1202" />
									</g>
									<g
   id="g1204">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.3,1212.1 1257.5,1214.1             1259.8,1212.1 1257.6,1210.1           "
   id="polygon1203" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.6,1212.1 1261.7,1214.1             1264,1212.1 1261.8,1210.1           "
   id="polygon1204" />
									</g>
									<g
   id="g1206">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.4,1207.8 1257.5,1209.7             1259.8,1207.8 1257.6,1205.7           "
   id="polygon1205" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.6,1207.8 1261.8,1209.8             1264.1,1207.8 1261.9,1205.8           "
   id="polygon1206" />
									</g>
									<g
   id="g1208">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.4,1203.4 1257.5,1205.4             1259.8,1203.4 1257.6,1201.4           "
   id="polygon1207" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.7,1203.4 1261.8,1205.4             1264.1,1203.4 1261.9,1201.4           "
   id="polygon1208" />
									</g>
									<g
   id="g1210">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.4,1199.1 1257.5,1201.1             1259.8,1199.1 1257.6,1197.1           "
   id="polygon1209" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.7,1199.1 1261.8,1201.1             1264.1,1199.1 1261.9,1197.1           "
   id="polygon1210" />
									</g>
									<g
   id="g1212">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.4,1194.7 1257.6,1196.7             1259.9,1194.8 1257.6,1192.7           "
   id="polygon1211" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.7,1194.7 1261.8,1196.7             1264.1,1194.8 1261.9,1192.7           "
   id="polygon1212" />
									</g>
									<g
   id="g1214">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.4,1190.4 1257.6,1192.4             1259.9,1190.4 1257.7,1188.4           "
   id="polygon1213" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.7,1190.4 1261.8,1192.4             1264.2,1190.4 1261.9,1188.4           "
   id="polygon1214" />
									</g>
									<g
   id="g1216">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.5,1186 1257.6,1188             1259.9,1186.1 1257.7,1184           "
   id="polygon1215" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.7,1186.1 1261.9,1188             1264.2,1186.1 1262,1184           "
   id="polygon1216" />
									</g>
									<g
   id="g1218">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.5,1181.7 1257.6,1183.7             1259.9,1181.7 1257.7,1179.7           "
   id="polygon1217" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.8,1181.7 1261.9,1183.7             1264.2,1181.7 1262,1179.7           "
   id="polygon1218" />
									</g>
									<g
   id="g1220">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.5,1177.4 1257.6,1179.3             1259.9,1177.4 1257.7,1175.3           "
   id="polygon1219" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.8,1177.4 1261.9,1179.4             1264.2,1177.4 1262,1175.4           "
   id="polygon1220" />
									</g>
									<g
   id="g1222">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.5,1173 1257.7,1175             1260,1173 1257.8,1171           "
   id="polygon1221" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.8,1173 1261.9,1175             1264.2,1173.1 1262,1171           "
   id="polygon1222" />
									</g>
									<g
   id="g1224">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.5,1168.7 1257.7,1170.7             1260,1168.7 1257.8,1166.7           "
   id="polygon1223" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.8,1168.7 1261.9,1170.7             1264.3,1168.7 1262,1166.7           "
   id="polygon1224" />
									</g>
									<g
   id="g1226">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.6,1164.3 1257.7,1166.3             1260,1164.4 1257.8,1162.3           "
   id="polygon1225" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.8,1164.3 1262,1166.3             1264.3,1164.4 1262.1,1162.3           "
   id="polygon1226" />
									</g>
									<g
   id="g1228">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.6,1160 1257.7,1162             1260,1160 1257.8,1158           "
   id="polygon1227" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.9,1160 1262,1162             1264.3,1160 1262.1,1158           "
   id="polygon1228" />
									</g>
									<g
   id="g1230">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.6,1155.7 1257.7,1157.6             1260,1155.7 1257.8,1153.6           "
   id="polygon1229" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.9,1155.7 1262,1157.6             1264.3,1155.7 1262.1,1153.7           "
   id="polygon1230" />
									</g>
									<g
   id="g1232">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.6,1151.3 1257.8,1153.3             1260.1,1151.3 1257.9,1149.3           "
   id="polygon1231" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.9,1151.3 1262,1153.3             1264.3,1151.3 1262.1,1149.3           "
   id="polygon1232" />
									</g>
									<g
   id="g1234">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.6,1147 1257.8,1149             1260.1,1147 1257.9,1145           "
   id="polygon1233" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.9,1147 1262,1149             1264.4,1147 1262.1,1145           "
   id="polygon1234" />
									</g>
									<g
   id="g1236">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.7,1142.6 1257.8,1144.6             1260.1,1142.6 1257.9,1140.6           "
   id="polygon1235" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.9,1142.6 1262.1,1144.6             1264.4,1142.7 1262.2,1140.6           "
   id="polygon1236" />
									</g>
									<g
   id="g1238">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.7,1138.3 1257.8,1140.3             1260.1,1138.3 1257.9,1136.3           "
   id="polygon1237" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260,1138.3 1262.1,1140.3             1264.4,1138.3 1262.2,1136.3           "
   id="polygon1238" />
									</g>
									<g
   id="g1240">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.7,1133.9 1257.8,1135.9             1260.1,1134 1257.9,1131.9           "
   id="polygon1239" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260,1134 1262.1,1135.9             1264.4,1134 1262.2,1131.9           "
   id="polygon1240" />
									</g>
									<g
   id="g1242">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.7,1129.6 1257.9,1131.6             1260.2,1129.6 1258,1127.6           "
   id="polygon1241" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260,1129.6 1262.1,1131.6             1264.4,1129.6 1262.2,1127.6           "
   id="polygon1242" />
									</g>
									<g
   id="g1244">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.7,1125.3 1257.9,1127.2             1260.2,1125.3 1258,1123.2           "
   id="polygon1243" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260,1125.3 1262.2,1127.3             1264.5,1125.3 1262.2,1123.3           "
   id="polygon1244" />
									</g>
									<g
   id="g1246">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.8,1120.9 1257.9,1122.9             1260.2,1120.9 1258,1118.9           "
   id="polygon1245" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260,1120.9 1262.2,1122.9             1264.5,1121 1262.3,1118.9           "
   id="polygon1246" />
									</g>
									<g
   id="g1248">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.8,1116.6 1257.9,1118.6             1260.2,1116.6 1258,1114.6           "
   id="polygon1247" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.1,1116.6 1262.2,1118.6             1264.5,1116.6 1262.3,1114.6           "
   id="polygon1248" />
									</g>
									<g
   id="g1250">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.8,1112.2 1257.9,1114.2             1260.2,1112.3 1258,1110.2           "
   id="polygon1249" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.1,1112.2 1262.2,1114.2             1264.5,1112.3 1262.3,1110.2           "
   id="polygon1250" />
									</g>
									<g
   id="g1252">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.8,1107.9 1258,1109.9             1260.3,1107.9 1258.1,1105.9           "
   id="polygon1251" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.1,1107.9 1262.2,1109.9             1264.5,1107.9 1262.3,1105.9           "
   id="polygon1252" />
									</g>
									<g
   id="g1254">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.9,1103.5 1258,1105.5             1260.3,1103.6 1258.1,1101.5           "
   id="polygon1253" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.1,1103.6 1262.3,1105.5             1264.6,1103.6 1262.4,1101.5           "
   id="polygon1254" />
									</g>
									<g
   id="g1256">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.9,1099.2 1258,1101.2             1260.3,1099.2 1258.1,1097.2           "
   id="polygon1255" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.1,1099.2 1262.3,1101.2             1264.6,1099.2 1262.4,1097.2           "
   id="polygon1256" />
									</g>
									<g
   id="g1258">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.9,1094.9 1258,1096.8             1260.3,1094.9 1258.1,1092.9           "
   id="polygon1257" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.2,1094.9 1262.3,1096.9             1264.6,1094.9 1262.4,1092.9           "
   id="polygon1258" />
									</g>
									<g
   id="g1260">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.9,1090.5 1258,1092.5             1260.4,1090.5 1258.1,1088.5           "
   id="polygon1259" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.2,1090.5 1262.3,1092.5             1264.6,1090.6 1262.4,1088.5           "
   id="polygon1260" />
									</g>
									<g
   id="g1262">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1255.9,1086.2 1258.1,1088.2             1260.4,1086.2 1258.2,1084.2           "
   id="polygon1261" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.2,1086.2 1262.3,1088.2             1264.6,1086.2 1262.4,1084.2           "
   id="polygon1262" />
									</g>
									<g
   id="g1264">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256,1081.8 1258.1,1083.8             1260.4,1081.9 1258.2,1079.8           "
   id="polygon1263" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.2,1081.9 1262.4,1083.8             1264.7,1081.9 1262.5,1079.8           "
   id="polygon1264" />
									</g>
									<g
   id="g1266">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256,1077.5 1258.1,1079.5             1260.4,1077.5 1258.2,1075.5           "
   id="polygon1265" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.2,1077.5 1262.4,1079.5             1264.7,1077.5 1262.5,1075.5           "
   id="polygon1266" />
									</g>
									<g
   id="g1268">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256,1073.2 1258.1,1075.1             1260.4,1073.2 1258.2,1071.1           "
   id="polygon1267" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.3,1073.2 1262.4,1075.2             1264.7,1073.2 1262.5,1071.2           "
   id="polygon1268" />
									</g>
									<g
   id="g1270">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256,1068.8 1258.1,1070.8             1260.5,1068.8 1258.2,1066.8           "
   id="polygon1269" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.3,1068.8 1262.4,1070.8             1264.7,1068.8 1262.5,1066.8           "
   id="polygon1270" />
									</g>
									<g
   id="g1272">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256,1064.5 1258.2,1066.5             1260.5,1064.5 1258.3,1062.5           "
   id="polygon1271" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.3,1064.5 1262.4,1066.5             1264.7,1064.5 1262.5,1062.5           "
   id="polygon1272" />
									</g>
									<g
   id="g1274">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.1,1060.1 1258.2,1062.1             1260.5,1060.2 1258.3,1058.1           "
   id="polygon1273" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.3,1060.1 1262.5,1062.1             1264.8,1060.2 1262.6,1058.1           "
   id="polygon1274" />
									</g>
									<g
   id="g1276">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.1,1055.8 1258.2,1057.8             1260.5,1055.8 1258.3,1053.8           "
   id="polygon1275" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.3,1055.8 1262.5,1057.8             1264.8,1055.8 1262.6,1053.8           "
   id="polygon1276" />
									</g>
									<g
   id="g1278">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.1,1051.4 1258.2,1053.4             1260.5,1051.5 1258.3,1049.4           "
   id="polygon1277" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.4,1051.5 1262.5,1053.4             1264.8,1051.5 1262.6,1049.4           "
   id="polygon1278" />
									</g>
									<g
   id="g1280">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.1,1047.1 1258.2,1049.1             1260.6,1047.1 1258.3,1045.1           "
   id="polygon1279" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.4,1047.1 1262.5,1049.1             1264.8,1047.1 1262.6,1045.1           "
   id="polygon1280" />
									</g>
									<g
   id="g1282">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.1,1042.8 1258.3,1044.7             1260.6,1042.8 1258.4,1040.7           "
   id="polygon1281" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.4,1042.8 1262.5,1044.8             1264.8,1042.8 1262.6,1040.8           "
   id="polygon1282" />
									</g>
									<g
   id="g1284">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.2,1038.4 1258.3,1040.4             1260.6,1038.4 1258.4,1036.4           "
   id="polygon1283" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.4,1038.4 1262.6,1040.4             1264.9,1038.5 1262.7,1036.4           "
   id="polygon1284" />
									</g>
									<g
   id="g1286">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.2,1034.1 1258.3,1036.1             1260.6,1034.1 1258.4,1032.1           "
   id="polygon1285" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.5,1034.1 1262.6,1036.1             1264.9,1034.1 1262.7,1032.1           "
   id="polygon1286" />
									</g>
									<g
   id="g1288">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.2,1029.7 1258.3,1031.7             1260.6,1029.8 1258.4,1027.7           "
   id="polygon1287" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.5,1029.7 1262.6,1031.7             1264.9,1029.8 1262.7,1027.7           "
   id="polygon1288" />
									</g>
									<g
   id="g1290">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.2,1025.4 1258.4,1027.4             1260.7,1025.4 1258.4,1023.4           "
   id="polygon1289" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.5,1025.4 1262.6,1027.4             1264.9,1025.4 1262.7,1023.4           "
   id="polygon1290" />
									</g>
									<g
   id="g1292">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.2,1021.1 1258.4,1023             1260.7,1021.1 1258.5,1019           "
   id="polygon1291" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.5,1021.1 1262.6,1023             1265,1021.1 1262.7,1019.1           "
   id="polygon1292" />
									</g>
									<g
   id="g1294">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.3,1016.7 1258.4,1018.7             1260.7,1016.7 1258.5,1014.7           "
   id="polygon1293" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.5,1016.7 1262.7,1018.7             1265,1016.7 1262.8,1014.7           "
   id="polygon1294" />
									</g>
									<g
   id="g1296">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.3,1012.4 1258.4,1014.4             1260.7,1012.4 1258.5,1010.4           "
   id="polygon1295" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.6,1012.4 1262.7,1014.4             1265,1012.4 1262.8,1010.4           "
   id="polygon1296" />
									</g>
									<g
   id="g1298">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.3,1008 1258.4,1010             1260.7,1008 1258.5,1006           "
   id="polygon1297" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.6,1008 1262.7,1010             1265,1008.1 1262.8,1006           "
   id="polygon1298" />
									</g>
									<g
   id="g1300">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.3,1003.7 1258.5,1005.7             1260.8,1003.7 1258.6,1001.7           "
   id="polygon1299" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.6,1003.7 1262.7,1005.7             1265,1003.7 1262.8,1001.7           "
   id="polygon1300" />
									</g>
									<g
   id="g1302">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.3,999.3 1258.5,1001.3             1260.8,999.4 1258.6,997.3           "
   id="polygon1301" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.6,999.4 1262.7,1001.3             1265.1,999.4 1262.8,997.3           "
   id="polygon1302" />
									</g>
									<g
   id="g1304">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.4,995 1258.5,997             1260.8,995 1258.6,993           "
   id="polygon1303" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.6,995 1262.8,997             1265.1,995 1262.9,993           "
   id="polygon1304" />
									</g>
									<g
   id="g1306">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.4,990.7 1258.5,992.6             1260.8,990.7 1258.6,988.6           "
   id="polygon1305" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.7,990.7 1262.8,992.7             1265.1,990.7 1262.9,988.7           "
   id="polygon1306" />
									</g>
									<g
   id="g1308">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.4,986.3 1258.5,988.3             1260.8,986.3 1258.6,984.3           "
   id="polygon1307" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.7,986.3 1262.8,988.3             1265.1,986.4 1262.9,984.3           "
   id="polygon1308" />
									</g>
									<g
   id="g1310">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.4,982 1258.6,984             1260.9,982 1258.7,980           "
   id="polygon1309" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.7,982 1262.8,984             1265.1,982 1262.9,980           "
   id="polygon1310" />
									</g>
									<g
   id="g1312">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.4,977.6 1258.6,979.6             1260.9,977.7 1258.7,975.6           "
   id="polygon1311" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.7,977.6 1262.8,979.6             1265.2,977.7 1262.9,975.6           "
   id="polygon1312" />
									</g>
									<g
   id="g1314">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.5,973.3 1258.6,975.3             1260.9,973.3 1258.7,971.3           "
   id="polygon1313" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.7,973.3 1262.9,975.3             1265.2,973.3 1263,971.3           "
   id="polygon1314" />
									</g>
									<g
   id="g1316">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.5,968.9 1258.6,970.9             1260.9,969 1258.7,966.9           "
   id="polygon1315" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.8,969 1262.9,970.9             1265.2,969 1263,966.9           "
   id="polygon1316" />
									</g>
									<g
   id="g1318">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.5,964.6 1258.6,966.6             1260.9,964.6 1258.7,962.6           "
   id="polygon1317" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.8,964.6 1262.9,966.6             1265.2,964.6 1263,962.6           "
   id="polygon1318" />
									</g>
									<g
   id="g1320">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.5,960.3 1258.7,962.2             1261,960.3 1258.8,958.3           "
   id="polygon1319" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.8,960.3 1262.9,962.3             1265.2,960.3 1263,958.3           "
   id="polygon1320" />
									</g>
									<g
   id="g1322">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.5,955.9 1258.7,957.9             1261,955.9 1258.8,953.9           "
   id="polygon1321" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.8,955.9 1263,957.9             1265.3,956 1263,953.9           "
   id="polygon1322" />
									</g>
									<g
   id="g1324">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.6,951.6 1258.7,953.6             1261,951.6 1258.8,949.6           "
   id="polygon1323" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.8,951.6 1263,953.6             1265.3,951.6 1263.1,949.6           "
   id="polygon1324" />
									</g>
									<g
   id="g1326">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.6,947.2 1258.7,949.2             1261,947.3 1258.8,945.2           "
   id="polygon1325" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.9,947.3 1263,949.2             1265.3,947.3 1263.1,945.2           "
   id="polygon1326" />
									</g>
									<g
   id="g1328">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.6,942.9 1258.7,944.9             1261,942.9 1258.8,940.9           "
   id="polygon1327" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.9,942.9 1263,944.9             1265.3,942.9 1263.1,940.9           "
   id="polygon1328" />
									</g>
									<g
   id="g1330">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.6,938.6 1258.8,940.5             1261.1,938.6 1258.9,936.5           "
   id="polygon1329" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.9,938.6 1263,940.6             1265.3,938.6 1263.1,936.6           "
   id="polygon1330" />
									</g>
									<g
   id="g1332">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.7,934.2 1258.8,936.2             1261.1,934.2 1258.9,932.2           "
   id="polygon1331" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.9,934.2 1263.1,936.2             1265.4,934.2 1263.2,932.2           "
   id="polygon1332" />
									</g>
									<g
   id="g1334">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.7,929.9 1258.8,931.9             1261.1,929.9 1258.9,927.9           "
   id="polygon1333" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1260.9,929.9 1263.1,931.9             1265.4,929.9 1263.2,927.9           "
   id="polygon1334" />
									</g>
									<g
   id="g1336">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.7,925.5 1258.8,927.5             1261.1,925.6 1258.9,923.5           "
   id="polygon1335" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261,925.5 1263.1,927.5             1265.4,925.6 1263.2,923.5           "
   id="polygon1336" />
									</g>
									<g
   id="g1338">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.7,921.2 1258.8,923.2             1261.2,921.2 1258.9,919.2           "
   id="polygon1337" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261,921.2 1263.1,923.2             1265.4,921.2 1263.2,919.2           "
   id="polygon1338" />
									</g>
									<g
   id="g1340">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.7,916.8 1258.9,918.8             1261.2,916.9 1259,914.8           "
   id="polygon1339" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261,916.9 1263.1,918.8             1265.4,916.9 1263.2,914.8           "
   id="polygon1340" />
									</g>
									<g
   id="g1342">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.8,912.5 1258.9,914.5             1261.2,912.5 1259,910.5           "
   id="polygon1341" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261,912.5 1263.2,914.5             1265.5,912.5 1263.3,910.5           "
   id="polygon1342" />
									</g>
									<g
   id="g1344">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.8,908.2 1258.9,910.1             1261.2,908.2 1259,906.1           "
   id="polygon1343" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261,908.2 1263.2,910.2             1265.5,908.2 1263.3,906.2           "
   id="polygon1344" />
									</g>
									<g
   id="g1346">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.8,903.8 1258.9,905.8             1261.2,903.8 1259,901.8           "
   id="polygon1345" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.1,903.8 1263.2,905.8             1265.5,903.9 1263.3,901.8           "
   id="polygon1346" />
									</g>
									<g
   id="g1348">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.8,899.5 1258.9,901.5             1261.3,899.5 1259,897.5           "
   id="polygon1347" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.1,899.5 1263.2,901.5             1265.5,899.5 1263.3,897.5           "
   id="polygon1348" />
									</g>
									<g
   id="g1350">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.8,895.1 1259,897.1             1261.3,895.2 1259.1,893.1           "
   id="polygon1349" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.1,895.1 1263.2,897.1             1265.5,895.2 1263.3,893.1           "
   id="polygon1350" />
									</g>
									<g
   id="g1352">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.9,890.8 1259,892.8             1261.3,890.8 1259.1,888.8           "
   id="polygon1351" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.1,890.8 1263.3,892.8             1265.6,890.8 1263.4,888.8           "
   id="polygon1352" />
									</g>
									<g
   id="g1354">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.9,886.5 1259,888.4             1261.3,886.5 1259.1,884.4           "
   id="polygon1353" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.1,886.5 1263.3,888.4             1265.6,886.5 1263.4,884.5           "
   id="polygon1354" />
									</g>
									<g
   id="g1356">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.9,882.1 1259,884.1             1261.3,882.1 1259.1,880.1           "
   id="polygon1355" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.2,882.1 1263.3,884.1             1265.6,882.1 1263.4,880.1           "
   id="polygon1356" />
									</g>
									<g
   id="g1358">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.9,877.8 1259,879.8             1261.4,877.8 1259.1,875.8           "
   id="polygon1357" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.2,877.8 1263.3,879.8             1265.6,877.8 1263.4,875.8           "
   id="polygon1358" />
									</g>
									<g
   id="g1360">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1256.9,873.4 1259.1,875.4             1261.4,873.4 1259.2,871.4           "
   id="polygon1359" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.2,873.4 1263.3,875.4             1265.6,873.5 1263.4,871.4           "
   id="polygon1360" />
									</g>
									<g
   id="g1362">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257,869.1 1259.1,871.1             1261.4,869.1 1259.2,867.1           "
   id="polygon1361" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.2,869.1 1263.4,871.1             1265.7,869.1 1263.5,867.1           "
   id="polygon1362" />
									</g>
									<g
   id="g1364">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257,864.7 1259.1,866.7             1261.4,864.8 1259.2,862.7           "
   id="polygon1363" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.3,864.8 1263.4,866.7             1265.7,864.8 1263.5,862.7           "
   id="polygon1364" />
									</g>
									<g
   id="g1366">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257,860.4 1259.1,862.4             1261.4,860.4 1259.2,858.4           "
   id="polygon1365" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.3,860.4 1263.4,862.4             1265.7,860.4 1263.5,858.4           "
   id="polygon1366" />
									</g>
									<g
   id="g1368">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257,856.1 1259.2,858             1261.5,856.1 1259.2,854           "
   id="polygon1367" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.3,856.1 1263.4,858.1             1265.7,856.1 1263.5,854.1           "
   id="polygon1368" />
									</g>
									<g
   id="g1370">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257,851.7 1259.2,853.7             1261.5,851.7 1259.3,849.7           "
   id="polygon1369" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.3,851.7 1263.4,853.7             1265.8,851.8 1263.5,849.7           "
   id="polygon1370" />
									</g>
									<g
   id="g1372">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.1,847.4 1259.2,849.4             1261.5,847.4 1259.3,845.4           "
   id="polygon1371" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.3,847.4 1263.5,849.4             1265.8,847.4 1263.6,845.4           "
   id="polygon1372" />
									</g>
									<g
   id="g1374">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.1,843 1259.2,845             1261.5,843.1 1259.3,841           "
   id="polygon1373" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.4,843 1263.5,845             1265.8,843.1 1263.6,841           "
   id="polygon1374" />
									</g>
									<g
   id="g1376">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.1,838.7 1259.2,840.7             1261.5,838.7 1259.3,836.7           "
   id="polygon1375" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.4,838.7 1263.5,840.7             1265.8,838.7 1263.6,836.7           "
   id="polygon1376" />
									</g>
									<g
   id="g1378">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.1,834.3 1259.3,836.3             1261.6,834.4 1259.4,832.3           "
   id="polygon1377" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.4,834.4 1263.5,836.3             1265.8,834.4 1263.6,832.3           "
   id="polygon1378" />
									</g>
									<g
   id="g1380">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.1,830 1259.3,832             1261.6,830 1259.4,828           "
   id="polygon1379" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.4,830 1263.5,832             1265.9,830 1263.6,828           "
   id="polygon1380" />
									</g>
									<g
   id="g1382">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.2,825.7 1259.3,827.6             1261.6,825.7 1259.4,823.7           "
   id="polygon1381" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.4,825.7 1263.6,827.7             1265.9,825.7 1263.7,823.7           "
   id="polygon1382" />
									</g>
									<g
   id="g1384">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.2,821.3 1259.3,823.3             1261.6,821.3 1259.4,819.3           "
   id="polygon1383" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.5,821.3 1263.6,823.3             1265.9,821.4 1263.7,819.3           "
   id="polygon1384" />
									</g>
									<g
   id="g1386">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.2,817 1259.3,819             1261.6,817 1259.4,815           "
   id="polygon1385" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.5,817 1263.6,819             1265.9,817 1263.7,815           "
   id="polygon1386" />
									</g>
									<g
   id="g1388">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.2,812.6 1259.4,814.6             1261.7,812.7 1259.5,810.6           "
   id="polygon1387" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.5,812.7 1263.6,814.6             1265.9,812.7 1263.7,810.6           "
   id="polygon1388" />
									</g>
									<g
   id="g1390">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.2,808.3 1259.4,810.3             1261.7,808.3 1259.5,806.3           "
   id="polygon1389" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.5,808.3 1263.6,810.3             1266,808.3 1263.7,806.3           "
   id="polygon1390" />
									</g>
									<g
   id="g1392">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.3,804 1259.4,805.9             1261.7,804 1259.5,801.9           "
   id="polygon1391" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.5,804 1263.7,806             1266,804 1263.8,802           "
   id="polygon1392" />
									</g>
									<g
   id="g1394">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.3,799.6 1259.4,801.6             1261.7,799.6 1259.5,797.6           "
   id="polygon1393" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.6,799.6 1263.7,801.6             1266,799.6 1263.8,797.6           "
   id="polygon1394" />
									</g>
									<g
   id="g1396">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.3,795.3 1259.4,797.3             1261.7,795.3 1259.5,793.3           "
   id="polygon1395" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.6,795.3 1263.7,797.3             1266,795.3 1263.8,793.3           "
   id="polygon1396" />
									</g>
									<g
   id="g1398">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.3,790.9 1259.5,792.9             1261.8,791 1259.6,788.9           "
   id="polygon1397" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.6,790.9 1263.7,792.9             1266,791 1263.8,788.9           "
   id="polygon1398" />
									</g>
									<g
   id="g1400">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.3,786.6 1259.5,788.6             1261.8,786.6 1259.6,784.6           "
   id="polygon1399" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.6,786.6 1263.8,788.6             1266.1,786.6 1263.8,784.6           "
   id="polygon1400" />
									</g>
									<g
   id="g1402">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.4,782.2 1259.5,784.2             1261.8,782.3 1259.6,780.2           "
   id="polygon1401" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.6,782.3 1263.8,784.2             1266.1,782.3 1263.9,780.2           "
   id="polygon1402" />
									</g>
									<g
   id="g1404">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.4,777.9 1259.5,779.9             1261.8,777.9 1259.6,775.9           "
   id="polygon1403" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.7,777.9 1263.8,779.9             1266.1,777.9 1263.9,775.9           "
   id="polygon1404" />
									</g>
									<g
   id="g1406">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.4,773.6 1259.5,775.5             1261.8,773.6 1259.6,771.5           "
   id="polygon1405" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.7,773.6 1263.8,775.6             1266.1,773.6 1263.9,771.6           "
   id="polygon1406" />
									</g>
									<g
   id="g1408">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.4,769.2 1259.6,771.2             1261.9,769.2 1259.7,767.2           "
   id="polygon1407" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.7,769.2 1263.8,771.2             1266.1,769.3 1263.9,767.2           "
   id="polygon1408" />
									</g>
									<g
   id="g1410">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.5,764.9 1259.6,766.9             1261.9,764.9 1259.7,762.9           "
   id="polygon1409" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.7,764.9 1263.9,766.9             1266.2,764.9 1264,762.9           "
   id="polygon1410" />
									</g>
									<g
   id="g1412">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.5,760.5 1259.6,762.5             1261.9,760.6 1259.7,758.5           "
   id="polygon1411" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.7,760.5 1263.9,762.5             1266.2,760.6 1264,758.5           "
   id="polygon1412" />
									</g>
									<g
   id="g1414">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.5,756.2 1259.6,758.2             1261.9,756.2 1259.7,754.2           "
   id="polygon1413" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.8,756.2 1263.9,758.2             1266.2,756.2 1264,754.2           "
   id="polygon1414" />
									</g>
									<g
   id="g1416">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.5,751.9 1259.6,753.8             1262,751.9 1259.7,749.8           "
   id="polygon1415" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.8,751.9 1263.9,753.8             1266.2,751.9 1264,749.9           "
   id="polygon1416" />
									</g>
									<g
   id="g1418">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.5,747.5 1259.7,749.5             1262,747.5 1259.8,745.5           "
   id="polygon1417" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.8,747.5 1263.9,749.5             1266.2,747.5 1264,745.5           "
   id="polygon1418" />
									</g>
									<g
   id="g1420">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.6,743.2 1259.7,745.2             1262,743.2 1259.8,741.2           "
   id="polygon1419" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.8,743.2 1264,745.2             1266.3,743.2 1264.1,741.2           "
   id="polygon1420" />
									</g>
									<g
   id="g1422">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.6,738.8 1259.7,740.8             1262,738.8 1259.8,736.8           "
   id="polygon1421" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.8,738.8 1264,740.8             1266.3,738.9 1264.1,736.8           "
   id="polygon1422" />
									</g>
									<g
   id="g1424">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.6,734.5 1259.7,736.5             1262,734.5 1259.8,732.5           "
   id="polygon1423" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.9,734.5 1264,736.5             1266.3,734.5 1264.1,732.5           "
   id="polygon1424" />
									</g>
									<g
   id="g1426">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.6,730.1 1259.7,732.1             1262.1,730.2 1259.8,728.1           "
   id="polygon1425" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.9,730.2 1264,732.1             1266.3,730.2 1264.1,728.1           "
   id="polygon1426" />
									</g>
									<g
   id="g1428">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.6,725.8 1259.8,727.8             1262.1,725.8 1259.9,723.8           "
   id="polygon1427" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.9,725.8 1264,727.8             1266.3,725.8 1264.1,723.8           "
   id="polygon1428" />
									</g>
									<g
   id="g1430">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.7,721.5 1259.8,723.4             1262.1,721.5 1259.9,719.4           "
   id="polygon1429" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.9,721.5 1264.1,723.5             1266.4,721.5 1264.2,719.5           "
   id="polygon1430" />
									</g>
									<g
   id="g1432">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.7,717.1 1259.8,719.1             1262.1,717.1 1259.9,715.1           "
   id="polygon1431" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1261.9,717.1 1264.1,719.1             1266.4,717.1 1264.2,715.1           "
   id="polygon1432" />
									</g>
									<g
   id="g1434">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.7,712.8 1259.8,714.8             1262.1,712.8 1259.9,710.8           "
   id="polygon1433" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262,712.8 1264.1,714.8             1266.4,712.8 1264.2,710.8           "
   id="polygon1434" />
									</g>
									<g
   id="g1436">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.7,708.4 1259.8,710.4             1262.2,708.5 1259.9,706.4           "
   id="polygon1435" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262,708.4 1264.1,710.4             1266.4,708.5 1264.2,706.4           "
   id="polygon1436" />
									</g>
									<g
   id="g1438">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.7,704.1 1259.9,706.1             1262.2,704.1 1260,702.1           "
   id="polygon1437" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262,704.1 1264.1,706.1             1266.4,704.1 1264.2,702.1           "
   id="polygon1438" />
									</g>
									<g
   id="g1440">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.8,699.7 1259.9,701.7             1262.2,699.8 1260,697.7           "
   id="polygon1439" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262,699.8 1264.2,701.7             1266.5,699.8 1264.3,697.7           "
   id="polygon1440" />
									</g>
									<g
   id="g1442">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.8,695.4 1259.9,697.4             1262.2,695.4 1260,693.4           "
   id="polygon1441" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.1,695.4 1264.2,697.4             1266.5,695.4 1264.3,693.4           "
   id="polygon1442" />
									</g>
									<g
   id="g1444">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.8,691.1 1259.9,693             1262.2,691.1 1260,689.1           "
   id="polygon1443" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.1,691.1 1264.2,693.1             1266.5,691.1 1264.3,689.1           "
   id="polygon1444" />
									</g>
									<g
   id="g1446">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.8,686.7 1260,688.7             1262.3,686.7 1260,684.7           "
   id="polygon1445" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.1,686.7 1264.2,688.7             1266.5,686.8 1264.3,684.7           "
   id="polygon1446" />
									</g>
									<g
   id="g1448">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.8,682.4 1260,684.4             1262.3,682.4 1260.1,680.4           "
   id="polygon1447" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.1,682.4 1264.2,684.4             1266.6,682.4 1264.3,680.4           "
   id="polygon1448" />
									</g>
									<g
   id="g1450">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.9,678 1260,680             1262.3,678.1 1260.1,676           "
   id="polygon1449" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.1,678.1 1264.3,680             1266.6,678.1 1264.4,676           "
   id="polygon1450" />
									</g>
									<g
   id="g1452">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.9,673.7 1260,675.7             1262.3,673.7 1260.1,671.7           "
   id="polygon1451" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.2,673.7 1264.3,675.7             1266.6,673.7 1264.4,671.7           "
   id="polygon1452" />
									</g>
									<g
   id="g1454">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.9,669.4 1260,671.3             1262.3,669.4 1260.1,667.3           "
   id="polygon1453" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.2,669.4 1264.3,671.4             1266.6,669.4 1264.4,667.4           "
   id="polygon1454" />
									</g>
									<g
   id="g1456">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.9,665 1260.1,667             1262.4,665 1260.2,663           "
   id="polygon1455" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.2,665 1264.3,667             1266.6,665 1264.4,663           "
   id="polygon1456" />
									</g>
									<g
   id="g1458">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1257.9,660.7 1260.1,662.7             1262.4,660.7 1260.2,658.7           "
   id="polygon1457" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.2,660.7 1264.3,662.7             1266.7,660.7 1264.4,658.7           "
   id="polygon1458" />
									</g>
									<g
   id="g1460">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258,656.3 1260.1,658.3             1262.4,656.3 1260.2,654.3           "
   id="polygon1459" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.2,656.3 1264.4,658.3             1266.7,656.4 1264.5,654.3           "
   id="polygon1460" />
									</g>
									<g
   id="g1462">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258,652 1260.1,654             1262.4,652 1260.2,650           "
   id="polygon1461" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.3,652 1264.4,654             1266.7,652 1264.5,650           "
   id="polygon1462" />
									</g>
									<g
   id="g1464">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258,647.6 1260.1,649.6             1262.4,647.7 1260.2,645.6           "
   id="polygon1463" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.3,647.7 1264.4,649.6             1266.7,647.7 1264.5,645.6           "
   id="polygon1464" />
									</g>
									<g
   id="g1466">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258,643.3 1260.2,645.3             1262.5,643.3 1260.3,641.3           "
   id="polygon1465" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.3,643.3 1264.4,645.3             1266.7,643.3 1264.5,641.3           "
   id="polygon1466" />
									</g>
									<g
   id="g1468">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258,639 1260.2,640.9             1262.5,639 1260.3,636.9           "
   id="polygon1467" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.3,639 1264.4,641             1266.8,639 1264.5,637           "
   id="polygon1468" />
									</g>
									<g
   id="g1470">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.1,634.6 1260.2,636.6             1262.5,634.6 1260.3,632.6           "
   id="polygon1469" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.3,634.6 1264.5,636.6             1266.8,634.7 1264.6,632.6           "
   id="polygon1470" />
									</g>
									<g
   id="g1472">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.1,630.3 1260.2,632.3             1262.5,630.3 1260.3,628.3           "
   id="polygon1471" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.4,630.3 1264.5,632.3             1266.8,630.3 1264.6,628.3           "
   id="polygon1472" />
									</g>
									<g
   id="g1474">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.1,625.9 1260.2,627.9             1262.5,626 1260.3,623.9           "
   id="polygon1473" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.4,625.9 1264.5,627.9             1266.8,626 1264.6,623.9           "
   id="polygon1474" />
									</g>
									<g
   id="g1476">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.1,621.6 1260.3,623.6             1262.6,621.6 1260.4,619.6           "
   id="polygon1475" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.4,621.6 1264.5,623.6             1266.8,621.6 1264.6,619.6           "
   id="polygon1476" />
									</g>
									<g
   id="g1478">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.1,617.3 1260.3,619.2             1262.6,617.3 1260.4,615.2           "
   id="polygon1477" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.4,617.3 1264.6,619.2             1266.9,617.3 1264.6,615.3           "
   id="polygon1478" />
									</g>
									<g
   id="g1480">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.2,612.9 1260.3,614.9             1262.6,612.9 1260.4,610.9           "
   id="polygon1479" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.4,612.9 1264.6,614.9             1266.9,612.9 1264.7,610.9           "
   id="polygon1480" />
									</g>
									<g
   id="g1482">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.2,608.6 1260.3,610.6             1262.6,608.6 1260.4,606.6           "
   id="polygon1481" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.5,608.6 1264.6,610.6             1266.9,608.6 1264.7,606.6           "
   id="polygon1482" />
									</g>
									<g
   id="g1484">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.2,604.2 1260.3,606.2             1262.6,604.2 1260.4,602.2           "
   id="polygon1483" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.5,604.2 1264.6,606.2             1266.9,604.3 1264.7,602.2           "
   id="polygon1484" />
									</g>
									<g
   id="g1486">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.2,599.9 1260.4,601.9             1262.7,599.9 1260.5,597.9           "
   id="polygon1485" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.5,599.9 1264.6,601.9             1266.9,599.9 1264.7,597.9           "
   id="polygon1486" />
									</g>
									<g
   id="g1488">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.3,595.5 1260.4,597.5             1262.7,595.6 1260.5,593.5           "
   id="polygon1487" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.5,595.6 1264.7,597.5             1267,595.6 1264.8,593.5           "
   id="polygon1488" />
									</g>
									<g
   id="g1490">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.3,591.2 1260.4,593.2             1262.7,591.2 1260.5,589.2           "
   id="polygon1489" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.5,591.2 1264.7,593.2             1267,591.2 1264.8,589.2           "
   id="polygon1490" />
									</g>
									<g
   id="g1492">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.3,586.9 1260.4,588.8             1262.7,586.9 1260.5,584.8           "
   id="polygon1491" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.6,586.9 1264.7,588.9             1267,586.9 1264.8,584.9           "
   id="polygon1492" />
									</g>
									<g
   id="g1494">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.3,582.5 1260.4,584.5             1262.8,582.5 1260.5,580.5           "
   id="polygon1493" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.6,582.5 1264.7,584.5             1267,582.5 1264.8,580.5           "
   id="polygon1494" />
									</g>
									<g
   id="g1496">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.3,578.2 1260.5,580.2             1262.8,578.2 1260.6,576.2           "
   id="polygon1495" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.6,578.2 1264.7,580.2             1267,578.2 1264.8,576.2           "
   id="polygon1496" />
									</g>
									<g
   id="g1498">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.4,573.8 1260.5,575.8             1262.8,573.9 1260.6,571.8           "
   id="polygon1497" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.6,573.8 1264.8,575.8             1267.1,573.9 1264.9,571.8           "
   id="polygon1498" />
									</g>
									<g
   id="g1500">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.4,569.5 1260.5,571.5             1262.8,569.5 1260.6,567.5           "
   id="polygon1499" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.6,569.5 1264.8,571.5             1267.1,569.5 1264.9,567.5           "
   id="polygon1500" />
									</g>
									<g
   id="g1502">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.4,565.1 1260.5,567.1             1262.8,565.2 1260.6,563.1           "
   id="polygon1501" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.7,565.2 1264.8,567.1             1267.1,565.2 1264.9,563.1           "
   id="polygon1502" />
									</g>
									<g
   id="g1504">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.4,560.8 1260.5,562.8             1262.9,560.8 1260.6,558.8           "
   id="polygon1503" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.7,560.8 1264.8,562.8             1267.1,560.8 1264.9,558.8           "
   id="polygon1504" />
									</g>
									<g
   id="g1506">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.4,556.5 1260.6,558.4             1262.9,556.5 1260.7,554.5           "
   id="polygon1505" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.7,556.5 1264.8,558.5             1267.1,556.5 1264.9,554.5           "
   id="polygon1506" />
									</g>
									<g
   id="g1508">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.5,552.1 1260.6,554.1             1262.9,552.1 1260.7,550.1           "
   id="polygon1507" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.7,552.1 1264.9,554.1             1267.2,552.2 1265,550.1           "
   id="polygon1508" />
									</g>
									<g
   id="g1510">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.5,547.8 1260.6,549.8             1262.9,547.8 1260.7,545.8           "
   id="polygon1509" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.7,547.8 1264.9,549.8             1267.2,547.8 1265,545.8           "
   id="polygon1510" />
									</g>
									<g
   id="g1512">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.5,543.4 1260.6,545.4             1262.9,543.5 1260.7,541.4           "
   id="polygon1511" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.8,543.5 1264.9,545.4             1267.2,543.5 1265,541.4           "
   id="polygon1512" />
									</g>
									<g
   id="g1514">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.5,539.1 1260.6,541.1             1263,539.1 1260.7,537.1           "
   id="polygon1513" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.8,539.1 1264.9,541.1             1267.2,539.1 1265,537.1           "
   id="polygon1514" />
									</g>
									<g
   id="g1516">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.5,534.8 1260.7,536.7             1263,534.8 1260.8,532.7           "
   id="polygon1515" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.8,534.8 1264.9,536.8             1267.2,534.8 1265,532.8           "
   id="polygon1516" />
									</g>
									<g
   id="g1518">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.6,530.4 1260.7,532.4             1263,530.4 1260.8,528.4           "
   id="polygon1517" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.8,530.4 1265,532.4             1267.3,530.4 1265.1,528.4           "
   id="polygon1518" />
									</g>
									<g
   id="g1520">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.6,526.1 1260.7,528.1             1263,526.1 1260.8,524.1           "
   id="polygon1519" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.9,526.1 1265,528.1             1267.3,526.1 1265.1,524.1           "
   id="polygon1520" />
									</g>
									<g
   id="g1522">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.6,521.7 1260.7,523.7             1263,521.7 1260.8,519.7           "
   id="polygon1521" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.9,521.7 1265,523.7             1267.3,521.8 1265.1,519.7           "
   id="polygon1522" />
									</g>
									<g
   id="g1524">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.6,517.4 1260.8,519.4             1263.1,517.4 1260.8,515.4           "
   id="polygon1523" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.9,517.4 1265,519.4             1267.3,517.4 1265.1,515.4           "
   id="polygon1524" />
									</g>
									<g
   id="g1526">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.6,513 1260.8,515             1263.1,513.1 1260.9,511           "
   id="polygon1525" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.9,513.1 1265,515             1267.4,513.1 1265.1,511           "
   id="polygon1526" />
									</g>
									<g
   id="g1528">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.7,508.7 1260.8,510.7             1263.1,508.7 1260.9,506.7           "
   id="polygon1527" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1262.9,508.7 1265.1,510.7             1267.4,508.7 1265.2,506.7           "
   id="polygon1528" />
									</g>
									<g
   id="g1530">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.7,504.4 1260.8,506.3             1263.1,504.4 1260.9,502.3           "
   id="polygon1529" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263,504.4 1265.1,506.4             1267.4,504.4 1265.2,502.4           "
   id="polygon1530" />
									</g>
									<g
   id="g1532">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.7,500 1260.8,502             1263.1,500 1260.9,498           "
   id="polygon1531" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263,500 1265.1,502             1267.4,500.1 1265.2,498           "
   id="polygon1532" />
									</g>
									<g
   id="g1534">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.7,495.7 1260.9,497.7             1263.2,495.7 1261,493.7           "
   id="polygon1533" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263,495.7 1265.1,497.7             1267.4,495.7 1265.2,493.7           "
   id="polygon1534" />
									</g>
									<g
   id="g1536">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.7,491.3 1260.9,493.3             1263.2,491.4 1261,489.3           "
   id="polygon1535" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263,491.3 1265.1,493.3             1267.5,491.4 1265.2,489.3           "
   id="polygon1536" />
									</g>
									<g
   id="g1538">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.8,487 1260.9,489             1263.2,487 1261,485           "
   id="polygon1537" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263,487 1265.2,489             1267.5,487 1265.3,485           "
   id="polygon1538" />
									</g>
									<g
   id="g1540">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.8,482.7 1260.9,484.6             1263.2,482.7 1261,480.6           "
   id="polygon1539" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.1,482.7 1265.2,484.6             1267.5,482.7 1265.3,480.6           "
   id="polygon1540" />
									</g>
									<g
   id="g1542">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.8,478.3 1260.9,480.3             1263.2,478.3 1261,476.3           "
   id="polygon1541" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.1,478.3 1265.2,480.3             1267.5,478.3 1265.3,476.3           "
   id="polygon1542" />
									</g>
									<g
   id="g1544">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.8,474 1261,476             1263.3,474 1261.1,472           "
   id="polygon1543" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.1,474 1265.2,476             1267.5,474 1265.3,472           "
   id="polygon1544" />
									</g>
									<g
   id="g1546">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.8,469.6 1261,471.6             1263.3,469.6 1261.1,467.6           "
   id="polygon1545" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.1,469.6 1265.2,471.6             1267.6,469.7 1265.3,467.6           "
   id="polygon1546" />
									</g>
									<g
   id="g1548">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.9,465.3 1261,467.3             1263.3,465.3 1261.1,463.3           "
   id="polygon1547" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.1,465.3 1265.3,467.3             1267.6,465.3 1265.4,463.3           "
   id="polygon1548" />
									</g>
									<g
   id="g1550">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.9,460.9 1261,462.9             1263.3,461 1261.1,458.9           "
   id="polygon1549" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.2,461 1265.3,462.9             1267.6,461 1265.4,458.9           "
   id="polygon1550" />
									</g>
									<g
   id="g1552">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.9,456.6 1261,458.6             1263.3,456.6 1261.1,454.6           "
   id="polygon1551" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.2,456.6 1265.3,458.6             1267.6,456.6 1265.4,454.6           "
   id="polygon1552" />
									</g>
									<g
   id="g1554">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.9,452.3 1261.1,454.2             1263.4,452.3 1261.2,450.2           "
   id="polygon1553" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.2,452.3 1265.3,454.3             1267.6,452.3 1265.4,450.3           "
   id="polygon1554" />
									</g>
									<g
   id="g1556">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1258.9,447.9 1261.1,449.9             1263.4,447.9 1261.2,445.9           "
   id="polygon1555" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.2,447.9 1265.4,449.9             1267.7,447.9 1265.4,445.9           "
   id="polygon1556" />
									</g>
									<g
   id="g1558">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259,443.6 1261.1,445.6             1263.4,443.6 1261.2,441.6           "
   id="polygon1557" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.2,443.6 1265.4,445.6             1267.7,443.6 1265.5,441.6           "
   id="polygon1558" />
									</g>
									<g
   id="g1560">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259,439.2 1261.1,441.2             1263.4,439.3 1261.2,437.2           "
   id="polygon1559" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.3,439.2 1265.4,441.2             1267.7,439.3 1265.5,437.2           "
   id="polygon1560" />
									</g>
									<g
   id="g1562">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259,434.9 1261.1,436.9             1263.4,434.9 1261.2,432.9           "
   id="polygon1561" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.3,434.9 1265.4,436.9             1267.7,434.9 1265.5,432.9           "
   id="polygon1562" />
									</g>
									<g
   id="g1564">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259,430.5 1261.2,432.5             1263.5,430.6 1261.3,428.5           "
   id="polygon1563" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.3,430.6 1265.4,432.5             1267.7,430.6 1265.5,428.5           "
   id="polygon1564" />
									</g>
									<g
   id="g1566">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.1,426.2 1261.2,428.2             1263.5,426.2 1261.3,424.2           "
   id="polygon1565" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.3,426.2 1265.5,428.2             1267.8,426.2 1265.6,424.2           "
   id="polygon1566" />
									</g>
									<g
   id="g1568">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.1,421.9 1261.2,423.8             1263.5,421.9 1261.3,419.8           "
   id="polygon1567" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.3,421.9 1265.5,423.9             1267.8,421.9 1265.6,419.9           "
   id="polygon1568" />
									</g>
									<g
   id="g1570">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.1,417.5 1261.2,419.5             1263.5,417.5 1261.3,415.5           "
   id="polygon1569" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.4,417.5 1265.5,419.5             1267.8,417.6 1265.6,415.5           "
   id="polygon1570" />
									</g>
									<g
   id="g1572">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.1,413.2 1261.2,415.2             1263.6,413.2 1261.3,411.2           "
   id="polygon1571" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.4,413.2 1265.5,415.2             1267.8,413.2 1265.6,411.2           "
   id="polygon1572" />
									</g>
									<g
   id="g1574">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1259.1,408.8 1261.3,410.8             1263.6,408.9 1261.4,406.8           "
   id="polygon1573" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1263.4,408.9 1265.5,410.8             1267.8,408.9 1265.6,406.8           "
   id="polygon1574" />
									</g>
									<g
   id="g1576">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1270.7,397.9 1268.6,399.9             1270.4,402.4 1272.6,400.3           "
   id="polygon1575" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1270.4,402.2 1268.4,404.2             1270.2,406.6 1272.3,404.5           "
   id="polygon1576" />
									</g>
									<g
   id="g1578">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1275,398.2 1272.9,400.2             1274.7,402.6 1276.8,400.5           "
   id="polygon1577" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1274.7,402.4 1272.7,404.5             1274.5,406.9 1276.6,404.8           "
   id="polygon1578" />
									</g>
									<g
   id="g1580">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1279.3,398.4 1277.2,400.5             1279,402.9 1281.1,400.8           "
   id="polygon1579" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1279,402.7 1276.9,404.7             1278.8,407.1 1280.9,405           "
   id="polygon1580" />
									</g>
									<g
   id="g1582">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1283.6,398.7 1281.5,400.7             1283.3,403.1 1285.4,401           "
   id="polygon1581" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1283.3,403 1281.2,405             1283,407.4 1285.2,405.3           "
   id="polygon1582" />
									</g>
									<g
   id="g1584">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1287.8,398.9 1285.8,401             1287.6,403.4 1289.7,401.3           "
   id="polygon1583" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1287.6,403.2 1285.5,405.2             1287.3,407.6 1289.5,405.5           "
   id="polygon1584" />
									</g>
									<g
   id="g1586">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1292.1,399.2 1290.1,401.2             1291.9,403.6 1294,401.5           "
   id="polygon1585" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1291.9,403.5 1289.8,405.5             1291.6,407.9 1293.8,405.8           "
   id="polygon1586" />
									</g>
									<g
   id="g1588">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1296.4,399.5 1294.3,401.5             1296.2,403.9 1298.3,401.8           "
   id="polygon1587" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1296.2,403.7 1294.1,405.7             1295.9,408.2 1298,406.1           "
   id="polygon1588" />
									</g>
									<g
   id="g1590">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1300.7,399.7 1298.6,401.7             1300.4,404.2 1302.6,402.1           "
   id="polygon1589" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1300.5,404 1298.4,406             1300.2,408.4 1302.3,406.3           "
   id="polygon1590" />
									</g>
									<g
   id="g1592">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1305,400 1302.9,402             1304.7,404.4 1306.9,402.3           "
   id="polygon1591" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1304.8,404.2 1302.7,406.3             1304.5,408.7 1306.6,406.6           "
   id="polygon1592" />
									</g>
									<g
   id="g1594">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1309.3,400.2 1307.2,402.3             1309,404.7 1311.2,402.6           "
   id="polygon1593" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1309,404.5 1307,406.5             1308.8,408.9 1310.9,406.8           "
   id="polygon1594" />
									</g>
									<g
   id="g1596">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1313.6,400.5 1311.5,402.5             1313.3,404.9 1315.4,402.8           "
   id="polygon1595" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1313.3,404.8 1311.3,406.8             1313.1,409.2 1315.2,407.1           "
   id="polygon1596" />
									</g>
									<g
   id="g1598">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1317.9,400.7 1315.8,402.8             1317.6,405.2 1319.7,403.1           "
   id="polygon1597" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1317.6,405 1315.5,407             1317.4,409.4 1319.5,407.3           "
   id="polygon1598" />
									</g>
									<g
   id="g1600">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1322.2,401 1320.1,403             1321.9,405.4 1324,403.3           "
   id="polygon1599" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1321.9,405.3 1319.8,407.3             1321.6,409.7 1323.8,407.6           "
   id="polygon1600" />
									</g>
									<g
   id="g1602">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1326.4,401.3 1324.4,403.3             1326.2,405.7 1328.3,403.6           "
   id="polygon1601" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1326.2,405.5 1324.1,407.5             1325.9,410 1328.1,407.9           "
   id="polygon1602" />
									</g>
									<g
   id="g1604">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1330.7,401.5 1328.7,403.5             1330.5,405.9 1332.6,403.9           "
   id="polygon1603" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1330.5,405.8 1328.4,407.8             1330.2,410.2 1332.4,408.1           "
   id="polygon1604" />
									</g>
									<g
   id="g1606">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1335,401.8 1332.9,403.8             1334.8,406.2 1336.9,404.1           "
   id="polygon1605" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1334.8,406 1332.7,408.1             1334.5,410.5 1336.6,408.4           "
   id="polygon1606" />
									</g>
									<g
   id="g1608">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1339.3,402 1337.2,404.1             1339,406.5 1341.2,404.4           "
   id="polygon1607" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1339.1,406.3 1337,408.3             1338.8,410.7 1340.9,408.6           "
   id="polygon1608" />
									</g>
									<g
   id="g1610">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1343.6,402.3 1341.5,404.3             1343.3,406.7 1345.5,404.6           "
   id="polygon1609" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1343.4,406.6 1341.3,408.6             1343.1,411 1345.2,408.9           "
   id="polygon1610" />
									</g>
									<g
   id="g1612">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1347.9,402.5 1345.8,404.6             1347.6,407 1349.8,404.9           "
   id="polygon1611" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1347.6,406.8 1345.6,408.8             1347.4,411.2 1349.5,409.1           "
   id="polygon1612" />
									</g>
									<g
   id="g1614">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1352.2,402.8 1350.1,404.8             1351.9,407.2 1354,405.1           "
   id="polygon1613" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1351.9,407.1 1349.9,409.1             1351.7,411.5 1353.8,409.4           "
   id="polygon1614" />
									</g>
									<g
   id="g1616">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1362.2,408.1 1359.3,407.8             1358.6,410.8 1361.6,411.1           "
   id="polygon1615" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1358.8,410.7 1355.9,410.4             1355.2,413.4 1358.2,413.7           "
   id="polygon1616" />
									</g>
									<g
   id="g1618">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1364.8,411.6 1361.9,411.3             1361.3,414.3 1364.3,414.5           "
   id="polygon1617" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1361.4,414.2 1358.5,413.9             1357.9,416.8 1360.8,417.1           "
   id="polygon1618" />
									</g>
									<g
   id="g1620">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1367.4,415.1 1364.5,414.8             1363.9,417.7 1366.9,418           "
   id="polygon1619" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1364,417.6 1361.1,417.3             1360.4,420.3 1363.4,420.6           "
   id="polygon1620" />
									</g>
									<g
   id="g1622">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1370,418.6 1367.1,418.2             1366.5,421.2 1369.4,421.5           "
   id="polygon1621" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1366.6,421.1 1363.7,420.8             1363,423.7 1366,424           "
   id="polygon1622" />
									</g>
									<g
   id="g1624">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1372.6,422.1 1369.7,421.7             1369,424.7 1372,425           "
   id="polygon1623" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1369.2,424.6 1366.3,424.3             1365.6,427.2 1368.6,427.5           "
   id="polygon1624" />
									</g>
									<g
   id="g1626">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1375.2,425.6 1372.3,425.2             1371.6,428.2 1374.6,428.5           "
   id="polygon1625" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1371.7,428.1 1368.8,427.8             1368.1,430.7 1371.1,431           "
   id="polygon1626" />
									</g>
									<g
   id="g1628">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1377.7,429.1 1374.8,428.7             1374.1,431.7 1377.1,432           "
   id="polygon1627" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1374.3,431.6 1371.4,431.3             1370.7,434.2 1373.7,434.5           "
   id="polygon1628" />
									</g>
									<g
   id="g1630">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1380.3,432.6 1377.4,432.2             1376.7,435.2 1379.7,435.5           "
   id="polygon1629" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1376.8,435.1 1373.9,434.8             1373.2,437.7 1376.2,438           "
   id="polygon1630" />
									</g>
									<g
   id="g1632">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1382.8,436.1 1379.9,435.8             1379.2,438.7 1382.2,439.1           "
   id="polygon1631" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1379.4,438.6 1376.5,438.3             1375.8,441.2 1378.7,441.6           "
   id="polygon1632" />
									</g>
									<g
   id="g1634">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1385.4,439.6 1382.5,439.3             1381.8,442.2 1384.7,442.6           "
   id="polygon1633" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1381.9,442.1 1379,441.8             1378.3,444.7 1381.3,445.1           "
   id="polygon1634" />
									</g>
									<g
   id="g1636">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1387.9,443.2 1385,442.8             1384.3,445.8 1387.3,446.1           "
   id="polygon1635" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1384.4,445.7 1381.5,445.3             1380.8,448.2 1383.8,448.6           "
   id="polygon1636" />
									</g>
									<g
   id="g1638">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1390.4,446.7 1387.5,446.3             1386.8,449.3 1389.8,449.6           "
   id="polygon1637" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1386.9,449.2 1384.1,448.8             1383.3,451.8 1386.3,452.1           "
   id="polygon1638" />
									</g>
									<g
   id="g1640">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1392.9,450.2 1390.1,449.9             1389.3,452.8 1392.3,453.2           "
   id="polygon1639" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1389.5,452.7 1386.6,452.4             1385.9,455.3 1388.8,455.6           "
   id="polygon1640" />
									</g>
									<g
   id="g1642">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1395.5,453.7 1392.6,453.4             1391.9,456.3 1394.8,456.7           "
   id="polygon1641" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1392,456.2 1389.1,455.9             1388.4,458.8 1391.4,459.2           "
   id="polygon1642" />
									</g>
									<g
   id="g1644">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1398,457.3 1395.1,456.9             1394.4,459.9 1397.4,460.2           "
   id="polygon1643" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1394.5,459.8 1391.6,459.4             1390.9,462.3 1393.9,462.7           "
   id="polygon1644" />
									</g>
									<g
   id="g1646">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1400.5,460.8 1397.6,460.4             1396.9,463.4 1399.9,463.7           "
   id="polygon1645" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1397,463.3 1394.2,462.9             1393.4,465.9 1396.4,466.2           "
   id="polygon1646" />
									</g>
									<g
   id="g1648">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1403,464.3 1400.2,464             1399.4,466.9 1402.4,467.2           "
   id="polygon1647" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1399.6,466.8 1396.7,466.5             1396,469.4 1399,469.7           "
   id="polygon1648" />
									</g>
									<g
   id="g1650">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1405.6,467.8 1402.7,467.5             1402,470.4 1405,470.7           "
   id="polygon1649" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1402.1,470.3 1399.2,470             1398.5,472.9 1401.5,473.3           "
   id="polygon1650" />
									</g>
									<g
   id="g1652">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1408.1,471.3 1405.2,471             1404.5,473.9 1407.5,474.2           "
   id="polygon1651" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1404.7,473.8 1401.8,473.5             1401.1,476.4 1404.1,476.8           "
   id="polygon1652" />
									</g>
									<g
   id="g1654">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1410.7,474.8 1407.8,474.5             1407.1,477.4 1410.1,477.7           "
   id="polygon1653" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1407.2,477.3 1404.3,477             1403.7,479.9 1406.6,480.3           "
   id="polygon1654" />
									</g>
									<g
   id="g1656">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1413.2,478.3 1410.3,477.9             1409.7,480.9 1412.7,481.2           "
   id="polygon1655" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1409.8,480.8 1406.9,480.5             1406.2,483.4 1409.2,483.8           "
   id="polygon1656" />
									</g>
									<g
   id="g1658">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1415.8,481.7 1412.9,481.4             1412.3,484.4 1415.2,484.7           "
   id="polygon1657" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1412.4,484.3 1409.5,484             1408.8,486.9 1411.8,487.2           "
   id="polygon1658" />
									</g>
									<g
   id="g1660">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1418.4,485.2 1415.5,484.9             1414.9,487.8 1417.9,488.1           "
   id="polygon1659" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1415,487.8 1412.1,487.5             1411.5,490.4 1414.4,490.7           "
   id="polygon1660" />
									</g>
									<g
   id="g1662">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1421,488.6 1418.1,488.3             1417.5,491.3 1420.5,491.6           "
   id="polygon1661" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1417.6,491.2 1414.7,490.9             1414.1,493.9 1417.1,494.2           "
   id="polygon1662" />
									</g>
									<g
   id="g1664">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1423.6,492 1420.7,491.8             1420.1,494.7 1423.1,495           "
   id="polygon1663" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1420.2,494.7 1417.3,494.4             1416.7,497.4 1419.7,497.6           "
   id="polygon1664" />
									</g>
									<g
   id="g1666">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1426.3,495.4 1423.4,495.2             1422.8,498.2 1425.8,498.4           "
   id="polygon1665" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1422.9,498.1 1420,497.8             1419.4,500.8 1422.4,501           "
   id="polygon1666" />
									</g>
									<g
   id="g1668">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1428.9,498.8 1426,498.6             1425.4,501.6 1428.4,501.8           "
   id="polygon1667" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1425.6,501.5 1422.7,501.3             1422.1,504.2 1425.1,504.5           "
   id="polygon1668" />
									</g>
									<g
   id="g1670">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431.6,502.2 1428.7,502             1428.1,505 1431.1,505.2           "
   id="polygon1669" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1428.3,504.9 1425.4,504.7             1424.8,507.6 1427.8,507.8           "
   id="polygon1670" />
									</g>
									<g
   id="g1672">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.3,505.6 1431.4,505.4             1430.8,508.4 1433.8,508.5           "
   id="polygon1671" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431,508.3 1428.1,508.1             1427.5,511.1 1430.5,511.2           "
   id="polygon1672" />
									</g>
									<g
   id="g1674">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1437,508.9 1434.1,508.7             1433.6,511.7 1436.6,511.9           "
   id="polygon1673" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1433.7,511.6 1430.8,511.5             1430.3,514.4 1433.3,514.6           "
   id="polygon1674" />
									</g>
									<g
   id="g1676">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.8,512.2 1436.9,512.1             1436.4,515.1 1439.3,515.2           "
   id="polygon1675" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.5,515 1433.6,514.8             1433.1,517.8 1436.1,517.9           "
   id="polygon1676" />
									</g>
									<g
   id="g1678">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.5,515.5 1439.6,515.4             1439.1,518.4 1442.1,518.5           "
   id="polygon1677" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.3,518.3 1436.4,518.2             1435.9,521.2 1438.9,521.3           "
   id="polygon1678" />
									</g>
									<g
   id="g1680">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.3,518.8 1442.4,518.7             1442,521.7 1444.9,521.8           "
   id="polygon1679" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.1,521.6 1439.2,521.5             1438.7,524.5 1441.7,524.6           "
   id="polygon1680" />
									</g>
									<g
   id="g1682">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1448.1,522.1 1445.2,522             1444.8,525 1447.8,525           "
   id="polygon1681" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.9,524.9 1442,524.8             1441.6,527.8 1444.6,527.9           "
   id="polygon1682" />
									</g>
									<g
   id="g1684">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1451,525.3 1448.1,525.2             1447.7,528.2 1450.7,528.3           "
   id="polygon1683" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1447.8,528.1 1444.9,528.1             1444.5,531.1 1447.5,531.1           "
   id="polygon1684" />
									</g>
									<g
   id="g1685">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1453.8,528.5l-2.9,0l-0.4,3l1.5,0            c0.6,0.1,1.2,0.2,1.8,0.4c0-0.6-0.1-1.2-0.2-1.9L1453.8,528.5z"
   id="path1684" />
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1450.7,531.4l-2.9,0l-0.4,3            c0.5,0,1,0,1.5,0c0.3-0.2,0.7-0.3,1.2-0.4c0.2-0.3,0.4-0.7,0.5-1.1L1450.7,531.4z"
   id="path1685" />
									</g>
									<g
   id="g1687">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1456.8,534.1l-1.3-0.7l-0.2-0.1            l-0.2-0.2l-0.4-0.3c-0.2-0.2-0.5-0.4-0.7-0.5c-0.2,0.6-0.5,1.2-0.8,1.6l-0.9,1.2l2.6,1.4L1456.8,534.1z"
   id="path1686" />
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1452.6,535.1l-1.3-0.7            c-0.4-0.2-0.8-0.3-1.2-0.3c-0.2,0.2-0.3,0.3-0.5,0.4c-0.1,0.1-0.2,0.1-0.3,0.2c0,0-0.1,0-0.1,0.1l-0.1,0.2l-0.9,1.2            l2.6,1.4L1452.6,535.1z"
   id="path1687" />
									</g>
									<g
   id="g1688">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1457.8,538.3 1455.3,536.9             1453.5,539.4 1456.2,540.8           "
   id="polygon1687" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1453.7,539.3 1451.1,537.9             1449.4,540.4 1452,541.8           "
   id="polygon1688" />
									</g>
									<g
   id="g1690">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1458.9,542.5 1456.3,541.1             1454.6,543.6 1457.2,545           "
   id="polygon1689" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1454.7,543.5 1452.2,542.1             1450.4,544.6 1453.1,546           "
   id="polygon1690" />
									</g>
									<g
   id="g1692">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1459.9,546.7 1457.4,545.3             1455.6,547.8 1458.3,549.2           "
   id="polygon1691" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1455.8,547.7 1453.2,546.3             1451.5,548.8 1454.1,550.2           "
   id="polygon1692" />
									</g>
									<g
   id="g1694">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1461,550.9 1458.4,549.5             1456.7,552 1459.3,553.4           "
   id="polygon1693" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1456.9,551.9 1454.3,550.6             1452.5,553 1455.2,554.4           "
   id="polygon1694" />
									</g>
									<g
   id="g1696">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1462,555.1 1459.5,553.7             1457.7,556.2 1460.4,557.6           "
   id="polygon1695" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1457.9,556.2 1455.3,554.8             1453.6,557.2 1456.2,558.6           "
   id="polygon1696" />
									</g>
									<g
   id="g1698">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1463.1,559.3 1460.5,557.9             1458.8,560.4 1461.4,561.8           "
   id="polygon1697" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1458.9,560.4 1456.4,559             1454.6,561.4 1457.3,562.9           "
   id="polygon1698" />
									</g>
									<g
   id="g1700">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464.1,563.6 1461.6,562.1             1459.8,564.6 1462.4,566           "
   id="polygon1699" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1460,564.6 1457.4,563.2             1455.6,565.6 1458.3,567.1           "
   id="polygon1700" />
									</g>
									<g
   id="g1702">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1465.1,567.8 1462.6,566.4             1460.8,568.8 1463.4,570.3           "
   id="polygon1701" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1461,568.8 1458.4,567.4             1456.7,569.8 1459.3,571.3           "
   id="polygon1702" />
									</g>
									<g
   id="g1704">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1466.1,572 1463.6,570.6             1461.8,573 1464.5,574.5           "
   id="polygon1703" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1462,573 1459.5,571.6             1457.7,574 1460.3,575.5           "
   id="polygon1704" />
									</g>
									<g
   id="g1706">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1467.2,576.2 1464.6,574.8             1462.8,577.3 1465.5,578.7           "
   id="polygon1705" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1463,577.2 1460.5,575.8             1458.7,578.3 1461.3,579.7           "
   id="polygon1706" />
									</g>
									<g
   id="g1708">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1468.2,580.4 1465.6,579             1463.8,581.5 1466.5,582.9           "
   id="polygon1707" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464,581.4 1461.5,580             1459.7,582.5 1462.3,583.9           "
   id="polygon1708" />
									</g>
									<g
   id="g1710">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469.2,584.7 1466.6,583.2             1464.8,585.7 1467.5,587.2           "
   id="polygon1709" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1465,585.7 1462.5,584.2             1460.7,586.7 1463.3,588.1           "
   id="polygon1710" />
									</g>
									<g
   id="g1712">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1470.1,588.9 1467.6,587.5             1465.8,589.9 1468.4,591.4           "
   id="polygon1711" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1466,589.9 1463.5,588.4             1461.7,590.9 1464.3,592.4           "
   id="polygon1712" />
									</g>
									<g
   id="g1714">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1471.1,593.1 1468.6,591.7             1466.8,594.1 1469.4,595.6           "
   id="polygon1713" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1467,594.1 1464.4,592.7             1462.6,595.1 1465.3,596.6           "
   id="polygon1714" />
									</g>
									<g
   id="g1716">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1472.1,597.4 1469.6,595.9             1467.8,598.4 1470.4,599.8           "
   id="polygon1715" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1467.9,598.3 1465.4,596.9             1463.6,599.3 1466.2,600.8           "
   id="polygon1716" />
									</g>
									<g
   id="g1718">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.1,601.6 1470.6,600.2             1468.7,602.6 1471.3,604.1           "
   id="polygon1717" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1468.9,602.6 1466.4,601.1             1464.6,603.5 1467.2,605           "
   id="polygon1718" />
									</g>
									<g
   id="g1720">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1474,605.8 1471.5,604.4             1469.7,606.8 1472.3,608.3           "
   id="polygon1719" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469.9,606.8 1467.3,605.3             1465.5,607.8 1468.1,609.2           "
   id="polygon1720" />
									</g>
									<g
   id="g1722">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1475,610.1 1472.4,608.6             1470.6,611 1473.2,612.5           "
   id="polygon1721" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1470.8,611 1468.3,609.6             1466.5,612 1469.1,613.5           "
   id="polygon1722" />
									</g>
									<g
   id="g1724">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1475.9,614.3 1473.4,612.9             1471.6,615.3 1474.2,616.8           "
   id="polygon1723" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1471.7,615.2 1469.2,613.8             1467.4,616.2 1470,617.7           "
   id="polygon1724" />
									</g>
									<g
   id="g1726">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1476.9,618.6 1474.3,617.1             1472.5,619.5 1475.1,621           "
   id="polygon1725" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1472.7,619.5 1470.2,618             1468.3,620.4 1470.9,621.9           "
   id="polygon1726" />
									</g>
									<g
   id="g1728">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.8,622.8 1475.3,621.3             1473.4,623.7 1476,625.3           "
   id="polygon1727" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.6,623.7 1471.1,622.2             1469.3,624.7 1471.8,626.2           "
   id="polygon1728" />
									</g>
									<g
   id="g1730">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1478.7,627.1 1476.2,625.6             1474.3,628 1476.9,629.5           "
   id="polygon1729" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1474.5,628 1472,626.5             1470.2,628.9 1472.7,630.4           "
   id="polygon1730" />
									</g>
									<g
   id="g1732">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1479.6,631.3 1477.1,629.8             1475.2,632.2 1477.8,633.7           "
   id="polygon1731" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1475.4,632.2 1472.9,630.7             1471.1,633.1 1473.7,634.6           "
   id="polygon1732" />
									</g>
									<g
   id="g1734">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1480.5,635.6 1478,634.1             1476.1,636.5 1478.7,638           "
   id="polygon1733" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1476.3,636.4 1473.8,635             1472,637.3 1474.5,638.9           "
   id="polygon1734" />
									</g>
									<g
   id="g1736">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1481.4,639.8 1478.9,638.3             1477,640.7 1479.6,642.2           "
   id="polygon1735" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.2,640.7 1474.7,639.2             1472.8,641.6 1475.4,643.1           "
   id="polygon1736" />
									</g>
									<g
   id="g1738">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1482.2,644.1 1479.7,642.6             1477.9,645 1480.5,646.5           "
   id="polygon1737" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1478.1,644.9 1475.6,643.4             1473.7,645.8 1476.3,647.4           "
   id="polygon1738" />
									</g>
									<g
   id="g1740">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1483.1,648.3 1480.6,646.8             1478.8,649.2 1481.3,650.7           "
   id="polygon1739" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1478.9,649.2 1476.4,647.7             1474.6,650.1 1477.2,651.6           "
   id="polygon1740" />
									</g>
									<g
   id="g1742">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1484,652.6 1481.5,651.1             1479.6,653.5 1482.2,655           "
   id="polygon1741" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1479.8,653.4 1477.3,651.9             1475.4,654.3 1478,655.8           "
   id="polygon1742" />
									</g>
									<g
   id="g1744">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1484.8,656.8 1482.3,655.3             1480.5,657.7 1483,659.3           "
   id="polygon1743" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1480.6,657.7 1478.2,656.2             1476.3,658.5 1478.8,660.1           "
   id="polygon1744" />
									</g>
									<g
   id="g1746">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1485.7,661.1 1483.2,659.6             1481.3,662 1483.9,663.5           "
   id="polygon1745" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1481.5,661.9 1479,660.4             1477.1,662.8 1479.7,664.3           "
   id="polygon1746" />
									</g>
									<g
   id="g1748">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1486.5,665.4 1484,663.8             1482.1,666.2 1484.7,667.8           "
   id="polygon1747" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1482.3,666.2 1479.8,664.7             1477.9,667 1480.5,668.6           "
   id="polygon1748" />
									</g>
									<g
   id="g1750">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1487.3,669.6 1484.8,668.1             1483,670.5 1485.5,672           "
   id="polygon1749" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1483.1,670.4 1480.6,668.9             1478.8,671.3 1481.3,672.8           "
   id="polygon1750" />
									</g>
									<g
   id="g1752">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1488.1,673.9 1485.7,672.4             1483.8,674.7 1486.3,676.3           "
   id="polygon1751" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1483.9,674.7 1481.5,673.2             1479.6,675.5 1482.1,677.1           "
   id="polygon1752" />
									</g>
									<g
   id="g1754">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1488.9,678.2 1486.5,676.6             1484.6,679 1487.1,680.6           "
   id="polygon1753" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1484.7,679 1482.3,677.4             1480.4,679.8 1482.9,681.4           "
   id="polygon1754" />
									</g>
									<g
   id="g1756">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1489.7,682.5 1487.2,680.9             1485.3,683.3 1487.9,684.8           "
   id="polygon1755" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1485.5,683.2 1483,681.7             1481.1,684 1483.7,685.6           "
   id="polygon1756" />
									</g>
									<g
   id="g1758">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.5,686.7 1488,685.2             1486.1,687.5 1488.7,689.1           "
   id="polygon1757" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1486.3,687.5 1483.8,685.9             1481.9,688.3 1484.5,689.9           "
   id="polygon1758" />
									</g>
									<g
   id="g1760">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1491.3,691 1488.8,689.4             1486.9,691.8 1489.4,693.4           "
   id="polygon1759" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1487.1,691.8 1484.6,690.2             1482.7,692.5 1485.2,694.1           "
   id="polygon1760" />
									</g>
									<g
   id="g1762">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492,695.3 1489.6,693.7             1487.7,696.1 1490.2,697.7           "
   id="polygon1761" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1487.8,696 1485.4,694.5             1483.5,696.8 1486,698.4           "
   id="polygon1762" />
									</g>
									<g
   id="g1764">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492.8,699.6 1490.3,698             1488.4,700.3 1490.9,701.9           "
   id="polygon1763" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1488.6,700.3 1486.1,698.7             1484.2,701.1 1486.7,702.7           "
   id="polygon1764" />
									</g>
									<g
   id="g1766">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1493.5,703.8 1491.1,702.3             1489.1,704.6 1491.7,706.2           "
   id="polygon1765" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1489.3,704.6 1486.9,703             1484.9,705.3 1487.5,706.9           "
   id="polygon1766" />
									</g>
									<g
   id="g1768">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1494.3,708.1 1491.8,706.5             1489.9,708.9 1492.4,710.5           "
   id="polygon1767" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.1,708.8 1487.6,707.3             1485.7,709.6 1488.2,711.2           "
   id="polygon1768" />
									</g>
									<g
   id="g1770">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1495,712.4 1492.6,710.8             1490.6,713.1 1493.1,714.8           "
   id="polygon1769" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.8,713.1 1488.3,711.5             1486.4,713.9 1488.9,715.5           "
   id="polygon1770" />
									</g>
									<g
   id="g1772">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1495.7,716.7 1493.3,715.1             1491.3,717.4 1493.8,719.1           "
   id="polygon1771" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1491.5,717.4 1489.1,715.8             1487.1,718.1 1489.6,719.8           "
   id="polygon1772" />
									</g>
									<g
   id="g1774">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1496.4,721 1494,719.4             1492,721.7 1494.5,723.3           "
   id="polygon1773" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492.2,721.7 1489.7,720.1             1487.8,722.4 1490.3,724           "
   id="polygon1774" />
									</g>
									<g
   id="g1776">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1497.1,725.3 1494.7,723.7             1492.7,726 1495.2,727.6           "
   id="polygon1775" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492.9,726 1490.4,724.4             1488.5,726.7 1491,728.3           "
   id="polygon1776" />
									</g>
									<g
   id="g1778">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1497.8,729.6 1495.4,727.9             1493.4,730.3 1495.9,731.9           "
   id="polygon1777" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1493.6,730.2 1491.1,728.6             1489.2,730.9 1491.7,732.6           "
   id="polygon1778" />
									</g>
									<g
   id="g1780">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.5,733.9 1496.1,732.2             1494.1,734.5 1496.6,736.2           "
   id="polygon1779" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1494.2,734.5 1491.8,732.9             1489.9,735.2 1492.4,736.9           "
   id="polygon1780" />
									</g>
									<g
   id="g1782">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.1,738.1 1496.7,736.5             1494.7,738.8 1497.2,740.5           "
   id="polygon1781" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1494.9,738.8 1492.5,737.2             1490.5,739.5 1493,741.1           "
   id="polygon1782" />
									</g>
									<g
   id="g1784">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.8,742.4 1497.4,740.8             1495.4,743.1 1497.9,744.8           "
   id="polygon1783" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1495.6,743.1 1493.1,741.5             1491.2,743.8 1493.7,745.4           "
   id="polygon1784" />
									</g>
									<g
   id="g1786">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1500.4,746.7 1498,745.1             1496,747.4 1498.5,749.1           "
   id="polygon1785" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1496.2,747.4 1493.8,745.7             1491.8,748 1494.3,749.7           "
   id="polygon1786" />
									</g>
									<g
   id="g1788">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.1,751 1498.7,749.4             1496.7,751.7 1499.2,753.4           "
   id="polygon1787" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1496.9,751.7 1494.4,750             1492.5,752.3 1495,754           "
   id="polygon1788" />
									</g>
									<g
   id="g1790">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.7,755.3 1499.3,753.7             1497.3,756 1499.8,757.7           "
   id="polygon1789" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1497.5,756 1495.1,754.3             1493.1,756.6 1495.6,758.3           "
   id="polygon1790" />
									</g>
									<g
   id="g1792">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.3,759.6 1499.9,758             1497.9,760.3 1500.4,762           "
   id="polygon1791" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.1,760.2 1495.7,758.6             1493.7,760.9 1496.2,762.6           "
   id="polygon1792" />
									</g>
									<g
   id="g1794">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.9,763.9 1500.5,762.3             1498.5,764.6 1501,766.2           "
   id="polygon1793" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.7,764.5 1496.3,762.9             1494.3,765.2 1496.8,766.8           "
   id="polygon1794" />
									</g>
									<g
   id="g1796">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.5,768.2 1501.1,766.6             1499.1,768.8 1501.6,770.5           "
   id="polygon1795" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.3,768.8 1496.9,767.2             1494.9,769.4 1497.4,771.1           "
   id="polygon1796" />
									</g>
									<g
   id="g1798">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.1,772.5 1501.7,770.9             1499.7,773.1 1502.2,774.8           "
   id="polygon1797" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.9,773.1 1497.5,771.5             1495.5,773.7 1498,775.4           "
   id="polygon1798" />
									</g>
									<g
   id="g1800">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.7,776.8 1502.3,775.2             1500.3,777.4 1502.8,779.1           "
   id="polygon1799" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1500.5,777.4 1498.1,775.8             1496.1,778 1498.5,779.7           "
   id="polygon1800" />
									</g>
									<g
   id="g1802">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.3,781.2 1502.9,779.5             1500.9,781.7 1503.3,783.5           "
   id="polygon1801" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501,781.7 1498.7,780.1             1496.6,782.3 1499.1,784           "
   id="polygon1802" />
									</g>
									<g
   id="g1804">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.8,785.5 1503.5,783.8             1501.4,786 1503.9,787.8           "
   id="polygon1803" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.6,786 1499.2,784.3             1497.2,786.6 1499.7,788.3           "
   id="polygon1804" />
									</g>
									<g
   id="g1806">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.4,789.8 1504,788.1             1502,790.3 1504.5,792.1           "
   id="polygon1805" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.2,790.3 1499.8,788.6             1497.8,790.9 1500.2,792.6           "
   id="polygon1806" />
									</g>
									<g
   id="g1808">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507,794.1 1504.6,792.4             1502.6,794.6 1505,796.4           "
   id="polygon1807" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.7,794.6 1500.3,792.9             1498.3,795.2 1500.8,796.9           "
   id="polygon1808" />
									</g>
									<g
   id="g1810">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.5,798.4 1505.1,796.7             1503.1,798.9 1505.5,800.7           "
   id="polygon1809" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.3,798.9 1500.9,797.2             1498.8,799.5 1501.3,801.2           "
   id="polygon1810" />
									</g>
									<g
   id="g1812">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508,802.7 1505.6,801             1503.6,803.2 1506,805           "
   id="polygon1811" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.8,803.2 1501.4,801.5             1499.4,803.8 1501.8,805.5           "
   id="polygon1812" />
									</g>
									<g
   id="g1814">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.5,807 1506.2,805.3             1504.1,807.5 1506.6,809.3           "
   id="polygon1813" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.3,807.5 1501.9,805.8             1499.9,808.1 1502.3,809.8           "
   id="polygon1814" />
									</g>
									<g
   id="g1816">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.1,811.3 1506.7,809.6             1504.6,811.8 1507.1,813.6           "
   id="polygon1815" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.8,811.8 1502.4,810.1             1500.4,812.4 1502.8,814.1           "
   id="polygon1816" />
									</g>
									<g
   id="g1818">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.6,815.6 1507.2,813.9             1505.2,816.2 1507.6,817.9           "
   id="polygon1817" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.3,816.1 1503,814.4             1500.9,816.7 1503.4,818.4           "
   id="polygon1818" />
									</g>
									<g
   id="g1820">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.1,820 1507.7,818.2             1505.7,820.5 1508.1,822.2           "
   id="polygon1819" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.8,820.4 1503.5,818.7             1501.4,821 1503.8,822.7           "
   id="polygon1820" />
									</g>
									<g
   id="g1822">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.5,824.3 1508.2,822.6             1506.1,824.8 1508.6,826.5           "
   id="polygon1821" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.3,824.8 1504,823             1501.9,825.3 1504.3,827           "
   id="polygon1822" />
									</g>
									<g
   id="g1824">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511,828.6 1508.7,826.9             1506.6,829.1 1509,830.8           "
   id="polygon1823" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.8,829.1 1504.4,827.3             1502.4,829.6 1504.8,831.3           "
   id="polygon1824" />
									</g>
									<g
   id="g1826">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.5,832.9 1509.1,831.2             1507.1,833.4 1509.5,835.2           "
   id="polygon1825" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.2,833.4 1504.9,831.6             1502.8,833.9 1505.3,835.6           "
   id="polygon1826" />
									</g>
									<g
   id="g1828">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512,837.2 1509.6,835.5             1507.6,837.7 1510,839.5           "
   id="polygon1827" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.7,837.7 1505.4,836             1503.3,838.2 1505.7,839.9           "
   id="polygon1828" />
									</g>
									<g
   id="g1829">
										<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1512.4,841.6            c-0.8-0.6-1.6-1.2-2.3-1.8l-2.1,2.2l2.4,1.8L1512.4,841.6z"
   id="path1828" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.2,842 1505.9,840.3             1503.8,842.4 1506.2,844.2           "
   id="polygon1829" />
									</g>
									<g
   id="g1831">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.8,845.9 1510.5,844.1             1508.4,846.3 1510.8,848.2           "
   id="polygon1830" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.6,846.3 1506.3,844.5             1504.2,846.7 1506.6,848.5           "
   id="polygon1831" />
									</g>
									<g
   id="g1833">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.2,850.3 1510.9,848.5             1508.8,850.6 1511.1,852.5           "
   id="polygon1832" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.9,850.6 1506.7,848.8             1504.5,851 1506.9,852.8           "
   id="polygon1833" />
									</g>
									<g
   id="g1835">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.5,854.7 1511.2,852.8             1509.1,855 1511.4,856.8           "
   id="polygon1834" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.3,855 1507,853.1             1504.8,855.3 1507.2,857.1           "
   id="polygon1835" />
									</g>
									<g
   id="g1837">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.8,859 1511.5,857.2             1509.4,859.3 1511.7,861.2           "
   id="polygon1836" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.5,859.3 1507.3,857.5             1505.1,859.5 1507.4,861.4           "
   id="polygon1837" />
									</g>
									<g
   id="g1839">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514,863.4 1511.8,861.5             1509.6,863.6 1511.9,865.5           "
   id="polygon1838" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.8,863.6 1507.5,861.8             1505.3,863.8 1507.6,865.7           "
   id="polygon1839" />
									</g>
									<g
   id="g1841">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.2,867.7 1512,865.9             1509.8,867.9 1512.1,869.9           "
   id="polygon1840" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510,867.9 1507.7,866.1             1505.5,868.1 1507.8,870.1           "
   id="polygon1841" />
									</g>
									<g
   id="g1843">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.4,872.1 1512.2,870.2             1510,872.3 1512.3,874.2           "
   id="polygon1842" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.2,872.3 1507.9,870.4             1505.7,872.5 1508,874.4           "
   id="polygon1843" />
									</g>
									<g
   id="g1845">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.6,876.4 1512.4,874.6             1510.2,876.6 1512.4,878.6           "
   id="polygon1844" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.3,876.6 1508.1,874.7             1505.9,876.8 1508.2,878.7           "
   id="polygon1845" />
									</g>
									<g
   id="g1847">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.7,880.8 1512.5,878.9             1510.3,880.9 1512.6,882.9           "
   id="polygon1846" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.5,880.9 1508.3,879             1506,881.1 1508.3,883           "
   id="polygon1847" />
									</g>
									<g
   id="g1849">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.9,885.1 1512.7,883.2             1510.4,885.3 1512.7,887.2           "
   id="polygon1848" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.6,885.3 1508.4,883.4             1506.2,885.4 1508.5,887.4           "
   id="polygon1849" />
									</g>
									<g
   id="g1851">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515,889.5 1512.8,887.6             1510.6,889.6 1512.8,891.6           "
   id="polygon1850" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.7,889.6 1508.5,887.7             1506.3,889.7 1508.6,891.7           "
   id="polygon1851" />
									</g>
									<g
   id="g1853">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.1,893.8 1512.9,891.9             1510.7,893.9 1512.9,895.9           "
   id="polygon1852" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.8,893.9 1508.7,892             1506.4,894.1 1508.7,896           "
   id="polygon1853" />
									</g>
									<g
   id="g1855">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.2,898.2 1513,896.3             1510.8,898.3 1513.1,900.2           "
   id="polygon1854" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511,898.3 1508.8,896.4             1506.5,898.4 1508.8,900.4           "
   id="polygon1855" />
									</g>
									<g
   id="g1857">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.3,902.5 1513.1,900.6             1510.9,902.6 1513.2,904.6           "
   id="polygon1856" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.1,902.6 1508.9,900.7             1506.6,902.7 1508.9,904.7           "
   id="polygon1857" />
									</g>
									<g
   id="g1859">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.4,906.8 1513.2,904.9             1511,906.9 1513.3,908.9           "
   id="polygon1858" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.2,906.9 1509,905             1506.7,907.1 1509,909           "
   id="polygon1859" />
									</g>
									<g
   id="g1861">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.6,911.1 1513.4,909.2             1511.1,911.3 1513.4,913.2           "
   id="polygon1860" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.3,911.3 1509.1,909.4             1506.8,911.4 1509.1,913.4           "
   id="polygon1861" />
									</g>
									<g
   id="g1863">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.7,915.5 1513.5,913.6             1511.3,915.6 1513.5,917.6           "
   id="polygon1862" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.4,915.6 1509.2,913.7             1507,915.8 1509.3,917.7           "
   id="polygon1863" />
									</g>
									<g
   id="g1865">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.8,919.8 1513.6,917.9             1511.4,919.9 1513.7,921.9           "
   id="polygon1864" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.6,919.9 1509.4,918.1             1507.1,920.1 1509.4,922           "
   id="polygon1865" />
									</g>
									<g
   id="g1867">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516,924.1 1513.8,922.2             1511.6,924.3 1513.9,926.2           "
   id="polygon1866" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.7,924.3 1509.5,922.4             1507.3,924.5 1509.6,926.4           "
   id="polygon1867" />
									</g>
									<g
   id="g1869">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.2,928.4 1514,926.5             1511.7,928.6 1514,930.5           "
   id="polygon1868" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.9,928.6 1509.7,926.7             1507.5,928.8 1509.8,930.7           "
   id="polygon1869" />
									</g>
									<g
   id="g1871">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.4,932.8 1514.1,930.9             1511.9,932.9 1514.2,934.9           "
   id="polygon1870" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.1,932.9 1509.9,931.1             1507.7,933.1 1510,935.1           "
   id="polygon1871" />
									</g>
									<g
   id="g1873">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.5,937.1 1514.3,935.2             1512.1,937.3 1514.4,939.2           "
   id="polygon1872" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.3,937.3 1510,935.4             1507.8,937.5 1510.1,939.4           "
   id="polygon1873" />
									</g>
									<g
   id="g1875">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.7,941.4 1514.5,939.5             1512.3,941.6 1514.6,943.5           "
   id="polygon1874" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.5,941.6 1510.2,939.7             1508,941.8 1510.3,943.7           "
   id="polygon1875" />
									</g>
									<g
   id="g1877">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.9,945.7 1514.7,943.9             1512.5,945.9 1514.8,947.9           "
   id="polygon1876" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.6,945.9 1510.4,944.1             1508.2,946.1 1510.5,948           "
   id="polygon1877" />
									</g>
									<g
   id="g1879">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.1,950.1 1514.9,948.2             1512.7,950.3 1515,952.2           "
   id="polygon1878" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.8,950.3 1510.6,948.4             1508.4,950.5 1510.7,952.4           "
   id="polygon1879" />
									</g>
									<g
   id="g1881">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.3,954.4 1515.1,952.5             1512.8,954.6 1515.1,956.5           "
   id="polygon1880" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513,954.6 1510.8,952.7             1508.6,954.8 1510.9,956.7           "
   id="polygon1881" />
									</g>
									<g
   id="g1883">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.5,958.8 1515.2,956.9             1513,958.9 1515.3,960.9           "
   id="polygon1882" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.2,958.9 1511,957             1508.8,959.1 1511.1,961           "
   id="polygon1883" />
									</g>
									<g
   id="g1885">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.6,963.1 1515.4,961.2             1513.2,963.3 1515.5,965.2           "
   id="polygon1884" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.4,963.3 1511.1,961.4             1508.9,963.4 1511.2,965.4           "
   id="polygon1885" />
									</g>
									<g
   id="g1887">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.8,967.4 1515.6,965.5             1513.3,967.6 1515.6,969.5           "
   id="polygon1886" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.5,967.6 1511.3,965.7             1509.1,967.7 1511.4,969.7           "
   id="polygon1887" />
									</g>
									<g
   id="g1889">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.9,971.8 1515.7,969.9             1513.5,971.9 1515.8,973.9           "
   id="polygon1888" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.7,971.9 1511.5,970             1509.2,972.1 1511.5,974           "
   id="polygon1889" />
									</g>
									<g
   id="g1891">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.1,976.1 1515.9,974.2             1513.6,976.3 1515.9,978.2           "
   id="polygon1890" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.8,976.3 1511.6,974.4             1509.4,976.4 1511.6,978.3           "
   id="polygon1891" />
									</g>
									<g
   id="g1893">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.2,980.5 1516,978.6             1513.7,980.6 1516,982.6           "
   id="polygon1892" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.9,980.6 1511.7,978.7             1509.5,980.7 1511.7,982.7           "
   id="polygon1893" />
									</g>
									<g
   id="g1895">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.3,984.8 1516.1,982.9             1513.8,984.9 1516.1,986.9           "
   id="polygon1894" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514,984.9 1511.8,983             1509.5,985 1511.8,987           "
   id="polygon1895" />
									</g>
									<g
   id="g1897">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.3,989.2 1516.2,987.3             1513.9,989.3 1516.1,991.3           "
   id="polygon1896" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514,989.3 1511.9,987.3             1509.6,989.3 1511.8,991.3           "
   id="polygon1897" />
									</g>
									<g
   id="g1899">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,993.6 1516.2,991.6             1513.9,993.6 1516.1,995.6           "
   id="polygon1898" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,993.6 1511.9,991.6             1509.6,993.6 1511.9,995.6           "
   id="polygon1899" />
									</g>
									<g
   id="g1901">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,997.9 1516.2,996             1513.9,997.9 1516.1,999.9           "
   id="polygon1900" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,997.9 1511.9,996             1509.7,998 1511.9,1000           "
   id="polygon1901" />
									</g>
									<g
   id="g1903">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,1002.3 1516.2,1000.3             1513.9,1002.3 1516.2,1004.3           "
   id="polygon1902" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,1002.3 1512,1000.3             1509.7,1002.3 1511.9,1004.3           "
   id="polygon1903" />
									</g>
									<g
   id="g1905">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,1006.6 1516.2,1004.6             1513.9,1006.6 1516.2,1008.6           "
   id="polygon1904" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,1006.6 1512,1004.6             1509.7,1006.6 1511.9,1008.6           "
   id="polygon1905" />
									</g>
									<g
   id="g1907">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,1010.9 1516.2,1009             1513.9,1010.9 1516.2,1013           "
   id="polygon1906" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,1010.9 1512,1009             1509.7,1010.9 1511.9,1013           "
   id="polygon1907" />
									</g>
									<g
   id="g1909">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,1015.3 1516.2,1013.3             1513.9,1015.3 1516.1,1017.3           "
   id="polygon1908" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,1015.3 1512,1013.3             1509.6,1015.3 1511.9,1017.3           "
   id="polygon1909" />
									</g>
									<g
   id="g1911">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.3,1019.6 1516.2,1017.6             1513.9,1019.6 1516.1,1021.6           "
   id="polygon1910" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.1,1019.6 1511.9,1017.6             1509.6,1019.6 1511.8,1021.6           "
   id="polygon1911" />
									</g>
									<g
   id="g1913">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.3,1024 1516.2,1022             1513.9,1023.9 1516.1,1026           "
   id="polygon1912" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514,1024 1511.9,1022             1509.6,1023.9 1511.8,1026           "
   id="polygon1913" />
									</g>
									<g
   id="g1915">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.3,1028.3 1516.1,1026.3             1513.8,1028.3 1516,1030.3           "
   id="polygon1914" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514,1028.3 1511.9,1026.3             1509.6,1028.2 1511.8,1030.3           "
   id="polygon1915" />
									</g>
									<g
   id="g1917">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.2,1032.7 1516.1,1030.7             1513.8,1032.6 1516,1034.7           "
   id="polygon1916" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.9,1032.6 1511.8,1030.6             1509.5,1032.6 1511.7,1034.6           "
   id="polygon1917" />
									</g>
									<g
   id="g1919">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.1,1037 1516,1035             1513.7,1036.9 1515.9,1039           "
   id="polygon1918" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.9,1037 1511.8,1035             1509.4,1036.9 1511.6,1038.9           "
   id="polygon1919" />
									</g>
									<g
   id="g1921">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.1,1041.4 1516,1039.3             1513.6,1041.3 1515.8,1043.3           "
   id="polygon1920" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.8,1041.3 1511.7,1039.3             1509.4,1041.2 1511.6,1043.3           "
   id="polygon1921" />
									</g>
									<g
   id="g1923">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518,1045.7 1515.9,1043.7             1513.6,1045.6 1515.8,1047.7           "
   id="polygon1922" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.7,1045.6 1511.6,1043.6             1509.3,1045.5 1511.5,1047.6           "
   id="polygon1923" />
									</g>
									<g
   id="g1925">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.9,1050 1515.8,1048             1513.5,1049.9 1515.7,1052           "
   id="polygon1924" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.7,1050 1511.6,1047.9             1509.2,1049.9 1511.4,1051.9           "
   id="polygon1925" />
									</g>
									<g
   id="g1927">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.8,1054.4 1515.7,1052.4             1513.4,1054.3 1515.6,1056.4           "
   id="polygon1926" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.5,1054.3 1511.5,1052.3             1509.1,1054.2 1511.3,1056.3           "
   id="polygon1927" />
									</g>
									<g
   id="g1929">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.7,1058.7 1515.6,1056.7             1513.3,1058.6 1515.4,1060.7           "
   id="polygon1928" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.4,1058.6 1511.3,1056.6             1509,1058.5 1511.2,1060.6           "
   id="polygon1929" />
									</g>
									<g
   id="g1931">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.6,1063.1 1515.5,1061             1513.2,1063 1515.3,1065           "
   id="polygon1930" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.3,1063 1511.2,1060.9             1508.9,1062.8 1511.1,1064.9           "
   id="polygon1931" />
									</g>
									<g
   id="g1933">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.5,1067.4 1515.4,1065.4             1513.1,1067.3 1515.2,1069.4           "
   id="polygon1932" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.2,1067.3 1511.1,1065.3             1508.8,1067.2 1510.9,1069.2           "
   id="polygon1933" />
									</g>
									<g
   id="g1935">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.3,1071.8 1515.3,1069.7             1512.9,1071.6 1515.1,1073.7           "
   id="polygon1934" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.1,1071.6 1511,1069.6             1508.6,1071.5 1510.8,1073.6           "
   id="polygon1935" />
									</g>
									<g
   id="g1937">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.2,1076.1 1515.1,1074.1             1512.8,1075.9 1514.9,1078           "
   id="polygon1936" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.9,1076 1510.9,1073.9             1508.5,1075.8 1510.6,1077.9           "
   id="polygon1937" />
									</g>
									<g
   id="g1939">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.1,1080.4 1515,1078.4             1512.6,1080.3 1514.8,1082.4           "
   id="polygon1938" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.8,1080.3 1510.7,1078.3             1508.3,1080.1 1510.5,1082.2           "
   id="polygon1939" />
									</g>
									<g
   id="g1941">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.9,1084.8 1514.8,1082.7             1512.5,1084.6 1514.6,1086.7           "
   id="polygon1940" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.6,1084.6 1510.6,1082.6             1508.2,1084.5 1510.3,1086.6           "
   id="polygon1941" />
									</g>
									<g
   id="g1943">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.7,1089.1 1514.7,1087.1             1512.3,1088.9 1514.4,1091.1           "
   id="polygon1942" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.4,1089 1510.4,1086.9             1508,1088.8 1510.1,1090.9           "
   id="polygon1943" />
									</g>
									<g
   id="g1945">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.5,1093.5 1514.5,1091.4             1512.1,1093.3 1514.2,1095.4           "
   id="polygon1944" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.3,1093.3 1510.2,1091.2             1507.8,1093.1 1510,1095.2           "
   id="polygon1945" />
									</g>
									<g
   id="g1947">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.3,1097.8 1514.3,1095.7             1511.9,1097.6 1514,1099.7           "
   id="polygon1946" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.1,1097.6 1510,1095.6             1507.6,1097.4 1509.8,1099.5           "
   id="polygon1947" />
									</g>
									<g
   id="g1949">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516.2,1102.2 1514.1,1100.1             1511.7,1101.9 1513.8,1104.1           "
   id="polygon1948" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.9,1102 1509.8,1099.9             1507.5,1101.7 1509.6,1103.9           "
   id="polygon1949" />
									</g>
									<g
   id="g1951">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.9,1106.5 1513.9,1104.4             1511.5,1106.3 1513.6,1108.4           "
   id="polygon1950" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.7,1106.3 1509.6,1104.2             1507.2,1106.1 1509.3,1108.2           "
   id="polygon1951" />
									</g>
									<g
   id="g1953">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.7,1110.8 1513.7,1108.7             1511.3,1110.6 1513.4,1112.7           "
   id="polygon1952" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.4,1110.6 1509.4,1108.5             1507,1110.4 1509.1,1112.5           "
   id="polygon1953" />
									</g>
									<g
   id="g1955">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.5,1115.2 1513.4,1113.1             1511,1114.9 1513.2,1117.1           "
   id="polygon1954" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.2,1114.9 1509.2,1112.9             1506.8,1114.7 1508.9,1116.8           "
   id="polygon1955" />
									</g>
									<g
   id="g1957">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515.2,1119.5 1513.2,1117.4             1510.8,1119.3 1512.9,1121.4           "
   id="polygon1956" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511,1119.3 1508.9,1117.2             1506.5,1119 1508.6,1121.2           "
   id="polygon1957" />
									</g>
									<g
   id="g1959">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1515,1123.8 1513,1121.8             1510.5,1123.6 1512.6,1125.7           "
   id="polygon1958" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.7,1123.6 1508.7,1121.5             1506.3,1123.3 1508.4,1125.5           "
   id="polygon1959" />
									</g>
									<g
   id="g1961">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.7,1128.2 1512.7,1126.1             1510.3,1127.9 1512.4,1130.1           "
   id="polygon1960" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.4,1127.9 1508.4,1125.8             1506,1127.7 1508.1,1129.8           "
   id="polygon1961" />
									</g>
									<g
   id="g1963">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.4,1132.5 1512.4,1130.4             1510,1132.2 1512.1,1134.4           "
   id="polygon1962" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.2,1132.3 1508.2,1130.2             1505.7,1132 1507.8,1134.1           "
   id="polygon1963" />
									</g>
									<g
   id="g1965">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.2,1136.9 1512.2,1134.7             1509.7,1136.6 1511.8,1138.7           "
   id="polygon1964" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.9,1136.6 1507.9,1134.5             1505.5,1136.3 1507.5,1138.4           "
   id="polygon1965" />
									</g>
									<g
   id="g1967">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.9,1141.2 1511.9,1139.1             1509.4,1140.9 1511.5,1143.1           "
   id="polygon1966" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.6,1140.9 1507.6,1138.8             1505.2,1140.6 1507.2,1142.8           "
   id="polygon1967" />
									</g>
									<g
   id="g1969">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.5,1145.5 1511.5,1143.4             1509.1,1145.2 1511.2,1147.4           "
   id="polygon1968" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.3,1145.2 1507.3,1143.1             1504.9,1144.9 1506.9,1147.1           "
   id="polygon1969" />
									</g>
									<g
   id="g1971">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.2,1149.9 1511.2,1147.7             1508.8,1149.5 1510.9,1151.7           "
   id="polygon1970" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509,1149.6 1507,1147.4             1504.5,1149.2 1506.6,1151.4           "
   id="polygon1971" />
									</g>
									<g
   id="g1973">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.9,1154.2 1510.9,1152.1             1508.5,1153.9 1510.5,1156           "
   id="polygon1972" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.6,1153.9 1506.7,1151.8             1504.2,1153.5 1506.3,1155.7           "
   id="polygon1973" />
									</g>
									<g
   id="g1975">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.6,1158.5 1510.6,1156.4             1508.1,1158.2 1510.2,1160.4           "
   id="polygon1974" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.3,1158.2 1506.3,1156.1             1503.9,1157.8 1505.9,1160           "
   id="polygon1975" />
									</g>
									<g
   id="g1977">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.2,1162.9 1510.2,1160.7             1507.8,1162.5 1509.8,1164.7           "
   id="polygon1976" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.9,1162.5 1506,1160.4             1503.5,1162.2 1505.6,1164.3           "
   id="polygon1977" />
									</g>
									<g
   id="g1979">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.8,1167.2 1509.9,1165.1             1507.4,1166.8 1509.5,1169           "
   id="polygon1978" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.6,1166.8 1505.6,1164.7             1503.2,1166.5 1505.2,1168.7           "
   id="polygon1979" />
									</g>
									<g
   id="g1981">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.5,1171.5 1509.5,1169.4             1507,1171.1 1509.1,1173.3           "
   id="polygon1980" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.2,1171.2 1505.3,1169             1502.8,1170.8 1504.8,1173           "
   id="polygon1981" />
									</g>
									<g
   id="g1983">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.1,1175.9 1509.1,1173.7             1506.6,1175.5 1508.7,1177.7           "
   id="polygon1982" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.8,1175.5 1504.9,1173.3             1502.4,1175.1 1504.4,1177.3           "
   id="polygon1983" />
									</g>
									<g
   id="g1985">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.7,1180.2 1508.7,1178             1506.2,1179.8 1508.3,1182           "
   id="polygon1984" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.4,1179.8 1504.5,1177.6             1502,1179.4 1504,1181.6           "
   id="polygon1985" />
									</g>
									<g
   id="g1987">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.3,1184.5 1508.3,1182.3             1505.9,1184.1 1507.9,1186.3           "
   id="polygon1986" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506,1184.1 1504.1,1181.9             1501.6,1183.7 1503.6,1185.9           "
   id="polygon1987" />
									</g>
									<g
   id="g1989">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.8,1188.8 1507.9,1186.7             1505.4,1188.4 1507.4,1190.6           "
   id="polygon1988" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.6,1188.4 1503.7,1186.3             1501.2,1188 1503.2,1190.2           "
   id="polygon1989" />
									</g>
									<g
   id="g1991">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1509.4,1193.2 1507.5,1191             1505,1192.7 1507,1195           "
   id="polygon1990" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.1,1192.7 1503.2,1190.6             1500.7,1192.3 1502.7,1194.5           "
   id="polygon1991" />
									</g>
									<g
   id="g1993">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.9,1197.5 1507,1195.3             1504.5,1197 1506.5,1199.3           "
   id="polygon1992" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.7,1197.1 1502.8,1194.9             1500.3,1196.6 1502.3,1198.8           "
   id="polygon1993" />
									</g>
									<g
   id="g1995">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.5,1201.8 1506.6,1199.6             1504.1,1201.3 1506.1,1203.6           "
   id="polygon1994" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.2,1201.4 1502.3,1199.2             1499.8,1200.9 1501.8,1203.1           "
   id="polygon1995" />
									</g>
									<g
   id="g1997">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508,1206.1 1506.1,1203.9             1503.6,1205.6 1505.6,1207.9           "
   id="polygon1996" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.8,1205.7 1501.8,1203.5             1499.3,1205.2 1501.3,1207.4           "
   id="polygon1997" />
									</g>
									<g
   id="g1999">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.5,1210.5 1505.6,1208.3             1503.1,1210 1505.1,1212.2           "
   id="polygon1998" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.3,1210 1501.4,1207.8             1498.9,1209.5 1500.8,1211.7           "
   id="polygon1999" />
									</g>
									<g
   id="g2001">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507,1214.8 1505.1,1212.6             1502.6,1214.3 1504.6,1216.5           "
   id="polygon2000" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.8,1214.3 1500.9,1212.1             1498.4,1213.8 1500.3,1216           "
   id="polygon2001" />
									</g>
									<g
   id="g2003">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.5,1219.1 1504.6,1216.9             1502.1,1218.6 1504,1220.8           "
   id="polygon2002" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.3,1218.6 1500.4,1216.4             1497.9,1218.1 1499.8,1220.3           "
   id="polygon2003" />
									</g>
									<g
   id="g2005">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506,1223.4 1504.1,1221.2             1501.6,1222.9 1503.5,1225.1           "
   id="polygon2004" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.7,1222.9 1499.8,1220.7             1497.3,1222.3 1499.3,1224.6           "
   id="polygon2005" />
									</g>
									<g
   id="g2007">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.4,1227.7 1503.5,1225.5             1501,1227.2 1503,1229.5           "
   id="polygon2006" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.2,1227.2 1499.3,1225             1496.8,1226.6 1498.7,1228.9           "
   id="polygon2007" />
									</g>
									<g
   id="g2009">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.9,1232 1503,1229.8             1500.5,1231.5 1502.4,1233.8           "
   id="polygon2008" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1500.6,1231.5 1498.8,1229.3             1496.2,1230.9 1498.2,1233.2           "
   id="polygon2009" />
									</g>
									<g
   id="g2011">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.3,1236.4 1502.4,1234.1             1499.9,1235.8 1501.8,1238.1           "
   id="polygon2010" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1500.1,1235.8 1498.2,1233.6             1495.7,1235.2 1497.6,1237.5           "
   id="polygon2011" />
									</g>
									<g
   id="g2013">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.7,1240.7 1501.9,1238.4             1499.3,1240.1 1501.2,1242.4           "
   id="polygon2012" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.5,1240.1 1497.6,1237.9             1495.1,1239.5 1497,1241.8           "
   id="polygon2013" />
									</g>
									<g
   id="g2015">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.1,1245 1501.3,1242.7             1498.7,1244.4 1500.6,1246.7           "
   id="polygon2014" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.9,1244.4 1497,1242.1             1494.5,1243.8 1496.4,1246.1           "
   id="polygon2015" />
									</g>
									<g
   id="g2017">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502.5,1249.3 1500.7,1247             1498.1,1248.6 1500,1251           "
   id="polygon2016" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.3,1248.7 1496.4,1246.4             1493.9,1248 1495.8,1250.4           "
   id="polygon2017" />
									</g>
									<g
   id="g2019">
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501.9,1253.6 1500,1251.3             1497.5,1252.9 1499.4,1255.3           "
   id="polygon2018" />
										<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1497.6,1253 1495.8,1250.7             1493.3,1252.3 1495.2,1254.6           "
   id="polygon2019" />
									</g>
									<g
   id="g2024">
										<g
   id="g2021">
											<defs
   id="defs2019">
												<polygon
   id="SVGID_00000090282981971786186830000016341204083386266536_"
   points="1266.7,1252.1 1252.3,1263.6               1266.6,1263.7             " />
											</defs>
											<clipPath
   id="SVGID_00000154426794137966038600000018357879942124741813_">
												<use
   xlinkHref="#SVGID_00000090282981971786186830000016341204083386266536_"
   overflow="visible"
   id="use2019" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000154426794137966038600000018357879942124741813_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1259.5,1262.2 1263.7,1260.1 1259.5,1257.8 1255.3,1260            "
   id="polygon2020" />
											
												<polygon
   clip-path="url(#SVGID_00000154426794137966038600000018357879942124741813_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1259.5,1258 1263.7,1255.8 1259.5,1253.5 1255.3,1255.7            "
   id="polygon2021" />
										</g>
										<g
   id="g2023">
											<defs
   id="defs2021">
												<polygon
   id="SVGID_00000067201982966600181400000016783234456840097452_"
   points="1265.3,1250.7 1253.7,1265               1253.7,1250.7             " />
											</defs>
											<clipPath
   id="SVGID_00000080184180217825941390000007946515753644909496_">
												<use
   xlinkHref="#SVGID_00000067201982966600181400000016783234456840097452_"
   overflow="visible"
   id="use2021" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000080184180217825941390000007946515753644909496_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1255.1,1257.9 1257.2,1262.1 1259.6,1257.9 1257.4,1253.7            "
   id="polygon2022" />
											
												<polygon
   clip-path="url(#SVGID_00000080184180217825941390000007946515753644909496_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1259.4,1257.9 1261.5,1262.1 1263.8,1257.9 1261.6,1253.7            "
   id="polygon2023" />
										</g>
									</g>
									<g
   id="g2028">
										<g
   id="g2025">
											<defs
   id="defs2024">
												<polygon
   id="SVGID_00000108995481915096148860000017189887457006614147_"
   points="1269.2,409.3 1267.8,407.5               1267.1,406.6 1266.4,405.7 1263.5,401.9 1257.8,394.3 1257.8,395.2 1257.8,395.7 1257.8,396.2 1257.7,398 1257.7,401.8               1257.7,409.2             " />
											</defs>
											<clipPath
   id="SVGID_00000069387741315439421860000014198812781180991679_">
												<use
   xlinkHref="#SVGID_00000108995481915096148860000017189887457006614147_"
   overflow="visible"
   id="use2024" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000069387741315439421860000014198812781180991679_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1259.2,401.9 1261.3,406.3 1263.6,401.9 1261.5,397.6 1260.9,398.6 1260.7,398.8 1260.6,399.1 1260.3,399.7                         "
   id="polygon2024" />
											
												<polygon
   clip-path="url(#SVGID_00000069387741315439421860000014198812781180991679_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1263.4,401.9 1265.6,406.3 1266.1,405.2 1266.3,404.9 1266.3,404.9 1266.4,404.8 1266.4,404.7 1266.8,404.2              1268.1,402.2 1266,397.8            "
   id="polygon2025" />
										</g>
										<g
   id="g2027">
											<defs
   id="defs2025">
												<polygon
   id="SVGID_00000066510605497231496870000015994088487692660133_"
   points="1270.6,408 1268.9,406.5 1268,405.8               1267.1,405 1263.5,401.9 1256.4,395.7 1257.3,395.7 1257.7,395.7 1258.2,395.7 1260.1,395.8 1263.9,396.1 1271.3,396.5                           " />
											</defs>
											<clipPath
   id="SVGID_00000045619051068674587320000011171183782162530729_">
												<use
   xlinkHref="#SVGID_00000066510605497231496870000015994088487692660133_"
   overflow="visible"
   id="use2025" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000045619051068674587320000011171183782162530729_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1263.7,397.5 1261.5,398.4 1260.9,398.7 1260.6,398.8 1260.4,398.9 1259.3,399.5 1263.5,401.9 1268.1,400            "
   id="polygon2026" />
											
												<polygon
   clip-path="url(#SVGID_00000045619051068674587320000011171183782162530729_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1263.5,401.8 1259.3,404 1263.5,406.5 1265.6,405.3 1266.1,405 1266.4,404.9 1266.7,404.7 1267.8,404.3            "
   id="polygon2027" />
										</g>
									</g>
									<g
   id="g2031">
										<g
   id="g2029">
											<defs
   id="defs2028">
												<polygon
   id="SVGID_00000065782012494107359360000011008558879972258710_"
   points="1351,414.4 1352,412.9 1352.5,412.1               1352.6,411.9 1352.7,411.8 1352.7,411.8 1352.7,411.8 1352.8,411.7 1352.8,411.7 1353,411.6 1353.5,411.2 1353.7,411.1               1353.8,411 1353.9,411 1353.9,411 1353.9,411 1353.9,410.9 1353.9,410.9 1353.9,410.9 1354.4,410.2 1356.2,407.4               1360.2,400.9 1359.5,401.5 1359.2,401.8 1359.1,401.8 1359.1,401.8 1359.1,401.8 1359,401.8 1358.9,401.8 1358.1,401.7               1356.5,401.6 1351.8,401.3             " />
											</defs>
											<clipPath
   id="SVGID_00000052813432389269579220000001783086710350880414_">
												<use
   xlinkHref="#SVGID_00000065782012494107359360000011008558879972258710_"
   overflow="visible"
   id="use2028" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000052813432389269579220000001783086710350880414_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1356.4,403.1 1354.4,405.1 1355.3,406.3 1355.7,406.9 1355.9,407.2 1356,407.3 1356.1,407.4 1356.1,407.4 1356.1,407.5              1356.1,407.5 1356.1,407.5 1356.1,407.5 1356.1,407.5 1356.1,407.5 1356.1,407.5 1358.9,404.1 1357.9,404.5              1357.6,404.6 1357.6,404.7 1357.6,404.7 1357.6,404.7 1357.6,404.7 1357.6,404.6 1357.6,404.6 1357.6,404.6              1357.6,404.6 1357.5,404.5 1357.3,404.2            "
   id="polygon2028" />
											
												<path
   clip-path="url(#SVGID_00000052813432389269579220000001783086710350880414_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="             M1356.1,407.3l-2,2l0.4,0.6l0.1,0.2l0,0l0,0l0,0l0,0c0,0,0,0,0,0l0,0l0,0l0,0l0.1-0.1l0.5-0.2l2-0.8l2.7-3.4l-2,0.9             l-1,0.4l-0.5,0.2l-0.2,0.1L1356.1,407.3L1356.1,407.3L1356.1,407.3L1356.1,407.3L1356.1,407.3L1356.1,407.3L1356.1,407.3             z"
   id="path2028" />
										</g>
										<g
   id="g2030">
											<defs
   id="defs2029">
												<polygon
   id="SVGID_00000068666584474471150060000005112816101166420140_"
   points="1353.2,415.6 1353.9,413.9               1354.3,413 1354.4,412.8 1354.4,412.7 1354.4,412.7 1354.5,412.7 1354.5,412.7 1354.5,412.6 1354.5,412.4 1354.5,411.8               1354.5,411.5 1354.5,411.3 1354.5,411.3 1354.5,411.3 1354.5,411.3 1354.5,411.3 1354.5,411.3 1354.5,411.2               1354.8,410.5 1356.2,407.4 1359.2,400.4 1359.2,401.3 1359.1,401.8 1359.1,401.8 1359.1,401.8 1359.2,401.8               1359.2,401.9 1359.3,401.9 1359.8,402.6 1360.7,403.9 1363.6,407.6             " />
											</defs>
											<clipPath
   id="SVGID_00000116934597275159798550000005682955564792306825_">
												<use
   xlinkHref="#SVGID_00000068666584474471150060000005112816101166420140_"
   overflow="visible"
   id="use2029" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000116934597275159798550000005682955564792306825_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1359.6,404.7 1358.2,404.6 1357.8,404.6 1357.7,404.6 1357.7,404.6 1357.7,404.6 1357.6,404.6 1357.6,404.6              1357.6,404.6 1357.6,404.6 1357.6,404.6 1357.6,404.6 1357.6,404.3 1357.4,403.3 1356.1,407.3 1356.1,407.4              1356.1,407.4 1356.1,407.4 1356.1,407.4 1356.1,407.4 1356.1,407.4 1356.1,407.4 1356.2,407.4 1356.3,407.4              1356.4,407.5 1356.8,407.5 1357.5,407.5 1359,407.6            "
   id="polygon2029" />
											
												<path
   clip-path="url(#SVGID_00000116934597275159798550000005682955564792306825_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="             M1356.2,407.3L1356.2,407.3L1356.2,407.3L1356.2,407.3L1356.2,407.3l0-0.1l0-0.1l0-0.3l-0.1-0.5l-0.2-1l-0.4-2.1             l-1.3,4.1l0.4,2.1l0.1,0.5l0,0.1l0,0.1l0,0l0,0c0,0,0,0,0,0h0l0,0l0,0l0,0l0.2,0l0.7,0L1356.2,407.3z"
   id="path2029" />
										</g>
									</g>
									<g
   id="g2034">
										<g
   id="g2032">
											<defs
   id="defs2031">
												<polygon
   id="SVGID_00000005972686021886463010000008765195853921645493_"
   points="1491.7,1251.7 1492.4,1252.7               1492.7,1253.2 1492.9,1253.4 1493.1,1253.7 1493.7,1254.6 1494.3,1255.5 1496.7,1259 1501.6,1266.2 1501.6,1265.3               1501.6,1264.8 1501.6,1264.8 1501.6,1264.8 1501.7,1264.7 1501.7,1264.6 1501.7,1264.5 1501.9,1262.9 1502.4,1259.9               1503.4,1253.4             " />
											</defs>
											<clipPath
   id="SVGID_00000000938993609135583090000003654464626523734444_">
												<use
   xlinkHref="#SVGID_00000005972686021886463010000008765195853921645493_"
   overflow="visible"
   id="use2031" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000000938993609135583090000003654464626523734444_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1501,1259.6 1499.4,1255.7 1496.6,1258.9 1498.5,1263.2 1499,1262.1 1499.1,1261.9 1499.1,1261.9 1499.1,1261.8              1499.1,1261.8 1499.1,1261.8 1499.2,1261.8 1499.3,1261.7 1499.6,1261.2            "
   id="polygon2031" />
											
												<path
   clip-path="url(#SVGID_00000000938993609135583090000003654464626523734444_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="             M1496.8,1259l-1.6-3.8l-0.7,0.8l-0.2,0.2l0,0l0,0l0,0l0,0c0,0,0,0,0,0l0,0l0,0l0,0l-0.1,0.1l-0.3,0.5l-1,2.1l1.9,4.2             l1-2.1l0.5-1.1l0.2-0.5l0.1-0.3l0.1-0.1L1496.8,1259L1496.8,1259L1496.8,1259L1496.8,1259L1496.8,1259L1496.8,1259z"
   id="path2031" />
										</g>
										<g
   id="g2033">
											<defs
   id="defs2032">
												<polygon
   id="SVGID_00000091002419817048208100000006899000560209362603_"
   points="1490.2,1253 1491.1,1253.8               1491.5,1254.2 1491.7,1254.5 1491.9,1254.6 1492.8,1255.4 1493.6,1256.1 1496.7,1259 1503,1265 1502.1,1264.9               1501.7,1264.8 1501.6,1264.8 1501.6,1264.8 1501.6,1264.8 1501.5,1264.8 1501.3,1264.8 1499.7,1264.8 1496.6,1264.8               1490.1,1264.8             " />
											</defs>
											<clipPath
   id="SVGID_00000001653157142168180890000016596335135897042871_">
												<use
   xlinkHref="#SVGID_00000091002419817048208100000006899000560209362603_"
   overflow="visible"
   id="use2032" />
											</clipPath>
											
												<polygon
   clip-path="url(#SVGID_00000001653157142168180890000016596335135897042871_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="             1496.7,1263.4 1498.5,1262.3 1498.9,1262 1499,1262 1499.1,1261.9 1499.1,1261.9 1499.1,1261.9 1499.1,1261.9              1499.2,1261.9 1499.2,1261.9 1499.4,1261.8 1500.5,1261.5 1496.7,1258.9 1496.7,1259 1496.7,1259 1496.6,1259              1496.6,1259 1496.6,1259 1496.6,1259 1496.5,1259.1 1496.3,1259.2 1495.8,1259.5 1494.9,1260 1493.1,1261.1                         "
   id="polygon2032" />
											
												<path
   clip-path="url(#SVGID_00000001653157142168180890000016596335135897042871_)"
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="             M1496.7,1259.1l4.3-1.2l-3.8-2.6l-2.2,0.6l-0.6,0.2l-0.1,0l-0.1,0l0,0l0,0c0,0,0,0,0,0l0,0l0,0l0,0l0,0l-0.2,0.1             l-0.9,0.6L1496.7,1259.1z"
   id="path2032" />
										</g>
									</g>
								</g>
							</g>
						</g>
					</g>
					
						<path
   clip-path="url(#SVGID_00000134225643552151101190000001929809485296274323_)"
   fill="none"
   stroke="#231F20"
   stroke-width="0.75"
   stroke-miterlimit="10"
   stroke-dasharray="5"
   d="       M1455.3,1113.4c10.8,2.7,26.2,6.1,45,9c26.2,4,47.3,5.1,86,6c31.6,0.7,57.3,0.9,98,1c46.1,0.1,48.5-0.1,98,0       c66.3,0.1,71,0.6,99,0c58.5-1.2,82.8-4.2,96-6c26.2-3.6,47.5-8.4,62-12"
   id="path2038" />
				</g>
				
					<path
   id="Stitch_00000073706330935438002120000003096566446822764206_"
   fill="none"
   stroke="#231F20"
   stroke-width="0.75"
   stroke-miterlimit="10"
   stroke-dasharray="5"
   d="      M1597.5,263.5c4,10.3,11.1,24.8,24,39c21.8,24,47.3,32.4,65,38c49.8,15.8,92.2,5.9,108,2c15-3.7,34.1-8.6,55-23      c25.4-17.5,39.2-39.3,46-52" />
			</g>
			<g
   id="Right_Sleeve_00000126290513933889586260000014795332165845219240_">
				<path
   id="Fill_Sleeve"
   ref={sleevesDrop}
   className="st3-sleeves" 
   fill={getFillValue('sleeves')} 
   style={{
	 ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
	 cursor: sleevesUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
	stroke="#231F20"
   stroke-width="2"
   stroke-miterlimit="10"
   d="M1885.5,202.5      c7.6,4.7,19,11.4,33,19c7.9,4.3,17.4,9.2,55,27c19,9,37.9,18.3,57,27c13,5.9,19.8,8.9,30,15c7.5,4.5,19.5,11.9,32,24      c14.8,14.3,22.9,28.1,28,37c12.2,21.1,17,39.2,23,62c13.1,50.1,19.6,75.1,25,104c4.8,25.8,7.9,48.5,14,93      c7.9,58.3,11.9,87.4,15,123c2.8,32.1,3.9,60.8,6,118c2.4,64.9,3.6,98.1,2,134c-1,21.6-7.2,62.4-9,96c-1.3,24.9-2,37.4-2,41      c0,7.1,0.2,14.1-1,24c-1.2,10.2-3.3,18.4-5,24c-5.5-2-13.8-4.7-24-7c-5.7-1.3-22-4.7-61-5c-10.9-0.1-25.6,0.1-43,1      c-0.5-2.3-1.1-5-1.7-8.2c-0.1-0.5-0.9-5.5-1.3-10.8c-0.8-10.1-0.1-19.7,0-21c0.7-12.4-0.5-20.3-3-41c-3-25.3-5.2-50.7-8-76      c-2.5-23-6.2-56.2-9-96c-2.4-33.7-3.5-61.6-4-81c-1.4-52.2-0.3-91.4,0-102c1.5-47.3,2.2-70.9,6-95c3-18.7,6.8-36.2,10-67      c0.4-3.7,1.2-19.7,3-42c0.4-5.1,0.8-9.3,1-12c-2.4-6.3-5.8-14.8-10-25c-6.8-16.4-16.1-38.9-29-65c-8.2-16.5-18.1-36.3-34-61      c-9.9-15.4-20.4-31.5-37-50c-12.1-13.5-30.4-31.4-56-49C1886.8,239.2,1886.2,220.8,1885.5,202.5z" />
				<g
   id="Cuufs_Left">
					<path
      ref={sleevesDrop}
	  className="st3-sleeves" 
	  fill={getFillValue('sleeves')} 
	  style={{
		...getDropZoneStyle(isSleevesOver, canSleevesDrop),
		cursor: sleevesUploadedPattern ? 'pointer' : 'default'
	  }}
	  onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
   
   stroke="#231F20"
   stroke-width="2.0356"
   stroke-miterlimit="10"
   d="M2061.5,1151.7       c-0.8,3.1,1.7,4.9,4,16.4c0.3,1.4,1.3,6.5,2,16.4c0.9,12.6,0.5,23,0,34.8c-0.5,11.3-1.2,24-2,37.9c6.1,1.9,12.5,3.6,19.2,5.1       c33.7,7.7,64.6,7.8,90.1,5.1c0.1-6,0.3-14.8,1-25.6c1-16,1.8-28.9,5.1-45c1.5-7.2,3.9-17.5,8.1-29.7       c-27.9-17-52.6-22.6-68.8-24.6C2094.8,1139.4,2064.1,1141.7,2061.5,1151.7z"
   id="path2039" />
					<g
   id="g2079">
						<defs
   id="defs2039">
							<path
   id="SVGID_00000028325748676562903180000015037785702944874162_"
   d="M2061.4,1151.7c-0.8,3.1,1.7,4.9,4,16.4         c0.3,1.4,1.3,6.5,2,16.4c0.9,12.6,0.5,23,0,34.8c-0.5,11.3-1.2,24-2,37.9c6.1,1.9,12.5,3.6,19.2,5.1         c33.7,7.7,64.6,7.8,90.1,5.1c0.1-6,0.3-14.8,1-25.6c1-16,1.8-28.9,5.1-45c1.5-7.2,3.9-17.5,8.1-29.7         c-27.9-17-52.6-22.6-68.8-24.6C2094.7,1139.3,2064,1141.6,2061.4,1151.7z" />
						</defs>
						<clipPath
   id="SVGID_00000112622132658734317550000000400202188236661426_">
							<use
   xlinkHref="#SVGID_00000028325748676562903180000015037785702944874162_"
   overflow="visible"
   id="use2039" />
						</clipPath>
						<g
   clip-path="url(#SVGID_00000112622132658734317550000000400202188236661426_)"
   id="g2078">
							<line
   fill="#FFFFFF"
   x1="2055.1"
   y1="1205.1"
   x2="2219.4"
   y2="1220.3"
   id="line2039" />
							<g
   id="g2077">
								<g
   id="g2076">
									<g
   id="g2043">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2068.2"
   y1="1064.7"
   x2="2042.2"
   y2="1345.7"
   id="line2040" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2074.3"
   y1="1065.3"
   x2="2048.2"
   y2="1346.3"
   id="line2041" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2080.1"
   y1="1065.7"
   x2="2054.1"
   y2="1346.6"
   id="line2042" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2086.1"
   y1="1066.3"
   x2="2060.1"
   y2="1347.2"
   id="line2043" />
									</g>
									<g
   id="g2047">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2086.5"
   y1="1066.4"
   x2="2060.5"
   y2="1347.4"
   id="line2044" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2092.5"
   y1="1067"
   x2="2066.5"
   y2="1348"
   id="line2045" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2098.4"
   y1="1067.3"
   x2="2072.4"
   y2="1348.3"
   id="line2046" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2104.4"
   y1="1067.9"
   x2="2078.4"
   y2="1348.9"
   id="line2047" />
									</g>
									<g
   id="g2051">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2104.8"
   y1="1068.1"
   x2="2078.7"
   y2="1349.1"
   id="line2048" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2110.8"
   y1="1068.7"
   x2="2084.7"
   y2="1349.6"
   id="line2049" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2116.6"
   y1="1069"
   x2="2090.6"
   y2="1350"
   id="line2050" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2122.7"
   y1="1069.6"
   x2="2096.6"
   y2="1350.6"
   id="line2051" />
									</g>
									<g
   id="g2055">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2123"
   y1="1069.8"
   x2="2097"
   y2="1350.7"
   id="line2052" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2129"
   y1="1070.4"
   x2="2103"
   y2="1351.3"
   id="line2053" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2134.9"
   y1="1070.7"
   x2="2108.9"
   y2="1351.7"
   id="line2054" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2140.9"
   y1="1071.3"
   x2="2114.9"
   y2="1352.3"
   id="line2055" />
									</g>
									<g
   id="g2059">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2141.3"
   y1="1071.5"
   x2="2115.2"
   y2="1352.4"
   id="line2056" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2147.3"
   y1="1072.1"
   x2="2121.3"
   y2="1353"
   id="line2057" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2153.2"
   y1="1072.4"
   x2="2127.1"
   y2="1353.4"
   id="line2058" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2159.2"
   y1="1073"
   x2="2133.1"
   y2="1354"
   id="line2059" />
									</g>
									<g
   id="g2063">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2159.5"
   y1="1073.2"
   x2="2133.5"
   y2="1354.1"
   id="line2060" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2165.5"
   y1="1073.8"
   x2="2139.5"
   y2="1354.7"
   id="line2061" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2171.4"
   y1="1074.1"
   x2="2145.4"
   y2="1355.1"
   id="line2062" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2177.4"
   y1="1074.7"
   x2="2151.4"
   y2="1355.7"
   id="line2063" />
									</g>
									<g
   id="g2067">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2177.8"
   y1="1074.9"
   x2="2151.8"
   y2="1355.8"
   id="line2064" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2183.8"
   y1="1075.5"
   x2="2157.8"
   y2="1356.4"
   id="line2065" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2189.7"
   y1="1075.8"
   x2="2163.6"
   y2="1356.8"
   id="line2066" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2195.7"
   y1="1076.4"
   x2="2169.7"
   y2="1357.4"
   id="line2067" />
									</g>
									<g
   id="g2071">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2196"
   y1="1076.5"
   x2="2170"
   y2="1357.5"
   id="line2068" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2202.1"
   y1="1077.1"
   x2="2176"
   y2="1358.1"
   id="line2069" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2207.9"
   y1="1077.5"
   x2="2181.9"
   y2="1358.5"
   id="line2070" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2213.9"
   y1="1078.1"
   x2="2187.9"
   y2="1359.1"
   id="line2071" />
									</g>
									<g
   id="g2075">
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2214.3"
   y1="1078.2"
   x2="2188.3"
   y2="1359.2"
   id="line2072" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2220.3"
   y1="1078.8"
   x2="2194.3"
   y2="1359.8"
   id="line2073" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2226.2"
   y1="1079.2"
   x2="2200.1"
   y2="1360.1"
   id="line2074" />
										
											<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="2232.2"
   y1="1079.8"
   x2="2206.2"
   y2="1360.7"
   id="line2075" />
									</g>
								</g>
							</g>
						</g>
					</g>
				</g>
				<g
   id="Stitch_Sleve">
					<g
   id="g2312">
						<g
   id="g2311">
							<g
   id="g2310">
								<g
   id="g2080">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1878.1,235.4c-1,0.3-1.9,0.5-2.9,0.8           c0.2,1,0.4,2,0.5,3c1-0.3,1.9-0.5,2.9-0.8C1878.5,237.4,1878.3,236.4,1878.1,235.4z"
   id="path2079" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1875.9,239c-0.9,0.3-1.9,0.5-2.8,0.8           c0.2,1,0.3,2,0.4,2.9c0.9-0.3,1.9-0.6,2.8-0.8C1876.2,241,1876.1,240,1875.9,239z"
   id="path2080" />
								</g>
								<g
   id="g2082">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1881.9,237.9c-1,0.2-1.9,0.4-2.9,0.6           c0.1,1,0.3,2,0.4,3c1-0.2,2-0.5,2.9-0.7C1882.2,239.9,1882.1,238.9,1881.9,237.9z"
   id="path2081" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1879.5,241.4c-0.9,0.2-1.9,0.4-2.8,0.7           c0.1,1,0.2,2,0.3,3c1-0.3,1.9-0.5,2.9-0.7C1879.8,243.4,1879.6,242.4,1879.5,241.4z"
   id="path2082" />
								</g>
								<g
   id="g2084">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1885.6,240.5c-1,0.2-1.9,0.3-2.9,0.5           c0.1,1,0.2,2,0.2,3l3-0.6C1885.8,242.5,1885.7,241.5,1885.6,240.5z"
   id="path2083" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1883,243.9c-0.9,0.2-1.9,0.4-2.8,0.6           c0.1,1,0.1,2,0.2,3c1-0.2,1.9-0.4,2.9-0.6L1883,243.9z"
   id="path2084" />
								</g>
								<g
   id="g2085">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1889.1,243.2 1886.2,243.6            1886.3,246.7 1889.3,246.2          "
   id="polygon2084" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1886.5,246.5 1883.6,247            1883.7,250 1886.6,249.5          "
   id="polygon2085" />
								</g>
								<g
   id="g2087">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1892.5,245.9 1889.6,246.3            1889.7,249.4 1892.7,248.9          "
   id="polygon2086" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1889.8,249.2 1887,249.7            1887,252.7 1890,252.2          "
   id="polygon2087" />
								</g>
								<g
   id="g2089">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1895.9,248.7 1893,249.1            1893,252.1 1896,251.7          "
   id="polygon2088" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1893.2,252 1890.3,252.4            1890.3,255.4 1893.3,255          "
   id="polygon2089" />
								</g>
								<g
   id="g2091">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1899.2,251.5 1896.3,251.9            1896.4,254.9 1899.3,254.5          "
   id="polygon2090" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1896.5,254.8 1893.6,255.2            1893.6,258.2 1896.6,257.8          "
   id="polygon2091" />
								</g>
								<g
   id="g2093">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1902.5,254.3 1899.6,254.6            1899.7,257.7 1902.6,257.3          "
   id="polygon2092" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1899.8,257.5 1896.9,257.9            1896.9,261 1899.9,260.5          "
   id="polygon2093" />
								</g>
								<g
   id="g2095">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1905.8,257 1903,257.4            1903,260.4 1906,260          "
   id="polygon2094" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1903.1,260.3 1900.2,260.7            1900.3,263.7 1903.3,263.3          "
   id="polygon2095" />
								</g>
								<g
   id="g2097">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1909.1,259.7 1906.3,260.1            1906.3,263.2 1909.3,262.7          "
   id="polygon2096" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1906.5,263 1903.6,263.5            1903.7,266.5 1906.6,266          "
   id="polygon2097" />
								</g>
								<g
   id="g2099">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1912.5,262.4 1909.6,262.9            1909.7,265.9 1912.7,265.4          "
   id="polygon2098" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1909.8,265.7 1907,266.2            1907.1,269.2 1910,268.7          "
   id="polygon2099" />
								</g>
								<g
   id="g2100">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1915.9,265.2l-2.9,0.4l0,3l3-0.4           C1916,267.2,1916,266.2,1915.9,265.2z"
   id="path2099" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1913.2,268.5l-2.9,0.4l0,3           c1-0.1,2-0.3,3-0.4L1913.2,268.5z"
   id="path2100" />
								</g>
								<g
   id="g2101">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1919.2,268.1 1916.3,268.4            1916.3,271.4 1919.3,271.1          "
   id="polygon2100" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1916.4,271.3 1913.6,271.7            1913.5,274.7 1916.5,274.3          "
   id="polygon2101" />
								</g>
								<g
   id="g2103">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1922.5,271 1919.6,271.3            1919.6,274.3 1922.6,274          "
   id="polygon2102" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1919.7,274.2 1916.8,274.5            1916.7,277.5 1919.7,277.2          "
   id="polygon2103" />
								</g>
								<g
   id="g2105">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1925.8,273.9 1922.9,274.2            1922.8,277.2 1925.8,276.9          "
   id="polygon2104" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1922.9,277.1 1920,277.3            1919.9,280.4 1922.9,280.1          "
   id="polygon2105" />
								</g>
								<g
   id="g2107">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1929,276.8 1926.1,277.1            1926,280.1 1929,279.8          "
   id="polygon2106" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1926.1,280 1923.2,280.2            1923.1,283.2 1926.1,283          "
   id="polygon2107" />
								</g>
								<g
   id="g2109">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1932.2,279.8 1929.3,280            1929.2,283 1932.1,282.8          "
   id="polygon2108" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1929.3,282.9 1926.4,283.1            1926.2,286.2 1929.2,285.9          "
   id="polygon2109" />
								</g>
								<g
   id="g2111">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1935.4,282.8 1932.4,283            1932.3,286 1935.3,285.8          "
   id="polygon2110" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1932.4,285.9 1929.5,286.1            1929.4,289.1 1932.4,288.9          "
   id="polygon2111" />
								</g>
								<g
   id="g2113">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1938.5,285.8 1935.6,285.9            1935.4,289 1938.4,288.8          "
   id="polygon2112" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1935.6,288.8 1932.7,289            1932.5,292 1935.5,291.8          "
   id="polygon2113" />
								</g>
								<g
   id="g2115">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1941.6,288.8 1938.7,288.9            1938.5,292 1941.5,291.8          "
   id="polygon2114" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1938.7,291.8 1935.8,292            1935.6,295 1938.6,294.8          "
   id="polygon2115" />
								</g>
								<g
   id="g2117">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1944.8,291.8 1941.8,292            1941.6,295 1944.6,294.8          "
   id="polygon2116" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1941.8,294.9 1938.9,295            1938.6,298 1941.6,297.9          "
   id="polygon2117" />
								</g>
								<g
   id="g2119">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1947.8,294.9 1944.9,295            1944.7,298 1947.7,297.9          "
   id="polygon2118" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1944.8,297.9 1941.9,298            1941.7,301 1944.6,300.9          "
   id="polygon2119" />
								</g>
								<g
   id="g2121">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1950.9,298 1948,298.1            1947.7,301.1 1950.7,301.1          "
   id="polygon2120" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1947.8,301 1944.9,301.1            1944.6,304.1 1947.6,304          "
   id="polygon2121" />
								</g>
								<g
   id="g2123">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1953.9,301.2 1951,301.2            1950.7,304.3 1953.7,304.2          "
   id="polygon2122" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1950.8,304.1 1947.9,304.2            1947.6,307.2 1950.5,307.1          "
   id="polygon2123" />
								</g>
								<g
   id="g2124">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1956.9,304.5c-1,0-2,0-2.9,0l-0.4,3           l3,0L1956.9,304.5z"
   id="path2123" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1953.7,307.3l-2.9,0           c-0.1,1-0.2,2-0.4,3l3,0L1953.7,307.3z"
   id="path2124" />
								</g>
								<g
   id="g2126">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1959.9,307.8c-1-0.1-2-0.1-3-0.2           c-0.1,1-0.3,2-0.4,3c1,0,2,0.1,3,0.2C1959.6,309.9,1959.8,308.9,1959.9,307.8z"
   id="path2125" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1956.6,310.6c-1,0-1.9-0.1-2.9-0.1           c-0.1,1-0.3,2-0.5,2.9c1,0,1.9,0,2.9,0.1C1956.3,312.5,1956.5,311.6,1956.6,310.6z"
   id="path2126" />
								</g>
								<g
   id="g2128">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1962.7,311.4l-2.9-0.3           c-0.2,1-0.4,2-0.6,3l3,0.3C1962.3,313.4,1962.5,312.4,1962.7,311.4z"
   id="path2127" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1959.3,314c-1-0.1-1.9-0.2-2.9-0.2           l-0.7,2.9c1,0.1,2,0.2,3,0.3L1959.3,314z"
   id="path2128" />
								</g>
								<g
   id="g2129">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1965.3,314.9 1962.4,314.6            1961.7,317.5 1964.7,317.9          "
   id="polygon2128" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1961.8,317.5 1959,317.1            1958.2,320.1 1961.2,320.4          "
   id="polygon2129" />
								</g>
								<g
   id="g2131">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1967.8,318.5 1964.9,318.1            1964.2,321.1 1967.2,321.4          "
   id="polygon2130" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1964.4,321 1961.5,320.6            1960.7,323.5 1963.7,323.9          "
   id="polygon2131" />
								</g>
								<g
   id="g2133">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1970.3,322.1 1967.4,321.7            1966.7,324.6 1969.6,325          "
   id="polygon2132" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1966.8,324.5 1963.9,324.1            1963.2,327 1966.1,327.4          "
   id="polygon2133" />
								</g>
								<g
   id="g2135">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1972.8,325.7 1969.9,325.3            1969.1,328.2 1972.1,328.6          "
   id="polygon2134" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1969.3,328.1 1966.4,327.7            1965.6,330.6 1968.5,331          "
   id="polygon2135" />
								</g>
								<g
   id="g2137">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1975.2,329.3 1972.3,328.9            1971.5,331.8 1974.5,332.2          "
   id="polygon2136" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1971.7,331.7 1968.8,331.2            1968,334.1 1970.9,334.6          "
   id="polygon2137" />
								</g>
								<g
   id="g2139">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1977.6,332.9 1974.7,332.5            1973.9,335.4 1976.9,335.8          "
   id="polygon2138" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1974.1,335.3 1971.2,334.8            1970.3,337.7 1973.3,338.2          "
   id="polygon2139" />
								</g>
								<g
   id="g2141">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1980,336.6 1977.1,336.1            1976.3,339 1979.2,339.5          "
   id="polygon2140" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1976.4,338.9 1973.6,338.4            1972.7,341.3 1975.7,341.8          "
   id="polygon2141" />
								</g>
								<g
   id="g2143">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1982.4,340.2 1979.5,339.7            1978.6,342.6 1981.6,343.1          "
   id="polygon2142" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1978.8,342.5 1975.9,342            1975,344.9 1978,345.4          "
   id="polygon2143" />
								</g>
								<g
   id="g2145">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1984.7,343.8 1981.8,343.3            1981,346.2 1983.9,346.7          "
   id="polygon2144" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1981.1,346.2 1978.2,345.7            1977.4,348.5 1980.3,349          "
   id="polygon2145" />
								</g>
								<g
   id="g2147">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1987,347.5 1984.2,347            1983.3,349.9 1986.2,350.4          "
   id="polygon2146" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1983.4,349.8 1980.6,349.3            1979.7,352.2 1982.6,352.7          "
   id="polygon2147" />
								</g>
								<g
   id="g2149">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1989.4,351.2 1986.5,350.6            1985.6,353.5 1988.6,354.1          "
   id="polygon2148" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1985.8,353.5 1982.9,352.9            1982,355.8 1984.9,356.3          "
   id="polygon2149" />
								</g>
								<g
   id="g2151">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1991.7,354.8 1988.8,354.3            1987.9,357.2 1990.9,357.7          "
   id="polygon2150" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1988.1,357.1 1985.2,356.6            1984.3,359.5 1987.2,360          "
   id="polygon2151" />
								</g>
								<g
   id="g2153">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994,358.5 1991.1,358            1990.2,360.9 1993.1,361.4          "
   id="polygon2152" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1990.3,360.8 1987.5,360.2            1986.6,363.1 1989.5,363.7          "
   id="polygon2153" />
								</g>
								<g
   id="g2155">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1996.2,362.2 1993.4,361.7            1992.5,364.5 1995.4,365.1          "
   id="polygon2154" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1992.6,364.5 1989.7,363.9            1988.8,366.8 1991.7,367.3          "
   id="polygon2155" />
								</g>
								<g
   id="g2157">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1998.5,366 1995.6,365.4            1994.7,368.2 1997.6,368.8          "
   id="polygon2156" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1994.8,368.2 1992,367.6            1991,370.5 1994,371          "
   id="polygon2157" />
								</g>
								<g
   id="g2159">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2000.7,369.7 1997.9,369.1            1996.9,372 1999.8,372.6          "
   id="polygon2158" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1997.1,371.9 1994.2,371.3            1993.2,374.1 1996.2,374.7          "
   id="polygon2159" />
								</g>
								<g
   id="g2161">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2002.9,373.4 2000.1,372.8            1999.1,375.7 2002,376.3          "
   id="polygon2160" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1999.3,375.6 1996.4,375            1995.4,377.8 1998.4,378.5          "
   id="polygon2161" />
								</g>
								<g
   id="g2163">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2005.1,377.2 2002.3,376.5            2001.3,379.4 2004.2,380          "
   id="polygon2162" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2001.4,379.3 1998.6,378.7            1997.6,381.6 2000.5,382.2          "
   id="polygon2163" />
								</g>
								<g
   id="g2165">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2007.3,381 2004.5,380.3            2003.4,383.2 2006.4,383.8          "
   id="polygon2164" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2003.6,383.1 2000.8,382.4            1999.7,385.3 2002.7,385.9          "
   id="polygon2165" />
								</g>
								<g
   id="g2167">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2009.4,384.7 2006.6,384.1            2005.6,386.9 2008.5,387.6          "
   id="polygon2166" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2005.7,386.8 2002.9,386.2            2001.9,389 2004.8,389.7          "
   id="polygon2167" />
								</g>
								<g
   id="g2169">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2011.6,388.5 2008.7,387.8            2007.7,390.7 2010.6,391.4          "
   id="polygon2168" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2007.8,390.6 2005,389.9            2004,392.8 2006.9,393.4          "
   id="polygon2169" />
								</g>
								<g
   id="g2171">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2013.7,392.4 2010.8,391.6            2009.8,394.5 2012.7,395.2          "
   id="polygon2170" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2009.9,394.4 2007.1,393.7            2006,396.5 2008.9,397.2          "
   id="polygon2171" />
								</g>
								<g
   id="g2173">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2015.7,396.2 2012.9,395.5            2011.8,398.3 2014.7,399          "
   id="polygon2172" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2012,398.2 2009.2,397.5            2008,400.3 2011,401          "
   id="polygon2173" />
								</g>
								<g
   id="g2175">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2017.8,400 2015,399.3            2013.8,402.1 2016.7,402.9          "
   id="polygon2174" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2014,402 2011.2,401.3            2010.1,404.1 2013,404.8          "
   id="polygon2175" />
								</g>
								<g
   id="g2177">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2019.8,403.9 2017,403.1            2015.8,405.9 2018.7,406.7          "
   id="polygon2176" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2016,405.9 2013.2,405.1            2012,407.9 2014.9,408.7          "
   id="polygon2177" />
								</g>
								<g
   id="g2179">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021.8,407.8 2019,407            2017.8,409.8 2020.7,410.6          "
   id="polygon2178" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2017.9,409.7 2015.1,408.9            2014,411.7 2016.9,412.5          "
   id="polygon2179" />
								</g>
								<g
   id="g2181">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2023.7,411.7 2020.9,410.9            2019.7,413.6 2022.6,414.5          "
   id="polygon2180" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2019.9,413.6 2017.1,412.8            2015.9,415.5 2018.8,416.4          "
   id="polygon2181" />
								</g>
								<g
   id="g2183">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.6,415.6 2022.8,414.8            2021.6,417.5 2024.5,418.4          "
   id="polygon2182" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2021.8,417.5 2019,416.6            2017.8,419.4 2020.6,420.2          "
   id="polygon2183" />
								</g>
								<g
   id="g2185">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2027.5,419.6 2024.7,418.7            2023.5,421.4 2026.3,422.3          "
   id="polygon2184" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2023.6,421.4 2020.8,420.5            2019.6,423.3 2022.4,424.1          "
   id="polygon2185" />
								</g>
								<g
   id="g2187">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029.3,423.5 2026.5,422.6            2025.3,425.4 2028.1,426.3          "
   id="polygon2186" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2025.4,425.3 2022.7,424.4            2021.4,427.1 2024.2,428          "
   id="polygon2187" />
								</g>
								<g
   id="g2189">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2031.1,427.5 2028.3,426.6            2027,429.3 2029.9,430.2          "
   id="polygon2188" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2027.2,429.2 2024.4,428.3            2023.1,431 2026,432          "
   id="polygon2189" />
								</g>
								<g
   id="g2191">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2032.9,431.4 2030.1,430.5            2028.8,433.2 2031.7,434.2          "
   id="polygon2190" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2029,433.2 2026.2,432.3            2024.9,435 2027.8,435.9          "
   id="polygon2191" />
								</g>
								<g
   id="g2193">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2034.6,435.4 2031.9,434.5            2030.6,437.2 2033.4,438.1          "
   id="polygon2192" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2030.7,437.1 2028,436.2            2026.7,439 2029.5,439.9          "
   id="polygon2193" />
								</g>
								<g
   id="g2195">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2036.4,439.3 2033.6,438.4            2032.4,441.1 2035.2,442.1          "
   id="polygon2194" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2032.5,441.1 2029.7,440.2            2028.5,442.9 2031.3,443.8          "
   id="polygon2195" />
								</g>
								<g
   id="g2197">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2038.2,443.2 2035.4,442.3            2034.1,445.1 2037,446          "
   id="polygon2196" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2034.3,445 2031.5,444.1            2030.2,446.8 2033.1,447.8          "
   id="polygon2197" />
								</g>
								<g
   id="g2199">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2040,447.2 2037.2,446.3            2035.9,449 2038.7,450          "
   id="polygon2198" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2036.1,449 2033.3,448            2032,450.8 2034.8,451.7          "
   id="polygon2199" />
								</g>
								<g
   id="g2201">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2041.7,451.2 2039,450.2            2037.7,453 2040.5,453.9          "
   id="polygon2200" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2037.8,452.9 2035.1,452            2033.7,454.7 2036.6,455.6          "
   id="polygon2201" />
								</g>
								<g
   id="g2203">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2043.5,455.1 2040.7,454.2            2039.4,456.9 2042.2,457.9          "
   id="polygon2202" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2039.5,456.9 2036.8,455.9            2035.5,458.6 2038.3,459.6          "
   id="polygon2203" />
								</g>
								<g
   id="g2205">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2045.2,459.1 2042.4,458.2            2041.1,460.9 2043.9,461.9          "
   id="polygon2204" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2041.3,460.8 2038.5,459.9            2037.2,462.6 2040,463.5          "
   id="polygon2205" />
								</g>
								<g
   id="g2207">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.9,463.1 2044.1,462.2            2042.8,464.9 2045.6,465.9          "
   id="polygon2206" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.9,464.8 2040.2,463.8            2038.9,466.5 2041.7,467.5          "
   id="polygon2207" />
								</g>
								<g
   id="g2209">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048.6,467.2 2045.8,466.2            2044.4,468.9 2047.3,469.9          "
   id="polygon2208" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2044.6,468.8 2041.9,467.8            2040.5,470.5 2043.3,471.5          "
   id="polygon2209" />
								</g>
								<g
   id="g2211">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050.2,471.2 2047.5,470.2            2046.1,472.9 2048.9,473.9          "
   id="polygon2210" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.2,472.8 2043.5,471.8            2042.1,474.5 2044.9,475.5          "
   id="polygon2211" />
								</g>
								<g
   id="g2213">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.8,475.3 2049.1,474.2            2047.7,476.9 2050.5,478          "
   id="polygon2212" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2047.8,476.8 2045.1,475.8            2043.7,478.4 2046.5,479.5          "
   id="polygon2213" />
								</g>
								<g
   id="g2215">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.4,479.3 2050.7,478.2            2049.2,480.9 2052,482          "
   id="polygon2214" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2049.4,480.9 2046.7,479.8            2045.2,482.4 2048,483.5          "
   id="polygon2215" />
								</g>
								<g
   id="g2217">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054.9,483.4 2052.2,482.3            2050.7,485 2053.5,486.1          "
   id="polygon2216" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050.9,484.9 2048.2,483.8            2046.7,486.4 2049.5,487.6          "
   id="polygon2217" />
								</g>
								<g
   id="g2219">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.4,487.5 2053.7,486.4            2052.2,489 2055,490.2          "
   id="polygon2218" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2052.4,489 2049.7,487.9            2048.2,490.5 2051,491.6          "
   id="polygon2219" />
								</g>
								<g
   id="g2221">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.8,491.6 2055.2,490.5            2053.7,493.1 2056.4,494.3          "
   id="polygon2220" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.8,493 2051.1,491.9            2049.6,494.5 2052.4,495.7          "
   id="polygon2221" />
								</g>
								<g
   id="g2223">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.3,495.8 2056.6,494.6            2055,497.2 2057.8,498.4          "
   id="polygon2222" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.2,497.1 2052.6,496            2051,498.5 2053.7,499.7          "
   id="polygon2223" />
								</g>
								<g
   id="g2225">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2060.6,499.9 2058,498.7            2056.4,501.3 2059.1,502.5          "
   id="polygon2224" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.6,501.2 2053.9,500            2052.3,502.6 2055.1,503.8          "
   id="polygon2225" />
								</g>
								<g
   id="g2226">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2062,504.1l-2.6-1.2l-1.6,2.6           c0.3,0.1,0.6,0.3,0.9,0.5c0.3,0.2,0.5,0.5,0.8,0.7l0.8,0.7l0.7-0.7c0.2-0.3,0.5-0.8,0.7-1.2           C2061.7,505,2061.8,504.5,2062,504.1z"
   id="path2225" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M2057.9,505.4l-2.6-1.2l-1.6,2.5           c0.2,0,0.5-0.1,0.7-0.1c0.3,0,0.5,0,0.8,0.1l0.8,0.7l0.7-0.7c0.2-0.2,0.5-0.4,0.7-0.6           C2057.6,505.9,2057.7,505.6,2057.9,505.4z"
   id="path2226" />
								</g>
								<g
   id="g2227">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.4,509.6 2060.3,507.6            2058,509.7 2060.3,511.6          "
   id="polygon2226" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.2,509.7 2056,507.8            2053.7,509.8 2056,511.7          "
   id="polygon2227" />
								</g>
								<g
   id="g2229">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.5,513.9 2060.4,512            2058.1,514 2060.3,516          "
   id="polygon2228" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.2,514 2056.1,512.1            2053.8,514 2056,516          "
   id="polygon2229" />
								</g>
								<g
   id="g2231">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.5,518.3 2060.4,516.3            2058.1,518.3 2060.3,520.3          "
   id="polygon2230" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.3,518.3 2056.1,516.4            2053.8,518.3 2056,520.3          "
   id="polygon2231" />
								</g>
								<g
   id="g2233">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.5,522.7 2060.4,520.7            2058.1,522.6 2060.3,524.7          "
   id="polygon2232" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.2,522.6 2056.1,520.7            2053.8,522.6 2056,524.6          "
   id="polygon2233" />
								</g>
								<g
   id="g2235">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.4,527 2060.3,525            2058,526.9 2060.2,529          "
   id="polygon2234" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.2,527 2056.1,525            2053.7,526.9 2055.9,528.9          "
   id="polygon2235" />
								</g>
								<g
   id="g2237">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.3,531.4 2060.2,529.4            2057.9,531.3 2060,533.4          "
   id="polygon2236" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058,531.3 2056,529.3            2053.6,531.1 2055.8,533.2          "
   id="polygon2237" />
								</g>
								<g
   id="g2239">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2062.2,535.8 2060.1,533.7            2057.7,535.6 2059.8,537.7          "
   id="polygon2238" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.9,535.6 2055.8,533.6            2053.5,535.4 2055.6,537.5          "
   id="polygon2239" />
								</g>
								<g
   id="g2241">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2061.9,540.1 2059.9,538.1            2057.5,539.9 2059.6,542          "
   id="polygon2240" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.7,539.9 2055.6,537.9            2053.2,539.7 2055.3,541.8          "
   id="polygon2241" />
								</g>
								<g
   id="g2243">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2061.7,544.5 2059.7,542.4            2057.3,544.2 2059.3,546.4          "
   id="polygon2242" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.4,544.2 2055.4,542.1            2053,543.9 2055.1,546.1          "
   id="polygon2243" />
								</g>
								<g
   id="g2245">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2061.4,548.9 2059.4,546.7            2057,548.5 2059,550.7          "
   id="polygon2244" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.1,548.5 2055.1,546.4            2052.7,548.2 2054.7,550.4          "
   id="polygon2245" />
								</g>
								<g
   id="g2247">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2061,553.2 2059.1,551.1            2056.6,552.8 2058.6,555          "
   id="polygon2246" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.8,552.9 2054.8,550.7            2052.3,552.5 2054.4,554.7          "
   id="polygon2247" />
								</g>
								<g
   id="g2249">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2060.6,557.6 2058.7,555.4            2056.2,557.1 2058.2,559.4          "
   id="polygon2248" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.4,557.2 2054.4,555            2051.9,556.7 2054,558.9          "
   id="polygon2249" />
								</g>
								<g
   id="g2251">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2060.2,561.9 2058.2,559.7            2055.7,561.4 2057.7,563.7          "
   id="polygon2250" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.9,561.5 2054,559.3            2051.5,561 2053.5,563.2          "
   id="polygon2251" />
								</g>
								<g
   id="g2253">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.7,566.3 2057.8,564            2055.3,565.7 2057.2,568          "
   id="polygon2252" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.4,565.8 2053.5,563.6            2051,565.2 2053,567.5          "
   id="polygon2253" />
								</g>
								<g
   id="g2255">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2059.1,570.6 2057.2,568.4            2054.7,570 2056.6,572.3          "
   id="polygon2254" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054.9,570 2053,567.8            2050.5,569.5 2052.4,571.7          "
   id="polygon2255" />
								</g>
								<g
   id="g2257">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2058.5,574.9 2056.7,572.7            2054.1,574.3 2056.1,576.6          "
   id="polygon2256" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054.3,574.3 2052.4,572.1            2049.9,573.7 2051.8,576          "
   id="polygon2257" />
								</g>
								<g
   id="g2259">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.9,579.2 2056.1,577            2053.5,578.6 2055.4,580.9          "
   id="polygon2258" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.7,578.6 2051.9,576.4            2049.3,578 2051.2,580.3          "
   id="polygon2259" />
								</g>
								<g
   id="g2261">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2057.3,583.5 2055.5,581.2            2052.9,582.9 2054.8,585.2          "
   id="polygon2260" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.1,582.9 2051.2,580.6            2048.7,582.2 2050.6,584.5          "
   id="polygon2261" />
								</g>
								<g
   id="g2263">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056.7,587.8 2054.8,585.5            2052.3,587.1 2054.2,589.5          "
   id="polygon2262" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2052.4,587.2 2050.6,584.9            2048,586.5 2049.9,588.8          "
   id="polygon2263" />
								</g>
								<g
   id="g2265">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2056,592.1 2054.2,589.8            2051.6,591.4 2053.5,593.7          "
   id="polygon2264" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.8,591.4 2050,589.2            2047.4,590.8 2049.3,593.1          "
   id="polygon2265" />
								</g>
								<g
   id="g2267">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2055.3,596.4 2053.5,594.1            2051,595.7 2052.8,598          "
   id="polygon2266" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.1,595.7 2049.3,593.4            2046.7,595 2048.6,597.4          "
   id="polygon2267" />
								</g>
								<g
   id="g2269">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054.7,600.6 2052.9,598.4            2050.3,599.9 2052.2,602.3          "
   id="polygon2268" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050.5,600 2048.6,597.7            2046.1,599.3 2048,601.6          "
   id="polygon2269" />
								</g>
								<g
   id="g2271">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2054,604.9 2052.2,602.6            2049.6,604.2 2051.5,606.5          "
   id="polygon2270" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2049.8,604.2 2048,602            2045.4,603.6 2047.3,605.9          "
   id="polygon2271" />
								</g>
								<g
   id="g2273">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2053.3,609.2 2051.5,606.9            2048.9,608.5 2050.8,610.8          "
   id="polygon2272" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2049.1,608.5 2047.3,606.2            2044.7,607.8 2046.6,610.2          "
   id="polygon2273" />
								</g>
								<g
   id="g2275">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2052.7,613.4 2050.9,611.2            2048.3,612.7 2050.2,615.1          "
   id="polygon2274" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048.4,612.8 2046.6,610.5            2044.1,612.1 2045.9,614.4          "
   id="polygon2275" />
								</g>
								<g
   id="g2277">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2052,617.7 2050.2,615.4            2047.6,617 2049.5,619.4          "
   id="polygon2276" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2047.8,617 2046,614.8            2043.4,616.4 2045.3,618.7          "
   id="polygon2277" />
								</g>
								<g
   id="g2279">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2051.3,622 2049.5,619.7            2046.9,621.3 2048.8,623.6          "
   id="polygon2278" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2047.1,621.3 2045.3,619            2042.7,620.6 2044.6,623          "
   id="polygon2279" />
								</g>
								<g
   id="g2281">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050.6,626.2 2048.8,624            2046.2,625.6 2048.1,627.9          "
   id="polygon2280" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.4,625.6 2044.6,623.3            2042,624.9 2043.9,627.2          "
   id="polygon2281" />
								</g>
								<g
   id="g2283">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2050,630.5 2048.1,628.2            2045.6,629.8 2047.5,632.1          "
   id="polygon2282" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2045.7,629.9 2043.9,627.6            2041.3,629.2 2043.2,631.5          "
   id="polygon2283" />
								</g>
								<g
   id="g2285">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2049.3,634.7 2047.5,632.5            2044.9,634.1 2046.8,636.4          "
   id="polygon2284" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2045.1,634.1 2043.3,631.9            2040.7,633.5 2042.6,635.8          "
   id="polygon2285" />
								</g>
								<g
   id="g2287">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048.7,639 2046.9,636.8            2044.3,638.4 2046.3,640.7          "
   id="polygon2286" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2044.5,638.4 2042.6,636.2            2040.1,637.8 2042,640.1          "
   id="polygon2287" />
								</g>
								<g
   id="g2289">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2048.2,643.2 2046.3,641            2043.8,642.7 2045.7,644.9          "
   id="polygon2288" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2043.9,642.7 2042,640.5            2039.5,642.1 2041.5,644.4          "
   id="polygon2289" />
								</g>
								<g
   id="g2291">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2047.7,647.4 2045.8,645.3            2043.3,647 2045.3,649.2          "
   id="polygon2290" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2043.4,647 2041.5,644.8            2039,646.5 2041,648.8          "
   id="polygon2291" />
								</g>
								<g
   id="g2293">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2047.3,651.7 2045.3,649.5            2042.8,651.3 2044.9,653.5          "
   id="polygon2292" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2043,651.3 2041.1,649.1            2038.6,650.9 2040.6,653.1          "
   id="polygon2293" />
								</g>
								<g
   id="g2295">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.9,655.9 2044.9,653.8            2042.5,655.6 2044.6,657.7          "
   id="polygon2294" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.6,655.6 2040.7,653.5            2038.2,655.3 2040.3,657.5          "
   id="polygon2295" />
								</g>
								<g
   id="g2297">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.6,660.1 2044.6,658.1            2042.2,659.9 2044.3,662          "
   id="polygon2296" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.4,659.9 2040.4,657.8            2037.9,659.6 2040,661.8          "
   id="polygon2297" />
								</g>
								<g
   id="g2299">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.4,664.4 2044.4,662.3            2042,664.2 2044.1,666.3          "
   id="polygon2298" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042.2,664.2 2040.1,662.2            2037.7,664 2039.9,666.2          "
   id="polygon2299" />
								</g>
								<g
   id="g2301">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.3,668.6 2044.2,666.6            2041.8,668.5 2044,670.6          "
   id="polygon2300" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042,668.5 2039.9,666.5            2037.6,668.4 2039.7,670.5          "
   id="polygon2301" />
								</g>
								<g
   id="g2303">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.2,672.9 2044.1,670.9            2041.8,672.8 2044,674.9          "
   id="polygon2302" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2041.9,672.9 2039.8,670.8            2037.5,672.8 2039.7,674.9          "
   id="polygon2303" />
								</g>
								<g
   id="g2305">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.2,677.2 2044,675.2            2041.7,677.2 2043.9,679.2          "
   id="polygon2304" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2041.9,677.2 2039.8,675.2            2037.5,677.2 2039.7,679.2          "
   id="polygon2305" />
								</g>
								<g
   id="g2307">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.2,681.4 2044,679.5            2041.8,681.5 2044,683.5          "
   id="polygon2306" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2041.9,681.5 2039.8,679.5            2037.5,681.6 2039.7,683.6          "
   id="polygon2307" />
								</g>
								<g
   id="g2309">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2046.3,685.7 2044.1,683.8            2041.8,685.8 2044.1,687.7          "
   id="polygon2308" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="2042,685.8 2039.8,683.9            2037.6,685.9 2039.9,687.9          "
   id="polygon2309" />
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
			<g
   id="Left_Sleeve_00000158734141438885585410000007970709413829431947_">
				<path
   id="Cuff_Fill"
   ref={sleevesDrop}
   className="st3-sleeves" 
   fill={getFillValue('sleeves')} 
   style={{
	 ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
	 cursor: sleevesUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
	stroke="#231F20"
   stroke-width="2.0356"
   stroke-miterlimit="10"
   d="M1427.2,1151.7      c0.8,3.1-1.7,4.9-4,16.4c-0.3,1.4-1.3,6.5-2,16.4c-0.9,12.6-0.5,23,0,34.8c0.5,11.3,1.2,24,2,37.9c-6.1,1.9-12.5,3.6-19.2,5.1      c-33.7,7.7-64.6,7.8-90.1,5.1c-0.1-6-0.3-14.8-1-25.6c-1-16-1.8-28.9-5.1-45c-1.5-7.2-3.9-17.5-8.1-29.7      c27.9-17,52.6-22.6,68.8-24.6C1393.9,1139.4,1424.6,1141.7,1427.2,1151.7z" />
				<g
   id="Rib_Cuffs">
					<defs
   id="defs2312">
						<path
   id="SVGID_00000060013513886942014040000017650493178640980373_"
   d="M1427.3,1151.7c0.8,3.1-1.7,4.9-4,16.4        c-0.3,1.4-1.3,6.5-2,16.4c-0.9,12.6-0.5,23,0,34.8c0.5,11.3,1.2,24,2,37.9c-6.1,1.9-12.5,3.6-19.2,5.1        c-33.7,7.7-64.6,7.8-90.1,5.1c-0.1-6-0.3-14.8-1-25.6c-1-16-1.8-28.9-5.1-45c-1.5-7.2-3.9-17.5-8.1-29.7        c27.9-17,52.6-22.6,68.8-24.6C1394,1139.3,1424.7,1141.6,1427.3,1151.7z" />
					</defs>
					<clipPath
   id="SVGID_00000163066647041326611470000008651494315711970948_">
						<use
   xlinkHref="#SVGID_00000060013513886942014040000017650493178640980373_"
   overflow="visible"
   id="use2312" />
					</clipPath>
					<g
   clip-path="url(#SVGID_00000163066647041326611470000008651494315711970948_)"
   id="g2351">
						<line
   fill="#FFFFFF"
   x1="1433.7"
   y1="1205.1"
   x2="1269.4"
   y2="1220.3"
   id="line2312" />
						<g
   id="g2350">
							<g
   id="g2349">
								<g
   id="g2316">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1446.5"
   y1="1345.6"
   x2="1420.5"
   y2="1064.6"
   id="line2313" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1440.5"
   y1="1346.1"
   x2="1414.5"
   y2="1065.1"
   id="line2314" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1434.7"
   y1="1346.8"
   x2="1408.6"
   y2="1065.8"
   id="line2315" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1428.6"
   y1="1347.3"
   x2="1402.6"
   y2="1066.4"
   id="line2316" />
								</g>
								<g
   id="g2320">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1428.2"
   y1="1347.2"
   x2="1402.2"
   y2="1066.3"
   id="line2317" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1422.2"
   y1="1347.8"
   x2="1396.2"
   y2="1066.8"
   id="line2318" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1416.4"
   y1="1348.5"
   x2="1390.4"
   y2="1067.5"
   id="line2319" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1410.4"
   y1="1349"
   x2="1384.3"
   y2="1068.1"
   id="line2320" />
								</g>
								<g
   id="g2324">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1410"
   y1="1348.9"
   x2="1384"
   y2="1068"
   id="line2321" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1404"
   y1="1349.5"
   x2="1377.9"
   y2="1068.5"
   id="line2322" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1398.1"
   y1="1350.2"
   x2="1372.1"
   y2="1069.2"
   id="line2323" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1392.1"
   y1="1350.7"
   x2="1366.1"
   y2="1069.7"
   id="line2324" />
								</g>
								<g
   id="g2328">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1391.7"
   y1="1350.6"
   x2="1365.7"
   y2="1069.7"
   id="line2325" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1385.7"
   y1="1351.1"
   x2="1359.7"
   y2="1070.2"
   id="line2326" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1379.9"
   y1="1351.9"
   x2="1353.9"
   y2="1070.9"
   id="line2327" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1373.9"
   y1="1352.4"
   x2="1347.8"
   y2="1071.4"
   id="line2328" />
								</g>
								<g
   id="g2332">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1373.5"
   y1="1352.3"
   x2="1347.5"
   y2="1071.4"
   id="line2329" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1367.5"
   y1="1352.8"
   x2="1341.4"
   y2="1071.9"
   id="line2330" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1361.6"
   y1="1353.6"
   x2="1335.6"
   y2="1072.6"
   id="line2331" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1355.6"
   y1="1354.1"
   x2="1329.6"
   y2="1073.1"
   id="line2332" />
								</g>
								<g
   id="g2336">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1355.2"
   y1="1354"
   x2="1329.2"
   y2="1073.1"
   id="line2333" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1349.2"
   y1="1354.5"
   x2="1323.2"
   y2="1073.6"
   id="line2334" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1343.4"
   y1="1355.3"
   x2="1317.3"
   y2="1074.3"
   id="line2335" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1337.3"
   y1="1355.8"
   x2="1311.3"
   y2="1074.8"
   id="line2336" />
								</g>
								<g
   id="g2340">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1337"
   y1="1355.7"
   x2="1310.9"
   y2="1074.7"
   id="line2337" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1330.9"
   y1="1356.2"
   x2="1304.9"
   y2="1075.3"
   id="line2338" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1325.1"
   y1="1357"
   x2="1299.1"
   y2="1076"
   id="line2339" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1319.1"
   y1="1357.5"
   x2="1293.1"
   y2="1076.5"
   id="line2340" />
								</g>
								<g
   id="g2344">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1318.7"
   y1="1357.4"
   x2="1292.7"
   y2="1076.4"
   id="line2341" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1312.7"
   y1="1357.9"
   x2="1286.7"
   y2="1077"
   id="line2342" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1306.9"
   y1="1358.6"
   x2="1280.8"
   y2="1077.7"
   id="line2343" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1300.8"
   y1="1359.2"
   x2="1274.8"
   y2="1078.2"
   id="line2344" />
								</g>
								<g
   id="g2348">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1300.5"
   y1="1359.1"
   x2="1274.4"
   y2="1078.1"
   id="line2345" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1294.4"
   y1="1359.6"
   x2="1268.4"
   y2="1078.6"
   id="line2346" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1288.6"
   y1="1360.3"
   x2="1262.6"
   y2="1079.4"
   id="line2347" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.3817"
   stroke-miterlimit="10"
   x1="1282.6"
   y1="1360.9"
   x2="1256.5"
   y2="1079.9"
   id="line2348" />
								</g>
							</g>
						</g>
					</g>
				</g>
				<path
   id="Fill_Lef_Sleeve"
   ref={sleevesDrop}
   className="st3-sleeves" 
   fill={getFillValue('sleeves')} 
   style={{
	 ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
	 cursor: sleevesUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
   stroke="#231F20"
   stroke-width="2"
   stroke-miterlimit="10"
   d="M1603.2,202.5      c-7.6,4.7-19,11.4-33,19c-7.9,4.3-17.4,9.2-55,27c-19,9-37.9,18.3-57,27c-13,5.9-19.8,8.9-30,15c-7.5,4.5-19.5,11.9-32,24      c-14.8,14.3-22.9,28.1-28,37c-12.2,21.1-17,39.2-23,62c-13.1,50.1-19.6,75.1-25,104c-4.8,25.8-7.9,48.5-14,93      c-7.9,58.3-11.9,87.4-15,123c-2.8,32.1-3.9,60.8-6,118c-2.4,64.9-3.6,98.1-2,134c1,21.6,7.2,62.4,9,96c1.3,24.9,2,37.4,2,41      c0,7.1-0.2,14.1,1,24c1.2,10.2,3.3,18.4,5,24c5.5-2,13.8-4.7,24-7c5.7-1.3,22-4.7,61-5c10.9-0.1,25.6,0.1,43,1      c0.5-2.3,1.1-5,1.7-8.2c0.1-0.5,0.9-5.5,1.3-10.8c0.8-10.1,0.1-19.7,0-21c-0.7-12.4,0.5-20.3,3-41c3-25.3,5.2-50.7,8-76      c2.5-23,6.2-56.2,9-96c2.4-33.7,3.5-61.6,4-81c1.4-52.2,0.3-91.4,0-102c-1.5-47.3-2.2-70.9-6-95c-3-18.7-6.8-36.2-10-67      c-0.4-3.7-1.2-19.7-3-42c-0.4-5.1-0.8-9.3-1-12c2.4-6.3,5.8-14.8,10-25c6.8-16.4,16.1-38.9,29-65c8.2-16.5,18.1-36.3,34-61      c9.9-15.4,20.4-31.5,37-50c12.1-13.5,30.4-31.4,56-49C1601.9,239.2,1602.6,220.8,1603.2,202.5z" />
				<g
   id="Stitch_00000021107795303313800390000002023905814129690757_">
					<g
   id="g2580">
						<g
   id="g2579">
							<g
   id="g2578">
								<g
   id="g2352">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1614,244.2c0.2-0.9,0.3-1.9,0.5-2.8           c-0.9-0.3-1.9-0.7-2.8-1c-0.2,1-0.3,2-0.5,2.9C1612.1,243.7,1613.1,243.9,1614,244.2z"
   id="path2351" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1611.8,240.6c0.2-0.9,0.4-1.9,0.6-2.9           c-1-0.3-1.9-0.6-2.9-0.9c-0.2,1-0.4,2-0.6,3C1609.8,240.1,1610.8,240.3,1611.8,240.6z"
   id="path2352" />
								</g>
								<g
   id="g2354">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1610.6,246.5c0.1-0.9,0.2-1.9,0.4-2.8           c-1-0.3-1.9-0.6-2.9-0.8c-0.1,1-0.3,2-0.4,3C1608.7,246,1609.6,246.2,1610.6,246.5z"
   id="path2353" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1608.1,242.9c0.1-1,0.3-1.9,0.5-2.9           c-1-0.3-2-0.5-3-0.8c-0.2,1-0.3,2-0.4,3C1606.2,242.5,1607.2,242.7,1608.1,242.9z"
   id="path2354" />
								</g>
								<g
   id="g2356">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1607.2,248.9c0.1-1,0.2-1.9,0.3-2.9           c-1-0.3-1.9-0.5-2.9-0.7l-0.3,3C1605.2,248.5,1606.2,248.7,1607.2,248.9z"
   id="path2355" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1604.6,245.5c0.1-1,0.2-1.9,0.3-2.9           c-1-0.2-2-0.5-3-0.7c-0.1,1-0.2,2-0.3,3L1604.6,245.5z"
   id="path2356" />
								</g>
								<g
   id="g2357">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1603.8,251.4 1604.1,248.6            1601.1,247.9 1600.9,250.9          "
   id="polygon2356" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1601.2,248.1 1601.4,245.2            1598.5,244.6 1598.2,247.6          "
   id="polygon2357" />
								</g>
								<g
   id="g2359">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1600.5,254.1 1600.7,251.2            1597.7,250.7 1597.6,253.6          "
   id="polygon2358" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1597.8,250.8 1598,247.9            1595,247.4 1594.9,250.4          "
   id="polygon2359" />
								</g>
								<g
   id="g2361">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1597.2,256.8 1597.4,253.9            1594.4,253.4 1594.3,256.4          "
   id="polygon2360" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1594.5,253.5 1594.7,250.6            1591.7,250.1 1591.5,253.1          "
   id="polygon2361" />
								</g>
								<g
   id="g2363">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1593.9,259.6 1594.1,256.7            1591.1,256.2 1591,259.2          "
   id="polygon2362" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1591.2,256.3 1591.3,253.4            1588.3,252.9 1588.2,255.9          "
   id="polygon2363" />
								</g>
								<g
   id="g2365">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1590.6,262.4 1590.8,259.5            1587.8,259 1587.6,261.9          "
   id="polygon2364" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1587.9,259.1 1588,256.2            1585,255.7 1584.9,258.7          "
   id="polygon2365" />
								</g>
								<g
   id="g2367">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1587.3,265.1 1587.4,262.2            1584.4,261.7 1584.3,264.7          "
   id="polygon2366" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1584.5,261.8 1584.7,258.9            1581.7,258.4 1581.6,261.4          "
   id="polygon2367" />
								</g>
								<g
   id="g2369">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1583.9,267.9 1584.1,265            1581.1,264.4 1580.9,267.4          "
   id="polygon2368" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1581.2,264.6 1581.4,261.7            1578.4,261.1 1578.2,264.1          "
   id="polygon2369" />
								</g>
								<g
   id="g2371">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1580.5,270.6 1580.7,267.7            1577.7,267.2 1577.6,270.1          "
   id="polygon2370" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1577.8,267.3 1578,264.4            1575.1,263.8 1574.9,266.8          "
   id="polygon2371" />
								</g>
								<g
   id="g2372">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1577.3,273.3l0.1-2.9l-3-0.5l-0.1,3           C1575.3,273,1576.3,273.1,1577.3,273.3z"
   id="path2371" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1574.5,270l0.1-2.9l-3-0.5           c-0.1,1-0.1,2-0.1,3L1574.5,270z"
   id="path2372" />
								</g>
								<g
   id="g2373">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1574,276.1 1574.1,273.2            1571.1,272.7 1571.1,275.7          "
   id="polygon2372" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1571.2,272.8 1571.3,269.9            1568.3,269.5 1568.2,272.5          "
   id="polygon2373" />
								</g>
								<g
   id="g2375">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1570.8,278.9 1570.9,276            1567.9,275.6 1567.9,278.6          "
   id="polygon2374" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1568,275.7 1568,272.8            1565,272.4 1565,275.4          "
   id="polygon2375" />
								</g>
								<g
   id="g2377">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1567.6,281.8 1567.7,278.9            1564.7,278.5 1564.7,281.5          "
   id="polygon2376" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1564.8,278.6 1564.8,275.7            1561.8,275.3 1561.8,278.3          "
   id="polygon2377" />
								</g>
								<g
   id="g2379">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1564.5,284.6 1564.5,281.7            1561.5,281.4 1561.5,284.4          "
   id="polygon2378" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1561.6,281.5 1561.6,278.6            1558.6,278.2 1558.6,281.2          "
   id="polygon2379" />
								</g>
								<g
   id="g2381">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1561.3,287.6 1561.3,284.7            1558.3,284.3 1558.3,287.3          "
   id="polygon2380" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1558.4,284.4 1558.4,281.5            1555.4,281.2 1555.4,284.2          "
   id="polygon2381" />
								</g>
								<g
   id="g2383">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1558.2,290.5 1558.1,287.6            1555.1,287.3 1555.2,290.3          "
   id="polygon2382" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1555.3,287.4 1555.2,284.5            1552.2,284.2 1552.3,287.2          "
   id="polygon2383" />
								</g>
								<g
   id="g2385">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1555.1,293.4 1555,290.5            1552,290.2 1552.1,293.2          "
   id="polygon2384" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1552.1,290.4 1552.1,287.5            1549,287.2 1549.1,290.2          "
   id="polygon2385" />
								</g>
								<g
   id="g2387">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1552,296.4 1551.9,293.5            1548.9,293.2 1549,296.2          "
   id="polygon2386" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1549,293.4 1548.9,290.5            1545.9,290.2 1546,293.2          "
   id="polygon2387" />
								</g>
								<g
   id="g2389">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1548.9,299.4 1548.8,296.5            1545.8,296.3 1546,299.3          "
   id="polygon2388" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1545.9,296.4 1545.8,293.5            1542.8,293.2 1542.9,296.2          "
   id="polygon2389" />
								</g>
								<g
   id="g2391">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1545.9,302.4 1545.8,299.6            1542.8,299.3 1542.9,302.3          "
   id="polygon2390" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1542.9,299.4 1542.7,296.5            1539.7,296.3 1539.9,299.3          "
   id="polygon2391" />
								</g>
								<g
   id="g2393">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1542.9,305.5 1542.8,302.6            1539.7,302.4 1540,305.4          "
   id="polygon2392" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1539.9,302.5 1539.7,299.6            1536.7,299.4 1536.9,302.5          "
   id="polygon2393" />
								</g>
								<g
   id="g2395">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1540,308.6 1539.8,305.7            1536.8,305.5 1537,308.5          "
   id="polygon2394" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1536.9,305.7 1536.7,302.8            1533.6,302.6 1533.9,305.6          "
   id="polygon2395" />
								</g>
								<g
   id="g2397">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1537.1,311.7 1536.8,308.8            1533.8,308.7 1534.2,311.7          "
   id="polygon2396" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1533.9,308.8 1533.7,305.9            1530.7,305.9 1530.9,308.9          "
   id="polygon2397" />
								</g>
								<g
   id="g2398">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1534.4,314.8c-0.2-0.9-0.3-1.9-0.4-2.8           c-1,0-2,0-3,0c0.1,1,0.3,2,0.5,2.9C1532.4,314.8,1533.4,314.8,1534.4,314.8z"
   id="path2397" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1531.1,312.1c-0.1-1-0.2-1.9-0.3-2.9           c-1,0-2,0-3.1,0c0.1,1,0.2,2,0.4,3C1529.1,312.2,1530.1,312.1,1531.1,312.1z"
   id="path2398" />
								</g>
								<g
   id="g2400">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1531.8,318l-0.5-2.8c-1,0-2,0.1-3,0.1           l0.6,2.9C1529.9,318.2,1530.8,318.1,1531.8,318z"
   id="path2399" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1528.4,315.5c-0.2-1-0.3-1.9-0.5-2.9           l-3,0.2c0.2,1,0.4,2,0.5,3L1528.4,315.5z"
   id="path2400" />
								</g>
								<g
   id="g2401">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1529.3,321.4 1528.7,318.6            1525.7,318.8 1526.4,321.8          "
   id="polygon2400" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1525.9,318.9 1525.3,316.1            1522.3,316.3 1522.9,319.3          "
   id="polygon2401" />
								</g>
								<g
   id="g2403">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1526.8,324.9 1526.2,322.1            1523.2,322.4 1523.9,325.3          "
   id="polygon2402" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1523.3,322.5 1522.7,319.6            1519.7,319.9 1520.4,322.8          "
   id="polygon2403" />
								</g>
								<g
   id="g2405">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1524.4,328.4 1523.8,325.6            1520.8,325.9 1521.4,328.8          "
   id="polygon2404" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1520.9,326 1520.2,323.2            1517.2,323.5 1517.9,326.4          "
   id="polygon2405" />
								</g>
								<g
   id="g2407">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1522,332 1521.3,329.1            1518.3,329.5 1519,332.4          "
   id="polygon2406" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1518.4,329.6 1517.8,326.7            1514.8,327.1 1515.5,330          "
   id="polygon2407" />
								</g>
								<g
   id="g2409">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1519.6,335.5 1518.9,332.7            1515.9,333.1 1516.6,336          "
   id="polygon2408" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1516,333.2 1515.4,330.3            1512.3,330.7 1513.1,333.6          "
   id="polygon2409" />
								</g>
								<g
   id="g2411">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1517.2,339.1 1516.5,336.3            1513.5,336.7 1514.3,339.6          "
   id="polygon2410" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1513.7,336.8 1513,333.9            1509.9,334.3 1510.7,337.2          "
   id="polygon2411" />
								</g>
								<g
   id="g2413">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1514.9,342.7 1514.1,339.9            1511.1,340.3 1511.9,343.2          "
   id="polygon2412" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1511.3,340.4 1510.6,337.6            1507.6,338 1508.3,340.9          "
   id="polygon2413" />
								</g>
								<g
   id="g2415">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1512.5,346.3 1511.8,343.5            1508.8,343.9 1509.6,346.8          "
   id="polygon2414" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1508.9,344 1508.2,341.2            1505.2,341.6 1506,344.5          "
   id="polygon2415" />
								</g>
								<g
   id="g2417">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1510.2,349.9 1509.4,347.1            1506.5,347.5 1507.2,350.4          "
   id="polygon2416" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1506.6,347.6 1505.8,344.8            1502.8,345.2 1503.6,348.1          "
   id="polygon2417" />
								</g>
								<g
   id="g2419">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1507.9,353.6 1507.1,350.8            1504.1,351.2 1504.9,354.1          "
   id="polygon2418" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1504.3,351.3 1503.5,348.5            1500.5,348.9 1501.3,351.8          "
   id="polygon2419" />
								</g>
								<g
   id="g2421">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1505.6,357.2 1504.8,354.4            1501.8,354.8 1502.6,357.7          "
   id="polygon2420" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1502,354.9 1501.2,352.1            1498.2,352.6 1499,355.4          "
   id="polygon2421" />
								</g>
								<g
   id="g2423">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1503.3,360.8 1502.5,358            1499.5,358.5 1500.3,361.4          "
   id="polygon2422" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1499.7,358.6 1498.9,355.8            1495.9,356.2 1496.7,359.1          "
   id="polygon2423" />
								</g>
								<g
   id="g2425">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1501,364.5 1500.2,361.7            1497.2,362.2 1498.1,365          "
   id="polygon2424" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1497.4,362.3 1496.6,359.5            1493.6,359.9 1494.4,362.8          "
   id="polygon2425" />
								</g>
								<g
   id="g2427">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1498.8,368.2 1498,365.4            1495,365.8 1495.8,368.7          "
   id="polygon2426" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1495.1,365.9 1494.3,363.1            1491.3,363.6 1492.2,366.5          "
   id="polygon2427" />
								</g>
								<g
   id="g2429">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1496.5,371.8 1495.7,369            1492.7,369.5 1493.6,372.4          "
   id="polygon2428" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492.9,369.6 1492.1,366.8            1489.1,367.3 1489.9,370.2          "
   id="polygon2429" />
								</g>
								<g
   id="g2431">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1494.3,375.5 1493.5,372.7            1490.5,373.2 1491.4,376.1          "
   id="polygon2430" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490.7,373.3 1489.8,370.5            1486.8,371.1 1487.7,373.9          "
   id="polygon2431" />
								</g>
								<g
   id="g2433">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1492.1,379.2 1491.3,376.4            1488.3,377 1489.2,379.8          "
   id="polygon2432" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1488.5,377.1 1487.6,374.3            1484.6,374.8 1485.5,377.7          "
   id="polygon2433" />
								</g>
								<g
   id="g2435">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1490,382.9 1489.1,380.2            1486.1,380.7 1487,383.5          "
   id="polygon2434" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1486.3,380.8 1485.4,378            1482.4,378.6 1483.3,381.4          "
   id="polygon2435" />
								</g>
								<g
   id="g2437">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1487.8,386.6 1486.9,383.9            1484,384.4 1484.9,387.3          "
   id="polygon2436" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1484.1,384.5 1483.2,381.8            1480.3,382.3 1481.2,385.2          "
   id="polygon2437" />
								</g>
								<g
   id="g2439">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1485.7,390.4 1484.8,387.6            1481.8,388.2 1482.8,391          "
   id="polygon2438" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1482,388.3 1481.1,385.5            1478.1,386.1 1479.1,389          "
   id="polygon2439" />
								</g>
								<g
   id="g2441">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1483.6,394.1 1482.7,391.4            1479.7,392 1480.7,394.8          "
   id="polygon2440" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1479.9,392.1 1479,389.3            1476,389.9 1477,392.8          "
   id="polygon2441" />
								</g>
								<g
   id="g2443">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1481.6,397.9 1480.6,395.1            1477.7,395.8 1478.7,398.6          "
   id="polygon2442" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.8,395.8 1476.9,393.1            1473.9,393.7 1474.9,396.6          "
   id="polygon2443" />
								</g>
								<g
   id="g2445">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1479.5,401.7 1478.6,398.9            1475.6,399.6 1476.6,402.4          "
   id="polygon2444" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1475.8,399.7 1474.8,396.9            1471.8,397.6 1472.8,400.4          "
   id="polygon2445" />
								</g>
								<g
   id="g2447">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1477.5,405.4 1476.5,402.7            1473.6,403.4 1474.6,406.2          "
   id="polygon2446" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.7,403.5 1472.8,400.7            1469.8,401.4 1470.8,404.2          "
   id="polygon2447" />
								</g>
								<g
   id="g2449">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1475.5,409.2 1474.5,406.5            1471.6,407.2 1472.7,410          "
   id="polygon2448" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1471.7,407.3 1470.7,404.6            1467.8,405.3 1468.8,408.1          "
   id="polygon2449" />
								</g>
								<g
   id="g2451">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1473.6,413.1 1472.6,410.4            1469.6,411.1 1470.7,413.9          "
   id="polygon2450" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469.8,411.1 1468.8,408.4            1465.8,409.2 1466.9,412          "
   id="polygon2451" />
								</g>
								<g
   id="g2453">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1471.7,416.9 1470.6,414.2            1467.7,414.9 1468.8,417.7          "
   id="polygon2452" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1467.8,415 1466.8,412.3            1463.9,413.1 1465,415.9          "
   id="polygon2453" />
								</g>
								<g
   id="g2455">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1469.8,420.7 1468.7,418.1            1465.8,418.8 1466.9,421.6          "
   id="polygon2454" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1466,418.9 1464.9,416.2            1462,417 1463.1,419.8          "
   id="polygon2455" />
								</g>
								<g
   id="g2457">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1468,424.6 1466.9,421.9            1464,422.7 1465.1,425.5          "
   id="polygon2456" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464.1,422.8 1463,420.1            1460.1,420.9 1461.2,423.7          "
   id="polygon2457" />
								</g>
								<g
   id="g2459">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1466.2,428.5 1465.1,425.8            1462.1,426.6 1463.3,429.4          "
   id="polygon2458" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1462.3,426.7 1461.2,424            1458.3,424.9 1459.4,427.7          "
   id="polygon2459" />
								</g>
								<g
   id="g2461">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1464.4,432.4 1463.3,429.7            1460.4,430.6 1461.6,433.3          "
   id="polygon2460" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1460.5,430.7 1459.4,428            1456.5,428.9 1457.7,431.6          "
   id="polygon2461" />
								</g>
								<g
   id="g2463">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1462.7,436.4 1461.5,433.7            1458.6,434.5 1459.8,437.3          "
   id="polygon2462" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1458.8,434.6 1457.6,431.9            1454.7,432.8 1455.9,435.5          "
   id="polygon2463" />
								</g>
								<g
   id="g2465">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1460.9,440.3 1459.7,437.6            1456.8,438.5 1458,441.2          "
   id="polygon2464" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1457,438.6 1455.8,435.9            1452.9,436.7 1454.1,439.5          "
   id="polygon2465" />
								</g>
								<g
   id="g2467">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1459.1,444.2 1458,441.6            1455.1,442.4 1456.3,445.2          "
   id="polygon2466" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1455.2,442.5 1454.1,439.8            1451.2,440.7 1452.4,443.4          "
   id="polygon2467" />
								</g>
								<g
   id="g2469">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1457.3,448.2 1456.2,445.5            1453.3,446.4 1454.5,449.1          "
   id="polygon2468" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1453.4,446.4 1452.3,443.8            1449.4,444.6 1450.6,447.4          "
   id="polygon2469" />
								</g>
								<g
   id="g2471">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1455.6,452.1 1454.4,449.4            1451.5,450.3 1452.7,453          "
   id="polygon2470" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1451.7,450.4 1450.5,447.7            1447.6,448.6 1448.8,451.3          "
   id="polygon2471" />
								</g>
								<g
   id="g2473">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1453.8,456 1452.7,453.4            1449.8,454.2 1451,457          "
   id="polygon2472" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1449.9,454.3 1448.8,451.7            1445.9,452.5 1447.1,455.3          "
   id="polygon2473" />
								</g>
								<g
   id="g2475">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1452.1,460 1450.9,457.3            1448,458.2 1449.3,460.9          "
   id="polygon2474" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1448.2,458.3 1447,455.6            1444.1,456.5 1445.3,459.2          "
   id="polygon2475" />
								</g>
								<g
   id="g2477">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450.4,463.9 1449.2,461.3            1446.3,462.2 1447.6,464.9          "
   id="polygon2476" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1446.5,462.2 1445.3,459.6            1442.4,460.5 1443.6,463.2          "
   id="polygon2477" />
								</g>
								<g
   id="g2479">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1448.7,467.9 1447.5,465.2            1444.6,466.1 1445.9,468.9          "
   id="polygon2478" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.8,466.2 1443.6,463.6            1440.7,464.5 1442,467.2          "
   id="polygon2479" />
								</g>
								<g
   id="g2481">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1447.1,471.8 1445.8,469.2            1443,470.1 1444.3,472.8          "
   id="polygon2480" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.1,470.2 1441.9,467.6            1439,468.5 1440.3,471.2          "
   id="polygon2481" />
								</g>
								<g
   id="g2483">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.5,475.8 1444.2,473.2            1441.3,474.1 1442.7,476.8          "
   id="polygon2482" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1441.5,474.2 1440.3,471.6            1437.4,472.6 1438.7,475.3          "
   id="polygon2483" />
								</g>
								<g
   id="g2485">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.9,479.8 1442.6,477.2            1439.8,478.2 1441.1,480.8          "
   id="polygon2484" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.9,478.2 1438.6,475.6            1435.8,476.6 1437.1,479.3          "
   id="polygon2485" />
								</g>
								<g
   id="g2487">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.3,483.8 1441,481.2            1438.2,482.2 1439.6,484.9          "
   id="polygon2486" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.4,482.3 1437.1,479.7            1434.2,480.7 1435.6,483.4          "
   id="polygon2487" />
								</g>
								<g
   id="g2489">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1440.8,487.8 1439.5,485.2            1436.7,486.2 1438.1,488.9          "
   id="polygon2488" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.8,486.3 1435.5,483.7            1432.7,484.8 1434.1,487.4          "
   id="polygon2489" />
								</g>
								<g
   id="g2491">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.4,491.8 1438,489.2            1435.2,490.3 1436.6,492.9          "
   id="polygon2490" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.4,490.4 1434,487.8            1431.2,488.9 1432.6,491.5          "
   id="polygon2491" />
								</g>
								<g
   id="g2493">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438,495.8 1436.6,493.3            1433.8,494.4 1435.2,497          "
   id="polygon2492" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1433.9,494.4 1432.5,491.9            1429.7,493 1431.2,495.6          "
   id="polygon2493" />
								</g>
								<g
   id="g2495">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.6,499.9 1435.2,497.3            1432.4,498.5 1433.8,501.1          "
   id="polygon2494" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1432.5,498.5 1431.1,496            1428.3,497.1 1429.8,499.7          "
   id="polygon2495" />
								</g>
								<g
   id="g2497">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.2,503.9 1433.8,501.4            1431,502.6 1432.5,505.2          "
   id="polygon2496" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431.2,502.6 1429.7,500.1            1426.9,501.3 1428.4,503.9          "
   id="polygon2497" />
								</g>
								<g
   id="g2498">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1433.9,508l-1.4-2.5l-2.8,1.2           c0.3,0.4,0.5,0.8,0.9,1.1c0.2,0.2,0.4,0.2,0.5,0.4l0.5,0.5l0.6-0.5c0.2-0.2,0.4-0.2,0.6-0.2           C1433.2,507.9,1433.5,508.1,1433.9,508z"
   id="path2497" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1429.8,506.7l-1.4-2.5l-2.8,1.2           c0.1,0.1,0.1,0.3,0.1,0.5l0.1,0.5c0,0.2,0.1,0.3,0.1,0.5l0.3,0.5l0.3,0.4c0.1,0.2,0.2,0.3,0.3,0.3l0.5,0.5l0.6-0.5           c0.2-0.2,0.4-0.4,0.6-0.6c0.2-0.2,0.4-0.4,0.6-0.5C1429.4,507,1429.6,506.8,1429.8,506.7z"
   id="path2498" />
								</g>
								<g
   id="g2500">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1433.9,511l-2.1-1.9           c-0.8,0.6-1.5,1.3-2.3,1.9l2.2,2C1432.4,512.3,1433.1,511.6,1433.9,511z"
   id="path2499" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1429.6,511c-0.7-0.7-1.4-1.3-2.1-2           c-0.8,0.7-1.5,1.3-2.3,2c0.7,0.7,1.5,1.4,2.2,2L1429.6,511z"
   id="path2500" />
								</g>
								<g
   id="g2501">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434,515.2 1431.8,513.3            1429.5,515.3 1431.8,517.2          "
   id="polygon2500" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1429.7,515.3 1427.5,513.4            1425.3,515.5 1427.6,517.4          "
   id="polygon2501" />
								</g>
								<g
   id="g2503">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.1,519.4 1431.9,517.6            1429.7,519.6 1432.1,521.5          "
   id="polygon2502" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1429.9,519.6 1427.6,517.8            1425.5,519.9 1427.8,521.8          "
   id="polygon2503" />
								</g>
								<g
   id="g2505">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.4,523.7 1432.1,521.8            1430,523.9 1432.3,525.8          "
   id="polygon2504" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1430.1,523.9 1427.9,522.1            1425.7,524.2 1428.1,526.1          "
   id="polygon2505" />
								</g>
								<g
   id="g2507">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.7,527.9 1432.4,526.1            1430.3,528.3 1432.7,530.1          "
   id="polygon2506" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1430.5,528.3 1428.2,526.4            1426,528.6 1428.4,530.4          "
   id="polygon2507" />
								</g>
								<g
   id="g2509">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435,532.2 1432.8,530.4            1430.6,532.6 1433,534.4          "
   id="polygon2508" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1430.8,532.6 1428.5,530.8            1426.4,532.9 1428.7,534.7          "
   id="polygon2509" />
								</g>
								<g
   id="g2511">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.4,536.5 1433.1,534.7            1431,536.9 1433.3,538.7          "
   id="polygon2510" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431.1,536.9 1428.8,535.1            1426.7,537.2 1429.1,539.1          "
   id="polygon2511" />
								</g>
								<g
   id="g2513">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.7,540.8 1433.4,539            1431.3,541.2 1433.7,543          "
   id="polygon2512" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431.5,541.2 1429.2,539.4            1427,541.5 1429.4,543.4          "
   id="polygon2513" />
								</g>
								<g
   id="g2515">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.1,545.1 1433.8,543.4            1431.6,545.5 1434,547.3          "
   id="polygon2514" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1431.8,545.5 1429.5,543.7            1427.4,545.8 1429.8,547.7          "
   id="polygon2515" />
								</g>
								<g
   id="g2516">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1436.4,549.5c-0.8-0.6-1.5-1.2-2.3-1.8           l-2.1,2.1l2.3,1.9L1436.4,549.5z"
   id="path2515" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1432.1,549.8l-2.3-1.8           c-0.7,0.7-1.4,1.4-2.1,2.1l2.3,1.8L1432.1,549.8z"
   id="path2516" />
								</g>
								<g
   id="g2517">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.7,553.8 1434.4,552            1432.3,554.1 1434.6,556          "
   id="polygon2516" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1432.4,554.1 1430.2,552.3            1428,554.4 1430.3,556.3          "
   id="polygon2517" />
								</g>
								<g
   id="g2519">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1437,558.1 1434.7,556.3            1432.5,558.4 1434.9,560.3          "
   id="polygon2518" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1432.7,558.4 1430.4,556.6            1428.3,558.7 1430.6,560.6          "
   id="polygon2519" />
								</g>
								<g
   id="g2520">
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1437.3,562.3c-0.8-0.5-1.5-1.1-2.3-1.7           c-0.7,0.7-1.4,1.4-2.1,2.2l2.4,1.8C1436,563.8,1436.6,563,1437.3,562.3z"
   id="path2519" />
									<path
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   d="M1433.1,562.7c-0.8-0.6-1.6-1.2-2.3-1.8           c-0.7,0.7-1.4,1.5-2.1,2.2c0.8,0.6,1.6,1.2,2.4,1.8L1433.1,562.7z"
   id="path2520" />
								</g>
								<g
   id="g2521">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1437.8,566.6 1435.4,564.8            1433.3,567 1435.8,568.8          "
   id="polygon2520" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1433.5,567 1431.2,565.3            1429.1,567.5 1431.5,569.2          "
   id="polygon2521" />
								</g>
								<g
   id="g2523">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.2,570.9 1435.9,569.1            1433.8,571.3 1436.2,573.1          "
   id="polygon2522" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434,571.3 1431.6,569.6            1429.5,571.8 1432,573.5          "
   id="polygon2523" />
								</g>
								<g
   id="g2525">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.6,575.2 1436.3,573.4            1434.2,575.6 1436.6,577.4          "
   id="polygon2524" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.4,575.6 1432.1,573.9            1430,576.1 1432.4,577.8          "
   id="polygon2525" />
								</g>
								<g
   id="g2527">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.1,579.5 1436.8,577.7            1434.7,579.9 1437.1,581.7          "
   id="polygon2526" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1434.8,579.9 1432.5,578.2            1430.4,580.4 1432.8,582.2          "
   id="polygon2527" />
								</g>
								<g
   id="g2529">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.6,583.7 1437.2,582            1435.1,584.2 1437.6,586          "
   id="polygon2528" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.3,584.2 1433,582.5            1430.9,584.7 1433.3,586.5          "
   id="polygon2529" />
								</g>
								<g
   id="g2531">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1440,588 1437.7,586.3            1435.6,588.5 1438.1,590.3          "
   id="polygon2530" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1435.8,588.5 1433.4,586.8            1431.4,589 1433.8,590.8          "
   id="polygon2531" />
								</g>
								<g
   id="g2533">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1440.5,592.3 1438.2,590.6            1436.1,592.8 1438.6,594.5          "
   id="polygon2532" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.3,592.8 1433.9,591.1            1431.9,593.3 1434.3,595.1          "
   id="polygon2533" />
								</g>
								<g
   id="g2535">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1441.1,596.5 1438.7,594.9            1436.7,597.1 1439.1,598.8          "
   id="polygon2534" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1436.8,597.1 1434.5,595.4            1432.4,597.6 1434.9,599.4          "
   id="polygon2535" />
								</g>
								<g
   id="g2537">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1441.6,600.8 1439.3,599.1            1437.2,601.4 1439.7,603.1          "
   id="polygon2536" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1437.4,601.4 1435,599.7            1433,602 1435.5,603.7          "
   id="polygon2537" />
								</g>
								<g
   id="g2539">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.2,605 1439.8,603.4            1437.8,605.7 1440.3,607.3          "
   id="polygon2538" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438,605.6 1435.6,604            1433.6,606.3 1436.1,608          "
   id="polygon2539" />
								</g>
								<g
   id="g2541">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.9,609.3 1440.5,607.7            1438.5,609.9 1441,611.6          "
   id="polygon2540" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1438.6,609.9 1436.2,608.3            1434.2,610.6 1436.7,612.2          "
   id="polygon2541" />
								</g>
								<g
   id="g2543">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.5,613.5 1441.1,611.9            1439.1,614.2 1441.6,615.8          "
   id="polygon2542" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1439.3,614.2 1436.9,612.6            1434.9,614.9 1437.4,616.5          "
   id="polygon2543" />
								</g>
								<g
   id="g2545">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.2,617.8 1441.7,616.2            1439.8,618.5 1442.3,620.1          "
   id="polygon2544" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1440,618.5 1437.5,616.8            1435.6,619.1 1438.1,620.8          "
   id="polygon2545" />
								</g>
								<g
   id="g2547">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.9,622 1442.4,620.4            1440.5,622.7 1443,624.4          "
   id="polygon2546" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1440.6,622.7 1438.2,621.1            1436.3,623.4 1438.8,625.1          "
   id="polygon2547" />
								</g>
								<g
   id="g2549">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.5,626.3 1443.1,624.7            1441.1,627 1443.7,628.7          "
   id="polygon2548" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1441.3,627 1438.9,625.4            1436.9,627.7 1439.4,629.3          "
   id="polygon2549" />
								</g>
								<g
   id="g2551">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1446.2,630.6 1443.8,629            1441.8,631.3 1444.3,632.9          "
   id="polygon2550" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442,631.3 1439.6,629.6            1437.6,631.9 1440.1,633.6          "
   id="polygon2551" />
								</g>
								<g
   id="g2553">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1446.8,634.9 1444.4,633.3            1442.5,635.5 1444.9,637.2          "
   id="polygon2552" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1442.6,635.5 1440.2,633.9            1438.2,636.2 1440.7,637.8          "
   id="polygon2553" />
								</g>
								<g
   id="g2555">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1447.5,639.2 1445.1,637.6            1443.1,639.8 1445.5,641.5          "
   id="polygon2554" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.2,639.8 1440.8,638.2            1438.8,640.4 1441.3,642.1          "
   id="polygon2555" />
								</g>
								<g
   id="g2557">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1448,643.6 1445.7,641.9            1443.6,644.1 1446.1,645.9          "
   id="polygon2556" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1443.8,644.1 1441.4,642.4            1439.4,644.6 1441.8,646.4          "
   id="polygon2557" />
								</g>
								<g
   id="g2559">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1448.5,647.9 1446.2,646.2            1444.1,648.4 1446.5,650.2          "
   id="polygon2558" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.3,648.4 1441.9,646.7            1439.9,648.9 1442.3,650.6          "
   id="polygon2559" />
								</g>
								<g
   id="g2561">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1449,652.3 1446.6,650.5            1444.5,652.7 1446.9,654.5          "
   id="polygon2560" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1444.7,652.7 1442.4,650.9            1440.3,653.1 1442.7,654.9          "
   id="polygon2561" />
								</g>
								<g
   id="g2563">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1449.3,656.7 1447,654.9            1444.9,657 1447.2,658.9          "
   id="polygon2562" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.1,657 1442.8,655.2            1440.6,657.3 1443,659.2          "
   id="polygon2563" />
								</g>
								<g
   id="g2565">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1449.6,661.1 1447.4,659.2            1445.2,661.3 1447.5,663.2          "
   id="polygon2564" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.3,661.3 1443.1,659.5            1440.9,661.6 1443.2,663.4          "
   id="polygon2565" />
								</g>
								<g
   id="g2567">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1449.8,665.4 1447.6,663.6            1445.4,665.6 1447.7,667.6          "
   id="polygon2566" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.6,665.6 1443.3,663.8            1441.1,665.8 1443.4,667.7          "
   id="polygon2567" />
								</g>
								<g
   id="g2569">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450,669.8 1447.8,667.9            1445.5,669.9 1447.8,671.9          "
   id="polygon2568" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.7,669.9 1443.5,668.1            1441.3,670.1 1443.5,672          "
   id="polygon2569" />
								</g>
								<g
   id="g2571">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450.1,674.2 1447.9,672.3            1445.6,674.3 1447.9,676.3          "
   id="polygon2570" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.8,674.3 1443.6,672.3            1441.4,674.3 1443.6,676.3          "
   id="polygon2571" />
								</g>
								<g
   id="g2573">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450.1,678.6 1448,676.6            1445.7,678.6 1447.9,680.6          "
   id="polygon2572" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.8,678.6 1443.7,676.6            1441.4,678.6 1443.6,680.6          "
   id="polygon2573" />
								</g>
								<g
   id="g2575">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450.1,683 1447.9,681            1445.6,682.9 1447.8,685          "
   id="polygon2574" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.8,682.9 1443.7,680.9            1441.4,682.8 1443.5,684.9          "
   id="polygon2575" />
								</g>
								<g
   id="g2577">
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1450,687.3 1447.9,685.3            1445.5,687.2 1447.7,689.3          "
   id="polygon2576" />
									<polygon
   fill="none"
   stroke="#000000"
   stroke-width="0.25"
   stroke-miterlimit="10"
   points="1445.7,687.2 1443.6,685.2            1441.3,687.1 1443.4,689.2          "
   id="polygon2577" />
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
			<g
   id="Collar_00000166674967552446561080000013903251839739707302_">
				
					<path
   id="Fill_00000163064044448217752500000007139852219565049497_"
   ref={collarDrop}
   className="st0" 
   fill={getFillValue('collar')} 
   style={{
	 ...getDropZoneStyle(isCollarOver, canCollarDrop),
	 cursor: collarUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(collarUploadedPattern || '', 'collar')}
	stroke="#231F20"
   stroke-width="1.8999"
   stroke-miterlimit="10"
   d="      M1628.4,186.7c14.2,5.3,33.2,11.4,56.1,15.8c10.6,2,44.2,8,88.1,5.5c17.2-1,36.8-2.2,61.7-9.5c12.9-3.8,23.4-8.1,30.8-11.5      c-1.3,21.7-2.4,40.1-3.7,61.8c-35,8.3-65.6,14.9-88.7,16.1c-18.7,0.9-46.9,2.2-83.4-3.2c-25.8-3.8-47-9.6-62.5-14.6      C1627.4,227.1,1627.9,206.9,1628.4,186.7z" />
				<g
   id="Rib_Sketch_Back">
					<defs
   id="defs2580">
						<path
   id="SVGID_00000072258628086322682400000000403179506013675679_"
   d="M1628.9,186.7c14.2,5.3,33.2,11.4,56.1,15.8        c10.6,2,44.2,8,88.1,5.5c17.2-1,36.8-2.2,61.7-9.5c12.9-3.8,23.4-8.1,30.8-11.5c-1.3,21.7-2.4,40.1-3.7,61.8        c-35,8.3-65.6,14.9-88.7,16.1c-18.7,0.9-46.9,2.2-83.4-3.2c-25.8-3.8-47-9.6-62.5-14.6C1627.9,227,1628.4,206.9,1628.9,186.7z        " />
					</defs>
					<clipPath
   id="SVGID_00000060747851788502413180000017754985135081529245_">
						<use
   xlinkHref="#SVGID_00000072258628086322682400000000403179506013675679_"
   overflow="visible"
   id="use2580" />
					</clipPath>
					<g
   clip-path="url(#SVGID_00000060747851788502413180000017754985135081529245_)"
   id="g2746">
						<g
   id="g2745">
							<g
   id="g2744">
								<g
   id="g2583">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1583.9"
   y1="112.1"
   x2="1518.4"
   y2="256.3"
   id="line2580" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1586.6"
   y1="113.3"
   x2="1522.1"
   y2="258"
   id="line2581" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1589.2"
   y1="114.4"
   x2="1525.8"
   y2="259.6"
   id="line2582" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1591.9"
   y1="115.5"
   x2="1529.5"
   y2="261.2"
   id="line2583" />
								</g>
								<g
   id="g2587">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1592.1"
   y1="115.7"
   x2="1529.7"
   y2="261.3"
   id="line2584" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1594.8"
   y1="116.9"
   x2="1533.5"
   y2="263"
   id="line2585" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1597.4"
   y1="117.9"
   x2="1537.2"
   y2="264.4"
   id="line2586" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1600.2"
   y1="119"
   x2="1541"
   y2="266"
   id="line2587" />
								</g>
								<g
   id="g2591">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1600.3"
   y1="119.1"
   x2="1541.2"
   y2="266.1"
   id="line2588" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1603"
   y1="120.2"
   x2="1545"
   y2="267.7"
   id="line2589" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1605.7"
   y1="121.1"
   x2="1548.8"
   y2="269"
   id="line2590" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1608.5"
   y1="122.2"
   x2="1552.6"
   y2="270.5"
   id="line2591" />
								</g>
								<g
   id="g2595">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1608.6"
   y1="122.4"
   x2="1552.8"
   y2="270.6"
   id="line2592" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1611.4"
   y1="123.4"
   x2="1556.6"
   y2="272.1"
   id="line2593" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1614.1"
   y1="124.3"
   x2="1560.4"
   y2="273.3"
   id="line2594" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1616.9"
   y1="125.3"
   x2="1564.2"
   y2="274.7"
   id="line2595" />
								</g>
								<g
   id="g2599">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1617"
   y1="125.4"
   x2="1564.5"
   y2="274.9"
   id="line2596" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1619.8"
   y1="126.4"
   x2="1568.3"
   y2="276.2"
   id="line2597" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1622.5"
   y1="127.2"
   x2="1572.1"
   y2="277.4"
   id="line2598" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1625.3"
   y1="128.2"
   x2="1576"
   y2="278.7"
   id="line2599" />
								</g>
								<g
   id="g2603">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1625.5"
   y1="128.3"
   x2="1576.2"
   y2="278.9"
   id="line2600" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1628.3"
   y1="129.2"
   x2="1580.1"
   y2="280.1"
   id="line2601" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1631"
   y1="130"
   x2="1584"
   y2="281.2"
   id="line2602" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1633.8"
   y1="130.8"
   x2="1587.9"
   y2="282.5"
   id="line2603" />
								</g>
								<g
   id="g2607">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1634"
   y1="130.9"
   x2="1588.1"
   y2="282.6"
   id="line2604" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1636.8"
   y1="131.8"
   x2="1592"
   y2="283.8"
   id="line2605" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1639.6"
   y1="132.5"
   x2="1595.9"
   y2="284.8"
   id="line2606" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1642.4"
   y1="133.3"
   x2="1599.9"
   y2="285.9"
   id="line2607" />
								</g>
								<g
   id="g2611">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1642.6"
   y1="133.4"
   x2="1600.1"
   y2="286.1"
   id="line2608" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1645.4"
   y1="134.2"
   x2="1604"
   y2="287.2"
   id="line2609" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1648.2"
   y1="134.9"
   x2="1607.9"
   y2="288.1"
   id="line2610" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1651"
   y1="135.6"
   x2="1611.9"
   y2="289.1"
   id="line2611" />
								</g>
								<g
   id="g2615">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1651.2"
   y1="135.7"
   x2="1612.1"
   y2="289.3"
   id="line2612" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1654"
   y1="136.4"
   x2="1616.1"
   y2="290.3"
   id="line2613" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1656.8"
   y1="137"
   x2="1620"
   y2="291.1"
   id="line2614" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1659.7"
   y1="137.7"
   x2="1624"
   y2="292.1"
   id="line2615" />
								</g>
								<g
   id="g2619">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1659.8"
   y1="137.8"
   x2="1624.2"
   y2="292.2"
   id="line2616" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1662.7"
   y1="138.5"
   x2="1628.2"
   y2="293.1"
   id="line2617" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1665.5"
   y1="139"
   x2="1632.1"
   y2="293.9"
   id="line2618" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1668.3"
   y1="139.6"
   x2="1636.2"
   y2="294.8"
   id="line2619" />
								</g>
								<g
   id="g2623">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1668.5"
   y1="139.7"
   x2="1636.4"
   y2="294.9"
   id="line2620" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1671.4"
   y1="140.3"
   x2="1640.4"
   y2="295.7"
   id="line2621" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1674.2"
   y1="140.8"
   x2="1644.4"
   y2="296.4"
   id="line2622" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1677.1"
   y1="141.3"
   x2="1648.4"
   y2="297.1"
   id="line2623" />
								</g>
								<g
   id="g2627">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1677.2"
   y1="141.4"
   x2="1648.6"
   y2="297.3"
   id="line2624" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1680.1"
   y1="142"
   x2="1652.7"
   y2="298"
   id="line2625" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1682.9"
   y1="142.3"
   x2="1656.6"
   y2="298.6"
   id="line2626" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1685.8"
   y1="142.8"
   x2="1660.7"
   y2="299.3"
   id="line2627" />
								</g>
								<g
   id="g2631">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1686"
   y1="142.9"
   x2="1660.9"
   y2="299.4"
   id="line2628" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1688.9"
   y1="143.4"
   x2="1665"
   y2="300"
   id="line2629" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1691.7"
   y1="143.7"
   x2="1669"
   y2="300.5"
   id="line2630" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1694.6"
   y1="144.2"
   x2="1673"
   y2="301.1"
   id="line2631" />
								</g>
								<g
   id="g2635">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1694.8"
   y1="144.2"
   x2="1673.3"
   y2="301.2"
   id="line2632" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1697.7"
   y1="144.6"
   x2="1677.3"
   y2="301.8"
   id="line2633" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1700.5"
   y1="144.9"
   x2="1681.3"
   y2="302.2"
   id="line2634" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1703.4"
   y1="145.3"
   x2="1685.4"
   y2="302.7"
   id="line2635" />
								</g>
								<g
   id="g2639">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1703.6"
   y1="145.4"
   x2="1685.7"
   y2="302.8"
   id="line2636" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1706.5"
   y1="145.7"
   x2="1689.7"
   y2="303.2"
   id="line2637" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1709.4"
   y1="145.9"
   x2="1693.7"
   y2="303.5"
   id="line2638" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1712.3"
   y1="146.2"
   x2="1697.8"
   y2="303.9"
   id="line2639" />
								</g>
								<g
   id="g2643">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1712.5"
   y1="146.3"
   x2="1698.1"
   y2="304"
   id="line2640" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1715.4"
   y1="146.5"
   x2="1702.2"
   y2="304.4"
   id="line2641" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1718.2"
   y1="146.6"
   x2="1706.2"
   y2="304.6"
   id="line2642" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1721.1"
   y1="146.9"
   x2="1710.3"
   y2="305"
   id="line2643" />
								</g>
								<g
   id="g2647">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1721.3"
   y1="147"
   x2="1710.5"
   y2="305"
   id="line2644" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1724.2"
   y1="147.2"
   x2="1714.6"
   y2="305.3"
   id="line2645" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1727.1"
   y1="147.2"
   x2="1718.6"
   y2="305.4"
   id="line2646" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1730"
   y1="147.4"
   x2="1722.7"
   y2="305.7"
   id="line2647" />
								</g>
								<g
   id="g2651">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1730.2"
   y1="147.5"
   x2="1722.9"
   y2="305.7"
   id="line2648" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1733.1"
   y1="147.6"
   x2="1727"
   y2="305.9"
   id="line2649" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1736"
   y1="147.6"
   x2="1731"
   y2="306"
   id="line2650" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1738.9"
   y1="147.7"
   x2="1735.1"
   y2="306.1"
   id="line2651" />
								</g>
								<g
   id="g2655">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1739.1"
   y1="147.8"
   x2="1735.4"
   y2="306.2"
   id="line2652" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1742"
   y1="147.9"
   x2="1739.5"
   y2="306.3"
   id="line2653" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1744.9"
   y1="147.8"
   x2="1743.5"
   y2="306.2"
   id="line2654" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1747.8"
   y1="147.8"
   x2="1747.6"
   y2="306.3"
   id="line2655" />
								</g>
								<g
   id="g2659">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1748"
   y1="147.9"
   x2="1747.8"
   y2="306.3"
   id="line2656" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1750.9"
   y1="147.9"
   x2="1752"
   y2="306.3"
   id="line2657" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1753.8"
   y1="147.8"
   x2="1755.9"
   y2="306.2"
   id="line2658" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1756.7"
   y1="147.7"
   x2="1760"
   y2="306.1"
   id="line2659" />
								</g>
								<g
   id="g2663">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1756.9"
   y1="147.8"
   x2="1760.3"
   y2="306.2"
   id="line2660" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1759.9"
   y1="147.7"
   x2="1764.4"
   y2="306.1"
   id="line2661" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1762.7"
   y1="147.6"
   x2="1768.4"
   y2="305.9"
   id="line2662" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1765.6"
   y1="147.4"
   x2="1772.5"
   y2="305.7"
   id="line2663" />
								</g>
								<g
   id="g2667">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1765.8"
   y1="147.5"
   x2="1772.8"
   y2="305.8"
   id="line2664" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1768.7"
   y1="147.4"
   x2="1776.9"
   y2="305.6"
   id="line2665" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1771.6"
   y1="147.1"
   x2="1780.8"
   y2="305.3"
   id="line2666" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1774.5"
   y1="147"
   x2="1785"
   y2="305.1"
   id="line2667" />
								</g>
								<g
   id="g2671">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1774.7"
   y1="147"
   x2="1785.2"
   y2="305.1"
   id="line2668" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1777.6"
   y1="146.8"
   x2="1789.3"
   y2="304.8"
   id="line2669" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1780.4"
   y1="146.5"
   x2="1793.3"
   y2="304.4"
   id="line2670" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1783.4"
   y1="146.3"
   x2="1797.4"
   y2="304.1"
   id="line2671" />
								</g>
								<g
   id="g2675">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1783.5"
   y1="146.3"
   x2="1797.7"
   y2="304.1"
   id="line2672" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1786.4"
   y1="146.1"
   x2="1801.8"
   y2="303.8"
   id="line2673" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1789.3"
   y1="145.7"
   x2="1805.8"
   y2="303.3"
   id="line2674" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1792.1"
   y1="145.4"
   x2="1809.9"
   y2="302.8"
   id="line2675" />
								</g>
								<g
   id="g2679">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1792.3"
   y1="145.4"
   x2="1810.1"
   y2="302.9"
   id="line2676" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1795.2"
   y1="145.1"
   x2="1814.2"
   y2="302.4"
   id="line2677" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1798"
   y1="144.7"
   x2="1818.2"
   y2="301.8"
   id="line2678" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1800.9"
   y1="144.3"
   x2="1822.3"
   y2="301.3"
   id="line2679" />
								</g>
								<g
   id="g2683">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1801.1"
   y1="144.4"
   x2="1822.6"
   y2="301.3"
   id="line2680" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1803.9"
   y1="144"
   x2="1826.7"
   y2="300.8"
   id="line2681" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1806.7"
   y1="143.5"
   x2="1830.7"
   y2="300.1"
   id="line2682" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1809.5"
   y1="143"
   x2="1834.8"
   y2="299.4"
   id="line2683" />
								</g>
								<g
   id="g2687">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1809.7"
   y1="143.1"
   x2="1835.1"
   y2="299.5"
   id="line2684" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1812.6"
   y1="142.6"
   x2="1839.2"
   y2="298.8"
   id="line2685" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1815.3"
   y1="142"
   x2="1843.1"
   y2="298"
   id="line2686" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1818.2"
   y1="141.5"
   x2="1847.2"
   y2="297.2"
   id="line2687" />
								</g>
								<g
   id="g2691">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1818.4"
   y1="141.5"
   x2="1847.5"
   y2="297.3"
   id="line2688" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1821.2"
   y1="141"
   x2="1851.5"
   y2="296.5"
   id="line2689" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1824"
   y1="140.4"
   x2="1855.5"
   y2="295.6"
   id="line2690" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1826.8"
   y1="139.8"
   x2="1859.5"
   y2="294.8"
   id="line2691" />
								</g>
								<g
   id="g2695">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1827"
   y1="139.8"
   x2="1859.8"
   y2="294.8"
   id="line2692" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1829.9"
   y1="139.2"
   x2="1863.8"
   y2="294"
   id="line2693" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1832.6"
   y1="138.5"
   x2="1867.7"
   y2="293"
   id="line2694" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1835.5"
   y1="137.9"
   x2="1871.7"
   y2="292.1"
   id="line2695" />
								</g>
								<g
   id="g2699">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1835.6"
   y1="137.9"
   x2="1872"
   y2="292.1"
   id="line2696" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1838.5"
   y1="137.2"
   x2="1876"
   y2="291.1"
   id="line2697" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1841.2"
   y1="136.4"
   x2="1879.9"
   y2="290.1"
   id="line2698" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1844"
   y1="135.8"
   x2="1883.9"
   y2="289.1"
   id="line2699" />
								</g>
								<g
   id="g2703">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1844.2"
   y1="135.8"
   x2="1884.2"
   y2="289.1"
   id="line2700" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1847"
   y1="135"
   x2="1888.2"
   y2="288"
   id="line2701" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1849.7"
   y1="134.2"
   x2="1892"
   y2="286.9"
   id="line2702" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1852.6"
   y1="133.4"
   x2="1896"
   y2="285.8"
   id="line2703" />
								</g>
								<g
   id="g2707">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1852.7"
   y1="133.4"
   x2="1896.2"
   y2="285.8"
   id="line2704" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1855.5"
   y1="132.6"
   x2="1900.2"
   y2="284.6"
   id="line2705" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1858.2"
   y1="131.7"
   x2="1904"
   y2="283.4"
   id="line2706" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1861"
   y1="130.9"
   x2="1908"
   y2="282.2"
   id="line2707" />
								</g>
								<g
   id="g2711">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1861.2"
   y1="130.9"
   x2="1908.3"
   y2="282.2"
   id="line2708" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1864"
   y1="130"
   x2="1912.2"
   y2="281"
   id="line2709" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1866.7"
   y1="129.1"
   x2="1916"
   y2="279.6"
   id="line2710" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1869.4"
   y1="128.2"
   x2="1919.9"
   y2="278.4"
   id="line2711" />
								</g>
								<g
   id="g2715">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1869.6"
   y1="128.2"
   x2="1920.2"
   y2="278.4"
   id="line2712" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1872.4"
   y1="127.3"
   x2="1924.1"
   y2="277"
   id="line2713" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1875"
   y1="126.2"
   x2="1927.8"
   y2="275.6"
   id="line2714" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1877.8"
   y1="125.3"
   x2="1931.7"
   y2="274.2"
   id="line2715" />
								</g>
								<g
   id="g2719">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1878"
   y1="125.3"
   x2="1932"
   y2="274.2"
   id="line2716" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1880.7"
   y1="124.3"
   x2="1935.9"
   y2="272.8"
   id="line2717" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1883.3"
   y1="123.2"
   x2="1939.6"
   y2="271.3"
   id="line2718" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1886.1"
   y1="122.2"
   x2="1943.4"
   y2="269.8"
   id="line2719" />
								</g>
								<g
   id="g2723">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1886.2"
   y1="122.2"
   x2="1943.7"
   y2="269.8"
   id="line2720" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1889"
   y1="121.1"
   x2="1947.6"
   y2="268.3"
   id="line2721" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1891.6"
   y1="120"
   x2="1951.2"
   y2="266.7"
   id="line2722" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1894.3"
   y1="118.9"
   x2="1955.1"
   y2="265.2"
   id="line2723" />
								</g>
								<g
   id="g2727">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1894.5"
   y1="118.8"
   x2="1955.3"
   y2="265.1"
   id="line2724" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1897.2"
   y1="117.7"
   x2="1959.1"
   y2="263.6"
   id="line2725" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1899.7"
   y1="116.5"
   x2="1962.8"
   y2="261.9"
   id="line2726" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1902.4"
   y1="115.4"
   x2="1966.6"
   y2="260.2"
   id="line2727" />
								</g>
								<g
   id="g2731">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1902.6"
   y1="115.4"
   x2="1966.8"
   y2="260.2"
   id="line2728" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1905.3"
   y1="114.2"
   x2="1970.6"
   y2="258.5"
   id="line2729" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1907.8"
   y1="112.9"
   x2="1974.2"
   y2="256.8"
   id="line2730" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1910.4"
   y1="111.7"
   x2="1977.9"
   y2="255"
   id="line2731" />
								</g>
								<g
   id="g2735">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1910.6"
   y1="111.7"
   x2="1978.2"
   y2="255"
   id="line2732" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1913.3"
   y1="110.4"
   x2="1981.9"
   y2="253.2"
   id="line2733" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1915.8"
   y1="109.1"
   x2="1985.5"
   y2="251.4"
   id="line2734" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1918.4"
   y1="107.8"
   x2="1989.2"
   y2="249.6"
   id="line2735" />
								</g>
								<g
   id="g2739">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1918.6"
   y1="107.8"
   x2="1989.5"
   y2="249.5"
   id="line2736" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1921.2"
   y1="106.5"
   x2="1993.2"
   y2="247.7"
   id="line2737" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1923.7"
   y1="105.1"
   x2="1996.7"
   y2="245.8"
   id="line2738" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1926.3"
   y1="103.8"
   x2="2000.3"
   y2="243.9"
   id="line2739" />
								</g>
								<g
   id="g2743">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1926.5"
   y1="103.8"
   x2="2000.6"
   y2="243.8"
   id="line2740" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1929"
   y1="102.4"
   x2="2004.2"
   y2="241.9"
   id="line2741" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1931.5"
   y1="101"
   x2="2007.7"
   y2="239.9"
   id="line2742" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.2143"
   stroke-miterlimit="10"
   x1="1934.1"
   y1="99.6"
   x2="2011.3"
   y2="237.9"
   id="line2743" />
								</g>
							</g>
						</g>
					</g>
				</g>
				
					<path
   id="Fill_00000173873701737472568330000003717709398749269410_"
   ref={collarDrop}
   className="st0" 
   fill={getFillValue('collar')} 
   style={{
	 ...getDropZoneStyle(isCollarOver, canCollarDrop),
	 cursor: collarUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(collarUploadedPattern || '', 'collar')}
	stroke="#231F20"
   stroke-width="1.9218"
   stroke-miterlimit="10"
   d="      M1587,211.7c13.8-8.2,27.6-16.4,41.4-24.6c0.9,10.9,3.9,29.6,15.1,49.6c17.5,31.3,43.4,45.3,49.2,48.3      c5.3,2.7,33.8,16.9,71.7,11.6c7.6-1.1,29.2-4.3,50.5-19c44-30.3,49.3-83.9,50.1-92.7c14.1,9.3,28.2,18.7,42.3,28      c-2.1,12.6-6.7,31.6-18.1,52.2c-5.8,10.4-17.5,31-41,47.9c-23.4,16.8-45.9,20.9-66.1,24.6c-14.6,2.7-42.1,7.4-76.4,0      c-14.5-3.1-43.3-9.3-69.9-31.9C1596.6,272.5,1588.9,226.2,1587,211.7z" />
				<g
   id="Rib_Sketch">
					<defs
   id="defs2746">
						<path
   id="SVGID_00000134951662611813916060000008179734844053714078_"
   d="M1588.2,211.5c13.8-8.2,27.6-16.4,41.4-24.6        c0.9,10.9,3.9,29.6,15.1,49.6c17.5,31.3,43.4,45.3,49.2,48.3c5.3,2.7,33.8,16.9,71.7,11.6c7.6-1.1,29.2-4.3,50.5-19        c44-30.3,49.3-83.9,50.1-92.7c14.1,9.3,28.2,18.7,42.3,28c-2.1,12.6-6.7,31.6-18.1,52.2c-5.8,10.4-17.5,31-41,47.9        c-23.4,16.8-45.9,20.9-66.1,24.6c-14.6,2.7-42.1,7.4-76.4,0c-14.5-3.1-43.3-9.3-69.9-31.9        C1597.8,272.2,1590,225.9,1588.2,211.5z" />
					</defs>
					<clipPath
   id="SVGID_00000103241004862030517130000016287737043273317275_">
						<use
   xlinkHref="#SVGID_00000134951662611813916060000008179734844053714078_"
   overflow="visible"
   id="use2746" />
					</clipPath>
					<g
   clip-path="url(#SVGID_00000103241004862030517130000016287737043273317275_)"
   id="g2976">
						<g
   id="g2975">
							<g
   id="g2974">
								<g
   id="g2749">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1857.5"
   y1="142.3"
   x2="1849.6"
   y2="75.5"
   id="line2746" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1853.4"
   y1="142.8"
   x2="1845.5"
   y2="75.9"
   id="line2747" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1849.4"
   y1="143.3"
   x2="1841.5"
   y2="76.5"
   id="line2748" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1845.3"
   y1="143.8"
   x2="1837.4"
   y2="76.9"
   id="line2749" />
								</g>
								<g
   id="g2753">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1844.9"
   y1="143.8"
   x2="1837"
   y2="76.9"
   id="line2750" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1840.8"
   y1="144.3"
   x2="1832.9"
   y2="77.4"
   id="line2751" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1836.8"
   y1="144.8"
   x2="1828.9"
   y2="77.9"
   id="line2752" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1832.7"
   y1="145.3"
   x2="1824.8"
   y2="78.4"
   id="line2753" />
								</g>
								<g
   id="g2757">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1832.3"
   y1="145.3"
   x2="1824.5"
   y2="78.4"
   id="line2754" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1828.2"
   y1="145.8"
   x2="1820.4"
   y2="78.9"
   id="line2755" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1824.3"
   y1="146.3"
   x2="1816.4"
   y2="79.4"
   id="line2756" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1820.2"
   y1="146.8"
   x2="1812.3"
   y2="79.9"
   id="line2757" />
								</g>
								<g
   id="g2761">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1819.8"
   y1="146.8"
   x2="1811.9"
   y2="79.9"
   id="line2758" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1815.7"
   y1="147.3"
   x2="1807.8"
   y2="80.4"
   id="line2759" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1811.7"
   y1="147.8"
   x2="1803.8"
   y2="80.9"
   id="line2760" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1807.6"
   y1="148.2"
   x2="1799.7"
   y2="81.4"
   id="line2761" />
								</g>
								<g
   id="g2765">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1807.2"
   y1="148.3"
   x2="1799.3"
   y2="81.4"
   id="line2762" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1803.1"
   y1="148.7"
   x2="1795.2"
   y2="81.9"
   id="line2763" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1799.1"
   y1="149.3"
   x2="1791.2"
   y2="82.4"
   id="line2764" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1795"
   y1="149.7"
   x2="1787.1"
   y2="82.9"
   id="line2765" />
								</g>
								<g
   id="g2769">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1794.6"
   y1="149.7"
   x2="1786.7"
   y2="82.9"
   id="line2766" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1790.5"
   y1="150.2"
   x2="1782.6"
   y2="83.4"
   id="line2767" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1786.5"
   y1="150.7"
   x2="1778.7"
   y2="83.9"
   id="line2768" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1782.4"
   y1="151.2"
   x2="1774.5"
   y2="84.3"
   id="line2769" />
								</g>
								<g
   id="g2773">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1782.1"
   y1="151.2"
   x2="1774.2"
   y2="84.4"
   id="line2770" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1777.9"
   y1="151.7"
   x2="1770.1"
   y2="84.8"
   id="line2771" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1774"
   y1="152.2"
   x2="1766.1"
   y2="85.4"
   id="line2772" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1769.9"
   y1="152.7"
   x2="1762"
   y2="85.8"
   id="line2773" />
								</g>
								<g
   id="g2777">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1769.5"
   y1="152.7"
   x2="1761.6"
   y2="85.9"
   id="line2774" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1765.4"
   y1="153.2"
   x2="1757.5"
   y2="86.3"
   id="line2775" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1761.4"
   y1="153.7"
   x2="1753.5"
   y2="86.8"
   id="line2776" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1757.3"
   y1="154.2"
   x2="1749.4"
   y2="87.3"
   id="line2777" />
								</g>
								<g
   id="g2781">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1756.9"
   y1="154.2"
   x2="1749"
   y2="87.3"
   id="line2778" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1752.8"
   y1="154.7"
   x2="1744.9"
   y2="87.8"
   id="line2779" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1748.8"
   y1="155.2"
   x2="1740.9"
   y2="88.3"
   id="line2780" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1744.7"
   y1="155.7"
   x2="1736.8"
   y2="88.8"
   id="line2781" />
								</g>
								<g
   id="g2785">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1744.3"
   y1="155.7"
   x2="1736.4"
   y2="88.8"
   id="line2782" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1740.2"
   y1="156.2"
   x2="1732.3"
   y2="89.3"
   id="line2783" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1736.2"
   y1="156.7"
   x2="1728.4"
   y2="89.8"
   id="line2784" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1732.1"
   y1="157.1"
   x2="1724.3"
   y2="90.3"
   id="line2785" />
								</g>
								<g
   id="g2789">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1731.8"
   y1="157.2"
   x2="1723.9"
   y2="90.3"
   id="line2786" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1727.7"
   y1="157.6"
   x2="1719.8"
   y2="90.8"
   id="line2787" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1723.7"
   y1="158.2"
   x2="1715.8"
   y2="91.3"
   id="line2788" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1719.6"
   y1="158.6"
   x2="1711.7"
   y2="91.8"
   id="line2789" />
								</g>
								<g
   id="g2793">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1719.2"
   y1="158.6"
   x2="1711.3"
   y2="91.8"
   id="line2790" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1715.1"
   y1="159.1"
   x2="1707.2"
   y2="92.3"
   id="line2791" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1711.1"
   y1="159.6"
   x2="1703.2"
   y2="92.8"
   id="line2792" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1707"
   y1="160.1"
   x2="1699.1"
   y2="93.3"
   id="line2793" />
								</g>
								<g
   id="g2797">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1706.6"
   y1="160.1"
   x2="1698.7"
   y2="93.3"
   id="line2794" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1702.5"
   y1="160.6"
   x2="1694.6"
   y2="93.7"
   id="line2795" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1698.5"
   y1="161.1"
   x2="1690.6"
   y2="94.3"
   id="line2796" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1694.4"
   y1="161.6"
   x2="1686.5"
   y2="94.7"
   id="line2797" />
								</g>
								<g
   id="g2801">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1694"
   y1="161.6"
   x2="1686.2"
   y2="94.8"
   id="line2798" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1689.9"
   y1="162.1"
   x2="1682"
   y2="95.2"
   id="line2799" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1686"
   y1="162.6"
   x2="1678.1"
   y2="95.7"
   id="line2800" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1681.8"
   y1="163.1"
   x2="1674"
   y2="96.2"
   id="line2801" />
								</g>
								<g
   id="g2805">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1681.5"
   y1="163.1"
   x2="1673.6"
   y2="96.2"
   id="line2802" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1677.4"
   y1="163.6"
   x2="1669.5"
   y2="96.7"
   id="line2803" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1673.4"
   y1="164.1"
   x2="1665.5"
   y2="97.2"
   id="line2804" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1669.3"
   y1="164.6"
   x2="1661.4"
   y2="97.7"
   id="line2805" />
								</g>
								<g
   id="g2809">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1668.9"
   y1="164.6"
   x2="1661"
   y2="97.7"
   id="line2806" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1664.8"
   y1="165.1"
   x2="1656.9"
   y2="98.2"
   id="line2807" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1660.8"
   y1="165.6"
   x2="1652.9"
   y2="98.7"
   id="line2808" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1656.7"
   y1="166"
   x2="1648.8"
   y2="99.2"
   id="line2809" />
								</g>
								<g
   id="g2813">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1656.3"
   y1="166.1"
   x2="1648.4"
   y2="99.2"
   id="line2810" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1652.2"
   y1="166.5"
   x2="1644.3"
   y2="99.7"
   id="line2811" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1648.2"
   y1="167.1"
   x2="1640.3"
   y2="100.2"
   id="line2812" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1644.1"
   y1="167.5"
   x2="1636.2"
   y2="100.7"
   id="line2813" />
								</g>
								<g
   id="g2817">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1643.8"
   y1="167.5"
   x2="1635.9"
   y2="100.7"
   id="line2814" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1639.6"
   y1="168"
   x2="1631.8"
   y2="101.2"
   id="line2815" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1635.7"
   y1="168.5"
   x2="1627.8"
   y2="101.7"
   id="line2816" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1631.6"
   y1="169"
   x2="1623.7"
   y2="102.2"
   id="line2817" />
								</g>
								<g
   id="g2821">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1631.4"
   y1="169.2"
   x2="1565.8"
   y2="184.7"
   id="line2818" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1632.3"
   y1="172.9"
   x2="1566.9"
   y2="189"
   id="line2819" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1633.2"
   y1="176.5"
   x2="1567.9"
   y2="193.1"
   id="line2820" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1634.1"
   y1="180.2"
   x2="1569"
   y2="197.4"
   id="line2821" />
								</g>
								<g
   id="g2825">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1634.2"
   y1="180.5"
   x2="1569.1"
   y2="197.8"
   id="line2822" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1635.2"
   y1="184.2"
   x2="1570.3"
   y2="202.1"
   id="line2823" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1636.2"
   y1="187.7"
   x2="1571.5"
   y2="206.2"
   id="line2824" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1637.3"
   y1="191.4"
   x2="1572.7"
   y2="210.5"
   id="line2825" />
								</g>
								<g
   id="g2829">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1637.3"
   y1="191.7"
   x2="1572.8"
   y2="210.9"
   id="line2826" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1638.4"
   y1="195.3"
   x2="1574.1"
   y2="215.1"
   id="line2827" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1639.6"
   y1="198.8"
   x2="1575.4"
   y2="219.2"
   id="line2828" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1640.7"
   y1="202.4"
   x2="1576.8"
   y2="223.5"
   id="line2829" />
								</g>
								<g
   id="g2833">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1640.8"
   y1="202.8"
   x2="1576.9"
   y2="223.9"
   id="line2830" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1642"
   y1="206.4"
   x2="1578.2"
   y2="228"
   id="line2831" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1643.3"
   y1="210.2"
   x2="1579.6"
   y2="231.8"
   id="line2832" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1644.6"
   y1="214"
   x2="1580.9"
   y2="235.8"
   id="line2833" />
								</g>
								<g
   id="g2837">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1644.7"
   y1="214.3"
   x2="1581"
   y2="236.2"
   id="line2834" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1646"
   y1="218"
   x2="1582.5"
   y2="240.3"
   id="line2835" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1647.3"
   y1="221.5"
   x2="1583.9"
   y2="244.3"
   id="line2836" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1648.6"
   y1="225"
   x2="1585.5"
   y2="248.5"
   id="line2837" />
								</g>
								<g
   id="g2841">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1648.7"
   y1="225.4"
   x2="1585.6"
   y2="248.9"
   id="line2838" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1650"
   y1="228.8"
   x2="1587.2"
   y2="253.2"
   id="line2839" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1651.3"
   y1="232"
   x2="1588.9"
   y2="257.3"
   id="line2840" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1652.6"
   y1="235.3"
   x2="1590.7"
   y2="261.7"
   id="line2841" />
								</g>
								<g
   id="g2845">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1652.7"
   y1="235.6"
   x2="1590.8"
   y2="262.1"
   id="line2842" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1654.1"
   y1="238.7"
   x2="1592.8"
   y2="266.5"
   id="line2843" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1655.5"
   y1="241.6"
   x2="1594.8"
   y2="270.8"
   id="line2844" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1657"
   y1="244.6"
   x2="1597"
   y2="275.2"
   id="line2845" />
								</g>
								<g
   id="g2849">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1657.1"
   y1="244.9"
   x2="1597.2"
   y2="275.6"
   id="line2846" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1658.6"
   y1="247.7"
   x2="1599.5"
   y2="280"
   id="line2847" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1660.1"
   y1="250.4"
   x2="1602"
   y2="284.3"
   id="line2848" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1661.7"
   y1="253.1"
   x2="1604.6"
   y2="288.7"
   id="line2849" />
								</g>
								<g
   id="g2853">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1661.9"
   y1="253.4"
   x2="1604.8"
   y2="289.1"
   id="line2850" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1663.5"
   y1="256"
   x2="1607.6"
   y2="293.4"
   id="line2851" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1665.3"
   y1="258.4"
   x2="1610.4"
   y2="297.5"
   id="line2852" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1667.1"
   y1="260.9"
   x2="1613.5"
   y2="301.6"
   id="line2853" />
								</g>
								<g
   id="g2857">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1667.3"
   y1="261.1"
   x2="1613.7"
   y2="302"
   id="line2854" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1669.2"
   y1="263.6"
   x2="1616.9"
   y2="306"
   id="line2855" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1671.1"
   y1="265.8"
   x2="1620.2"
   y2="309.9"
   id="line2856" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1673.1"
   y1="268.1"
   x2="1623.6"
   y2="313.8"
   id="line2857" />
								</g>
								<g
   id="g2861">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1673.3"
   y1="268.3"
   x2="1623.9"
   y2="314.1"
   id="line2858" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1675.3"
   y1="270.5"
   x2="1627.6"
   y2="317.9"
   id="line2859" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1677.4"
   y1="272.4"
   x2="1631.3"
   y2="321.5"
   id="line2860" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1679.6"
   y1="274.4"
   x2="1635.2"
   y2="325.1"
   id="line2861" />
								</g>
								<g
   id="g2865">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1679.7"
   y1="274.6"
   x2="1635.6"
   y2="325.4"
   id="line2862" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1681.9"
   y1="276.4"
   x2="1639.7"
   y2="328.8"
   id="line2863" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1684.2"
   y1="278.1"
   x2="1643.8"
   y2="332"
   id="line2864" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1686.6"
   y1="279.9"
   x2="1648.1"
   y2="335.1"
   id="line2865" />
								</g>
								<g
   id="g2869">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1686.8"
   y1="280"
   x2="1648.4"
   y2="335.4"
   id="line2866" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1689.4"
   y1="281.8"
   x2="1652.7"
   y2="338.2"
   id="line2867" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1692.1"
   y1="283.4"
   x2="1656.8"
   y2="340.7"
   id="line2868" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1694.6"
   y1="284.9"
   x2="1661.3"
   y2="343.5"
   id="line2869" />
								</g>
								<g
   id="g2873">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1694.8"
   y1="285.1"
   x2="1661.8"
   y2="343.8"
   id="line2870" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1697.3"
   y1="286.4"
   x2="1666.5"
   y2="346.3"
   id="line2871" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1699.7"
   y1="287.6"
   x2="1671.3"
   y2="348.6"
   id="line2872" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1702.2"
   y1="288.7"
   x2="1676.3"
   y2="350.8"
   id="line2873" />
								</g>
								<g
   id="g2877">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1702.4"
   y1="288.8"
   x2="1676.8"
   y2="351"
   id="line2874" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1705"
   y1="289.8"
   x2="1681.9"
   y2="353"
   id="line2875" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1707.5"
   y1="290.6"
   x2="1687"
   y2="354.7"
   id="line2876" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1710.1"
   y1="291.4"
   x2="1692.3"
   y2="356.3"
   id="line2877" />
								</g>
								<g
   id="g2881">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1710.3"
   y1="291.5"
   x2="1692.7"
   y2="356.5"
   id="line2878" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1712.9"
   y1="292.2"
   x2="1698.1"
   y2="357.8"
   id="line2879" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1715.6"
   y1="292.7"
   x2="1703.3"
   y2="358.8"
   id="line2880" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1718.4"
   y1="293.1"
   x2="1708.6"
   y2="359.7"
   id="line2881" />
								</g>
								<g
   id="g2885">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1718.7"
   y1="293.2"
   x2="1709.1"
   y2="359.8"
   id="line2882" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1721.6"
   y1="293.6"
   x2="1714.3"
   y2="360.5"
   id="line2883" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1724.5"
   y1="293.8"
   x2="1719.3"
   y2="360.9"
   id="line2884" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1727.7"
   y1="294"
   x2="1724.4"
   y2="361.3"
   id="line2885" />
								</g>
								<g
   id="g2889">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1728"
   y1="294.1"
   x2="1724.8"
   y2="361.3"
   id="line2886" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1731.3"
   y1="294.2"
   x2="1729.7"
   y2="361.5"
   id="line2887" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1734.8"
   y1="294.2"
   x2="1734.2"
   y2="361.5"
   id="line2888" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1738.6"
   y1="294.2"
   x2="1738.7"
   y2="361.5"
   id="line2889" />
								</g>
								<g
   id="g2893">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1739"
   y1="294.2"
   x2="1739.1"
   y2="361.6"
   id="line2890" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1742.8"
   y1="294.2"
   x2="1743.4"
   y2="361.6"
   id="line2891" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1746.3"
   y1="294.1"
   x2="1748"
   y2="361.4"
   id="line2892" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1749.6"
   y1="294"
   x2="1752.9"
   y2="361.3"
   id="line2893" />
								</g>
								<g
   id="g2897">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1749.9"
   y1="294"
   x2="1753.3"
   y2="361.3"
   id="line2894" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1753"
   y1="293.8"
   x2="1758.4"
   y2="360.9"
   id="line2895" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1756"
   y1="293.5"
   x2="1763.4"
   y2="360.4"
   id="line2896" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1759"
   y1="293.1"
   x2="1768.5"
   y2="359.8"
   id="line2897" />
								</g>
								<g
   id="g2901">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1759.3"
   y1="293.1"
   x2="1769"
   y2="359.7"
   id="line2898" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1762.3"
   y1="292.6"
   x2="1774.1"
   y2="358.9"
   id="line2899" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1765.2"
   y1="292"
   x2="1779.1"
   y2="357.9"
   id="line2900" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1768.1"
   y1="291.4"
   x2="1784.2"
   y2="356.8"
   id="line2901" />
								</g>
								<g
   id="g2905">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1768.4"
   y1="291.3"
   x2="1784.6"
   y2="356.7"
   id="line2902" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1771.3"
   y1="290.6"
   x2="1789.7"
   y2="355.3"
   id="line2903" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1774.1"
   y1="289.7"
   x2="1794.5"
   y2="353.8"
   id="line2904" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1777"
   y1="288.7"
   x2="1799.4"
   y2="352.2"
   id="line2905" />
								</g>
								<g
   id="g2909">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1777.2"
   y1="288.6"
   x2="1799.9"
   y2="352"
   id="line2906" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1780.1"
   y1="287.6"
   x2="1804.7"
   y2="350.2"
   id="line2907" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1782.9"
   y1="286.4"
   x2="1809.3"
   y2="348.3"
   id="line2908" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1785.8"
   y1="285.1"
   x2="1813.9"
   y2="346.3"
   id="line2909" />
								</g>
								<g
   id="g2913">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1786.2"
   y1="285"
   x2="1814.3"
   y2="346.2"
   id="line2910" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1789.6"
   y1="283.4"
   x2="1818.3"
   y2="344.3"
   id="line2911" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1792.6"
   y1="281.9"
   x2="1822.4"
   y2="342.3"
   id="line2912" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1795.5"
   y1="280.5"
   x2="1826.9"
   y2="340"
   id="line2913" />
								</g>
								<g
   id="g2917">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1795.7"
   y1="280.3"
   x2="1827.4"
   y2="339.8"
   id="line2914" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1798.3"
   y1="278.9"
   x2="1832"
   y2="337.2"
   id="line2915" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1800.7"
   y1="277.5"
   x2="1836.4"
   y2="334.5"
   id="line2916" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1803"
   y1="276"
   x2="1841"
   y2="331.5"
   id="line2917" />
								</g>
								<g
   id="g2921">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1803.2"
   y1="275.8"
   x2="1841.5"
   y2="331.2"
   id="line2918" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1805.4"
   y1="274.3"
   x2="1845.9"
   y2="328"
   id="line2919" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1807.4"
   y1="272.6"
   x2="1850.1"
   y2="324.6"
   id="line2920" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1809.5"
   y1="270.8"
   x2="1854.3"
   y2="321.1"
   id="line2921" />
								</g>
								<g
   id="g2925">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1809.7"
   y1="270.7"
   x2="1854.7"
   y2="320.8"
   id="line2922" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1811.7"
   y1="268.8"
   x2="1858.7"
   y2="317"
   id="line2923" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1813.6"
   y1="266.8"
   x2="1862.4"
   y2="313.3"
   id="line2924" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1815.6"
   y1="264.7"
   x2="1866"
   y2="309.3"
   id="line2925" />
								</g>
								<g
   id="g2929">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1815.8"
   y1="264.5"
   x2="1866.3"
   y2="309"
   id="line2926" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1817.6"
   y1="262.4"
   x2="1869.8"
   y2="304.9"
   id="line2927" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1819.2"
   y1="260.3"
   x2="1873.1"
   y2="300.6"
   id="line2928" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1820.8"
   y1="258"
   x2="1876.2"
   y2="296.2"
   id="line2929" />
								</g>
								<g
   id="g2933">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1821"
   y1="257.8"
   x2="1876.5"
   y2="295.8"
   id="line2930" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1822.7"
   y1="255.2"
   x2="1879.4"
   y2="291.6"
   id="line2931" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1824.3"
   y1="252.6"
   x2="1881.9"
   y2="287.4"
   id="line2932" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1826"
   y1="249.7"
   x2="1884.5"
   y2="283.1"
   id="line2933" />
								</g>
								<g
   id="g2937">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1826.2"
   y1="249.5"
   x2="1884.7"
   y2="282.7"
   id="line2934" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1827.8"
   y1="246.6"
   x2="1887.1"
   y2="278.5"
   id="line2935" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1829.3"
   y1="243.6"
   x2="1889.2"
   y2="274.3"
   id="line2936" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1830.8"
   y1="240.5"
   x2="1891.3"
   y2="270"
   id="line2937" />
								</g>
								<g
   id="g2941">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1831"
   y1="240.2"
   x2="1891.6"
   y2="269.7"
   id="line2938" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1832.5"
   y1="237.1"
   x2="1893.6"
   y2="265.4"
   id="line2939" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1833.9"
   y1="233.9"
   x2="1895.4"
   y2="261.3"
   id="line2940" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1835.3"
   y1="230.6"
   x2="1897.3"
   y2="257"
   id="line2941" />
								</g>
								<g
   id="g2945">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1835.5"
   y1="230.3"
   x2="1897.5"
   y2="256.6"
   id="line2942" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1836.9"
   y1="227"
   x2="1899.3"
   y2="252.3"
   id="line2943" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1838.1"
   y1="223.7"
   x2="1900.9"
   y2="248.2"
   id="line2944" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1839.5"
   y1="220.3"
   x2="1902.5"
   y2="243.9"
   id="line2945" />
								</g>
								<g
   id="g2949">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1839.6"
   y1="220"
   x2="1902.7"
   y2="243.5"
   id="line2946" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1840.8"
   y1="216.5"
   x2="1904.2"
   y2="239.3"
   id="line2947" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1842"
   y1="213.2"
   x2="1905.7"
   y2="235.1"
   id="line2948" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1843.2"
   y1="209.7"
   x2="1907.1"
   y2="230.8"
   id="line2949" />
								</g>
								<g
   id="g2953">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1843.3"
   y1="209.3"
   x2="1907.3"
   y2="230.4"
   id="line2950" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1844.5"
   y1="205.8"
   x2="1908.7"
   y2="226.1"
   id="line2951" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1845.5"
   y1="202.4"
   x2="1909.9"
   y2="221.8"
   id="line2952" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1846.5"
   y1="198.8"
   x2="1911.2"
   y2="217.5"
   id="line2953" />
								</g>
								<g
   id="g2957">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1846.7"
   y1="198.5"
   x2="1911.4"
   y2="217.1"
   id="line2954" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1847.7"
   y1="195"
   x2="1912.6"
   y2="212.8"
   id="line2955" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1848.6"
   y1="191.5"
   x2="1913.7"
   y2="208.5"
   id="line2956" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1849.5"
   y1="187.8"
   x2="1914.8"
   y2="204.2"
   id="line2957" />
								</g>
								<g
   id="g2961">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1849.6"
   y1="187.5"
   x2="1914.9"
   y2="203.8"
   id="line2958" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1850.5"
   y1="183.9"
   x2="1916"
   y2="199.4"
   id="line2959" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1851.3"
   y1="180.4"
   x2="1916.9"
   y2="195.1"
   id="line2960" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1852.1"
   y1="176.7"
   x2="1917.9"
   y2="190.8"
   id="line2961" />
								</g>
								<g
   id="g2965">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1852.2"
   y1="176.4"
   x2="1918"
   y2="190.4"
   id="line2962" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1852.9"
   y1="172.7"
   x2="1918.9"
   y2="186"
   id="line2963" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1853.6"
   y1="169.1"
   x2="1919.7"
   y2="181.7"
   id="line2964" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1854.3"
   y1="165.4"
   x2="1920.6"
   y2="177.3"
   id="line2965" />
								</g>
								<g
   id="g2969">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1854.4"
   y1="165.1"
   x2="1920.7"
   y2="176.9"
   id="line2966" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1855"
   y1="161.4"
   x2="1921.4"
   y2="172.5"
   id="line2967" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1855.6"
   y1="157.7"
   x2="1922.1"
   y2="168.2"
   id="line2968" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1856.1"
   y1="154"
   x2="1922.8"
   y2="163.8"
   id="line2969" />
								</g>
								<g
   id="g2973">
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1856.2"
   y1="153.7"
   x2="1922.8"
   y2="163.4"
   id="line2970" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1856.8"
   y1="149.9"
   x2="1923.5"
   y2="159"
   id="line2971" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1857.2"
   y1="146.3"
   x2="1924"
   y2="154.8"
   id="line2972" />
									
										<line
   fill="#FFFFFF"
   stroke="#000000"
   stroke-width="0.373"
   stroke-miterlimit="10"
   x1="1857.7"
   y1="142.5"
   x2="1924.5"
   y2="150.4"
   id="line2973" />
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g>
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
export default SweaterSVG;
