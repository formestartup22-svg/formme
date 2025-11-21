
import { useState, RefObject } from 'react';
import { useDrop } from 'react-dnd';
import { ElementType, CanvasElementType } from '@/types/elements';
import { toast } from "sonner";

export const useCanvasDrop = (
  canvasRef: RefObject<HTMLDivElement>,
  zoomLevel: number,
  canvasElements: CanvasElementType[],
  addCanvasElement: (element: CanvasElementType) => void
) => {
  const [placeholderPosition, setPlaceholderPosition] = useState<{ x: number, y: number } | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "DESIGN_ELEMENT",
    drop: (item: ElementType, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = ((offset.x - canvasRect.left) / (canvasRect.width * zoomLevel / 100)) * 100;
      const y = ((offset.y - canvasRect.top) / (canvasRect.height * zoomLevel / 100)) * 100;

      addCanvasElement({
        ...item,
        id: `canvas-${Date.now()}`,
        position: { x, y },
        rotation: 0,
        scale: 1,
        zIndex: canvasElements.length + 1,
      });

      toast(`Added ${item.name} to design`);
      setPlaceholderPosition(null);
    },
    hover: (item: ElementType, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = ((offset.x - canvasRect.left) / (canvasRect.width * zoomLevel / 100)) * 100;
      const y = ((offset.y - canvasRect.top) / (canvasRect.height * zoomLevel / 100)) * 100;

      setPlaceholderPosition({ x, y });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [canvasElements, addCanvasElement, zoomLevel]);

  return { isOver, canDrop, placeholderPosition, drop };
};
