
import React from 'react';
import { Button } from '@/components/ui/button';

const ButtonPalette = () => {
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

  const handleDragStart = (e: React.DragEvent, buttonType: { style: string; size: string }) => {
    console.log('Drag started for button:', buttonType);
    e.dataTransfer.setData('application/button-type', `${buttonType.style}-${buttonType.size}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {buttonTypes.map((buttonType, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => handleDragStart(e, buttonType)}
          >
            <div 
              className={getButtonStyle(buttonType.style, buttonType.size)}
              style={{ 
                minWidth: buttonType.size === 'large' ? '40px' : buttonType.size === 'medium' ? '32px' : '24px',
                minHeight: buttonType.size === 'large' ? '40px' : buttonType.size === 'medium' ? '32px' : '24px'
              }}
            />
            <span className="text-xs text-gray-600 mt-2 text-center leading-tight">
              {buttonType.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag any button onto the t-shirt</li>
          <li>• Click on placed buttons to select them</li>
          <li>• Click the ✕ to delete selected buttons</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonPalette;
