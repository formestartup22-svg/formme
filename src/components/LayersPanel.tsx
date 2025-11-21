
import { useState } from "react";
import { useElementContext } from "@/context/ElementContext";
import { LayerType } from "@/types/elements";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LayersPanel = () => {
  const { layers, addLayer, deleteLayer, currentLayerId, setCurrentLayerId, updateLayerVisibility, updateLayerLock } = useElementContext();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editLayerName, setEditLayerName] = useState("");

  const handleLayerClick = (layerId: string) => {
    setCurrentLayerId(layerId);
  };

  const handleLayerNameEdit = (layer: LayerType) => {
    setEditingLayerId(layer.id);
    setEditLayerName(layer.name);
  };

  const saveLayerName = (layerId: string) => {
    // This would update layer name if we had that functionality
    setEditingLayerId(null);
  };

  return (
    <div className="w-64 bg-white border-r overflow-hidden flex flex-col">
      <div className="p-3 border-b flex items-center justify-between bg-[#E5DEFF]/30">
        <h3 className="text-sm font-medium">Layers</h3>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addLayer}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span className="ml-1 text-xs">Add Layer</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {layers.map((layer) => (
            <div 
              key={layer.id} 
              className={`mb-1 p-2 rounded-md cursor-pointer ${
                currentLayerId === layer.id ? 'bg-[#E5DEFF]' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleLayerClick(layer.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <button 
                    className="mr-2 text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayerVisibility(layer.id, !layer.visible);
                    }}
                  >
                    {layer.visible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    )}
                  </button>
                  
                  {editingLayerId === layer.id ? (
                    <Input 
                      value={editLayerName}
                      onChange={(e) => setEditLayerName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveLayerName(layer.id);
                        if (e.key === 'Escape') setEditingLayerId(null);
                      }}
                      onBlur={() => saveLayerName(layer.id)}
                      className="h-6 text-xs py-0 px-1"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="text-sm truncate"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleLayerNameEdit(layer);
                      }}
                    >
                      {layer.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayerLock(layer.id, !layer.locked);
                    }}
                  >
                    {layer.locked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                    )}
                  </button>
                  
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {layer.elements.length} element{layer.elements.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-[#E5DEFF]/30">
        <div className="text-xs text-purple-500 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Tip: Organize your design with multiple layers for easier editing
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;
