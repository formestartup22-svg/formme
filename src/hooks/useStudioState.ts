
import { useState } from 'react';

export interface StudioColors {
  body: string;
  sleeves: string;
  collar: string;
  stripesColor: string;
}

export interface StudioPatterns {
  body: string;
  sleeves: string;
  collar: string;
  stripesColor: string;
}

export interface FabricProperties {
  name: string;
  texture: string;
  roughness: number;
  metalness: number;
}

export const useStudioState = () => {
  const [colors, setColors] = useState<StudioColors>({
    body: '#ffffff',
    sleeves: '#ffffff',
    collar: '#ffffff',
    stripesColor: '#ffffff'
  });

  const [patterns, setPatterns] = useState<StudioPatterns>({
    body: '',
    sleeves: '',
    collar: '',
    stripesColor: ''
  });

  // New state for uploaded custom patterns
  const [uploadedPatterns, setUploadedPatterns] = useState<StudioPatterns>({
    body: '',
    sleeves: '',
    collar: '',
    stripesColor: ''
  });

  const [selectedFabric, setSelectedFabric] = useState('Cotton');
  
  const [fabric, setFabric] = useState<FabricProperties>({
    name: 'Cotton',
    texture: 'cotton',
    roughness: 0.8,
    metalness: 0.1
  });

  // New state for back mode toggle
  const [isBackMode, setIsBackMode] = useState(false);

  const updateColor = (part: keyof StudioColors, color: string) => {
    console.warn('what is the updated color', color);
    setColors(prev => ({
      ...prev,
      [part]: color
    }));
  };

  const updatePattern = (part: keyof StudioPatterns, pattern: string) => {
    setPatterns(prev => ({
      ...prev,
      [part]: pattern
    }));
  };

  const updateUploadedPattern = (part: keyof StudioPatterns, patternId: string) => {
    setUploadedPatterns(prev => ({
      ...prev,
      [part]: patternId
    }));
  };

  const updateFabric = (fabricName: string) => {
    const fabricTypes = {
      'Cotton': { name: 'Cotton', texture: 'cotton', roughness: 0.8, metalness: 0.1 },
      'Polyester': { name: 'Polyester', texture: 'polyester', roughness: 0.5, metalness: 0.2 },
      'Linen': { name: 'Linen', texture: 'linen', roughness: 0.9, metalness: 0.05 },
      'Bamboo': { name: 'Bamboo', texture: 'bamboo', roughness: 0.6, metalness: 0.15 }
    };
    
    const newFabric = fabricTypes[fabricName as keyof typeof fabricTypes] || fabricTypes.Cotton;
    setFabric(newFabric);
    setSelectedFabric(fabricName);
  };

  const toggleBackMode = () => {
    setIsBackMode(prev => !prev);
  };

  return {
    colors,
    patterns,
    uploadedPatterns,
    selectedFabric,
    fabric,
    isBackMode,
    updateColor,
    updatePattern,
    updateUploadedPattern,
    setSelectedFabric: updateFabric,
    toggleBackMode
  };
};
