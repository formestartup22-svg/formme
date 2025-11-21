
import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import { ElementType } from "@/types/elements";

interface ElementItemProps {
  item: ElementType;
}

const ElementItem = ({ item }: ElementItemProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DESIGN_ELEMENT",
    item: { ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={cn(
        "p-2 border rounded-md bg-white hover:bg-gray-50 cursor-grab transition-all flex flex-col items-center",
        isDragging ? "opacity-50" : "opacity-100",
        isDragging ? "shadow-lg" : "shadow-sm"
      )}
    >
      <div className="flex items-center justify-center h-16 w-full">
        {item.preview}
      </div>
      <span className="text-[10px] text-center mt-1 text-gray-600 font-medium">
        {item.name}
      </span>
    </div>
  );
};

export default ElementItem;
