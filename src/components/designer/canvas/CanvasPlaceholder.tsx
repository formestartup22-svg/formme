
import React from 'react';

interface CanvasPlaceholderProps {
  position: { x: number; y: number };
}

const CanvasPlaceholder = ({ position }: CanvasPlaceholderProps) => {
  return (
    <div 
      className="absolute w-10 h-10 rounded-lg border-2 border-dashed border-orange-500 bg-orange-100/50 pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default CanvasPlaceholder;
