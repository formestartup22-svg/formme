
import React from 'react';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import TshirtSVG from './SVGs/SweaterSVGs';
import mannequinSVG from '@/assets/mannequin.svg';

interface MannequinDisplayProps {
  colors: {
    body: string;
    sleeves: string;
    collar: string;
  };
  patterns: StudioPatterns;
  fabric: FabricProperties;
  selectedTemplate: string;
  className?: string;
}

const MannequinDisplay = ({ 
  colors, 
  patterns, 
  fabric, 
  selectedTemplate,
  className = ""
}: MannequinDisplayProps) => {
  
  const renderTshirtOnMannequin = () => {
    return (
      <div className="absolute" style={{ 
        left: '50%',
        top: '32%',
        width: '42%', 
        height: '35%',
        transform: 'translateX(-50%)',
        zIndex: 15
      }}>
        <TshirtSVG
          bodyColor={colors.body}
          sleevesColor={colors.sleeves}
          collarColor={colors.collar}
          bodyPattern={patterns.body}
          sleevesPattern={patterns.sleeves}
          collarPattern={patterns.collar}
          fabric={fabric}
          className="w-full h-full"
        />
      </div>
    );
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-full h-auto max-w-sm">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] to-[#EFEDE6] rounded-lg"></div>
        
        {/* Mannequin SVG */}
        <img 
          src={mannequinSVG} 
          alt="Dress mannequin" 
          className="w-full h-auto relative z-10"
        />
        
        {/* T-shirt overlay - positioned to align with mannequin's torso area */}
        {renderTshirtOnMannequin()}
      </div>
    </div>
  );
};

export default MannequinDisplay;
