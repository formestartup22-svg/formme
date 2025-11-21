import React from 'react';

export interface ElementType {
  id: string;
  name: string;
  category: string;
  type: string;
  preview: React.ReactNode;
}

export interface CanvasPatterns {
  body?: string;
  sleeves?: string;
  collar?: string;
  stripesColor?: string;
}

export interface CanvasElementType extends ElementType {
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  zIndex: number;
  width?: string | number;
  height?: string | number;
  text?: string;
  style?: Omit<React.CSSProperties, 'textAlign' | 'textDecoration'> & {
    textAlign?: any;
    textDecoration?: string;
  };

  // Garment-specific properties
  templateId?: string;
  colors?: TShirtColors;
  patterns?: CanvasPatterns;
  uploadedPatterns?: CanvasPatterns;
  fabric?: any;
  buttons?: any[];
}

export interface BackgroundSettings {
  type: 'color' | 'gradient';
  value: string;
}

export interface LayerType {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  elements: CanvasElementType[];
}

export type DrawingTool = 'draw' | 'erase' | null;

export type CollarType = 'round' | 'v-neck' | 'polo' | 'henley' | 'crew';
export type SleeveType = 'short' | 'long' | 'sleeveless' | 'raglan';
export type FitType = 'regular' | 'slim' | 'oversized' | 'relaxed';

export interface TShirtColors {
  body: string;
  sleeves: string;
  collar: string;
  stripesColor?: string;
}

export interface ThreeDModelSettings {
  colors: TShirtColors;
  texture: string | null;
  normal: string | null;
  roughness: number;
  metalness: number;
  collarType: CollarType;
  sleeveType: SleeveType;
  fitType: FitType;
}
