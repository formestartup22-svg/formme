
import React, { useState } from 'react';
import { CanvasButton } from '@/hooks/useCanvasButtons';

interface SVGButtonElementProps {
  button: CanvasButton;
  isSelected: boolean;
  onButtonClick: (buttonId: string) => void;
  onButtonDelete: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  onButtonResize?: (buttonId: string, scale: number) => void;
  svgWidth: number;
  svgHeight: number;
}

const SVGButtonElement = ({
  button,
  isSelected,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  onButtonResize,
  svgWidth,
  svgHeight
}: SVGButtonElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Much larger button sizes
  const sizeMap = {
    small: 20,    // Increased from 8
    medium: 28,   // Increased from 12
    large: 36     // Increased from 16
  };

  const buttonSize = sizeMap[button.size];
  
  // Convert percentage position to SVG coordinates
  const x = (button.position.x / 100) * svgWidth;
  const y = (button.position.y / 100) * svgHeight;

  // Much larger interaction zones for easier selection
  const baseRadius = (buttonSize * (button.scale || 1)) / 2;
  const interactionRadius = Math.max(50, baseRadius + 40); // Increased minimum to 50px
  const hoverRadius = interactionRadius + 15; // Even larger hover area

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onButtonClick(button.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onButtonDelete(button.id);
  };

  // Enhanced drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onButtonDrag) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Auto-select on drag start
    if (!isSelected) {
      onButtonClick(button.id);
    }
    
    const svgElement = e.currentTarget.closest('svg');
    if (!svgElement) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = svgElement.getBoundingClientRect();
      const svgX = moveEvent.clientX - rect.left;
      const svgY = moveEvent.clientY - rect.top;
      
      // Convert back to percentage
      const percentX = (svgX / rect.width) * 100;
      const percentY = (svgY / rect.height) * 100;
      
      // Constrain to SVG bounds with padding
      const constrainedX = Math.max(10, Math.min(90, percentX));
      const constrainedY = Math.max(10, Math.min(90, percentY));
      
      onButtonDrag(button.id, { x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Improved resize with scroll wheel
  const handleResize = (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (!onButtonResize) return;

    const currentScale = button.scale || 1;
    const scaleChange = direction === 'up' ? 0.25 : -0.25;
    const newScale = Math.max(0.5, Math.min(3, currentScale + scaleChange));
    
    onButtonResize(button.id, newScale);
  };

  const handleWheelResize = (e: React.WheelEvent) => {
    if (!isSelected || !onButtonResize) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentScale = button.scale || 1;
    const scaleChange = e.deltaY > 0 ? -0.15 : 0.15;
    const newScale = Math.max(0.5, Math.min(3, currentScale + scaleChange));
    
    onButtonResize(button.id, newScale);
  };

  const renderButton = () => {
    const commonProps = {
      style: { 
        cursor: isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        filter: isSelected ? 'drop-shadow(0 6px 16px rgba(59, 130, 246, 0.5))' : 
                isHovering ? 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))' : 'none'
      },
      className: `${isSelected ? 'stroke-blue-500 stroke-[4]' : isHovering ? 'stroke-blue-400 stroke-[3]' : 'stroke-gray-600 stroke-2'} 
                  ${isDragging ? 'opacity-70' : ''} 
                  transition-all duration-200 ease-out`
    };

    if (button.style === 'round') {
      return (
        <g transform={`translate(${x}, ${y}) scale(${button.scale || 1}) rotate(${button.rotation || 0})`}>
          <circle
            cx="0"
            cy="0"
            r={buttonSize / 2}
            fill={button.color}
            {...commonProps}
          />
          {/* Larger button holes with better visibility */}
          <circle cx="-4" cy="-4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="4" cy="-4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="-4" cy="4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="4" cy="4" r="1.5" fill="rgba(0,0,0,0.6)" />
        </g>
      );
    }

    if (button.style === 'square') {
      return (
        <g transform={`translate(${x}, ${y}) scale(${button.scale || 1}) rotate(${button.rotation || 0})`}>
          <rect
            x={-buttonSize / 2}
            y={-buttonSize / 2}
            width={buttonSize}
            height={buttonSize}
            fill={button.color}
            rx="2"
            {...commonProps}
          />
          {/* Larger button holes with better visibility */}
          <circle cx="-4" cy="-4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="4" cy="-4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="-4" cy="4" r="1.5" fill="rgba(0,0,0,0.6)" />
          <circle cx="4" cy="4" r="1.5" fill="rgba(0,0,0,0.6)" />
        </g>
      );
    }

    // Oval style
    return (
      <g transform={`translate(${x}, ${y}) scale(${button.scale || 1}) rotate(${button.rotation || 0})`}>
        <ellipse
          cx="0"
          cy="0"
          rx={buttonSize * 0.6}
          ry={buttonSize * 0.4}
          fill={button.color}
          {...commonProps}
        />
        {/* Larger button holes with better visibility */}
        <circle cx="-6" cy="0" r="1.5" fill="rgba(0,0,0,0.6)" />
        <circle cx="6" cy="0" r="1.5" fill="rgba(0,0,0,0.6)" />
      </g>
    );
  };

  return (
    <g>
      {/* Extra large invisible interaction area */}
      <circle
        cx={x}
        cy={y}
        r={hoverRadius}
        fill="transparent"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onWheel={handleWheelResize}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ 
          cursor: isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        }}
        className="transition-all duration-200"
      />

      {renderButton()}
      
      {/* Enhanced visual feedback with larger selection rings */}
      {(isSelected || isHovering) && (
        <g>
          {/* Outer selection ring - much more prominent */}
          <circle
            cx={x}
            cy={y}
            r={interactionRadius}
            fill="none"
            stroke={isSelected ? "rgba(59, 130, 246, 0.9)" : "rgba(156, 163, 175, 0.7)"}
            strokeWidth={isSelected ? "3" : "2"}
            strokeDasharray={isSelected ? "8,4" : "6,3"}
            className={isSelected ? "animate-pulse" : ""}
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Inner selection area - more visible */}
          {isSelected && (
            <>
              <circle
                cx={x}
                cy={y}
                r={interactionRadius - 12}
                fill="rgba(59, 130, 246, 0.12)"
                stroke="none"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Larger corner indicators */}
              <g transform={`translate(${x}, ${y})`}>
                <circle cx={-interactionRadius + 6} cy={-interactionRadius + 6} r="3" fill="rgba(59, 130, 246, 0.9)" />
                <circle cx={interactionRadius - 6} cy={-interactionRadius + 6} r="3" fill="rgba(59, 130, 246, 0.9)" />
                <circle cx={-interactionRadius + 6} cy={interactionRadius - 6} r="3" fill="rgba(59, 130, 246, 0.9)" />
                <circle cx={interactionRadius - 6} cy={interactionRadius - 6} r="3" fill="rgba(59, 130, 246, 0.9)" />
              </g>
            </>
          )}

          {/* Larger delete button */}
          <g transform={`translate(${x + interactionRadius - 12}, ${y - interactionRadius + 12})`}>
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="#ef4444"
              stroke="white"
              strokeWidth="4"
              onClick={handleDeleteClick}
              style={{ cursor: 'pointer' }}
              className="hover:fill-red-600 drop-shadow-lg transition-all duration-200 hover:scale-110"
            />
            <path
              d="M-6,-6 L6,6 M6,-6 L-6,6"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              onClick={handleDeleteClick}
              style={{ cursor: 'pointer', pointerEvents: 'none' }}
            />
          </g>

          {/* Larger resize controls */}
          {onButtonResize && isSelected && (
            <g>
              {/* Increase size button - larger */}
              <g transform={`translate(${x + interactionRadius - 12}, ${y + interactionRadius - 12})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="4"
                  onClick={(e) => handleResize(e, 'up')}
                  style={{ cursor: 'pointer' }}
                  className="hover:fill-green-600 drop-shadow-lg transition-all duration-200 hover:scale-110"
                />
                <path
                  d="M-5,0 L5,0 M0,-5 L0,5"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ pointerEvents: 'none' }}
                />
              </g>

              {/* Decrease size button - larger */}
              <g transform={`translate(${x - interactionRadius + 12}, ${y + interactionRadius - 12})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth="4"
                  onClick={(e) => handleResize(e, 'down')}
                  style={{ cursor: 'pointer' }}
                  className="hover:fill-amber-600 drop-shadow-lg transition-all duration-200 hover:scale-110"
                />
                <path
                  d="M-5,0 L5,0"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            </g>
          )}

          {/* Larger instruction tooltip */}
          {isSelected && (
            <g transform={`translate(${x}, ${y - interactionRadius - 30})`}>
              <rect
                x="-65"
                y="-16"
                width="130"
                height="32"
                fill="rgba(0,0,0,0.9)"
                rx="16"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="medium"
                style={{ pointerEvents: 'none' }}
              >
                {isDragging ? 'Dragging...' : 'Drag to move • Scroll to resize'}
              </text>
            </g>
          )}

          {/* Larger scale indicator */}
          {isSelected && button.scale !== 1 && (
            <g transform={`translate(${x}, ${y + interactionRadius + 35})`}>
              <rect
                x="-25"
                y="-14"
                width="50"
                height="28"
                fill="rgba(59, 130, 246, 0.95)"
                rx="14"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {Math.round((button.scale || 1) * 100)}%
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export default SVGButtonElement;
