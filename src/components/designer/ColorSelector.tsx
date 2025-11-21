import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useElementContext } from '@/context/ElementContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TShirtColors } from '@/types/elements';
import { getAvailablePartsForTemplate } from '@/utils/garmentUtils';

const popularColors = [
  { id: "white", color: "#FFFFFF", name: "White" },
  { id: "black", color: "#000000", name: "Black" },
  { id: "navy", color: "#0A192F", name: "Navy" },
  { id: "grey", color: "#808080", name: "Grey" },
  { id: "red", color: "#FF0000", name: "Red" },
  { id: "blue", color: "#0000FF", name: "Blue" },
  { id: "green", color: "#008000", name: "Green" },
  { id: "yellow", color: "#FFFF00", name: "Yellow" },
  { id: "purple", color: "#800080", name: "Purple" },
  { id: "pink", color: "#FFC0CB", name: "Pink" },
  { id: "orange", color: "#FFA500", name: "Orange" },
  { id: "teal", color: "#008080", name: "Teal" },
];

interface ColorSelectorProps {
  defaultTab?: keyof TShirtColors;
  selectedTemplate?: string;
}

const ColorSelector = ({ defaultTab = 'body', selectedTemplate }: ColorSelectorProps) => {
  const { modelSettings, updateTShirtColors } = useElementContext();

  // Get available parts for the current template
  const availableParts = selectedTemplate 
    ? getAvailablePartsForTemplate(selectedTemplate) 
    : { body: true, sleeves: true, collar: true };

  // Handle color selection for any part
  const handleColorChange = (part: keyof TShirtColors, color: string) => {
    updateTShirtColors(part, color);
  };

  // Get available parts as array for tabs
  const availablePartsList = Object.entries(availableParts)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([part, _]) => part as keyof TShirtColors);

  // Ensure defaultTab is valid for current template
  const validDefaultTab = availablePartsList.includes(defaultTab) 
    ? defaultTab 
    : availablePartsList[0] || 'body';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Color Options</h2>
        <button
          onClick={() => {
            availablePartsList.forEach(part => {
              updateTShirtColors(part, 'none');
            });
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition"
        >
          Reset to Transparent
        </button>
      </div>
      
      {availablePartsList.length > 1 ? (
        <Tabs defaultValue={validDefaultTab} className="w-full">
          <TabsList className={`w-full grid grid-cols-${availablePartsList.length} mb-6 bg-gray-100 p-1 rounded-md`}>
            {availablePartsList.map((part) => (
              <TabsTrigger 
                key={part}
                value={part} 
                className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {availablePartsList.map((part) => (
            <TabsContent key={part} value={part} className="space-y-6 mt-2 animate-fade-in">
              <div>
                <Label className="block mb-3 text-sm font-medium text-gray-700">Popular Colors</Label>
                <div className="grid grid-cols-6 gap-3">
                  {popularColors.map((colorItem) => (
                    <button 
                      key={`${part}-${colorItem.id}`}
                      className={`w-10 h-10 rounded-full hover:scale-110 transition-transform ${
                        modelSettings.colors[part] === colorItem.color ? 'ring-2 ring-purple-600 ring-offset-2' : ''
                      }`}
                      style={{
                          backgroundColor: colorItem.color === "none" ? "transparent" : colorItem.color,
                          border:
                            colorItem.color === "#FFFFFF" || colorItem.color === "none"
                              ? "1px solid #ddd"
                              : "none"
                        }}                      
                      onClick={() => handleColorChange(part, colorItem.color)}
                      title={colorItem.name}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor={`custom-color-${part}`} className="block mb-3 text-sm font-medium text-gray-700">Custom Color</Label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      id={`custom-color-${part}`}
                      type="color"
                      value={modelSettings.colors[part]}
                      onChange={(e) => handleColorChange(part, e.target.value)}
                      className="w-14 h-14 p-1 cursor-pointer rounded-md overflow-hidden"
                    />
                  </div>
                  <Input
                    type="text"
                    value={modelSettings.colors[part].toUpperCase()}
                    onChange={(e) => handleColorChange(part, e.target.value)}
                    className="flex-1 h-10"
                    placeholder="#HEXCODE"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{part.charAt(0).toUpperCase() + part.slice(1)} color</span>
                  <div className="flex items-center">
                    <div 
                      className="w-5 h-5 rounded-full mr-2" 
                      style={{ 
                        backgroundColor: modelSettings.colors[part],
                        border: modelSettings.colors[part] === "#FFFFFF" ? "1px solid #ddd" : "none"
                      }}
                    ></div>
                    <span className="text-sm font-mono">{modelSettings.colors[part].toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        // Single part case - show directly without tabs
        availablePartsList.map((part) => (
          <div key={part} className="space-y-6">
            <div>
              <Label className="block mb-3 text-sm font-medium text-gray-700">Popular Colors</Label>
              <div className="grid grid-cols-6 gap-3">
                {popularColors.map((colorItem) => (
                  <button 
                    key={`${part}-${colorItem.id}`}
                    className={`w-10 h-10 rounded-full hover:scale-110 transition-transform ${
                      modelSettings.colors[part] === colorItem.color ? 'ring-2 ring-purple-600 ring-offset-2' : ''
                    }`}
                    style={{
                        backgroundColor: colorItem.color === "none" ? "transparent" : colorItem.color,
                        border:
                          colorItem.color === "#FFFFFF" || colorItem.color === "none"
                            ? "1px solid #ddd"
                            : "none"
                      }}                      
                    onClick={() => handleColorChange(part, colorItem.color)}
                    title={colorItem.name}
                    type="button"
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor={`custom-color-${part}`} className="block mb-3 text-sm font-medium text-gray-700">Custom Color</Label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    id={`custom-color-${part}`}
                    type="color"
                    value={modelSettings.colors[part]}
                    onChange={(e) => handleColorChange(part, e.target.value)}
                    className="w-14 h-14 p-1 cursor-pointer rounded-md overflow-hidden"
                  />
                </div>
                <Input
                  type="text"
                  value={modelSettings.colors[part].toUpperCase()}
                  onChange={(e) => handleColorChange(part, e.target.value)}
                  className="flex-1 h-10"
                  placeholder="#HEXCODE"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{part.charAt(0).toUpperCase() + part.slice(1)} color</span>
                <div className="flex items-center">
                  <div 
                    className="w-5 h-5 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: modelSettings.colors[part],
                      border: modelSettings.colors[part] === "#FFFFFF" ? "1px solid #ddd" : "none"
                    }}
                  ></div>
                  <span className="text-sm font-mono">{modelSettings.colors[part].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ColorSelector;
