
import React from 'react';

interface ButtonElementProps {
  size?: 'small' | 'medium' | 'large';
  style?: 'round' | 'square' | 'oval';
  color?: string;
  position: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

const ButtonElement = ({ 
  size = 'medium', 
  style = 'round', 
  color = '#2c3e50',
  position,
  scale = 1,
  rotation = 0
}: ButtonElementProps) => {
  const sizeMap = {
    small: 12,
    medium: 16,
    large: 20
  };

  const buttonSize = sizeMap[size];
  
  const commonStyles = {
    position: 'absolute' as const,
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    transition: 'all 0.2s ease',
  };

  if (style === 'round') {
    return (
      <div style={commonStyles}>
        <div
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: '50%',
            background: `linear-gradient(145deg, ${color}, ${color}dd)`,
            border: '1px solid rgba(0,0,0,0.2)',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {/* Button holes */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '25%',
              right: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              right: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
        </div>
      </div>
    );
  }

  if (style === 'square') {
    return (
      <div style={commonStyles}>
        <div
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: '2px',
            background: `linear-gradient(145deg, ${color}, ${color}dd)`,
            border: '1px solid rgba(0,0,0,0.2)',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {/* Button holes */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '25%',
              right: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              right: '25%',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
        </div>
      </div>
    );
  }

  // Oval style
  return (
    <div style={commonStyles}>
      <div
        style={{
          width: buttonSize * 1.2,
          height: buttonSize * 0.8,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${color}, ${color}dd)`,
          border: '1px solid rgba(0,0,0,0.2)',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {/* Button holes */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
};

export default ButtonElement;
