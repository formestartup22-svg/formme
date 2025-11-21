
import React from 'react';
import { useElementContext } from '@/context/ElementContext';
import { toast } from "sonner";

const garmentTypes = [
  { id: "tshirt", name: "T-Shirt" },
  { id: "hoodie", name: "Hoodie" },
  { id: "pants", name: "Pants" },
  { id: "shorts", name: "Shorts" },
];

interface GarmentSelectorProps {
  selectedGarment: string;
  customColor: string;
  onGarmentChange: (garment: string) => void;
}

const GarmentSelector = ({ selectedGarment, customColor, onGarmentChange }: GarmentSelectorProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Select Garment Type</h2>
      <div className="grid grid-cols-2 gap-2">
        {garmentTypes.map((item) => (
          <div 
            key={item.id}
            className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer transition-all ${
              selectedGarment === item.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => onGarmentChange(item.id)}
          >
            <svg width="48" height="48" viewBox="0 0 300 400" fill={customColor} stroke="#333" strokeWidth="1.5">
              {item.id === "tshirt" && (
                <>
                  <path d="M100,50 C100,50 125,30 150,30 C175,30 200,50 200,50 L240,100 L220,140 C220,140 200,130 200,170 
                          L200,350 L100,350 L100,170 C100,130 80,140 80,140 L60,100 Z" />
                  <path d="M100,50 C100,50 125,30 150,30 C175,30 200,50 200,50" fill="none" strokeWidth="2" />
                  <path d="M150,30 L150,80" stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
                  <path d="M110,90 C120,100 140,105 150,105 C160,105 180,100 190,90" fill="none" stroke="#333" strokeWidth="1" />
                </>
              )}
              {item.id === "hoodie" && (
                <>
                  <path d="M100,40 C100,40 125,20 150,20 C175,20 200,40 200,40 L240,90 L220,130 C220,130 200,120 200,160 
                          L200,350 L100,350 L100,160 C100,120 80,130 80,130 L60,90 Z" />
                  <path d="M125,20 C125,20 150,5 175,20" fill="none" stroke="#333" strokeWidth="2" />
                  <ellipse cx="150" cy="15" rx="30" ry="10" fill={customColor} stroke="#333" />
                </>
              )}
              {(item.id === "pants" || item.id === "shorts") && (
                <path d={item.id === "pants" ? 
                  "M120,50 L100,350 L140,350 L150,80 L160,350 L200,350 L180,50 Z" : 
                  "M120,50 L115,150 L140,150 L150,80 L160,150 L185,150 L180,50 Z"
                } />
              )}
            </svg>
            <span className="mt-1 text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GarmentSelector;
