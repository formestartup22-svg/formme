
import React from 'react';
import TshirtSVG from './SVGs/TShirtSVG';
import VNeckSVG from './SVGs/VNeckSVG';
import SweaterSVG from './SVGs/SweaterSVGs';
import PremiumCrewNeckSVG from './SVGs/PremiumCrewNeck';
import PatternedTrackPantsSVG from './SVGs/PatternedTrackPants';
import FemaleStripesTshirtSVG from './SVGs/FemaleStripesTshirt';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';
import { getTemplateById } from '@/data/garmentTemplates';

interface GarmentRendererProps {
  selectedTemplate: string;
  colors: StudioColors;
  patterns: StudioPatterns;
  uploadedPatterns: StudioPatterns;
  fabric: FabricProperties;
  className?: string;
  onPatternDrop?: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void;
  getPatternById?: (patternId: string) => UploadedPattern | undefined;
  onPatternUpdate?: (patternId: string, cropData: any) => void;
  buttons?: CanvasButton[];
  selectedButtonId?: string | null;
  onButtonClick?: (buttonId: string) => void;
  onButtonDelete?: (buttonId: string) => void;
  onButtonDrag?: (buttonId: string, newPosition: { x: number; y: number }) => void;
  onButtonResize?: (buttonId: string, scale: number) => void;
  activeTool?: string | null;
  onButtonPlacement?: (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => void;
}
const GarmentRenderer = ({
  selectedTemplate,
  colors,
  patterns,
  uploadedPatterns,
  fabric,
  className = "w-96 h-96",
  onPatternDrop,
  getPatternById,
  onPatternUpdate,
  buttons = [],
  selectedButtonId,
  onButtonClick,
  onButtonDelete,
  onButtonDrag,
  onButtonResize,
  activeTool,
  onButtonPlacement
}: GarmentRendererProps) => {
  if (!selectedTemplate) {
    return null;
  }
  
  const template = getTemplateById(selectedTemplate);
  
  console.log('🔍 GarmentRenderer: Received buttons:', buttons);
  console.log('🔍 GarmentRenderer: Buttons count:', buttons.length);
  console.warn('🔍 GarmentRenderer: Selected template:', selectedTemplate);
  console.warn('what is the template', template);
  console.warn('what is inside stripes color', colors.stripesColor);

  if (!template) {
    console.warn(`Template with ID ${selectedTemplate} not found, falling back to crew-neck`);
    // Fallback to crew-neck if template not found
    return (
      <div id="garment-preview">
      <TshirtSVG
        className={className}
        bodyColor={colors.body}
        sleevesColor={colors.sleeves}
        collarColor={colors.collar}
        bodyPattern={patterns.body}
        sleevesPattern={patterns.sleeves}
        collarPattern={patterns.collar}
        bodyUploadedPattern={uploadedPatterns.body}
        sleevesUploadedPattern={uploadedPatterns.sleeves}
        collarUploadedPattern={uploadedPatterns.collar}
        fabric={fabric}
        onPatternDrop={onPatternDrop}
        getPatternById={getPatternById}
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
    );
  }
  console.warn('what is the template id', template.id);
  // Render different SVG components based on template style and gender
  switch (template.id) {
    case 'v-neck-female':
      console.warn('🔍 GarmentRenderer: Rendering V-neck with buttons:', buttons.length);
      // Only use VNeckSVG for female v-neck templates
      if (template.gender === 'female') {
        return (
          <div id="garment-preview">
          <VNeckSVG
            className={className}
            bodyColor={colors.body}
            sleevesColor={colors.sleeves}
            collarColor={colors.collar}
            bodyPattern={patterns.body}
            sleevesPattern={patterns.sleeves}
            collarPattern={patterns.collar}
            bodyUploadedPattern={uploadedPatterns.body}
            sleevesUploadedPattern={uploadedPatterns.sleeves}
            collarUploadedPattern={uploadedPatterns.collar}
            fabric={fabric}
            onPatternDrop={onPatternDrop}
            getPatternById={getPatternById}
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
        );
      } else {
        // Use SweaterSVG for male v-neck templates
        return (
          <div id="garment-preview">

          <SweaterSVG
            className={className}
            bodyColor={colors.body}
            sleevesColor={colors.sleeves}
            collarColor={colors.collar}
            bodyPattern={patterns.body}
            sleevesPattern={patterns.sleeves}
            collarPattern={patterns.collar}
            bodyUploadedPattern={uploadedPatterns.body}
            sleevesUploadedPattern={uploadedPatterns.sleeves}
            collarUploadedPattern={uploadedPatterns.collar}
            fabric={fabric}
            onPatternDrop={onPatternDrop}
            getPatternById={getPatternById}
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
        );
      }
    
    case 'long-sleeve-basic-male':
      return (
        <div id="garment-preview">

        <SweaterSVG
        className={className}
        bodyColor={colors.body}
        sleevesColor={colors.sleeves}
        collarColor={colors.collar}
        bodyPattern={patterns.body}
        sleevesPattern={patterns.sleeves}
        collarPattern={patterns.collar}
        bodyUploadedPattern={uploadedPatterns.body}
        sleevesUploadedPattern={uploadedPatterns.sleeves}
        collarUploadedPattern={uploadedPatterns.collar}
        fabric={fabric}
        onPatternDrop={onPatternDrop}
        getPatternById={getPatternById}
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
      )
    case 'tank-top':
    case 'long-sleeve':
    case 'polo':
    case 'crew-neck-premium':
      return (
        <div id="garment-preview">

        <PremiumCrewNeckSVG
        className={className}
        bodyColor={colors.body}
        sleevesColor={colors.sleeves}
        collarColor={colors.collar}
        bodyPattern={patterns.body}
        sleevesPattern={patterns.sleeves}
        collarPattern={patterns.collar}
        bodyUploadedPattern={uploadedPatterns.body}
        sleevesUploadedPattern={uploadedPatterns.sleeves}
        collarUploadedPattern={uploadedPatterns.collar}
        fabric={fabric}
        onPatternDrop={onPatternDrop}
        getPatternById={getPatternById}
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
      )

    case 'patterned-track-female':
      return (
        <div id="garment-preview">

      <PatternedTrackPantsSVG 
      className={className}
      bodyColor={colors.body}
      bodyPattern={patterns.body}
      bodyUploadedPattern={uploadedPatterns.body}
      fabric={fabric}
      onPatternDrop={onPatternDrop}
      getPatternById={getPatternById}
      onPatternUpdate={onPatternUpdate}
      activeTool={activeTool}
    />
          </div>

      )
    case 'stripes-short-basic-female': 
      return (
        <div id="garment-preview">
        <FemaleStripesTshirtSVG 
        className={className}
        bodyColor={colors.body}
        sleevesColor={colors.sleeves}
        collarColor={colors.collar}
        stripesColor={colors.stripesColor}
        bodyPattern={patterns.body}
        sleevesPattern={patterns.sleeves}
        collarPattern={patterns.collar}
        bodyUploadedPattern={uploadedPatterns.body}
        sleevesUploadedPattern={uploadedPatterns.sleeves}
        collarUploadedPattern={uploadedPatterns.collar}
        fabric={fabric}
        onPatternDrop={onPatternDrop}
        getPatternById={getPatternById}
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
      )
    default:
      console.log('🔍 GarmentRenderer: Rendering crew-neck/default with buttons:', buttons.length);
      return (
        <div id="garment-preview">

        <TshirtSVG
          className={className}
          bodyColor={colors.body}
          sleevesColor={colors.sleeves}
          collarColor={colors.collar}
          bodyPattern={patterns.body}
          sleevesPattern={patterns.sleeves}
          collarPattern={patterns.collar}
          bodyUploadedPattern={uploadedPatterns.body}
          sleevesUploadedPattern={uploadedPatterns.sleeves}
          collarUploadedPattern={uploadedPatterns.collar}
          fabric={fabric}
          onPatternDrop={onPatternDrop}
          getPatternById={getPatternById}
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
      );
  }
};

export default GarmentRenderer;
