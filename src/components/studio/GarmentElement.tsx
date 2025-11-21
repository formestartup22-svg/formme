
import React from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { CanvasElementType } from '@/types/elements';
import GarmentRenderer from './GarmentRenderer';
import { StudioColors, StudioPatterns, FabricProperties } from '@/hooks/useStudioState';
import { UploadedPattern } from '@/hooks/usePatternUpload';
import { CanvasButton } from '@/hooks/useCanvasButtons';

interface GarmentElementProps {
    element: CanvasElementType;
    onUpdate: (id: string, data: Partial<CanvasElementType>) => void;
    onSelect: (id: string | null) => void;
    onDelete: (id: string) => void;
    isSelected: boolean;
    activeSubTool: string;
    getPatternById?: (patternId: string) => UploadedPattern | undefined;
}

export const GarmentElement = ({
    element,
    onUpdate,
    onSelect,
    onDelete,
    isSelected,
    activeSubTool,
    getPatternById
}: GarmentElementProps) => {
    const { id, position, zIndex, width, height, templateId, colors, patterns, uploadedPatterns, fabric, buttons } = element;

    if (!templateId || !colors || !patterns || !uploadedPatterns || !fabric) {
        return null; // Or some fallback UI
    }

    // Adapt the element's colors and patterns to what GarmentRenderer expects.
    const rendererColors: StudioColors = {
        ...colors,
        stripesColor: colors.stripesColor || '',
    };
    const rendererPatterns: StudioPatterns = {
        body: patterns.body,
        sleeves: patterns.sleeves,
        collar: patterns.collar,
        stripesColor: patterns.stripesColor || '',
    };
    const rendererUploadedPatterns: StudioPatterns = {
        body: uploadedPatterns.body,
        sleeves: uploadedPatterns.sleeves,
        collar: uploadedPatterns.collar,
        stripesColor: uploadedPatterns.stripesColor || '',
    };

    const handleDragStop = (e: any, d: { x: number; y: number; }) => {
        onUpdate(id, { position: { x: d.x, y: d.y } });
    };

    const handleResizeStop = (e: any, direction: any, ref: HTMLElement, delta: any, newPosition: { x: number; y: number; }) => {
        onUpdate(id, {
            width: ref.style.width,
            height: ref.style.height,
            position: newPosition,
        });
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(id);
    };

    const isDraggable = activeSubTool === 'select';

    return (
        <Rnd
            style={{
                border: isSelected ? '2px dashed #2563eb' : '1px solid #e2e8f0',
                zIndex: zIndex || 1,
                pointerEvents: 'auto',
            }}
            size={{ width: width || 300, height: height || 380 }}
            position={{ x: position.x, y: position.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onClick={handleClick}
            disableDragging={!isDraggable}
            enableResizing={isSelected && isDraggable ? {
                top: false, right: true, bottom: true, left: false,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: false
            } : false}
            minWidth={100}
            minHeight={100}
            bounds="parent"
        >
            <div 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    cursor: isDraggable ? 'move' : 'default',
                }}
            >
                <GarmentRenderer
                    selectedTemplate={templateId}
                    colors={rendererColors}
                    patterns={rendererPatterns}
                    uploadedPatterns={rendererUploadedPatterns}
                    fabric={fabric}
                    buttons={buttons}
                    getPatternById={getPatternById}
                    className="w-full h-full"
                />
            </div>

            {isSelected && (
                <button
                    onMouseDown={handleDelete}
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-red-100 flex items-center justify-center"
                    style={{ zIndex: (zIndex || 1) + 1, width: '24px', height: '24px' }}
                    title="Delete"
                >
                    <X className="w-4 h-4 text-red-500" />
                </button>
            )}
        </Rnd>
    );
};
