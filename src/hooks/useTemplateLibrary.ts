
import { useState } from 'react';

export interface GarmentPiece {
  id: string;
  name: string;
  category: string;
  preview: string;
  isPremium: boolean;
  price?: number;
  modelPath?: string;
}

export interface TemplateLibraryState {
  selectedPieces: { [category: string]: string }; // One piece per category
  assemblyMode: boolean;
  selectedModels: { [category: string]: string }; // Track model paths by category
}

export const useTemplateLibrary = () => {
  const [state, setState] = useState<TemplateLibraryState>({
    selectedPieces: {},
    assemblyMode: false,
    selectedModels: {}
  });

  const selectPieceInCategory = (piece: GarmentPiece) => {
    setState(prev => {
      const newSelectedPieces = { ...prev.selectedPieces };
      const newSelectedModels = { ...prev.selectedModels };
      
      // If this piece is already selected, deselect it
      if (newSelectedPieces[piece.category] === piece.id) {
        delete newSelectedPieces[piece.category];
        delete newSelectedModels[piece.category];
      } else {
        // Select this piece and replace any previous piece in this category
        newSelectedPieces[piece.category] = piece.id;
        if (piece.modelPath) {
          newSelectedModels[piece.category] = piece.modelPath;
        }
      }
      
      return {
        ...prev,
        selectedPieces: newSelectedPieces,
        selectedModels: newSelectedModels
      };
    });
  };

  const clearSelection = () => {
    setState(prev => ({
      ...prev,
      selectedPieces: {},
      selectedModels: {}
    }));
  };

  const toggleAssemblyMode = () => {
    setState(prev => ({
      ...prev,
      assemblyMode: !prev.assemblyMode
    }));
  };

  const handlePieceSelect = (piece: GarmentPiece) => {
    console.log('Selected piece:', piece);
    selectPieceInCategory(piece);
  };

  const getSelectedPieceIds = () => {
    return Object.values(state.selectedPieces);
  };

  const isPieceSelected = (pieceId: string) => {
    return Object.values(state.selectedPieces).includes(pieceId);
  };

  return {
    ...state,
    selectPieceInCategory,
    clearSelection,
    toggleAssemblyMode,
    handlePieceSelect,
    getSelectedPieceIds,
    isPieceSelected
  };
};
