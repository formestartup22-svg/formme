
import { useState } from "react";
import { LayerType, CanvasElementType } from "@/types/elements";
import { toast } from "sonner";

export const useLayers = () => {
  const [layers, setLayers] = useState<LayerType[]>([
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      elements: []
    }
  ]);
  const [currentLayerId, setCurrentLayerId] = useState('layer-1');

  const addLayer = () => {
    const newLayerId = `layer-${layers.length + 1}`;
    const newLayer: LayerType = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      elements: []
    };
    setLayers([...layers, newLayer]);
    setCurrentLayerId(newLayerId);
    toast("New layer added");
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) {
      toast("Cannot delete the only layer", {
        description: "You must have at least one layer"
      });
      return;
    }
    
    setLayers(layers.filter(layer => layer.id !== id));
    if (currentLayerId === id) {
      setCurrentLayerId(layers[0].id);
    }
    toast("Layer deleted");
  };

  const updateLayerVisibility = (id: string, visible: boolean) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, visible } : layer
    ));
  };

  const updateLayerLock = (id: string, locked: boolean) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, locked } : layer
    ));
  };

  const addElementToLayer = (element: CanvasElementType) => {
    setLayers(layers.map(layer => 
      layer.id === currentLayerId 
        ? { ...layer, elements: [...layer.elements, element] }
        : layer
    ));
  };

  const updateElementInLayers = (id: string, updatedElement: CanvasElementType) => {
    setLayers(layers.map(layer => ({
      ...layer,
      elements: layer.elements.map(element => 
        element.id === id ? updatedElement : element
      )
    })));
  };

  const removeElementFromLayers = (id: string) => {
    setLayers(layers.map(layer => ({
      ...layer,
      elements: layer.elements.filter(element => element.id !== id)
    })));
  };

  return {
    layers,
    currentLayerId,
    setCurrentLayerId,
    addLayer,
    deleteLayer,
    updateLayerVisibility,
    updateLayerLock,
    addElementToLayer,
    updateElementInLayers,
    removeElementFromLayers
  };
};
