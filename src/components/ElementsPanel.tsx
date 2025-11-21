import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { elementCategories } from "@/data/elementData";
import ElementItem from "@/components/ElementItem";
import ButtonPalette from "@/components/designer/ButtonPalette";
import { Input } from "@/components/ui/input";
import { useElementContext } from "@/context/ElementContext";

interface ElementsPanelProps {
  activeTab: string;
}

const ElementsPanel = ({ activeTab }: ElementsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedCategory, setSelectedCategory } = useElementContext();
  
  if (activeTab === "Elements") {
    const categories = [...Object.keys(elementCategories), "buttons"];
    
    return (
      <div className="w-64 bg-white border-r overflow-hidden flex flex-col">
        <div className="p-3 border-b">
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        
        <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex px-3 pt-2 overflow-x-auto thin-scrollbar">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="text-xs py-1 px-2.5 h-7 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-none"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            {Object.keys(elementCategories).map((category) => (
              <TabsContent 
                key={category} 
                value={category}
                className="h-full m-0 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {elementCategories[category].map((item) => (
                      <ElementItem key={item.id} item={item} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
            
            <TabsContent value="buttons" className="h-full m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <ButtonPalette />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-3 border-t bg-purple-50">
          <div className="text-xs text-purple-500 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Tip: Drag elements onto the canvas or use the draw tool for precise placement
          </div>
        </div>
      </div>
    );
  }
  
  if (activeTab === "Colors") {
    return (
      <div className="w-64 bg-white border-r overflow-hidden flex flex-col">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium">Color Palette</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Base Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF3333', '#33FFF3', '#F3FF33', '#FF33A8', '#33FFB8', '#6333FF', '#000000', '#FFFFFF', '#808080', '#C0C0C0'].map((color) => (
                  <div
                    key={color}
                    className="w-full aspect-square rounded-md cursor-pointer hover:scale-105 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Gradients</h4>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className="w-full aspect-[3/1] rounded-md cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  style={{ background: 'linear-gradient(90deg, #FF9A9E 0%, #FAD0C4 100%)' }}
                  onClick={() => {}}
                />
                <div 
                  className="w-full aspect-[3/1] rounded-md cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  style={{ background: 'linear-gradient(90deg, #A18CD1 0%, #FBC2EB 100%)' }}
                  onClick={() => {}}
                />
                <div 
                  className="w-full aspect-[3/1] rounded-md cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  style={{ background: 'linear-gradient(90deg, #84FAB0 0%, #8FD3F4 100%)' }}
                  onClick={() => {}}
                />
                <div 
                  className="w-full aspect-[3/1] rounded-md cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  style={{ background: 'linear-gradient(90deg, #FCCB90 0%, #D57EDC 100%)' }}
                  onClick={() => {}}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium mb-2">Color Picker</h4>
              <div className="relative">
                <Input 
                  type="color" 
                  className="w-full h-10 p-1 cursor-pointer"
                  value="#6366F1" 
                  onChange={() => {}}
                />
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>#6366F1</span>
                    <span>RGB: 99, 102, 241</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  if (activeTab === "Fabrics") {
    return (
      <div className="w-64 bg-white border-r overflow-hidden flex flex-col">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium">Fabric Library</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3">
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Cotton</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Regular Cotton', 'Organic Cotton', 'Pima Cotton', 'Egyptian Cotton'].map((fabric) => (
                  <div
                    key={fabric}
                    className="p-3 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {}}
                  >
                    <div className="w-full aspect-square mb-2 bg-white rounded-sm shadow-sm flex items-center justify-center">
                      <span className="text-2xl">🧵</span>
                    </div>
                    <span className="text-xs font-medium">{fabric}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Polyester</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Regular Polyester', 'Athletic Polyester', 'Recycled Polyester'].map((fabric) => (
                  <div
                    key={fabric}
                    className="p-3 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {}}
                  >
                    <div className="w-full aspect-square mb-2 bg-white rounded-sm shadow-sm flex items-center justify-center">
                      <span className="text-2xl">🧶</span>
                    </div>
                    <span className="text-xs font-medium">{fabric}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium mb-2">Other Materials</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Silk', 'Linen', 'Wool', 'Denim', 'Velvet', 'Satin'].map((fabric) => (
                  <div
                    key={fabric}
                    className="p-3 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {}}
                  >
                    <div className="w-full aspect-square mb-2 bg-white rounded-sm shadow-sm flex items-center justify-center">
                      <span className="text-2xl">🧵</span>
                    </div>
                    <span className="text-xs font-medium">{fabric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  return (
    <div className="w-64 bg-white border-r p-4">
      <h3 className="text-sm font-medium">{activeTab}</h3>
      <p className="text-xs text-gray-500 mt-2">This panel is coming soon!</p>
    </div>
  );
};

export default ElementsPanel;
