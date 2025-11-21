
import React, { createContext, useContext, useState, ReactNode } from "react";
import { BackgroundSettings, DrawingTool, CanvasElementType } from "@/types/elements";
import { ElementContextType } from "./types";
import { useModelSettings } from "@/hooks/useModelSettings";
import { useLayers } from "@/hooks/useLayers";
import { useCanvasElements } from "@/hooks/useCanvasElements";

const ElementContext = createContext<ElementContextType | undefined>(undefined);

interface ElementContextProviderProps {
  children: ReactNode;
}

export const useElementContext = () => {
  const context = useContext(ElementContext);
  if (context === undefined) {
    throw new Error("useElementContext must be used within an ElementContextProvider");
  }
  return context;
};

const ElementContextProvider = ({ children }: ElementContextProviderProps) => {
  const [selectedCategory, setSelectedCategory] = useState("collars");
  const [currentTool, setCurrentTool] = useState<DrawingTool>(null);
  
  // Background settings
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'color',
    value: '#ffffff'
  });

  // Import functionality from custom hooks
  const modelSettingsHook = useModelSettings();
  const layersHook = useLayers();
  const canvasElementsHook = useCanvasElements();

  // Handle adding an element to both canvasElements and the current layer
  const addCanvasElement = (element: CanvasElementType) => {
    canvasElementsHook.addCanvasElement(element);
    layersHook.addElementToLayer(element);
  };

  // Handle updating an element in both canvasElements and all layers
  const updateCanvasElement = (id: string, updatedElement: CanvasElementType) => {
    canvasElementsHook.updateCanvasElement(id, updatedElement);
    layersHook.updateElementInLayers(id, updatedElement);
  };

  // Handle deleting an element from both canvasElements and all layers
  const deleteElement = (id: string) => {
    canvasElementsHook.deleteElement(id);
    layersHook.removeElementFromLayers(id);
  };

  return (
    <ElementContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        
        // Canvas elements functionality
        canvasElements: canvasElementsHook.canvasElements,
        addCanvasElement,
        updateCanvasElement,
        deleteElement,
        selectedElementId: canvasElementsHook.selectedElementId,
        selectElement: canvasElementsHook.selectElement,
        
        // Layer functionality
        layers: layersHook.layers,
        addLayer: layersHook.addLayer,
        deleteLayer: layersHook.deleteLayer,
        currentLayerId: layersHook.currentLayerId,
        setCurrentLayerId: layersHook.setCurrentLayerId,
        updateLayerVisibility: layersHook.updateLayerVisibility,
        updateLayerLock: layersHook.updateLayerLock,
        
        // Background settings
        backgroundSettings,
        setBackgroundSettings,
        
        // Current tool
        currentTool,
        setCurrentTool,
        
        // Model settings
        modelSettings: modelSettingsHook.modelSettings,
        updateModelSettings: modelSettingsHook.updateModelSettings,
        updateTShirtColors: modelSettingsHook.updateTShirtColors,
        setCollarType: modelSettingsHook.setCollarType,
        setSleeveType: modelSettingsHook.setSleeveType,
        setFitType: modelSettingsHook.setFitType,
      }}
    >
      {children}
    </ElementContext.Provider>
  );
};

export default ElementContextProvider;
