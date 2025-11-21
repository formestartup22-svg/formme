import React, { useState, useRef } from 'react';
import { FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { useTshirtDrop } from '@/hooks/useTshirtDrop';
import InteractivePatternEditor from '../InteractivePatternEditor';
import SVGButtonElement from '../SVGButtonElement';
import StandardSVGWrapper from '../StandardSVGWrapper';

interface PatternedTrackPantsSVGProps {
  className?: string;
  bodyColor?: string;
  bodyPattern?: string;
  bodyUploadedPattern?: string;
  fabric?: FabricProperties;
  onPatternDrop?: (part: 'body', patternId: string) => void;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  activeTool?: string | null;
}

const PatternedTrackPantsSVG = ({ 
  className = "flex justify-center items-center", 
  bodyColor = "#ffffff",
  bodyPattern = '',
  bodyUploadedPattern,
  fabric,
  onPatternDrop,
  getPatternById,
  onPatternUpdate,
  activeTool,
}: PatternedTrackPantsSVGProps) => {
  const [activePatternEditor, setActivePatternEditor] = useState<{
    patternId: string;
    part: 'body' | 'sleeves' | 'collar';
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up drop zones for each part with proper handlers
  const { isOver: isBodyOver, canDrop: canBodyDrop, drop: bodyDrop } = useTshirtDrop('body', onPatternDrop || (() => {}));
  const { isOver: isSleevesOver, canDrop: canSleevesDrop, drop: sleevesDrop } = useTshirtDrop('sleeves', onPatternDrop || (() => {}));
  const { isOver: isCollarOver, canDrop: canCollarDrop, drop: collarDrop } = useTshirtDrop('collar', onPatternDrop || (() => {}));
    
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
  
  
  const getFillValue = (part: 'body' | 'sleeves' | 'collar') => {
    const color =  bodyColor;
    const uploadedPatternId = bodyUploadedPattern;
    const predefinedPattern = bodyPattern;
    
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



  return (
    <div ref={containerRef} className="relative">
      <StandardSVGWrapper
        className={className}
        viewBox="0 0 512 512"
        style={{ cursor: activeTool === 'buttons' ? 'crosshair' : 'default' }}
      >
        <defs>
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
        {bodyPattern}

        </defs>
  <g
     id="layer1" transform="scale(1.75) translate(-120, -280)">
    <g
       id="Long_Short_00000001644571838739160800000001033366929719405724_">
					<g
   id="Body_00000016778203739102478510000010227044873548448390_">
						
							<path
   id="No_Fill_00000060015259418916354660000003154853594102910896_"
   ref={bodyDrop}
   className="st3" 
   fill={getFillValue('body')} 
   style={{
     ...getDropZoneStyle(isBodyOver, canBodyDrop),
     cursor: bodyUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}

   stroke="#080504"
   strokeWidth="0.5878"
   strokeLinecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 278.5,367.7 c 10.2,63.5 20.4,127.1 30.5,190.6 l 69.4,-10.6 c -14.1,-77.9 -27.4,-155.9 -40,-234 -0.8,-5.2 -1.7,-10.3 -2.5,-15.5 -16.3,3.4 -37,6.2 -61,6 -20.5,-0.2 -38.4,-2.6 -53.1,-5.5 -1,5 -2,10 -3,15 -15.6,79.2 -27.5,157.2 -36.1,234 l 69.5,10.6 c 5.8,-61.4 14.2,-123.4 25.4,-185.7 0.3,-1.6 0.6,-3.3 0.9,-4.9 z" />

						
						<g
   id="Pockets_00000117678805597603198900000009105154375185513863_">
							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="233"
   y1="301.5"
   x2="215.89999"
   y2="332.70001"
   id="line56900" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="323.89999"
   y1="301.29999"
   x2="341.10001"
   y2="332.70001"
   id="line56901" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="322.5"
   y1="301.5"
   x2="342.29999"
   y2="337.79999"
   id="line56902" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="234.60001"
   y1="301.5"
   x2="214.3"
   y2="337.20001"
   id="line56903" />

						</g>

						<g
   id="Stitch_00000011738008065042287880000008105923062175529902_">
							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="337.79999"
   y1="326.70001"
   x2="375.60001"
   y2="547.29999"
   id="line56904" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="376.5"
   y1="545"
   x2="310.39999"
   y2="555.20001"
   id="line56905" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="184.5"
   y1="542.20001"
   x2="250.7"
   y2="552.29999"
   id="line56906" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="375.39999"
   y1="542.20001"
   x2="309.20001"
   y2="552.29999"
   id="line56907" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="185.7"
   y1="539.40002"
   x2="251.8"
   y2="549.5"
   id="line56908" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 218.1,328.7 c -8,46.1 -15.7,93.2 -22.8,141.3 -3.8,26 -7.5,51.8 -10.9,77.3"
   id="path56908" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="278.5"
   y1="367.70001"
   x2="278.5"
   y2="310"
   id="line56909" />

						</g>

					</g>

					<g
   id="Waisband_00000103981120381767800120000014180742412302184354_">
						<g
   id="Front_Waisband_00000052823733743585572990000009554364419028335027_">
							
								<path
   id="Fill_00000038411577464314278760000008916182993743793793_"
   ref={bodyDrop}
   className="st3" 
   fill={getFillValue('body')} 
   style={{
     ...getDropZoneStyle(isBodyOver, canBodyDrop),
     cursor: bodyUploadedPattern ? 'pointer' : 'default'
   }}
   onClick={() => handlePatternClick(bodyUploadedPattern || '', 'body')}
stroke="#000000"
   strokeMiterlimit="10"
   d="m 335.9,298.3 c -0.5,-4 -1.1,-8 -1.6,-12 -37,6.9 -73.9,6.7 -110.7,0 -0.6,4 -1.1,8 -1.7,12 16.4,3.5 37.4,6.5 62,6 20.2,-0.4 37.7,-3 52,-6 z" />

							
							<g
   id="Stirch_00000156578392541508674190000001749794570287807668_">
								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 230.7,299.4 c 0,-1.9 0.2,-2.6 1,-2.9 0.6,-0.3 1.3,-0.3 1.5,-4.3 0,-0.2 0,-0.2 0.2,-2.2 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.8,0.4 -0.9,1.7 -1,2.5 z"
   id="path75840" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 239.4,300.7 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.8,1.4 1.2,1.7 z"
   id="path75841" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 248.1,290.7 c 0.2,2.6 -1.5,3 -2.5,4.6 -0.6,1 -0.7,2 -0.5,3.9 0.1,0.8 0.3,1.7 0.4,1.8 -0.6,-1.5 -0.9,-2.7 -0.8,-4.1 0.3,-2.5 2.3,-3.1 3.1,-5 0.1,-0.2 0.1,-0.4 0.2,-0.5 0,-0.3 0,-0.6 0.1,-0.7 z"
   id="path75842" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 251,301.3 c 0,-2.1 0.2,-2.8 1,-3.1 0.6,-0.3 1.3,-0.3 1.5,-4.7 0,-0.3 0,-0.3 0.2,-2.4 0.1,0.7 0.2,1.8 0.1,2.6 -0.2,4.4 -0.9,4.4 -1.7,4.8 -0.1,0.1 -0.4,0.2 -0.6,0.7 -0.3,0.6 -0.5,1.8 -0.5,2.1 z"
   id="path75843" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 254.1,303 c 0,-2.1 0.2,-2.8 1,-3.1 0.6,-0.3 1.3,-0.3 1.5,-4.7 0,-0.3 0,-0.3 0.2,-2.4 0.1,0.7 0.2,1.8 0.1,2.6 -0.2,4.4 -0.9,4.4 -1.7,4.8 -0.1,0.1 -0.4,0.2 -0.6,0.7 -0.4,0.6 -0.5,1.8 -0.5,2.1 z"
   id="path75844" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 263.7,291.6 c 0.1,0.9 -0.1,1.7 -0.9,2.6 -1.1,1.2 -2.4,1.9 -2.2,4.5 0.1,0.6 0.1,1.2 0.5,2.6 0,0 0,0 0,-0.1 -0.7,-1.7 -0.9,-2.7 -0.7,-3.7 0.2,-1.6 1.2,-2.4 1.9,-3.2 1.2,-1.1 1.3,-1.9 1.4,-2.7 z"
   id="path75845" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 275.5,301.3 c 0,-1.9 0.2,-2.6 1,-2.9 0.6,-0.3 1.3,-0.3 1.5,-4.3 0,-0.2 0,-0.2 0.2,-2.2 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.8,0.3 -0.9,1.6 -1,2.5 z"
   id="path75846" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 265.7,293.2 c 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.5,0.3 -0.7,1 -0.9,2.5 0,0.1 0,-0.5 0,-0.6 0,-2.5 0.9,-2.1 1.5,-2.6 0.9,-0.7 0.9,-3.4 0.9,-4.4 z"
   id="path75847" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 299.9,293 c 0.1,1.7 0.2,1.7 0.2,2.6 0.2,3.9 1,3.7 1.6,4 0.6,0.3 0.9,1 0.8,2.8 0,0.3 0,-1.8 -0.8,-2.4 -0.6,-0.5 -1.5,0 -1.9,-3.1 -0.1,-1.4 -0.1,-2.2 -0.1,-2.3 0.2,-0.8 0.2,-0.8 0.2,-1.6 z"
   id="path75848" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 284.2,302.5 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.8,1.4 1.2,1.7 z"
   id="path75849" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 290.4,304.2 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.8,1.5 1.2,1.7 z"
   id="path75850" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 331.9,298.5 c 0,-0.1 0,-0.2 -0.1,-0.3 0,-0.2 -0.4,-0.7 -0.5,-1.7 -0.1,-1.3 -0.1,-2.7 0,-4 0,-0.6 0.1,-1 0.3,-2.2 0,-0.1 0,0.8 0,0.9 0,1.1 0,1.1 -0.1,2.1 -0.1,2.1 0,2.8 0.1,4 0.1,0.6 0.2,0.9 0.2,1 0.1,0 0.1,0.1 0.1,0.2 z"
   id="path75851" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 324.6,290.3 c 0.1,1.7 0.2,1.7 0.2,2.6 0.2,3.9 1,3.7 1.6,4 0.6,0.3 0.9,1 0.8,2.9 -0.2,-1.3 -0.3,-2.3 -1,-2.6 -0.8,-0.4 -1.6,-0.2 -1.7,-4.6 0,-0.1 0,-0.2 0,-0.7 0,-0.8 0,-0.8 0.1,-1.6 z"
   id="path75852" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 319.7,290.7 c -0.3,1.9 -0.6,2.2 -0.6,2.9 -0.1,1 0.6,2 0.9,3.1 0.2,0.9 0.2,2.1 -0.1,2.9 -0.5,1 -1.2,1.3 -1.4,1.3 0.4,-0.2 1.1,-0.6 1.3,-2.2 0.1,-0.9 0,-2 -0.3,-2.7 -0.6,-1.6 -0.9,-2.2 -0.5,-3.3 0.3,-0.9 0.3,-0.9 0.7,-2 z"
   id="path75853" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 309.8,291.6 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.6 -0.2,-1.2 -0.2,-1.4 z"
   id="path75854" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 304.2,291.2 c 0.1,1.8 0.1,1.8 0.2,2.8 0.2,4.3 0.9,4.1 1.6,4.4 0.6,0.3 0.9,1.1 0.8,3.1 -0.2,-1.4 -0.3,-2.5 -1,-2.8 -0.8,-0.4 -1.6,-0.2 -1.7,-5 0,-0.7 0.1,-2.5 0.1,-2.5 z"
   id="path75855" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 294.1,291.8 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2.1,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.5 -0.2,-1.1 -0.2,-1.4 z"
   id="path75856" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 268.7,292.1 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2.1,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.6 -0.2,-1.2 -0.2,-1.4 z"
   id="path75857" />

							</g>

						</g>

						<g
   id="No_Fill_00000137124375358053457410000007776319057407909286_">
							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.5878"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="334.29999"
   y1="286.29999"
   x2="223.60001"
   y2="286.29999"
   id="line75857" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   d="m 335.9,296.6 c -39.6,8 -77.5,7.4 -113.8,0"
   id="path75858" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.283"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 336.1,298.1 c -39.6,8 -78,7.4 -114.4,0"
   id="path75859" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   d="m 334.3,288.2 c -39.1,10.3 -111,1.8 -110.9,-0.3"
   id="path75860" />

						</g>

						<g
   id="Drawstring_00000117659020821385177940000000085750491694044839_">
							<rect
   x="284"
   y="297.60001"
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   width="2.7"
   height="46.700001"
   id="rect75860" />

							<rect
   x="268.89999"
   y="297.60001"
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   width="2.7"
   height="46.700001"
   id="rect75861" />

						</g>

					</g>

				</g>
    {/* <g
       id="Long_Short_00000085967344697275896800000012148376114500282248_"
       transform="matrix(0.40517156,0,0,0.51959021,-82.858755,-61.807012)">
					<g
   id="Body_00000065785899099207379740000009594340973095524019_"
   transform="matrix(1.160341,0,0,0.97403157,-74.609784,14.479258)">
						<g
   id="g19007">
							<defs
   id="defs76">
								<path
   id="path324"
   d="m 561.3,368.1 c 10.2,63.5 20.4,127.1 30.5,190.6 l 69.4,-10.6 c -14.1,-77.9 -27.4,-155.9 -40,-234 -0.8,-5.2 -1.7,-10.3 -2.5,-15.5 -16.3,3.4 -37,6.2 -61,6 -20.5,-0.2 -38.4,-2.6 -53.1,-5.5 -1,5 -2,10 -3,15 -15.6,79.2 -27.5,157.2 -36.1,234 l 69.5,10.6 c 5.8,-61.4 14.2,-123.4 25.4,-185.7 0.3,-1.6 0.6,-3.3 0.9,-4.9 z" />

							</defs>

							<clipPath
   id="clipPath38175-5">
								<use
   xlinkHref="#No_Fill_00000041983096243786316580000013925177696118997656_"
   overflow="visible"
   id="use38175-5" />

							</clipPath>

							
								
							
								<use
   xlinkHref="#No_Fill_00000041983096243786316580000013925177696118997656_"
   overflow="visible"
   fill="none"
   stroke="#000000"
   strokeMiterlimit="10"
   id="use38338" />

						</g>

						<g
   id="Stitch_00000118355736384507349710000017779823467703966102_">
							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="660.40002"
   y1="545.79999"
   x2="591.40002"
   y2="555.79999"
   id="line19007" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="466.39999"
   y1="542.79999"
   x2="535.40002"
   y2="553.79999"
   id="line19008" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="659.40002"
   y1="542.79999"
   x2="591.40002"
   y2="552.79999"
   id="line19009" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   x1="466.39999"
   y1="539.79999"
   x2="535.40002"
   y2="550.79999"
   id="line19010" />

							
								<line
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   x1="561.29999"
   y1="368.10001"
   x2="561.29999"
   y2="304.79999"
   id="line19011" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 615.4,299.8 c 3.4,18.3 6.7,36.6 10,54.9 11.6,64.6 22.6,129.3 33,194.1"
   id="path19011" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.205"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 508.4,299.8 c -8.3,39.2 -16.1,80.4 -23.1,123.6 -7,43.5 -12.5,85.4 -16.9,125.4"
   id="path19012" />

						</g>

					</g>

					<g
   id="Waisband_00000103257777765350555470000007883610387124857278_"
   transform="matrix(1.160341,0,0,0.97403157,-74.609784,14.479258)">
						<g
   id="Front_Waisband_00000046327978025413406850000012065832359029852090_">
							
							
								<path
   id="Fill_00000118361070504937837790000016341657535846914717_"
   fill="none"
   stroke="#000000"
   strokeMiterlimit="10"
   d="m 618.7,298.7 c -0.5,-4 -1.1,-8 -1.6,-12 -37,6.9 -73.9,6.7 -110.7,0 -0.6,4 -1.1,8 -1.7,12 16.4,3.5 37.4,6.5 62,6 20.1,-0.4 37.7,-3 52,-6 z" />

							<g
   id="Stirch_00000128448147047917873740000017206659072655457942_">
								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 513.4,299.9 c 0,-1.9 0.2,-2.6 1,-2.9 0.6,-0.3 1.3,-0.3 1.5,-4.3 0,-0.2 0,-0.2 0.2,-2.2 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.7,0.3 -0.9,1.6 -1,2.5 z"
   id="path37943" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 522.2,301.1 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.8,1.4 1.2,1.7 z"
   id="path37944" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 530.8,291.1 c 0.2,2.6 -1.5,3 -2.5,4.6 -0.6,1 -0.7,2 -0.5,3.9 0.1,0.8 0.3,1.7 0.4,1.8 -0.6,-1.5 -0.9,-2.7 -0.8,-4.1 0.3,-2.5 2.3,-3.1 3.1,-5 0.1,-0.2 0.1,-0.4 0.2,-0.5 0.1,-0.3 0.1,-0.6 0.1,-0.7 z"
   id="path37945" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 533.8,301.7 c 0,-2.1 0.2,-2.8 1,-3.1 0.6,-0.3 1.3,-0.3 1.5,-4.7 0,-0.3 0,-0.3 0.2,-2.4 0.1,0.7 0.2,1.8 0.1,2.6 -0.2,4.4 -0.9,4.4 -1.7,4.8 -0.1,0.1 -0.4,0.2 -0.6,0.7 -0.4,0.6 -0.5,1.8 -0.5,2.1 z"
   id="path37946" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 536.8,303.4 c 0,-2.1 0.2,-2.8 1,-3.1 0.6,-0.3 1.3,-0.3 1.5,-4.7 0,-0.3 0,-0.3 0.2,-2.4 0.1,0.7 0.2,1.8 0.1,2.6 -0.2,4.4 -0.9,4.4 -1.7,4.8 -0.1,0.1 -0.4,0.2 -0.6,0.7 -0.3,0.6 -0.4,1.9 -0.5,2.1 z"
   id="path37947" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 546.5,292 c 0.1,0.9 -0.1,1.7 -0.9,2.6 -1.1,1.2 -2.4,1.9 -2.2,4.5 0.1,0.6 0.1,1.2 0.5,2.6 0,0 0,0 0,-0.1 -0.7,-1.7 -0.9,-2.7 -0.7,-3.7 0.2,-1.6 1.2,-2.4 1.9,-3.2 1.2,-1.1 1.3,-1.8 1.4,-2.7 z"
   id="path37948" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 558.2,301.7 c 0,-1.9 0.2,-2.6 1,-2.9 0.6,-0.3 1.3,-0.3 1.5,-4.3 0,-0.2 0,-0.2 0.2,-2.2 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.7,0.3 -0.9,1.6 -1,2.5 z"
   id="path37949" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 548.5,293.6 c 0.1,1 0.2,1.7 0.1,2.6 -0.2,4.2 -1.1,3.9 -1.8,4.3 -0.5,0.3 -0.7,1 -0.9,2.5 0,0.1 0,-0.5 0,-0.6 0,-2.5 0.9,-2.1 1.5,-2.6 0.9,-0.7 0.9,-3.4 0.9,-4.4 z"
   id="path37950" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 582.7,293.4 c 0.1,1.7 0.2,1.7 0.2,2.6 0.2,3.9 1,3.7 1.6,4 0.6,0.3 0.9,1 0.8,2.8 0,0.3 0,-1.8 -0.8,-2.4 -0.6,-0.5 -1.5,0 -1.9,-3.1 -0.1,-1.4 -0.1,-2.2 -0.1,-2.3 0.1,-0.8 0.1,-0.8 0.2,-1.6 z"
   id="path37951" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 567,302.9 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.8,1.5 1.2,1.7 z"
   id="path37952" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 573.2,304.6 c -0.2,-0.1 -0.9,-0.3 -1.3,-1.2 -0.6,-1.1 -0.3,-2.8 0.1,-3.8 0.7,-1.6 0.8,-2 0.5,-3 -0.2,-0.6 -0.3,-1.1 -0.5,-2.3 0.7,2.2 0.9,2.2 0.9,3 0,1 -0.7,2.1 -0.9,3 -0.3,1.3 0,2.3 0,2.6 0.3,1.1 0.7,1.5 1.2,1.7 z"
   id="path37953" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 614.7,298.9 c 0,-0.1 0,-0.2 -0.1,-0.3 0,-0.2 -0.4,-0.7 -0.5,-1.7 -0.1,-1.3 -0.1,-2.7 0,-4 0,-0.6 0.1,-1 0.3,-2.2 0,-0.1 0,0.8 0,0.9 0,1.1 0,1.1 -0.1,2.1 -0.1,2.1 0,2.8 0.1,4 0.1,0.6 0.2,0.9 0.2,1 0.1,0 0.1,0.1 0.1,0.2 z"
   id="path37954" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 607.4,290.7 c 0.1,1.7 0.2,1.7 0.2,2.6 0.2,3.9 1,3.7 1.6,4 0.6,0.3 0.9,1 0.8,2.9 -0.2,-1.3 -0.3,-2.3 -1,-2.6 -0.8,-0.4 -1.6,-0.2 -1.7,-4.6 0,-0.1 0,-0.2 0,-0.7 0,-0.8 0,-0.8 0.1,-1.6 z"
   id="path37955" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 602.4,291.1 c -0.3,1.9 -0.6,2.2 -0.6,2.9 -0.1,1 0.6,2 0.9,3.1 0.2,0.9 0.2,2.1 -0.1,2.9 -0.5,1 -1.2,1.3 -1.4,1.3 0.4,-0.2 1.1,-0.6 1.3,-2.2 0.1,-0.9 0,-2 -0.3,-2.7 -0.6,-1.6 -0.9,-2.2 -0.5,-3.3 0.3,-0.8 0.4,-0.8 0.7,-2 z"
   id="path37956" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 592.6,292 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.6 -0.3,-1.1 -0.2,-1.4 z"
   id="path37957" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 587,291.7 c 0.1,1.8 0.1,1.8 0.2,2.8 0.2,4.3 0.9,4.1 1.6,4.4 0.6,0.3 0.9,1.1 0.8,3.1 -0.2,-1.4 -0.3,-2.5 -1,-2.8 -0.8,-0.4 -1.6,-0.2 -1.7,-5 -0.1,-0.7 0.1,-2.5 0.1,-2.5 z"
   id="path37958" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 576.9,292.3 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2.1,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.6 -0.2,-1.2 -0.2,-1.4 z"
   id="path37959" />

								<path
   fill-rule="evenodd"
   clip-rule="evenodd"
   fill="#080504"
   d="m 551.5,292.5 c 0.1,1 0.3,1.7 1.6,2.9 1,1 2.1,1.9 1.8,4.3 -0.1,0.9 -0.7,2.3 -0.8,2.5 0.1,-0.3 0.4,-1.4 0.5,-2.9 0.2,-3.2 -2.2,-3.5 -2.9,-5.4 -0.3,-0.6 -0.2,-1.2 -0.2,-1.4 z"
   id="path37960" />

							</g>

						</g>

						<g
   id="No_Fill_00000067227248985549153140000000906995633611515780_">
							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   d="m 618.6,297 c -39.6,8 -77.5,7.4 -113.8,0"
   id="path37961" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.283"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   d="m 618.9,298.5 c -39.6,8 -78,7.4 -114.4,0"
   id="path37962" />

							
								<path
   fill="none"
   stroke="#080504"
   strokeWidth="0.2177"
   stroke-linecap="round"
   strokeLinejoin="round"
   strokeMiterlimit="1.5"
   strokeDasharray="0.6532, 0.6532, 0, 0, 0, 0"
   d="m 617.1,288.6 c -39.1,10.3 -111,1.8 -110.9,-0.3"
   id="path37963" />

						</g>

					</g>

				</g>
  </g> */}
  </g>
  </StandardSVGWrapper>

  </div>
  );
};

export default PatternedTrackPantsSVG;