
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useElementContext } from "@/context/ElementContext";
import { CanvasElementType } from "@/types/elements";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const UploadsPanel = () => {
  const { addCanvasElement } = useElementContext();
  const [dragging, setDragging] = useState(false);
  
  // Sample images for the UI demo
  const sampleImages = [
    { id: 'img1', thumbnail: '/lovable-uploads/01473d26-2229-42e7-80b1-89dbde506fc5.png', name: 'Design 1' },
    { id: 'img2', thumbnail: 'https://via.placeholder.com/100x100', name: 'Pattern 1' },
    { id: 'img3', thumbnail: 'https://via.placeholder.com/100x100', name: 'Texture 1' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    toast.success("File upload simulated", {
      description: "This is a UI demo. In a real app, your file would be uploaded."
    });
  };

  const handleAddImage = (imageUrl: string, name: string) => {
    const newImageElement: CanvasElementType = {
      id: `image-${Date.now()}`,
      name: name || 'Custom Image',
      category: 'images',
      type: 'image',
      position: { x: 50, y: 50 },
      rotation: 0,
      scale: 1,
      zIndex: 50,
      preview: (
        <img 
          src={imageUrl} 
          alt="Custom" 
          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} 
        />
      )
    };
    
    addCanvasElement(newImageElement);
    toast.success("Image added to canvas");
  };

  const handleDeleteImage = (id: string) => {
    // In a real app, this would delete the image from the server
    toast.info("Image delete simulated", {
      description: "This is a UI demo. In a real app, your file would be deleted."
    });
  };

  return (
    <div className="w-64 bg-white border-r overflow-hidden flex flex-col">
      <div className="p-3 border-b bg-[#FFC72C]/10">
        <h3 className="text-sm font-medium">Uploads</h3>
      </div>
      
      <div className="p-3">
        <div 
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragging ? 'border-[#FFC72C] bg-[#FFC72C]/10' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center h-24">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <p className="text-sm text-gray-500">Drag and drop files or</p>
            <Button size="sm" variant="outline" className="mt-2">Browse Files</Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          <h4 className="text-xs font-medium mb-2">Recent Uploads</h4>
          <div className="grid grid-cols-2 gap-2">
            {sampleImages.map((image) => (
              <ContextMenu key={image.id}>
                <ContextMenuTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="border rounded-md p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleAddImage(image.thumbnail, image.name)}
                      >
                        <div className="aspect-square w-full rounded overflow-hidden mb-1">
                          <img 
                            src={image.thumbnail} 
                            alt="Upload thumbnail" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs truncate">{image.name}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to add to canvas</p>
                    </TooltipContent>
                  </Tooltip>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleAddImage(image.thumbnail, image.name)}>
                    Add to Canvas
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleDeleteImage(image.id)}>
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-[#FFC72C]/10">
        <div className="text-xs text-amber-600 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Tip: Uploaded images can be resized, rotated, and positioned on your design
        </div>
      </div>
    </div>
  );
};

export default UploadsPanel;
