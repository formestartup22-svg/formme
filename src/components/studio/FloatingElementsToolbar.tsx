
import React, { startTransition } from 'react';
import { MousePointer2, PenLine, Eraser, Type, Spline } from 'lucide-react';
import { useActiveSubTool } from '@/hooks/useActiveSubTool';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const toolIcons = [
  { id: 'select', Icon: MousePointer2, label: 'Select' },
  { id: 'draw', Icon: PenLine, label: 'Draw' },
  { id: 'eraser', Icon: Eraser, label: 'Eraser' },
  { id: 'vector', Icon: Spline, label: 'Vector' },
  { id: 'text', Icon: Type, label: 'Text' },
];

const FloatingElementsToolbar = () => {
  const { subTool, setActiveSubTool } = useActiveSubTool();

  const handleToolClick = (toolId: 'select' | 'draw' | 'eraser' | 'vector' | 'text' | '') => {
    if (toolId) {
      startTransition(() => {
        setActiveSubTool(toolId);
      });
    }
  };

  return (
    <div className="absolute left-4 top-36 z-40">
      <TooltipProvider delayDuration={100}>
        <div className="bg-card rounded-lg shadow-lg border border-border">
          <ToggleGroup
            type="single"
            value={subTool}
            onValueChange={(value) => handleToolClick(value as any)}
            className="flex flex-col p-1 gap-0.5"
          >
            {toolIcons.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value={tool.id} aria-label={tool.label} className="w-11 h-11 rounded-md data-[state=on]:bg-primary/15 data-[state=on]:text-primary">
                    <tool.Icon size={20} />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default FloatingElementsToolbar;
