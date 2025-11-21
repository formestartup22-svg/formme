
import React from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface ButtonPaletteProps {
  onButtonSelect?: (style: string, size: string) => void;
}

const ButtonDraggable = ({ style, size, label }: { style: string, size: string, label: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BUTTON_ELEMENT',
    item: { style, size },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [style, size]);

  const getButtonSize = (size: string) => {
    switch (size) {
      case 'small': return 'w-6 h-6';
      case 'medium': return 'w-8 h-8';
      case 'large': return 'w-10 h-10';
      default: return 'w-6 h-6';
    }
  };

  const getButtonStyle = (style: string, size: string) => {
    const sizeClass = getButtonSize(size);
    const baseClass = `${sizeClass} bg-gray-700 border-2 border-gray-500`;

    switch (style) {
      case 'round':
        return `${baseClass} rounded-full`;
      case 'square':
        return `${baseClass} rounded-none`;
      case 'oval':
        return `${baseClass} rounded-full`;
      default:
        return `${baseClass} rounded-full`;
    }
  };

  return (
    <div
      ref={drag}
      className={`flex flex-col items-center p-3 border border-gray-200 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40' : 'hover:border-blue-300 hover:bg-blue-50'}`}
      style={{ pointerEvents: isDragging ? 'none' : 'auto', opacity: isDragging ? 0.5 : 1 }}
      draggable={false}
    >
      <div 
        className={getButtonStyle(style, size)}
        style={{ 
          minWidth: size === 'large' ? '40px' : size === 'medium' ? '32px' : '24px',
          minHeight: size === 'large' ? '40px' : size === 'medium' ? '32px' : '24px',
          pointerEvents: 'none'
        }}
      />
      <span className="text-xs text-gray-600 mt-2 text-center leading-tight pointer-events-none">
        {label}
      </span>
    </div>
  );
};

const ButtonPalette = ({ onButtonSelect }: ButtonPaletteProps) => {
  const buttonTypes = [
    { style: 'round', size: 'small', label: 'Small Round' },
    { style: 'round', size: 'medium', label: 'Medium Round' },
    { style: 'round', size: 'large', label: 'Large Round' },
    { style: 'square', size: 'small', label: 'Small Square' },
    { style: 'square', size: 'medium', label: 'Medium Square' },
    { style: 'square', size: 'large', label: 'Large Square' },
    { style: 'oval', size: 'small', label: 'Small Oval' },
    { style: 'oval', size: 'medium', label: 'Medium Oval' },
    { style: 'oval', size: 'large', label: 'Large Oval' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Plus size={16} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-700">Add Buttons</h3>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-2">
          <GripVertical size={12} />
          <span>How to add buttons:</span>
        </div>
        <p className="text-blue-600 text-xs leading-relaxed">
          1. Select the "Buttons" tool from the toolbar<br/>
          2. Drag any button from below and drop it onto the t-shirt<br/>
          3. Click placed buttons to select and delete them
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {buttonTypes.map((buttonType, index) => (
          <ButtonDraggable
            key={index}
            style={buttonType.style}
            size={buttonType.size}
            label={buttonType.label}
          />
        ))}
      </div>
    </div>
  );
};

export default ButtonPalette;
