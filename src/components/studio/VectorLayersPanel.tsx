import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useVectorDrawing } from '@/hooks/useVectorDrawing';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VectorLayersPanelProps {
  className?: string;
  vectorContext?: ReturnType<typeof useVectorDrawing>;
}

const VectorLayersPanel = ({ className = '', vectorContext }: VectorLayersPanelProps) => {
  // Use provided context or create new one (fallback)
  const fallbackContext = useVectorDrawing();
  const context = vectorContext || fallbackContext;
  const {
    vectorLayers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    deleteLayer,
    updateLayer
  } = context;

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleLayerClick = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const startEditing = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() });
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  const toggleVisibility = (layerId: string, currentVisible: boolean) => {
    updateLayer(layerId, { visible: !currentVisible });
  };

  const toggleLock = (layerId: string, currentLocked: boolean) => {
    updateLayer(layerId, { locked: !currentLocked });
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    updateLayer(layerId, { opacity });
  };

  const handleAddLayer = () => {
    const newLayerId = addLayer();
    // Start editing the new layer name immediately
    setTimeout(() => {
      startEditing(newLayerId, `Layer ${vectorLayers.length + 1}`);
    }, 0);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (vectorLayers.length > 1) {
      deleteLayer(layerId);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-2xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Vector Layers</Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddLayer}
                  className="h-7 w-7 p-0"
                >
                  <Plus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new layer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Layers List */}
      <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
        {[...vectorLayers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`
              group border rounded-lg p-2 cursor-pointer transition-colors
              ${activeLayerId === layer.id 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            onClick={() => handleLayerClick(layer.id)}
          >
            {/* Layer Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {editingLayerId === layer.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-6 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Check size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEdit();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {layer.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(layer.id, layer.name);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={12} />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Visibility Toggle */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(layer.id, layer.visible);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{layer.visible ? 'Hide layer' : 'Show layer'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Lock Toggle */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(layer.id, layer.locked);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{layer.locked ? 'Unlock layer' : 'Lock layer'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete Layer */}
                {vectorLayers.length > 1 && (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLayer(layer.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete layer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Layer Info */}
            <div className="text-xs text-gray-500 mb-2">
              {layer.paths.length} path{layer.paths.length !== 1 ? 's' : ''}
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600">Opacity</Label>
                <span className="text-xs text-gray-500">{Math.round(layer.opacity * 100)}%</span>
              </div>
              <Slider
                value={[layer.opacity]}
                onValueChange={(value) => handleOpacityChange(layer.id, value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="border-t border-border p-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <p>• Click layer to make it active</p>
          <p>• Use eye icon to show/hide</p>
          <p>• Use lock icon to prevent editing</p>
          <p>• Adjust opacity for transparency effects</p>
        </div>
      </div>
    </div>
  );
};

export default VectorLayersPanel;