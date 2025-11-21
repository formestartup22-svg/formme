
import React from 'react';
import { templateCategories } from "@/data/templateData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import SVG as a regular image instead of a React component
import TshirtSVG from "@/assets/tshirt.svg";
import VNeckSVG from "@/assets/vneck.svg";

interface TemplateGridProps {
  selectedGarment: string;
  setSelectedGarment: (garment: string) => void;
}

const TemplateGrid = ({ selectedGarment, setSelectedGarment }: TemplateGridProps) => {
  const getTemplatePreview = (item: any) => {
    // Check if preview is an image URL
    if (item.preview && (item.preview.startsWith('/') || item.preview.startsWith('http'))) {
      return (
        <img 
          src={item.preview} 
          alt={item.name}
          className="w-32 h-auto object-contain"
        />
      );
    }
    
    // Default logic for SVG templates
    if (selectedGarment === "tshirt") {
      if (item.id === "v-neck-tshirt-template-1" || item.name.toLowerCase().includes("v-neck")) {
        return <img src={VNeckSVG} alt="V-neck T-shirt" style={{ width: 128, height: "auto" }} />;
      } else {
        return <img src={TshirtSVG} alt="T-shirt" style={{ width: 128, height: "auto" }} />;
      }
    }
    
    return null;
  };

  return (
    <div className="w-[25%] overflow-y-auto p-4 space-y-4">
      <Select defaultValue={selectedGarment} onValueChange={setSelectedGarment}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Select garment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tshirt">T-Shirt</SelectItem>
          <SelectItem value="hoodie">Hoodie</SelectItem>
          <SelectItem value="dress">Dress</SelectItem>
          <SelectItem value="pants">Pants</SelectItem>
          <SelectItem value="skirt">Skirt</SelectItem>
          <SelectItem value="jacket">Jacket</SelectItem>
        </SelectContent>
      </Select>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {templateCategories.tshirts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group cursor-pointer h-50"
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                {getTemplatePreview(item)}
              </div>
            </div>

            <div className="p-3">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{item.creator}</p>
                {item.price ? (
                  <p className="text-sm font-medium text-gray-900">${item.price}</p>
                ) : (
                  <p className="text-sm text-green-600 font-medium">Free</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;
