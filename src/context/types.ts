
import { ElementType, CanvasElementType, BackgroundSettings, LayerType, DrawingTool, ThreeDModelSettings, CollarType, SleeveType, FitType } from "@/types/elements";

export interface ElementContextType {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  canvasElements: CanvasElementType[];
  addCanvasElement: (element: CanvasElementType) => void;
  updateCanvasElement: (id: string, updatedElement: Partial<CanvasElementType>) => void;
  deleteElement: (id: string) => void;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  layers: LayerType[];
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  currentLayerId: string;
  setCurrentLayerId: (id: string) => void;
  updateLayerVisibility: (id: string, visible: boolean) => void;
  updateLayerLock: (id: string, locked: boolean) => void;
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: (settings: BackgroundSettings) => void;
  currentTool: DrawingTool;
  setCurrentTool: (tool: DrawingTool) => void;
  modelSettings: ThreeDModelSettings;
  updateModelSettings: (settings: Partial<ThreeDModelSettings>) => void;
  updateTShirtColors: (colorType: keyof ThreeDModelSettings['colors'], color: string) => void;
  setCollarType: (type: CollarType) => void;
  setSleeveType: (type: SleeveType) => void;
  setFitType: (type: FitType) => void;
}
