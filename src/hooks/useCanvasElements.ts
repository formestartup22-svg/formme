
import { useState } from "react";
import { CanvasElementType } from "@/types/elements";
import { toast } from "sonner";

export const useCanvasElements = () => {
  const [canvasElements, setCanvasElements] = useState<CanvasElementType[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const addCanvasElement = (element: CanvasElementType) => {
    const isGarment = element.type === 'garment';
    const id = isGarment ? `gmt-${Math.random().toString(36).substr(2, 9)}` : element.id;

    setCanvasElements((prev) => {
      const highestZIndex = prev.reduce((maxZ, el) => Math.max(maxZ, el.zIndex || 0), 0);
      
      const garmentElements = prev.filter(el => el.type === 'garment');
      const offset = isGarment ? garmentElements.length * 40 : 0;

      const newPosition = {
        x: (element.position?.x ?? 50) + offset,
        y: (element.position?.y ?? 50) + offset,
      };

      const newElement: CanvasElementType = {
        ...element,
        id,
        position: newPosition,
        zIndex: highestZIndex + 1,
        // Ensure deep copies of mutable properties
        style: element.style ? { ...element.style } : undefined,
        colors: element.colors ? { ...element.colors } : undefined,
        patterns: element.patterns ? { ...element.patterns } : undefined,
        uploadedPatterns: element.uploadedPatterns ? { ...element.uploadedPatterns } : undefined,
        fabric: element.fabric ? { ...element.fabric } : undefined,
        buttons: element.buttons ? element.buttons.map(b => ({...b})) : undefined,
      };
      
      return [...prev, newElement];
    });

    setSelectedElementId(id);
  };

  const updateCanvasElement = (id: string, updatedData: Partial<CanvasElementType>) => {
    setCanvasElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, ...updatedData } : element
      )
    );
  };

  const deleteElement = (id: string) => {
    setCanvasElements((prev) => prev.filter((element) => element.id !== id));
    
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    toast("Element deleted");
  };

  const selectElement = (id: string | null) => {
    setSelectedElementId(id);

    if (id) {
      setCanvasElements((prev) => {
        const highestZIndex = prev.reduce((maxZ, el) => Math.max(maxZ, el.zIndex || 0), 1);
        
        return prev.map((element) =>
          element.id === id
            ? { ...element, zIndex: highestZIndex + 1 }
            : element
        );
      });
    }
  };

  return {
    canvasElements,
    addCanvasElement,
    updateCanvasElement,
    deleteElement,
    selectedElementId,
    selectElement
  };
};
