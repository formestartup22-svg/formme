
import { useState } from 'react';

export interface CanvasButton {
  id: string;
  size: 'small' | 'medium' | 'large';
  style: 'round' | 'square' | 'oval';
  color: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export const useCanvasButtons = () => {
  const [buttons, setButtons] = useState<CanvasButton[]>([]);
  const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);

  console.log('🔍 useCanvasButtons: Hook called, current buttons count:', buttons.length);

  const addButton = (buttonData: Omit<CanvasButton, 'id'>) => {
    const newButton: CanvasButton = {
      ...buttonData,
      id: `button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    console.log('🔍 useCanvasButtons: Creating new button:', newButton);
    
    setButtons(prev => {
      console.log('🔍 useCanvasButtons: Previous buttons:', prev);
      const newButtons = [...prev, newButton];
      console.log('🔍 useCanvasButtons: New buttons array:', newButtons);
      console.log('🔍 useCanvasButtons: New buttons length:', newButtons.length);
      return newButtons;
    });
    
    console.log('🔍 useCanvasButtons: Button add function completed, returning ID:', newButton.id);
    return newButton.id;
  };

  const addButtonAtCenter = (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => {
    console.log('🔍 useCanvasButtons: addButtonAtCenter called with:', style, size);
    console.log('🔍 useCanvasButtons: Current state before adding:', { buttonsCount: buttons.length, selectedButtonId });
    
    // Add button at center of SVG (50% x, 50% y)
    const newButtonId = addButton({
      style,
      size,
      color: '#2c3e50',
      position: { x: 50, y: 50 }, // Center of SVG
      scale: 1,
      rotation: 0,
    });

    console.log('🔍 useCanvasButtons: Button created with ID:', newButtonId);
    
    // Select the new button
    setSelectedButtonId(newButtonId);
    console.log('🔍 useCanvasButtons: Selected new button:', newButtonId);
    
    return newButtonId;
  };

  const updateButton = (id: string, updates: Partial<CanvasButton>) => {
    console.log('🔍 useCanvasButtons: Updating button:', id, updates);
    setButtons(prev => prev.map(button => 
      button.id === id ? { ...button, ...updates } : button
    ));
  };

  const updateButtonPosition = (id: string, newPosition: { x: number; y: number }) => {
    console.log('🔍 useCanvasButtons: Updating button position:', id, newPosition);
    updateButton(id, { position: newPosition });
  };

  const updateButtonScale = (id: string, scale: number) => {
    console.log('🔍 useCanvasButtons: Updating button scale:', id, scale);
    updateButton(id, { scale });
  };

  const deleteButton = (id: string) => {
    console.log('🔍 useCanvasButtons: Deleting button:', id);
    setButtons(prev => prev.filter(button => button.id !== id));
    if (selectedButtonId === id) {
      setSelectedButtonId(null);
    }
  };

  const selectButton = (id: string | null) => {
    console.log('🔍 useCanvasButtons: Selecting button:', id);
    setSelectedButtonId(id);
  };

  console.log('🔍 useCanvasButtons: Hook returning state - buttons:', buttons.length, 'selected:', selectedButtonId);

  return {
    buttons,
    selectedButtonId,
    addButton,
    addButtonAtCenter,
    updateButton,
    updateButtonPosition,
    updateButtonScale,
    deleteButton,
    selectButton,
  };
};
