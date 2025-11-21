
import React, { useState } from 'react';
import TemplateGrid from './TemplateGrid';
import ThreeDPreview from './ThreeDPreview';
import FabricColorPanel from './FabricColorPanel';

interface DesignerLayoutProps {
  selectedGarment: string;
  fabricType: string;
  onGarmentChange: (garment: string) => void;
  onFabricChange: (fabric: string) => void;
}

const DesignerLayout = ({ 
  selectedGarment, 
  fabricType, 
  onGarmentChange,
  onFabricChange,
}: DesignerLayoutProps) => {
  const [selectedGarments, setSelectedGarments] = useState(selectedGarment);

  // Handle updates to selected garment
  const handleGarmentChange = (garment: string) => {
    setSelectedGarments(garment);
    onGarmentChange(garment);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Template Grid */}
      <TemplateGrid 
        selectedGarment={selectedGarments} 
        setSelectedGarment={handleGarmentChange} 
      />

      {/* Center: 3D Preview */}
      <ThreeDPreview />

      {/* Right: Fabric / Color Panel */}
      <FabricColorPanel 
        fabricType={fabricType}
        onFabricChange={onFabricChange}
      />
    </div>
  );
};

export default DesignerLayout;
