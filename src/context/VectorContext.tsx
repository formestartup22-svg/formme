import React, { createContext, useContext, ReactNode } from 'react';
import { useVectorDrawing } from '@/hooks/useVectorDrawing';

interface VectorContextType {
  vectorDrawing: ReturnType<typeof useVectorDrawing>;
}

const VectorContext = createContext<VectorContextType | undefined>(undefined);

export const useVectorContext = () => {
  const context = useContext(VectorContext);
  if (!context) {
    throw new Error('useVectorContext must be used within a VectorProvider');
  }
  return context;
};

interface VectorProviderProps {
  children: ReactNode;
}

export const VectorProvider = ({ children }: VectorProviderProps) => {
  const vectorDrawing = useVectorDrawing();

  return (
    <VectorContext.Provider value={{ vectorDrawing }}>
      {children}
    </VectorContext.Provider>
  );
};

export default VectorProvider;