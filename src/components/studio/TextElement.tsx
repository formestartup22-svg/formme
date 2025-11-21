import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { CanvasElementType } from '@/types/elements';

interface TextElementProps {
    element: CanvasElementType;
    onUpdate: (id: string, data: Partial<CanvasElementType>) => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    isSelected: boolean;
    activeSubTool: string;
    setActiveSubTool: (tool: string) => void;
}

export const TextElement = ({ element, onUpdate, onSelect, onDelete, isSelected, activeSubTool, setActiveSubTool }: TextElementProps) => {
    const { text, style, position, zIndex, id, width, height } = element;
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditedText(element.text);
    }, [element.text]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedText(e.target.value);
    };

    const handleTextBlur = () => {
        setIsEditing(false);
        // If text is empty when user clicks away, delete the element
        if (editedText.trim() === '') {
            onDelete(id);
            return;
        }
        if (editedText !== text) {
            onUpdate(id, { text: editedText });
        }
    };
    
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [isEditing, editedText]);
    
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
        setActiveSubTool('select');
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent textarea from blurring and stealing focus
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <Rnd
            style={{
                border: isSelected ? '1px dashed #2563eb' : 'none',
                zIndex: zIndex || 999,
                pointerEvents: 'auto',
            }}
            size={{ width: width || 'auto', height: height || 'auto' }}
            position={{ x: position.x, y: position.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            disableDragging={activeSubTool !== 'select'}
            enableResizing={isSelected && activeSubTool === 'select' ? {
                top: false, right: false, bottom: false, left: false,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
            } : false}
            minWidth={50}
            bounds="parent"
        >
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={editedText}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    style={{
                        ...style,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        background: 'transparent',
                        resize: 'none',
                        outline: 'none',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                        overflow: 'hidden',
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle,
                        color: style.color,
                        textAlign: style.textAlign,
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                            setEditedText(text);
                            setIsEditing(false);
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextBlur();
                        }
                    }}
                    onClick={e => e.stopPropagation()}
                />
            ) : (
                <div 
                    style={{
                        ...style,
                        width: '100%',
                        height: '100%',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'none',
                        wordBreak: 'break-word',
                        cursor: activeSubTool === 'select' ? 'move' : 'default',
                    }}
                >
                    {text}
                </div>
            )}
            {isSelected && (
                <button
                    onMouseDown={handleDelete}
                    className="absolute -top-2.5 -right-2.5 bg-white rounded-full p-0.5 shadow-md hover:bg-red-100 flex items-center justify-center"
                    style={{ zIndex: (zIndex || 999) + 1, width: '20px', height: '20px' }}
                    title="Delete"
                >
                    <X className="w-3.5 h-3.5 text-red-500" />
                </button>
            )}
        </Rnd>
    );
};
