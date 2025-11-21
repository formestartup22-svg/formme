
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Palette, Shirt, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import BackModeToggle from './BackModeToggle';
import { CanvasElementType } from '@/types/elements';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { useElementContext } from '@/context/ElementContext';

interface TopToolbarProps {
  onShowColors: () => void;
  onShowFabrics: () => void;
  isBackMode: boolean;
  onToggle: () => void;
  selectedElement: CanvasElementType | null | undefined;
  onUpdateElement: (id: string, data: Partial<CanvasElementType>) => void;
}

const fonts = ['Arial', 'Georgia', 'Helvetica', 'Times New Roman', 'Verdana', 'Impact', 'Courier New'];

const TopToolbar = ({ onShowColors, onShowFabrics, isBackMode, onToggle, selectedElement, onUpdateElement }: TopToolbarProps) => {
  const { canvasElements } = useElementContext();
  const isTextSelected = selectedElement && selectedElement.type === 'text';
  const hasTextElements = canvasElements.some(el => el.type === 'text');

  const handleStyleChange = (property: string, value: any) => {
    if (selectedElement) {
        onUpdateElement(selectedElement.id, {
            style: {
                ...selectedElement.style,
                [property]: value,
            }
        });
    }
  };

  const handleToggleStyle = (style: 'fontWeight' | 'fontStyle' | 'textDecoration') => {
      if (!selectedElement || !selectedElement.style) return;
      const currentStyle = selectedElement.style;
      let newValue;
      if (style === 'fontWeight') newValue = currentStyle?.fontWeight === 'bold' ? 'normal' : 'bold';
      if (style === 'fontStyle') newValue = currentStyle?.fontStyle === 'italic' ? 'normal' : 'italic';
      if (style === 'textDecoration') newValue = currentStyle?.textDecoration === 'underline' ? 'none' : 'underline';
      
      handleStyleChange(style, newValue);
  };
  
  const handleSave = () => {
    const node = document.getElementById('design-canvas-container');
    if (node) {
      toast.info('Generating image...');
      toPng(node)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'design.png';
          link.href = dataUrl;
          link.click();
          toast.success('Design downloaded successfully!');
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
          toast.error('Could not save design.');
        });
    } else {
        toast.error('Could not find canvas to save.');
    }
  };

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 flex items-center p-2 gap-1 bg-card border border-border rounded-lg shadow-lg">
      <Button variant="ghost" size="sm" onClick={onShowColors} className="flex items-center gap-2 text-foreground">
        <Palette className="w-5 h-5" />
        <span>Colors</span>
      </Button>
      
      <Button variant="ghost" size="sm" onClick={onShowFabrics} className="flex items-center gap-2 text-foreground">
        <Shirt className="w-5 h-5" />
        <span>Fabric</span>
      </Button>

      <Button variant="ghost" size="sm" onClick={handleSave} className="flex items-center gap-2 text-foreground">
        <Save className="w-5 h-5" />
        <span>Save</span>
      </Button>

      {hasTextElements && (
        <>
            <div className="w-px h-6 bg-border mx-1" />
            <Select
                value={isTextSelected ? selectedElement.style.fontFamily || 'Arial' : 'Arial'}
                onValueChange={(value) => handleStyleChange('fontFamily', value)}
                disabled={!isTextSelected}
            >
                <SelectTrigger className="w-[120px] h-8 text-xs focus:ring-0 border-border">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                    {fonts.map(font => (
                        <SelectItem key={font} value={font} className="text-xs">
                          <span style={{fontFamily: font}}>{font}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="number"
                value={isTextSelected ? parseInt(selectedElement.style.fontSize?.toString() || '16', 10) : 16}
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="w-16 h-8 text-xs"
                min={1}
                disabled={!isTextSelected}
            />
            <Input
                type="color"
                value={isTextSelected ? selectedElement.style.color?.toString() || '#000000' : '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="p-0 border-none w-8 h-8 cursor-pointer disabled:cursor-not-allowed"
                disabled={!isTextSelected}
            />
            <div className="w-px h-6 bg-border mx-1" />
            <ToggleGroup type="multiple" size="sm" 
              value={isTextSelected ? [
                selectedElement.style.fontWeight === 'bold' ? 'bold' : '',
                selectedElement.style.fontStyle === 'italic' ? 'italic' : '',
                selectedElement.style.textDecoration === 'underline' ? 'underline' : ''
              ].filter(Boolean) : []}
              className="gap-0.5"
            >
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => handleToggleStyle('fontWeight')} className="h-8 w-8" disabled={!isTextSelected}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => handleToggleStyle('fontStyle')} className="h-8 w-8" disabled={!isTextSelected}>
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => handleToggleStyle('textDecoration')} className="h-8 w-8" disabled={!isTextSelected}>
                    <Underline className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            <div className="w-px h-6 bg-border mx-1" />
            <ToggleGroup
                type="single"
                size="sm"
                value={isTextSelected ? selectedElement.style.textAlign || 'left' : 'left'}
                onValueChange={(value) => {
                    if (value) handleStyleChange('textAlign', value)
                }}
                className="gap-0.5"
            >
                <ToggleGroupItem value="left" aria-label="Align left" className="h-8 w-8" disabled={!isTextSelected}>
                    <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Align center" className="h-8 w-8" disabled={!isTextSelected}>
                    <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Align right" className="h-8 w-8" disabled={!isTextSelected}>
                    <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </>
      )}

      <div className="w-px h-6 bg-border mx-2" />
      
      <div className="px-2">
        <BackModeToggle isBackMode={isBackMode} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default TopToolbar;
