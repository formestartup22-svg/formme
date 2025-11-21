
import { useDrop } from 'react-dnd';
import { toast } from 'sonner';

interface DroppedPattern {
  id: string;
  url: string;
  name: string;
  type: string;
}

export const useTshirtDrop = (
  part: 'body' | 'sleeves' | 'collar',
  onPatternDrop: (part: 'body' | 'sleeves' | 'collar', patternId: string) => void
) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'UPLOADED_PATTERN',
    drop: (item: DroppedPattern) => {
      onPatternDrop(part, item.id);
      toast.success(`Applied "${item.name}" to ${part}`);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [part, onPatternDrop]);

  return { isOver, canDrop, drop };
};
