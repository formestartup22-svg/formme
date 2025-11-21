
import React, { useState, useRef } from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { useTshirtDrop } from '@/hooks/useTshirtDrop';
import InteractivePatternEditor from '../InteractivePatternEditor';
import SVGButtonElement from '../SVGButtonElement';
import TShirt3d from '../3d/TShirt3d'; // Create this next

interface FemaleStripesTshirtSVGProps {
  className?: string;
  bodyColor?: string;
  sleevesColor?: string;
  collarColor?: string;
  stripesColor?: string;
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

const FemaleStripesTshirtSVG = ({ 
  className = "", 
  bodyColor = "#ffffff",
  sleevesColor = "#ffffff", 
  collarColor = "#ffffff",
  stripesColor = "#ffffff",
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
}: FemaleStripesTshirtSVGProps) => {
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
  const getFillValue = (part: 'body' | 'sleeves' | 'collar' | 'stripes') => {
    const color = part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : part === 'collar' ? collarColor : stripesColor;

	console.warn('what is the color', color);

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

    console.warn("✅ stripes fill:", getFillValue('stripes'));


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
          
          <style type="text/css">
	{`.st0{stroke:#000000;stroke-width:2.1073;stroke-miterlimit:10;}
	.st1{clip-path:url(#Sleve_00000158712276868057120700000013279235466885886873_);}
	
		.st2{fill:none;stroke:#030408;stroke-width:1.2065;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:2.4178,4.8297;}
	.st3{fill:none;stroke:#030408;stroke-width:0.56;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st4{opacity:0.2;clip-path:url(#Sleve_00000158712276868057120700000013279235466885886873_);}
	.st5{clip-path:url(#No_Fill_00000031897805380020581970000008507893665092417681_);}
	.st6{opacity:0.2;clip-path:url(#No_Fill_00000031897805380020581970000008507893665092417681_);}
	.st7{opacity:0.2;clip-path:url(#No_Fil_00000145037873714540547370000007522102286931104443_);}
	.st8{clip-path:url(#SVGID_00000144296894558322374960000009996896161657873560_);}
	.st9{fill:none;stroke:#030408;stroke-width:0.9531;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
	.st10{fill:#FFFFFF;}
	.st11{stroke:#000000;stroke-width:1.0537;stroke-miterlimit:10;}
	.st12{clip-path:url(#SVGID_00000067215315858348056530000012258403085820834738_);}
	
		.st13{fill:none;stroke:#030408;stroke-width:1.1146;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:2.2336,4.4618;}
	.st14{}
	.st15{fill:#030408;}
	
		.st16{fill:none;stroke:#030408;stroke-width:1.1672;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:2.339,4.6724;}
	.st17{fill:#FFFFFF;stroke:#000000;stroke-width:0.819;stroke-miterlimit:10;}
	.st18{fill:#0F1B3C;}
	.st19{fill:#A91C2B;}
	.st20{opacity:0.15;clip-path:url(#No_full_00000054955956055663218140000014809969927194101145_);}
	.st21{clip-path:url(#No_full_00000054955956055663218140000014809969927194101145_);}
	.st22{opacity:0.15;clip-path:url(#SVGID_00000142138209084042761220000005444289607279857590_);}
	.st23{clip-path:url(#SVGID_00000142138209084042761220000005444289607279857590_);}
	.st24{opacity:0.2;clip-path:url(#SVGID_00000134930169335745138490000013510058831644295100_);}
	.st25{fill:#606060;}
	.st26{clip-path:url(#SVGID_00000134930169335745138490000013510058831644295100_);}
	
		.st27{fill:none;stroke:#030408;stroke-width:1.1664;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:5.3235,5.3235;}
`}
</style>
</defs>
<g transform="scale(1) translate(-1100, 100)">

<g id="Front_00000069361865712188558700000007863281467138838424_">
	<g id="Right_Sleeve">
		<path id="fILL" className="st0"    ref={sleevesDrop}
   fill={getFillValue('sleeves')} 
   style={{
	 ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
	 cursor: sleevesUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
	d="M2040.3,211.9c4.2,1.5,5.7,1.5,9.3,3.1c8.3,3.8,17.3,9.5,22.3,12.7c11.5,7.4,22.7,14.8,31.6,28.4
			c4.6,7.1,6.9,13.2,9.5,21.1c8.9,26.4,13.3,39.7,16.9,58c11.8,60.6,30.1,87.7,51.6,190.7c3.5,16.6,6,30,7.4,37.9
			c-18.1,8-40.8,13.6-61.3,21c-41.6,15-78,25.3-113.6,35.9c-2.8-12.6-4.7-25.4-7.6-38c-5.1-14.4-6.2-50.2-10.5-67.4
			c-5.5-21.5-14.8-25-17.7-50.5c-12.4-109,12.2-198.3,31.6-250.8C2020,213.3,2030.2,212.6,2040.3,211.9z"/>
		<g>
			<defs>
				<path id="Sleve_00000102513008267674842310000012589754252504231077_" d="M2040.3,212.3c4.2,1.5,5.7,1.5,9.3,3.1
					c8.3,3.8,17.3,9.5,22.3,12.7c11.5,7.4,22.7,14.8,31.6,28.4c4.6,7.1,6.9,13.2,9.5,21.1c8.9,26.4,13.3,39.7,16.9,58
					c11.8,60.6,30.1,87.7,51.6,190.7c3.5,16.6,6,30,7.4,37.9c-18.1,8-40.8,13.6-61.3,21c-41.6,15-78,25.3-113.6,35.9
					c-2.8-12.6-4.7-25.4-7.6-38c-5.1-14.4-6.2-50.2-10.5-67.4c-5.5-21.5-14.8-25-17.7-50.5c-12.4-109,12.2-198.3,31.6-250.8
					C2020,213.7,2030.1,213,2040.3,212.3z"/>
			</defs>
			<clipPath id="Sleve_00000010304851573280564030000010800365476502305685_">
				<use xlinkHref="#Sleve_00000102513008267674842310000012589754252504231077_"  style={{overflow:"visible"}}/>
			</clipPath>
			
				<g id="Stitch_00000016759372819090438890000016800931599595585959_" style={{clipPath:"url(#Sleve_00000010304851573280564030000010800365476502305685_)"}}>
				<line className="st2" x1="2013.5" y1="598.5" x2="2179.7" y2="541.9"/>
				<line className="st2" x1="2013.4" y1="592.7" x2="2179.6" y2="536.1"/>
				<path className="st3" d="M2029,423.2c17.3-33.3,46.5-71.6,53.2-109.1"/>
				<path className="st3" d="M2018,447.2c19.5,8.7,61.5-41.6,73.6-53.2"/>
			</g>
			
				<g id="Strips_Sleeve_00000017478647270645675410000007350307388719831730_" fill={getFillValue('stripes')} style={{opacity:"0.2", clipPath:"url(#Sleve_00000010304851573280564030000010800365476502305685_)"}}>
				<rect x="965.6" y="504" width="1572.2" height="11.8"/>
				<rect x="965.6" y="535.1" width="1572.2" height="11.8"/>
				<rect x="965.5" y="447.4" width="1572.2" height="11.8"/>
				<rect x="965.5" y="478.6" width="1572.2" height="11.8"/>
				<rect x="965.8" y="566.2" width="1572.2" height="11.8"/>
				<rect x="965.8" y="594.4" width="1572.2" height="11.8"/>
				<rect x="964.5" y="268.8" width="1572.2" height="11.8"/>
				<rect x="964.5" y="299.9" width="1572.2" height="11.8"/>
				<rect x="964.4" y="212.2" width="1572.2" height="11.8"/>
				<rect x="964.4" y="243.4" width="1572.2" height="11.8"/>
				<rect x="964.9" y="387.6" width="1572.2" height="11.8"/>
				<rect x="964.9" y="418.7" width="1572.2" height="11.8"/>
				<rect x="964.8" y="331" width="1572.2" height="11.8"/>
				<rect x="964.8" y="362.2" width="1572.2" height="11.8"/>
			</g>
		</g>
	</g>
	<g id="Left_Slevee">
		<path id="Fill_00000170278845452519251860000004110735970248738223_" className="st0"    ref={sleevesDrop}
   fill={getFillValue('sleeves')} 
   style={{
	 ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
	 cursor: sleevesUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
 d="M1414.3,214c0.5-1.7-19.4,4.3-34.8,14.8
			c-11.3,7.7-22.7,14.8-31.6,28.4c-4.6,7.1-6.9,13.2-9.5,21.1c-8.9,26.4-13.3,39.7-16.9,58c-11.8,60.6-30.1,87.7-51.6,190.7
			c-3.5,16.6-6,30-7.4,37.9c18.1,8,40.8,13.6,61.3,21c41.6,15,78,25.3,113.6,35.9c2.8-12.6,4.7-25.4,7.6-38
			c5.1-14.4,6.2-50.2,10.5-67.4c5.5-21.5,14.8-25,17.7-50.5c12.4-109-12.2-198.3-31.6-250.8C1431.5,214.4,1424.5,214.7,1414.3,214z"
			/>
		<g id="Sleve">
			<defs>
				<path id="No_Fill" d="M1415,213.3c0.5-1.7-19.4,4.3-34.8,14.8c-11.3,7.7-22.7,14.8-31.6,28.4c-4.6,7.1-6.9,13.2-9.5,21.1
					c-8.9,26.4-13.3,39.7-16.9,58c-11.8,60.6-30.1,87.7-51.6,190.7c-3.5,16.6-6,30-7.4,37.9c18.1,8,40.8,13.6,61.3,21
					c41.6,15,78,25.3,113.6,35.9c2.8-12.6,4.7-25.4,7.6-38c5.1-14.4,6.2-50.2,10.5-67.4c5.5-21.5,14.8-25,17.7-50.5
					c12.4-109-12.2-198.3-31.6-250.8C1432.2,213.7,1425.2,214,1415,213.3z"/>
			</defs>
			<clipPath id="No_Fill_00000088828340065130943580000015404637303084096439_">
				<use xlinkHref="#No_Fill"  style={{overflow:"visible"}}/>
			</clipPath>
			
				<g id="Stitch_00000165923651022975510500000012271194896337648046_" style={{clipPath:"url(#No_Fill_00000088828340065130943580000015404637303084096439_)"}}>
				<line className="st2" x1="1271.8" y1="543" x2="1437.9" y2="599.6"/>
				<line className="st2" x1="1271.9" y1="537.2" x2="1438" y2="593.7"/>
				<path className="st3" d="M1422.4,424.3c-17.3-33.3-46.5-71.6-53.2-109.1"/>
				<path className="st3" d="M1433.5,448.2c-19.5,8.7-61.5-41.6-73.6-53.2"/>
			</g>
			<g id="Strips_Sleeve" fill={getFillValue('stripes')} style={{opacity:"0.2", clipPath:"url(#No_Fill_00000088828340065130943580000015404637303084096439_)"}}>
				<rect x="589.8" y="599" width="1572.2" height="11.8"/>
				<rect x="588.9" y="420.3" width="1572.2" height="11.8"/>
				<rect x="588.9" y="451.5" width="1572.2" height="11.8"/>
				<rect x="588.7" y="363.8" width="1572.2" height="11.8"/>
				<rect x="588.7" y="395" width="1572.2" height="11.8"/>
				<rect x="589.2" y="539.1" width="1572.2" height="11.8"/>
				<rect x="589.2" y="570.3" width="1572.2" height="11.8"/>
				<rect x="589.1" y="482.6" width="1572.2" height="11.8"/>
				<rect x="589.1" y="513.7" width="1572.2" height="11.8"/>
				<rect x="589.5" y="304.7" width="1572.2" height="11.8"/>
				<rect x="589.5" y="335.9" width="1572.2" height="11.8"/>
				<rect x="589.4" y="248.2" width="1572.2" height="11.8"/>
				<rect x="589.4" y="276.4" width="1572.2" height="11.8"/>
			</g>
		</g>
	</g>
	<g id="Body_00000137855065414518723550000015904810000501279400_">
		<path id="Fill_00000000215109693966985680000016102489101925424518_"             ref={bodyDrop}
		className="st0"
            fill={getFillValue('body')} 
            style={{
              ...getDropZoneStyle(isBodyOver, canBodyDrop),
              cursor: bodyUploadedPattern ? 'pointer' : 'default'
            }}
            onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}
			 d="M1566,179.2c-2.5,0.5-6.5,1.2-11.6,2.1
			c-10.6,1.8-18.4,2.9-20,3.2c-12.8,1.8-47.3,8.5-86.4,19c-13.5,3.6-30.3,8.5-49.5,14.8c3.4,11.2,5.8,20.3,7.4,26.3
			c5.4,20.9,6,27.6,13.7,62.2c3.5,15.8,4,17.2,5.3,24.2c3.1,17.6,3.9,31.4,4.2,37.9c0.5,11.3,0.2,19.9,0,25.3
			c-0.4,10.7-1.2,20-2.1,27.4c4.2,8.1,8.3,17,12.1,26.9c2,5.1,3.7,10,5.3,14.8c0.8,14.8,1.6,29.9,2.1,45.3c0.5,13.6,0.8,26.9,1.1,40
			c0.2,12.9,1.6,21.7,5.3,50.6c7.8,61.9,8.9,65.8,10.5,86.4c1.1,14.6,2.2,29.3,2.1,48.5c-0.2,27.5-2.9,48.4-6.3,72.7
			c-6.3,44.1-11.2,78.6-21.1,127.5c-9.3,45.9-18.5,82.8-23.2,101.2c-2.9,11.7-5.5,21.4-7.4,28.4c1.2,6.1,2.2,14.8,1.1,25.3
			c-1.1,10.3-3.9,18.6-6.3,24.2c-10.5,75.2-21.1,150.3-31.6,225.5c24.8,7.3,51.5,14.2,80.1,20c20.7,4.2,73.2,14.3,159.1,19
			c89.9,4.9,158.4,0.8,222.3-3.2c87.7-5.5,123.1-8.3,158-14.8c41.2-7.6,74.8-17,98-24.2c-5.1-40.7-12-84-21.1-129.6
			c-8.9-44.3-18.9-85.8-29.5-124.3c0.5-10.4,0.2-23.3-2.1-37.9c-2.7-16.7-7.3-30.6-11.6-41.1c0.5-4.7,1.1-12.1,1.1-21.1
			c-0.1-22.5-3.9-39.4-5.3-45.3c-6.1-27.5-10.1-59.8-17.9-124.3c-1.3-10.9-4.3-35.9-6.3-65.3c-8.1-119.3,11.8-146.4,3.2-222.3
			c-1-8.6-3.6-28.9,1.1-54.8c4.1-23.1,12.2-40.9,17.9-51.6c-0.2-14.5,0.1-29.6,1.1-45.3c3.6-60.5,15.4-113.7,29.5-158
			c-13.6-4.8-28-9.4-43.2-13.7c-34.1-9.5-66.1-15.4-94.8-19c-9.5,3.9-19,7.7-28.4,11.6c-46.9,20.7-88.2,29-117,32.7
			c-51.9,6.6-86.9,1-120.1-4.2c-35.2-5.6-63.7-14.2-75.9-36.9C1567.4,182.6,1566.5,180.6,1566,179.2z"/>
		<g>
			<defs>
				<path id="No_Fil" d="M1564.9,178c-2.5,0.5-6.5,1.2-11.6,2.1c-10.6,1.8-18.4,2.9-20,3.2c-12.8,1.8-47.3,8.5-86.4,19
					c-13.5,3.6-30.3,8.5-49.5,14.8c3.4,11.2,5.8,20.3,7.4,26.3c5.4,20.9,6,27.6,13.7,62.2c3.5,15.8,4,17.2,5.3,24.2
					c3.1,17.6,3.9,31.4,4.2,37.9c0.5,11.3,0.2,19.9,0,25.3c-0.4,10.7-1.2,20-2.1,27.4c4.2,8.1,8.3,17,12.1,26.9
					c2,5.1,3.7,10,5.3,14.8c0.8,14.8,1.6,29.9,2.1,45.3c0.5,13.6,0.8,26.9,1.1,40c0.2,12.9,1.6,21.7,5.3,50.6
					c7.8,61.9,8.9,65.8,10.5,86.4c1.1,14.6,2.2,29.3,2.1,48.5c-0.2,27.5-2.9,48.4-6.3,72.7c-6.3,44.1-11.2,78.6-21.1,127.5
					c-9.3,45.9-18.5,82.8-23.2,101.2c-2.9,11.7-5.5,21.4-7.4,28.4c1.2,6.1,2.2,14.8,1.1,25.3c-1.1,10.3-3.9,18.6-6.3,24.2
					c-10.5,75.2-21.1,150.3-31.6,225.5c24.8,7.3,51.5,14.2,80.1,20c20.7,4.2,73.2,14.3,159.1,19c89.9,4.9,158.4,0.8,222.3-3.2
					c87.7-5.5,123.1-8.3,158-14.8c41.2-7.7,74.8-17,98-24.2c-5.1-40.7-12-84-21.1-129.6c-8.9-44.3-18.9-85.8-29.5-124.3
					c0.5-10.4,0.2-23.3-2.1-37.9c-2.7-16.7-7.3-30.6-11.6-41.1c0.5-4.7,1.1-12.1,1.1-21.1c-0.1-22.5-3.9-39.4-5.3-45.3
					c-6.1-27.5-10.1-59.8-17.9-124.3c-1.3-10.9-4.3-35.9-6.3-65.3c-8.1-119.3,11.8-146.4,3.2-222.3c-1-8.6-3.6-28.9,1.1-54.8
					c4.1-23.1,12.2-40.9,17.9-51.6c-0.2-14.5,0.1-29.6,1.1-45.3c3.6-60.5,15.4-113.7,29.5-158c-13.6-4.8-28-9.4-43.2-13.7
					c-34.1-9.5-66.1-15.4-94.8-19c-9.5,3.9-19,7.7-28.4,11.6c-46.9,20.7-88.2,29-117,32.7c-51.9,6.6-86.9,1-120.1-4.2
					c-35.2-5.6-63.7-14.2-75.9-36.9C1566.3,181.5,1565.4,179.4,1564.9,178z"/>
			</defs>
			<clipPath id="No_Fil_00000005981313394508750190000001329431531023608991_">
				<use xlinkHref="#No_Fil"  style={{overflow:"visible"}}/>
			</clipPath>
			<g id="Strips_Body"   fill={getFillValue('stripes')} style={{opacity:"0.2", clipPath: "url(#No_Fil_00000005981313394508750190000001329431531023608991_)"}}>
				<rect x="881.5" y="888.8" width="1572.2" height="11.8" />
				<rect x="881.5" y="919.9" width="1572.2" height="11.8"/>
				<rect x="881.4" y="832.2" width="1572.2" height="11.8"/>
				<rect x="881.4" y="863.4" width="1572.2" height="11.8"/>
				<rect x="881.8" y="1007.5" width="1572.2" height="11.8"/>
				<rect x="881.8" y="1038.7" width="1572.2" height="11.8"/>
				<rect x="881.7" y="951" width="1572.2" height="11.8"/>
				<rect x="881.7" y="982.2" width="1572.2" height="11.8"/>
				<rect x="881.8" y="654.4" width="1572.2" height="11.8"/>
				<rect x="881.8" y="685.5" width="1572.2" height="11.8"/>
				<rect x="881.7" y="597.8" width="1572.2" height="11.8"/>
				<rect x="881.7" y="629" width="1572.2" height="11.8"/>
				<rect x="882.1" y="773.2" width="1572.2" height="11.8"/>
				<rect x="882.1" y="804.3" width="1572.2" height="11.8"/>
				<rect x="882" y="716.6" width="1572.2" height="11.8"/>
				<rect x="882" y="744.8" width="1572.2" height="11.8"/>
				<rect x="881.9" y="1360.4" width="1572.2" height="11.8"/>
				<rect x="881.8" y="1303.9" width="1572.2" height="11.8"/>
				<rect x="881.8" y="1335.1" width="1572.2" height="11.8"/>
				<rect x="882.3" y="1126.1" width="1572.2" height="11.8"/>
				<rect x="882.3" y="1157.2" width="1572.2" height="11.8"/>
				<rect x="882.1" y="1069.5" width="1572.2" height="11.8"/>
				<rect x="882.1" y="1100.7" width="1572.2" height="11.8"/>
				<rect x="882.6" y="1244.8" width="1572.2" height="11.8"/>
				<rect x="882.6" y="1276" width="1572.2" height="11.8"/>
				<rect x="882.5" y="1188.3" width="1572.2" height="11.8"/>
				<rect x="882.5" y="1216.5" width="1572.2" height="11.8"/>
				<rect x="880.7" y="419.2" width="1572.2" height="11.8"/>
				<rect x="880.7" y="450.3" width="1572.2" height="11.8"/>
				<rect x="880.6" y="362.6" width="1572.2" height="11.8"/>
				<rect x="880.6" y="393.8" width="1572.2" height="11.8"/>
				<rect x="881" y="537.9" width="1572.2" height="11.8"/>
				<rect x="881" y="569.1" width="1572.2" height="11.8"/>
				<rect x="880.9" y="481.4" width="1572.2" height="11.8"/>
				<rect x="880.9" y="512.6" width="1572.2" height="11.8"/>
				<rect x="881" y="215.9" width="1572.2" height="11.8"/>
				<rect x="881.3" y="303.6" width="1572.2" height="11.8"/>
				<rect x="881.3" y="334.7" width="1572.2" height="11.8"/>
				<rect x="881.2" y="247" width="1572.2" height="11.8"/>
				<rect x="881.2" y="275.2" width="1572.2" height="11.8"/>
			</g>
		</g>
		<g id="Body">
			<defs>
				<path id="SVGID_1_" d="M1566.7,178.8c-2.5,0.5-6.5,1.2-11.6,2.1c-10.6,1.8-18.4,2.9-20,3.2c-12.8,1.8-47.3,8.5-86.4,19
					c-13.5,3.6-30.3,8.5-49.5,14.8c3.4,11.2,5.8,20.3,7.4,26.3c5.4,20.9,6,27.6,13.7,62.2c3.5,15.8,4,17.2,5.3,24.2
					c3.1,17.6,3.9,31.4,4.2,37.9c0.5,11.3,0.2,19.9,0,25.3c-0.4,10.7-1.2,20-2.1,27.4c4.2,8.1,8.3,17,12.1,26.9
					c2,5.1,3.7,10,5.3,14.8c0.8,14.8,1.6,29.9,2.1,45.3c0.5,13.6,0.8,26.9,1.1,40c0.2,12.9,1.6,21.7,5.3,50.6
					c7.8,61.9,8.9,65.8,10.5,86.4c1.1,14.6,2.2,29.3,2.1,48.5c-0.2,27.5-2.9,48.4-6.3,72.7c-6.3,44.1-11.2,78.6-21.1,127.5
					c-9.3,45.9-18.5,82.8-23.2,101.2c-2.9,11.7-5.5,21.4-7.4,28.4c1.2,6.1,2.2,14.8,1.1,25.3c-1.1,10.3-3.9,18.6-6.3,24.2
					c-10.5,75.2-21.1,150.3-31.6,225.5c24.8,7.3,51.5,14.2,80.1,20c20.7,4.2,73.2,14.3,159.1,19c89.9,4.9,158.4,0.8,222.3-3.2
					c87.7-5.5,123.1-8.3,158-14.8c41.2-7.6,74.8-17,98-24.2c-5.1-40.7-12-84-21.1-129.6c-8.9-44.3-18.9-85.8-29.5-124.3
					c0.5-10.4,0.2-23.3-2.1-37.9c-2.7-16.7-7.3-30.6-11.6-41.1c0.5-4.7,1.1-12.1,1.1-21.1c-0.1-22.5-3.9-39.4-5.3-45.3
					c-6.1-27.5-10.1-59.8-17.9-124.3c-1.3-10.9-4.3-35.9-6.3-65.3c-8.1-119.3,11.8-146.4,3.2-222.3c-1-8.6-3.6-28.9,1.1-54.8
					c4.1-23.1,12.2-40.9,17.9-51.6c-0.2-14.5,0.1-29.6,1.1-45.3c3.6-60.5,15.4-113.7,29.5-158c-13.6-4.8-28-9.4-43.2-13.7
					c-34.1-9.5-66.1-15.4-94.8-19c-9.5,3.9-19,7.7-28.4,11.6c-46.9,20.7-88.2,29-117,32.7c-51.9,6.6-86.9,1-120.1-4.2
					c-35.2-5.6-63.7-14.2-75.9-36.9C1568.1,182.2,1567.2,180.2,1566.7,178.8z"/>
			</defs>
			<clipPath id="SVGID_00000041981658624875954820000017374686301149927301_">
				<use xlinkHref="#SVGID_1_"  style={{ overflow: "visible"}} />
			</clipPath>
			
				<g id="Stitch_00000077302332932330385640000006762374887033623175_" style={{clipPath:"url(#SVGID_00000041981658624875954820000017374686301149927301_)"}}>
				<path className="st2" d="M1379,1321c21.1,6.9,51,15.6,87.5,23.2c69.4,14.4,123.8,16.4,170.7,17.9c48.2,1.6,83.1,0,152.8-3.2
					c63.8-2.9,95.6-4.3,137-9.5c40.3-5,92.9-13.9,153.8-30.6"/>
				<path className="st2" d="M1378.7,1310.6c21.1,6.9,51,15.6,87.5,23.2c69.4,14.4,123.8,16.4,170.7,17.9c48.2,1.6,83.1,0,152.8-3.2
					c63.8-2.9,95.6-4.3,137-9.5c40.3-5,92.9-13.9,153.8-30.6"/>
				<line className="st9" x1="1899.3" y1="765.9" x2="2051.1" y2="1143.3"/>
				<line className="st9" x1="1881.3" y1="526.9" x2="2033" y2="904.2"/>
			</g>
		</g>
	</g>
	<g id="Collar_00000181055512294536428360000012365064030479725746_">
		<g>
		<path className="st10"
		d="M1561.8,215c12-13,45.4,16.5,110.6,28.4c58.5,10.8,107.5,1,139.1-5.3c37.6-7.5,68.3-18.7,90.6-28.4
				c-0.9,15.5-5,48.1-27.4,80.1c-30.9,44.1-75.7,57.2-93.8,62.2c-51.8,14.3-94.9,1.4-110.6-4.2c-14.6-5.2-62.1-24.2-91.7-72.7
				C1573.8,267.1,1549.9,228,1561.8,215z"/>
			<g>
			<path className="st11" 		fill={getFillValue('collar')} 
			style={{
				...getDropZoneStyle(isCollarOver, canCollarDrop),
				cursor: collarUploadedPattern ? 'pointer' : 'default'
			}}
			onClick={() => handlePatternClick(collarUploadedPattern || '', 'collar')} 
			d="M1543.8,186.8c0,0,44.8,51,177,51h4.8c131.7,0,194.2-52.7,194.2-52.7l-25.6-7.9c0,0-56.5,41.1-168.6,41.1
					h-4.8c-113.6,0-155.1-41.1-155.1-41.1L1543.8,186.8"/>
			</g>
		</g>
		<g id="Front_Collar">
			<path id="Fill_00000129165603712447555730000001854139382508018100_" className="st14" ref={collarDrop}
		fill={getFillValue('collar')} 
		style={{
			...getDropZoneStyle(isCollarOver, canCollarDrop),
			cursor: collarUploadedPattern ? 'pointer' : 'default'
		}}
		onClick={() => handlePatternClick(collarUploadedPattern || '', 'collar')} 
		d="M1894.8,178c0,0,11.9,160.2-153.4,171.1
				c-6.6,0.4-24.3-0.1-34.9-1.2C1566.3,333.6,1566.3,178,1566.3,178l-25.8,4.8c3.2,91.3,42.8,177.9,165.5,191.1
				c9.2,1,29.2,1.4,36.3,1.2c130.4-3.6,179.8-107.2,178-191.1L1894.8,178"/>
			<path id="No_Fill_00000080889354355764048930000012640833170496056759_" className="st15" d="M1894.6,177.5l1.1-0.1
				c0,0,0.2,2.6,0.2,7.1c0,15.6-2.3,54.4-22.8,90.7c-20.5,36.2-59.3,69.8-131.9,74.6c-1.6,0.1-3.8,0.2-6.3,0.2
				c-8.3,0-20.6-0.5-28.8-1.3c-70.5-7.2-105.9-50.1-123.5-91c-17.6-40.9-17.6-80-17.6-80.1h1.1l0.2,1.1l-25.8,4.8l-0.2-1.1l1.1,0
				c1.6,45.5,12.2,89.8,37.7,124.2c25.5,34.5,65.7,59.3,126.8,65.8c7.6,0.8,22.7,1.2,31.7,1.2c1.8,0,3.3,0,4.5,0
				c63.8-1.8,107.9-27.5,136.2-63.1c28.3-35.6,40.7-81.2,40.7-122.5c0-1.5,0-2.9,0-4.4l1.1,0l-0.3,1.1l-25.6-6L1894.6,177.5l1.1-0.1
				L1894.6,177.5l0.3-1.1l25.6,6c0.5,0.1,0.9,0.6,0.9,1.1c0,1.5,0,2.9,0,4.4c0,41.8-12.5,87.8-41.2,123.9
				c-28.7,36.1-73.6,62.2-137.9,63.9c-1.2,0-2.7,0-4.5,0c-9,0-24.2-0.4-31.9-1.2c-61.6-6.6-102.6-31.7-128.4-66.7
				c-25.8-35-36.6-79.7-38.1-125.5c0-0.5,0.4-1,0.9-1.1l25.8-4.8l0.9,0.2l0.4,0.9c0,0,0,2.4,0.3,6.6c1,14.9,5.3,52.4,24.5,87.7
				c19.3,35.3,53.4,68.2,114.3,74.5c8.1,0.8,20.4,1.3,28.6,1.3c2.5,0,4.7,0,6.2-0.1c71.9-4.8,109.9-37.8,130.1-73.4
				c20.2-35.7,22.5-74.2,22.5-89.6c0-4.4-0.2-6.9-0.2-6.9l0.4-0.9l1-0.2L1894.6,177.5"/>
		</g>
		<g id="Stitch_00000106119404773493473610000010861808457544980871_">
			<path className="st16" d="M1546,184.5c1,16.3,3.8,35.8,10.4,57.2c4.2,13.8,8.5,27.7,18.6,44.2c16,26,35.3,40.5,40.4,44.2
				c13.9,10,26.2,15.2,33.1,18.1c18.6,7.7,33.8,10.3,44.5,12c12.2,2,34.8,5.5,64.2,2c30.2-3.6,51.9-12.8,59-16.1
				c9.8-4.4,23.5-10.7,38.3-23.1c17.3-14.5,26.5-29.3,33.1-40.1c13.7-22.5,19.1-42,20.7-48.2c5.1-19.7,5.7-36.9,5.2-49.2"/>
			<path className="st16" d="M1530.4,189.8c1.1,17.8,4.2,39,11.2,62.2c4.6,15,9.2,30.1,20.2,48c17.3,28.3,38.2,44,43.7,48
				c15,10.9,28.4,16.5,35.9,19.7c20.1,8.4,36.6,11.2,48.2,13.1c13.2,2.2,37.7,6,69.5,2.2c32.7-4,56.1-14,63.9-17.5
				c10.6-4.8,25.4-11.6,41.5-25.1c18.7-15.8,28.7-31.9,35.9-43.7c14.9-24.5,20.7-45.7,22.4-52.4c5.5-21.5,6.2-40.1,5.6-53.5"/>
		</g>
	</g>
    </g>


        {/* Render buttons */}
        {buttons.map((button) => (
          <SVGButtonElement
            key={button.id}
            button={button}
            isSelected={selectedButtonId === button.id}
            onButtonClick={onButtonClick || (() => {})}
            onButtonDelete={onButtonDelete || (() => {})}
            onButtonDrag={onButtonDrag}
            svgWidth={1332.15}
            svgHeight={1687.55}
          />
        ))}
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

export default FemaleStripesTshirtSVG;
