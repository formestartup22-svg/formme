
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import FabricSelector from "./FabricSelector";
import ColorSelector from "./ColorSelector";

interface FabricColorPanelProps {
  fabricType: string;
  onFabricChange: (fabric: string) => void;
}

const FabricColorPanel = ({ fabricType, onFabricChange }: FabricColorPanelProps) => {
  return (
    <div className="w-[300px] shrink-0 bg-card p-4 shadow-sm border border-border rounded-md flex flex-col justify-between">
      <Tabs defaultValue="color">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="fabric" className="px-4 py-2">Fabric</TabsTrigger>
          <TabsTrigger value="color" className="px-4 py-2 flex items-center">
            <Palette className="w-4 h-4 mr-1" /> Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fabric" className="mt-4">
          <FabricSelector fabricType={fabricType} onFabricChange={onFabricChange} />
        </TabsContent>

        <TabsContent value="color" className="mt-4">
          <ColorSelector />
        </TabsContent>
      </Tabs>

      <div className="mt-auto pt-4 border-t">
        <Button className="w-full" size="lg">Save Design</Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          All changes are automatically saved to your preview
        </p>
      </div>
    </div>
  );
};

export default FabricColorPanel;
