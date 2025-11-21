
import React from 'react';
import { FabricProperties } from '@/hooks/useStudioState';

interface VNeckCollarSVGProps {
  className?: string;
  collarColor?: string;
  collarPattern?: string;
  fabric?: FabricProperties;
}

const VNeckCollarSVG = ({ 
  className = "", 
  collarColor = "#f3f4f6",
  collarPattern,
  fabric
}: VNeckCollarSVGProps) => {
  const patternId = React.useId();
  
  // Add safety check for fabric
  const safeFabric = fabric || { name: 'Cotton', texture: 'cotton', roughness: 0.8, metalness: 0.1 };
  
  // Function to get the fill value for collar
  const getFillValue = () => {
    if (collarPattern) {
      return `url(#collar-pattern-${patternId})`;
    } else if (safeFabric.texture !== 'cotton') {
      return `url(#collar-fabric-${patternId})`;
    } else {
      return collarColor;
    }
  };
  
  return (
    <svg 
      version="1.0" 
      xmlns="http://www.w3.org/2000/svg"
      width="300pt" 
      height="172pt" 
      viewBox="0 0 300 172"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <defs>
        {/* Fabric texture pattern for collar */}
        <pattern id={`collar-fabric-${patternId}`} patternUnits="userSpaceOnUse" width="30" height="30">
          <rect width="30" height="30" fill={collarColor}/>
          {safeFabric.texture === 'cotton' && (
            <>
              <circle cx="5" cy="5" r="0.8" fill="rgba(0,0,0,0.04)" />
              <circle cx="15" cy="8" r="0.6" fill="rgba(0,0,0,0.03)" />
              <circle cx="25" cy="12" r="0.7" fill="rgba(0,0,0,0.05)" />
            </>
          )}
          {safeFabric.texture === 'polyester' && (
            <>
              <rect x="2" y="2" width="2" height="2" fill="rgba(255,255,255,0.12)" opacity="0.8"/>
              <rect x="8" y="6" width="1.5" height="1.5" fill="rgba(255,255,255,0.1)" opacity="0.7"/>
            </>
          )}
        </pattern>

        {/* Pattern definitions for collar */}
        {collarPattern && (
          <pattern id={`collar-pattern-${patternId}`} patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill={collarColor} />
            {collarPattern === 'stripes' && (
              <>
                <rect x="0" y="0" width="20" height="10" fill="#000" opacity="0.1" />
                <rect x="0" y="10" width="20" height="10" fill="transparent" />
              </>
            )}
            {collarPattern === 'polka-dots' && (
              <circle cx="10" cy="10" r="3" fill="#000" opacity="0.15" />
            )}
            {collarPattern === 'checkerboard' && (
              <>
                <rect x="0" y="0" width="10" height="10" fill="#000" opacity="0.1" />
                <rect x="10" y="10" width="10" height="10" fill="#000" opacity="0.1" />
              </>
            )}
          </pattern>
        )}
      </defs>
      
      <g transform="translate(0,172) scale(0.1,-0.1)" fill={getFillValue()} stroke="none">
        <path d="M490 1596 c-100 -26 -161 -57 -183 -94 -19 -34 -35 -124 -39 -220 l-3 -73 68 -23 c37 -12 73 -28 79 -34 14 -14 24 -84 39 -292 14 -201 10 -240 -63 -558 -28 -122 -49 -225 -46 -228 17 -16 188 -35 369 -41 202 -6 403 5 512 29 43 9 48 13 44 32 -3 11 -26 106 -51 211 -69 285 -77 356 -66 565 5 96 12 199 16 229 6 51 9 54 48 71 22 10 58 22 79 25 36 7 37 9 37 49 0 70 -20 206 -37 247 -20 50 -70 81 -180 108 -97 25 -93 25 -93 5 0 -9 -5 -12 -12 -8 -7 4 -8 3 -4 -5 5 -7 -9 -19 -41 -33 -69 -31 -200 -36 -279 -12 -32 10 -65 18 -71 17 -7 0 -11 3 -8 7 3 5 0 12 -6 16 -22 13 -1 -58 45 -151 29 -59 66 -114 106 -158 74 -80 66 -90 -11 -12 -61 62 -119 152 -149 233 -39 104 -34 111 60 75 30 -11 80 -24 112 -27 57 -7 170 7 198 26 12 8 11 8 -4 4 -98 -31 -245 -23 -328 19 -27 14 -50 25 -51 24 -1 0 -40 -11 -87 -23z"/>
        
        <path d="M1034 1539 c-27 -92 -92 -205 -160 -277 -35 -37 -63 -64 -64 -61 0 3 27 39 61 80 64 79 130 203 150 282 7 27 15 45 20 40 5 -5 2 -33 -7 -64z"/>
        
        <path d="M564 1543 c40 -127 159 -307 227 -344 56 -30 214 185 259 354 10 36 17 46 29 43 140 -39 134 -35 127 -64 -20 -95 -37 -206 -32 -219 3 -8 1 -24 -6 -36 -6 -12 -12 -56 -13 -97 -2 -131 -16 -343 -26 -397 -7 -35 -7 -71 0 -110 6 -32 15 -89 22 -128 6 -38 29 -144 50 -234 21 -89 37 -167 34 -171 -3 -5 -37 -14 -75 -20 -39 -6 -70 -16 -70 -21 0 -5 11 -7 25 -4 14 3 37 8 52 11 68 15 83 14 83 -5 0 -11 -7 -22 -15 -25 -114 -44 -783 -40 -867 5 -28 15 -23 43 6 35 51 -13 132 -17 116 -7 -8 6 -27 11 -41 11 -14 0 -40 5 -56 10 l-30 11 19 77 c10 42 26 111 34 152 9 41 22 79 29 85 14 11 167 465 157 465 -4 0 -41 -101 -81 -225 -41 -123 -76 -223 -78 -222 -1 2 4 45 12 97 12 78 40 320 60 515 l5 40 -9 -34 c-5 -19 -15 -88 -22 -153 -6 -66 -15 -115 -19 -111 -7 8 -29 239 -35 368 -7 126 -25 246 -51 337 -4 13 11 22 73 42 43 14 81 25 84 26 3 0 13 -26 23 -57z"/>
        
        <path d="M1004 1547 c-6 -17 -83 -47 -121 -47 -13 0 -23 -4 -23 -9 0 -10 82 4 111 20 11 6 22 9 25 7 11 -12 -85 -175 -135 -230 l-57 -62 -57 68 c-52 63 -127 190 -127 215 0 7 13 6 38 -3 57 -20 102 -27 102 -16 0 6 -11 10 -24 10 -41 0 -126 32 -126 48 0 10 5 12 18 7 53 -23 90 -34 113 -35 14 0 29 -3 32 -7 9 -8 66 -10 61 -2 -2 4 6 7 19 7 32 0 108 22 131 38 23 16 29 13 20 -9z"/>
        
        <path d="M1071 1039 c0 -33 47 -288 48 -267 1 22 -39 281 -45 287 -2 2 -4 -7 -3 -20z"/>
        <path d="M989 954 c49 -169 104 -341 111 -348 4 -4 -17 75 -48 177 -32 102 -60 189 -64 193 -4 4 -4 -6 1 -22z"/>
        <path d="M550 101 c0 -10 60 -24 68 -16 8 8 0 12 -35 18 -18 4 -33 3 -33 -2z"/>
        <path d="M993 102 c-18 -2 -33 -8 -33 -14 0 -6 10 -8 23 -4 12 3 39 6 60 6 20 0 37 4 37 10 0 9 -13 9 -87 2z"/>
        <path d="M880 91 c0 -5 16 -9 35 -9 19 0 35 4 35 9 0 5 -16 9 -35 9 -19 0 -35 -4 -35 -9z"/>
        <path d="M777 1463 c-18 -17 -5 -33 28 -33 28 0 35 4 35 20 0 15 -7 20 -28 20 -16 0 -32 -3 -35 -7z"/>
        <path d="M284 1249 c-5 -9 1 -10 20 -5 14 3 26 2 26 -3 0 -5 14 -14 31 -20 39 -13 39 -13 39 0 0 5 -4 7 -10 4 -5 -3 -10 -1 -10 5 0 6 -5 8 -10 5 -6 -3 -17 1 -26 9 -18 19 -50 21 -60 5z"/>
        
        {/* Right side paths */}
        <path d="M2424 1602 c-42 -23 -131 -42 -194 -42 -59 0 -165 24 -187 42 -29 24 -236 -28 -282 -71 -34 -32 -50 -95 -58 -227 l-6 -91 70 -21 c39 -12 75 -27 81 -34 13 -17 31 -185 39 -363 6 -157 -4 -228 -78 -534 -22 -94 -36 -168 -31 -173 5 -5 51 -16 103 -26 188 -32 772 -15 809 25 4 4 -7 67 -25 138 -84 330 -90 366 -88 555 2 207 17 370 35 382 7 4 44 18 81 29 l68 21 -6 77 c-10 112 -32 211 -52 233 -27 30 -63 46 -161 72 -82 22 -90 22 -118 8z"/>
        
        <path d="M2066 1578 c35 -15 76 -23 144 -26 83 -4 105 -1 173 22 87 29 111 32 83 11 -10 -8 -23 -12 -27 -9 -5 3 -9 1 -9 -5 0 -12 -89 -38 -153 -44 -58 -6 -170 8 -200 25 -12 7 -28 13 -36 14 -18 3 -49 34 -34 34 6 0 32 -10 59 -22z"/>
        
        <path d="M2412 980 c3 -8 29 -95 59 -194 29 -98 55 -174 56 -169 4 11 -103 363 -113 372 -4 3 -5 -1 -2 -9z"/>
        <path d="M2523 123 c-13 -2 -23 -9 -23 -15 0 -5 7 -7 16 -4 9 3 27 6 40 6 13 0 24 5 24 10 0 10 -16 11 -57 3z"/>
        <path d="M2654 1383 c-37 -77 -39 -84 -15 -48 22 33 54 105 47 105 -3 0 -17 -26 -32 -57z"/>
        <path d="M1800 1290 c17 -22 37 -40 43 -40 6 0 -7 18 -28 40 -21 22 -41 40 -43 40 -2 0 11 -18 28 -40z"/>
      </g>
    </svg>
  );
};

export default VNeckCollarSVG;
