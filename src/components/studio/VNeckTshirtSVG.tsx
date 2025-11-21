import React from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import SVGButtonElement from './SVGButtonElement';
import StandardSVGWrapper from './StandardSVGWrapper';

interface VNeckTshirtSVGProps {
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
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
}

const VNeckTshirtSVG = ({ 
  className = "", 
  bodyColor = "#f3f4f6",
  sleevesColor = "#f3f4f6", 
  collarColor = "#f3f4f6",
  bodyPattern,
  sleevesPattern,
  collarPattern,
  bodyUploadedPattern,
  sleevesUploadedPattern,
  collarUploadedPattern,
  fabric,
  getPatternById,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  onButtonPlacement
}: VNeckTshirtSVGProps) => {
  const safeFabric = fabric || { name: 'Cotton', texture: 'cotton', roughness: 0.8, metalness: 0.1 };
  
  console.log('=== VNeckTshirtSVG Debug Info ===');
  console.log('buttons:', buttons);
  console.log('buttons length:', buttons.length);
  
  // Function to get the fill value for each part with layered patterns
  const getFillValue = (part: 'body' | 'sleeves' | 'collar') => {
    const color = part === 'body' ? bodyColor : part === 'sleeves' ? sleevesColor : collarColor;
    const pattern = part === 'body' ? bodyPattern : part === 'sleeves' ? sleevesPattern : collarPattern;
    const uploadedPatternId = part === 'body' ? bodyUploadedPattern : part === 'sleeves' ? sleevesUploadedPattern : collarUploadedPattern;
    
    if (uploadedPatternId && getPatternById) {
      const patternData = getPatternById(uploadedPatternId);
      if (patternData) {
        const stableId = `${part}-uploaded-pattern-${uploadedPatternId}`;
        console.log(`VNeck: Using stable pattern ID for ${part}:`, stableId);
        return `url(#${stableId})`;
      }
    }
    
    if (pattern) {
      return `url(#${part}-pattern-${pattern})`;
    } else if (safeFabric.texture !== 'cotton') {
      return `url(#${part}-fabric-${safeFabric.texture})`;
    } else {
      return color;
    }
  };
  
  return (
    <StandardSVGWrapper
      className={className}
      viewBox="0 0 512 512"
    >
      <defs>
        {/* Uploaded Pattern Definitions with stable IDs */}
        {bodyUploadedPattern && getPatternById && getPatternById(bodyUploadedPattern) && (
          <pattern 
            id={`body-uploaded-pattern-${bodyUploadedPattern}`}
            patternUnits="userSpaceOnUse" 
            width="100" 
            height="100"
            patternTransform={`scale(${getPatternById(bodyUploadedPattern)?.cropData?.scale || 0.8}) rotate(${getPatternById(bodyUploadedPattern)?.cropData?.rotation || 0}) translate(${getPatternById(bodyUploadedPattern)?.cropData?.x || 0} ${getPatternById(bodyUploadedPattern)?.cropData?.y || 0})`}
          >
            <rect width="100" height="100" fill={bodyColor} />
            <image 
              xlinkHref={getPatternById(bodyUploadedPattern)!.url} 
              width="100" 
              height="100" 
              preserveAspectRatio="xMidYMid slice"
              opacity="0.9"
              crossOrigin="anonymous"
            />
          </pattern>
        )}
        
        {sleevesUploadedPattern && getPatternById && getPatternById(sleevesUploadedPattern) && (
          <pattern 
            id={`sleeves-uploaded-pattern-${sleevesUploadedPattern}`}
            patternUnits="userSpaceOnUse" 
            width="100" 
            height="100"
            patternTransform={`scale(${getPatternById(sleevesUploadedPattern)?.cropData?.scale || 0.8}) rotate(${getPatternById(sleevesUploadedPattern)?.cropData?.rotation || 0}) translate(${getPatternById(sleevesUploadedPattern)?.cropData?.x || 0} ${getPatternById(sleevesUploadedPattern)?.cropData?.y || 0})`}
          >
            <rect width="100" height="100" fill={sleevesColor} />
            <image 
              xlinkHref={getPatternById(sleevesUploadedPattern)!.url} 
              width="100" 
              height="100" 
              preserveAspectRatio="xMidYMid slice"
              opacity="0.9"
              crossOrigin="anonymous"
            />
          </pattern>
        )}
        
        {collarUploadedPattern && getPatternById && getPatternById(collarUploadedPattern) && (
          <pattern 
            id={`collar-uploaded-pattern-${collarUploadedPattern}`}
            patternUnits="userSpaceOnUse" 
            width="100" 
            height="100"
            patternTransform={`scale(${getPatternById(collarUploadedPattern)?.cropData?.scale || 0.8}) rotate(${getPatternById(collarUploadedPattern)?.cropData?.rotation || 0}) translate(${getPatternById(collarUploadedPattern)?.cropData?.x || 0} ${getPatternById(collarUploadedPattern)?.cropData?.y || 0})`}
          >
            <rect width="100" height="100" fill={collarColor} />
            <image 
              xlinkHref={getPatternById(collarUploadedPattern)!.url} 
              width="100" 
              height="100" 
              preserveAspectRatio="xMidYMid slice"
              opacity="0.9"
              crossOrigin="anonymous"
            />
          </pattern>
        )}

        {/* Regular Pattern definitions */}
        {bodyPattern && (
          <pattern id={`body-pattern-${bodyPattern}`} patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill={bodyColor} />
            {bodyPattern === 'stripes' && (
              <>
                <rect x="0" y="0" width="20" height="10" fill="#000" opacity="0.1" />
                <rect x="0" y="10" width="20" height="10" fill="transparent" />
              </>
            )}
            {bodyPattern === 'polka-dots' && (
              <circle cx="10" cy="10" r="3" fill="#000" opacity="0.15" />
            )}
            {bodyPattern === 'checkerboard' && (
              <>
                <rect x="0" y="0" width="10" height="10" fill="#000" opacity="0.1" />
                <rect x="10" y="10" width="10" height="10" fill="#000" opacity="0.1" />
              </>
            )}
          </pattern>
        )}
        
        <style>
          {`
            .st0 {
              strokeWidth: 5px;
              stroke: #000;
              strokeLinecap: round;
              strokeLinejoin: round;
            }
            .st3 {
              strokeWidth: 6px;
              stroke: #000;
              strokeLinecap: round;
              strokeLinejoin: round;
            }
          `}
        </style>
      </defs>
      
      {/* V-neck T-shirt SVG paths normalized to 512x512 viewBox */}
      <g id="BODY" transform="translate(256,256) scale(0.8)">
        <path className="st3" fill={getFillValue('body')} d="M-90,-100 L-90,150 L90,150 L90,-100 L30,-150 L30,-120 Q0,-90 0,-90 Q0,-90 -30,-120 L-30,-150 Z"/>
      </g>
      
      <g id="LEFT_SLEEVE" transform="translate(256,256) scale(0.8)">
        <path className="st3" fill={getFillValue('sleeves')} d="M-200,-50 Q-250,0 -250,50 L-250,100 Q-200,150 -150,100 L-150,50 Q-200,0 -200,-50"/>
      </g>
      
      <g id="RIGHT_SLEEVE" transform="translate(256,256) scale(0.8)">
        <path className="st3" fill={getFillValue('sleeves')} d="M200,-50 Q250,0 250,50 L250,100 Q200,150 150,100 L150,50 Q200,0 200,-50"/>
      </g>
      
      <g id="COLLAR" transform="translate(256,256) scale(0.8)">
        <path className="st0" fill={getFillValue('collar')} d="M-30,-150 L-30,-120 Q0,-90 0,-90 Q0,-90 30,-120 L30,-150 Q0,-170 0,-170 Q0,-170 -30,-150"/>
      </g>

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
  );
};

export default VNeckTshirtSVG;
