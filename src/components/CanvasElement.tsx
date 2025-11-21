
import { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import { useElementContext } from "@/context/ElementContext";
import { CanvasElementType } from "@/types/elements";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface CanvasElementProps {
  element: CanvasElementType;
  selected: boolean;
  canvasSize: { width: number; height: number };
}

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Impact', label: 'Impact' },
];

const CanvasElement = ({ element, selected, canvasSize }: CanvasElementProps) => {
  const { selectElement, updateCanvasElement, deleteElement } = useElementContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialAngle, setInitialAngle] = useState(0);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState(false);
  const [elementText, setElementText] = useState(element.text || '');
  const [elementFontFamily, setElementFontFamily] = useState(element.style?.fontFamily || 'Arial');
  const [elementFontSize, setElementFontSize] = useState(parseInt(element.style?.fontSize?.toString() || '16', 10));
  const [editableElement, setEditableElement] = useState(element);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const rotateHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableElement(element);
    setElementText(element.text || '');
    setElementFontFamily(element.style?.fontFamily || 'Arial');
    setElementFontSize(parseInt(element.style?.fontSize?.toString() || '16', 10));
  }, [element]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selected) return;
    e.stopPropagation();
    
    setIsDragging(true);
    setInitialPosition({ x: e.clientX, y: e.clientY });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setIsRotating(true);
    setInitialAngle(Math.atan2(e.clientY - centerY, e.clientX - centerX));
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!elementRef.current) return;
    
    setIsResizing(true);
    setInitialPosition({ x: e.clientX, y: e.clientY });
    setInitialSize({ 
      width: elementRef.current.offsetWidth, 
      height: elementRef.current.offsetHeight 
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  const handleTextEdit = () => {
    if (element.type === 'text') {
      setEditingText(true);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    }
  };

  const saveTextChanges = () => {
    updateCanvasElement(element.id, {
      text: elementText,
      style: {
        ...element.style,
        fontFamily: elementFontFamily,
        fontSize: `${elementFontSize}px`,
      },
    });
    setEditingText(false);
  };

  useEffect(() => {
    if (!isDragging && !isRotating && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (!elementRef.current || !canvasSize.width || !canvasSize.height) return;
        
        const deltaX = e.clientX - initialPosition.x;
        const deltaY = e.clientY - initialPosition.y;
        
        const percentDeltaX = (deltaX / canvasSize.width) * 100;
        const percentDeltaY = (deltaY / canvasSize.height) * 100;
        
        const newX = Math.max(0, Math.min(100, element.position.x + percentDeltaX));
        const newY = Math.max(0, Math.min(100, element.position.y + percentDeltaY));
        
        updateCanvasElement(element.id, {
          ...element,
          position: { x: newX, y: newY }
        });
        
        setInitialPosition({ x: e.clientX, y: e.clientY });
      } else if (isRotating) {
        if (!elementRef.current) return;
        
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const angleDeg = ((angle - initialAngle) * 180) / Math.PI;
        
        updateCanvasElement(element.id, {
          ...element,
          rotation: element.rotation + angleDeg
        });
        
        setInitialAngle(angle);
      } else if (isResizing) {
        if (!elementRef.current) return;
        
        const deltaX = e.clientX - initialPosition.x;
        const deltaY = e.clientY - initialPosition.y;
        const aspectRatio = initialSize.width / initialSize.height;
        
        // Calculate new scale based on diagonal distance
        const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const direction = (deltaX + deltaY) > 0 ? 1 : -1;
        const newScale = Math.max(0.2, element.scale + (direction * diagonal * 0.01));
        
        updateCanvasElement(element.id, {
          ...element,
          scale: newScale
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsRotating(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isRotating, isResizing, initialPosition, initialAngle, initialSize, element, canvasSize, updateCanvasElement]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-shadow",
        selected ? "shadow-lg z-10" : ""
      )}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scale(${element.scale})`,
        zIndex: element.zIndex,
        touchAction: "none",
        fontFamily: element.style?.fontFamily || 'Arial',
        fontSize: element.style?.fontSize || '16px',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleTextEdit}
    >
      {selected && (
        <div className="absolute -inset-2 border-2 border-dashed border-purple-500 rounded-lg pointer-events-none"></div>
      )}
      
      <div className="relative">
        {element.type === 'text' ? (
          editingText ? (
            <div className="min-w-[100px] p-2">
              <input
                ref={textInputRef}
                type="text"
                value={elementText}
                onChange={(e) => setElementText(e.target.value)}
                className="border rounded px-2 py-1 w-full mb-2"
                autoFocus
              />
              <div className="flex flex-col gap-2 mb-2">
                <Select 
                  value={elementFontFamily}
                  onValueChange={setElementFontFamily}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="space-y-1">
                  <Label className="text-xs">Font Size: {elementFontSize}px</Label>
                  <Slider
                    value={[elementFontSize]}
                    min={8}
                    max={72}
                    step={1}
                    onValueChange={(value) => setElementFontSize(value[0])}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingText(false)}>Cancel</Button>
                <Button size="sm" onClick={saveTextChanges}>Save</Button>
              </div>
            </div>
          ) : (
            <div 
              style={{ 
                fontFamily: elementFontFamily, 
                fontSize: `${elementFontSize}px`,
                minWidth: '50px',
                minHeight: '24px',
                padding: '4px'
              }}
            >
              {elementText || 'Double-click to edit'}
            </div>
          )
        ) : (
          element.preview
        )}
        
        {selected && (
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
            <button
              onClick={handleDelete}
              className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}
        
        {selected && (
          <>
            {/* Rotate Handle */}
            <div 
              ref={rotateHandleRef}
              className="absolute -top-8 left-1/2 w-5 h-5 bg-blue-500 border border-white rounded-full cursor-pointer shadow-md -translate-x-1/2"
              onMouseDown={handleRotateStart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-0 left-0"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.7 2.84"/><path d="M21 3v9h-9"/></svg>
            </div>
            
            {/* Resize Handle */}
            <div 
              ref={resizeHandleRef}
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-300 rounded-full cursor-se-resize shadow-md"
              onMouseDown={handleResizeStart}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CanvasElement;
