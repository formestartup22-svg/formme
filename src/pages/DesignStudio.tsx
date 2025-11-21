
import React from 'react';
import Navbar from "@/components/Navbar";
import StudioLayout from "@/components/studio/StudioLayout";
import ElementContextProvider from "@/context/ElementContext";
import VectorProvider from "@/context/VectorContext";

const DesignStudio = () => {
  return (
    <VectorProvider>
      <ElementContextProvider>
        <div className="h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <div className="flex-1 overflow-hidden mt-20">
            <StudioLayout />
          </div>
        </div>
      </ElementContextProvider>
    </VectorProvider>
  );
};

export default DesignStudio;
