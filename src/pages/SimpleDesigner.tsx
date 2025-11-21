
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SimplifiedDesigner from "@/components/SimplifiedDesigner";
import ElementContextProvider from "@/context/ElementContext";

const SimpleDesigner = () => {
  return (
    <ElementContextProvider>
      <div className="h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <SimplifiedDesigner />
        </div>
      </div>
    </ElementContextProvider>
  );
};

export default SimpleDesigner;
