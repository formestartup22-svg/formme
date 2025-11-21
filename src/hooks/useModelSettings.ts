
import { useState } from "react";
import { ThreeDModelSettings, CollarType, SleeveType, FitType } from "@/types/elements";
import { toast } from "sonner";

export const useModelSettings = () => {
  const [modelSettings, setModelSettings] = useState<ThreeDModelSettings>({
    colors: {
      body: '#ffffff',
      sleeves: '#ffffff',
      collar: '#ffffff'
    },
    texture: null,
    normal: null,
    roughness: 0.5,
    metalness: 0.1,
    collarType: 'crew',
    sleeveType: 'short',
    fitType: 'regular'
  });

  const updateModelSettings = (settings: Partial<ThreeDModelSettings>) => {
    setModelSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const updateTShirtColors = (colorType: keyof ThreeDModelSettings['colors'], color: string) => {
    setModelSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
    toast(`Updated ${colorType} color`);
  };

  const setCollarType = (collarType: CollarType) => {
    setModelSettings(prev => ({
      ...prev,
      collarType
    }));
    toast(`Changed collar to ${collarType} style`);
  };

  const setSleeveType = (sleeveType: SleeveType) => {
    setModelSettings(prev => ({
      ...prev,
      sleeveType
    }));
    toast(`Changed sleeves to ${sleeveType} style`);
  };

  const setFitType = (fitType: FitType) => {
    setModelSettings(prev => ({
      ...prev,
      fitType
    }));
    toast(`Changed fit to ${fitType} style`);
  };

  return {
    modelSettings,
    updateModelSettings,
    updateTShirtColors,
    setCollarType,
    setSleeveType,
    setFitType
  };
};
