import React, { useState, useRef } from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { useTshirtDrop } from '@/hooks/useTshirtDrop';
import InteractivePatternEditor from '../InteractivePatternEditor';
import SVGButtonElement from '../SVGButtonElement';
import StandardSVGWrapper from '../StandardSVGWrapper';

interface VNeckSVGProps {
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
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  activeTool?: string | null;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
}

const VNeckSVG = ({ 
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
}: VNeckSVGProps) => {
  const [activePatternEditor, setActivePatternEditor] = useState<{
    patternId: string;
    part: 'body' | 'sleeves' | 'collar';
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up drop zones for each part with proper handlers
  const { isOver: isBodyOver, canDrop: canBodyDrop, drop: bodyDrop } = useTshirtDrop('body', onPatternDrop || (() => {}));
  const { isOver: isSleevesOver, canDrop: canSleevesDrop, drop: sleevesDrop } = useTshirtDrop('sleeves', onPatternDrop || (() => {}));
  const { isOver: isCollarOver, canDrop: canCollarDrop, drop: collarDrop } = useTshirtDrop('collar', onPatternDrop || (() => {}));
  
  console.log('🔍 VNeckSVG: Received buttons:', buttons);
  console.log('🔍 VNeckSVG: Buttons count:', buttons.length);
  
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
  
  const getFillValue = (part: 'body' | 'sleeves' | 'collar') => {
    const color = part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor;
    const uploadedPatternId = part === 'body' ? bodyUploadedPattern : part === 'sleeves' ? sleevesUploadedPattern : collarUploadedPattern;
    const predefinedPattern = part === 'body' ? bodyPattern : part === 'sleeves' ? sleevesPattern : collarPattern;
    
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

  const getDropZoneStyle = (isOver: boolean, canDrop: boolean) => {
    if (isOver && canDrop) {
      return { filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' };
    }
    if (canDrop) {
      return { filter: 'brightness(1.05)' };
    }
    return {};
  };

  const activePattern = getActivePattern();

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'buttons' && onButtonPlacement) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - svgRect.left;
      const clickY = e.clientY - svgRect.top;
      
      const percentX = (clickX / svgRect.width) * 100;
      const percentY = (clickY / svgRect.height) * 100;
      
      const constrainedX = Math.max(5, Math.min(95, percentX));
      const constrainedY = Math.max(5, Math.min(95, percentY));
      
      console.log('🔍 VNeckSVG: SVG clicked in button mode at:', { x: constrainedX, y: constrainedY });
      onButtonPlacement('round', 'medium');
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <StandardSVGWrapper
        className={className}
        viewBox="0 0 512 512"
        onClick={handleSVGClick}
        style={{ cursor: activeTool === 'buttons' ? 'crosshair' : 'default' }}
      >
        <defs>
          {/* Uploaded pattern definitions */}
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
      
        {/* V-neck T-shirt SVG paths normalized to 512x512 viewBox */}
        <switch id="switch75872" transform="translate(256,256)">		
          <g id="Design" transform="scale(2.0) translate(-280, -200)">
            <g id="Front_00000119096672613169130740000011453686654596922539_" transform="translate(0,50)">
              <g id="Top_00000134941307564365658930000016003842570268569730_">
                <g id="Top_00000056398308270037416080000015244064161257324689_">
                  <g id="Body_00000138543282349610209710000012760478308368699791_">
                    <path
                      id="Fill_00000035517302225727684460000008769297941223429505_"
                      ref={bodyDrop}
                      className="st3" 
                      fill={getFillValue('body')} 
                      style={{
                        ...getDropZoneStyle(isBodyOver, canBodyDrop),
                        cursor: bodyUploadedPattern ? 'pointer' : 'default'
                      }}
                      onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}
                      stroke="#000000"
                      strokeMiterlimit="1.5"
                      d="m 348.5,271.6 -5.8,-151.2 c -6.5,-10.2 -8.2,-19.1 -8.8,-24.2 -0.9,-8.8 0.7,-15.8 3,-26 1.8,-8.1 4.1,-14.7 5.8,-19.3 -9.3,-2.9 -18.5,-5.7 -27.8,-8.6 -24,9.6 -48,9.6 -71.9,0 L 215.3,51 c 0.5,1.1 1.1,2.6 1.7,4.4 0,0 1.7,4.5 2.9,8.8 3.8,13 4,23 4,23 0.1,6.2 0.2,16.2 -5,27 -1.3,2.7 -2.6,4.8 -3.6,6.2 l -5.8,151.2 c 46.3,2.5 92.7,2.5 139,0 z" />
                  </g>
                  
                  {/* V-neck collar */}
                  <g id="collar_00000062182484409978690050000008812714154190648761_">
                    <g id="No_Fill_00000086662949796146914130000009501253549732097429_">
                      <path
                        stroke="#080504"
                        strokeWidth="0.5731"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeMiterlimit="10"
                        d="M 279,104.1 C 295.3,86.6 307.6,66.3 314.9,42.5"
                        id="path75867" />
                      <path
                        fill="none"
                        stroke="#080504"
                        strokeWidth="0.5731"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeMiterlimit="10"
                        d="M 279,104.1 C 262.7,86.6 250.4,66.2 243.1,42.5"
                        id="path75868" />
                      <path
                        fill="none"
                        stroke="#080504"
                        strokeWidth="0.24"
                        strokeLinecap="round"
                        strokeMiterlimit="1.5"
                        d="m 239.3,43.6 v 0 C 246.4,69.1 260,90.9 279,109.8 297.9,91 311.5,69.1 318.7,43.6 M 279,109.8 Z"
                        id="path75869" />
                    </g>
                    <path
                      id="Stitch_00000132785797640095831340000012517037682229110709_"
                      fill="none"
                      stroke="#080504"
                      strokeWidth="0.2123"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeMiterlimit="1.5"
                      strokeDasharray="0.6368, 0.6368, 0, 0, 0, 0"
                      d="m 238,44 c 6.3,20.9 16.7,42.7 41,67.4 18.9,-19.9 33.3,-42.1 41,-67.4" />
                  </g>
                  
                  {/* Right Sleeve */}
                  <g id="Right_Sleeve_00000090255109587689698210000015097967150274606006_">
                    <path
                      id="Fill_00000156548445213936579270000011958291547690972831_"
                      ref={sleevesDrop}
                      className="st3-sleeves" 
                      fill={getFillValue('sleeves')} 
                      style={{
                        ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
                        cursor: sleevesUploadedPattern ? 'pointer' : 'default'
                      }}
                      onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
                      stroke="#000000"
                      strokeMiterlimit="1.5"
                      d="m 214.8,121.1 -10,5.7 -29.5,-43.6 c 13.2,-10.6 26.3,-21.2 39.5,-31.9 3.4,7.8 5.3,14.6 6.3,19.7 2,9.3 4.4,20.4 1.1,33.4 -1.8,7.5 -5.1,13.2 -7.4,16.7 z" />
                  </g>
                  
                  {/* Left Sleeve */}
                  <g id="Left_Sleeve_00000168827220149908965520000001346646466325755793_">
                    <path
                      id="Fill_00000120540249166863606950000000293265440840567987_"
                      ref={sleevesDrop}
                      className="st3-sleeves" 
                      fill={getFillValue('sleeves')} 
                      style={{
                        ...getDropZoneStyle(isSleevesOver, canSleevesDrop),
                        cursor: sleevesUploadedPattern ? 'pointer' : 'default'
                      }}
                      onClick={() => handlePatternClick(sleevesUploadedPattern || '', 'sleeves')}
                      stroke="#000000"
                      strokeMiterlimit="1.5"
                      d="m 342.8,120.2 c 3.5,1.9 7.1,3.7 10.6,5.6 L 383,83.1 C 369.7,72.5 356.4,61.8 343.1,51.2 c -2.6,6.2 -4.1,11.3 -5.1,15 0,0.1 -0.7,3.1 -2,9 -1.2,5.5 -1.9,8.2 -2,10 -0.5,4.4 -0.2,7.9 0,10 0.1,1.7 0.3,4 1,7 0.2,0.8 1,4.4 3,9 0.9,2.5 2.5,5.6 4.8,9 z" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </switch>

        {/* Render buttons */}
        <g id="BUTTONS">
          {buttons.map((button) => {
            console.log('Rendering button in VNeck:', button.id, button.position);
            return (
              <SVGButtonElement
                key={button.id}
                button={button}
                isSelected={selectedButtonId === button.id}
                onButtonClick={onButtonClick || (() => {})}
                onButtonDelete={onButtonDelete || (() => {})}
                onButtonDrag={onButtonDrag || (() => {})}
                svgWidth={512}
                svgHeight={512}
              />
            );
          })}
        </g>
      </StandardSVGWrapper>

      {/* Interactive Pattern Editor Overlay */}
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

export default VNeckSVG;
