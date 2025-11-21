
import React, { useState } from 'react';
import GarmentRenderer from '../studio/GarmentRenderer';
import RealisticPreviewButton from '../studio/RealisticPreviewButton';
import Enhanced3DDesigner from '../studio/Enhanced3DDesigner';
import { Button } from '@/components/ui/button';
import { View, Eye } from 'lucide-react';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';

interface ThreeDPreviewProps {
  selectedTemplate?: string;
  colors?: StudioColors;
  patterns?: StudioPatterns;
  uploadedPatterns?: StudioPatterns;
  fabric?: FabricProperties;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  onPatternDrop?: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void;
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  activeTool?: string | null;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
}

const ThreeDPreview = ({ 
  selectedTemplate = 'crew-neck-basic',
  colors = { body: '#ffffff', sleeves: '#ffffff', collar: '#ffffff', stripesColor: '#ffffff' },
  patterns = { body: '', sleeves: '', collar: '', stripesColor: '' },
  uploadedPatterns = { body: '', sleeves: '', collar: '', stripesColor: '' },
  fabric = { name: 'Cotton', texture: 'cotton', roughness: 0.8, metalness: 0.1 },
  getPatternById,
  onPatternDrop,
  onPatternUpdate,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  activeTool,
  onButtonPlacement
}: ThreeDPreviewProps) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  console.log('🔍 ThreeDPreview: Received uploadedPatterns:', uploadedPatterns);
  console.log('🔍 ThreeDPreview: getPatternById function:', !!getPatternById);
  
  const handleRealisticConversion = () => {
    console.log('Converting to realistic preview...');
    console.log('Current design state:', {
      selectedTemplate,
      colors,
      patterns,
      uploadedPatterns,
      fabric,
      buttons
    });
  };
  
  return (
    <div className="flex-1 bg-gray-50 relative flex flex-col p-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={viewMode === '2d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('2d')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            2D View
          </Button>
          <Button
            variant={viewMode === '3d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('3d')}
            className="flex items-center gap-2"
          >
            <View className="w-4 h-4" />
            3D Interactive
          </Button>
        </div>
      </div>

      {viewMode === '2d' ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-8">2D Preview</h2>
          
          {/* Template Display with consistent sizing */}
          <div className="relative w-[400px] h-[400px] mx-auto flex items-center justify-center mb-8">
            <GarmentRenderer
              selectedTemplate={selectedTemplate}
              colors={colors}
              patterns={patterns}
              uploadedPatterns={uploadedPatterns}
              fabric={fabric}
              className="w-96 h-96"
              getPatternById={getPatternById}
              onPatternDrop={onPatternDrop}
              onPatternUpdate={onPatternUpdate}
              buttons={buttons}
              selectedButtonId={selectedButtonId}
              onButtonClick={onButtonClick}
              onButtonDelete={onButtonDelete}
              onButtonDrag={onButtonDrag}
              activeTool={activeTool}
              onButtonPlacement={onButtonPlacement}
            />
          </div>
          
          {/* Realistic Preview Button */}
          <RealisticPreviewButton 
            onConvertToRealistic={handleRealisticConversion}
            className="mb-6"
          />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Real-time preview of your design</p>
            <p className="text-xs text-gray-500">Changes will appear instantly</p>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <Enhanced3DDesigner
            selectedTemplate={selectedTemplate}
            initialColors={{
              body: colors.body,
              sleeves: colors.sleeves,
              collar: colors.collar
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ThreeDPreview;
