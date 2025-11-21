
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Edit, Move, RotateCw, ZoomIn } from 'lucide-react';
import { UploadedPattern, usePatternUpload } from '@/hooks/usePatternUpload';
import PatternEditor from './PatternEditor';

interface PatternUploaderProps {
  selectedPart: 'body' | 'sleeves' | 'collar';
  onPatternSelect: (patternId: string) => void;
  selectedPatternId?: string;
  patternUploadHook?: ReturnType<typeof usePatternUpload>;
}

interface DraggablePatternProps {
  pattern: UploadedPattern;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDirectEdit: () => void;
}

const DraggablePattern = ({ pattern, isSelected, onSelect, onRemove, onEdit, onDirectEdit }: DraggablePatternProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'UPLOADED_PATTERN',
    item: { id: pattern.id, url: pattern.url, name: pattern.name, type: 'UPLOADED_PATTERN' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`relative group cursor-move ${isDragging ? 'opacity-50' : ''} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
        <img
          src={pattern.url}
          alt={pattern.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDirectEdit();
          }}
          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 transition-colors"
          title="Quick edit on garment"
        >
          <Move size={10} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
          title="Edit pattern"
        >
          <Edit size={10} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          title="Remove pattern"
        >
          <X size={10} />
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-600 truncate">{pattern.name}</div>
    </div>
  );
};

const PatternUploader = ({ 
  selectedPart, 
  onPatternSelect, 
  selectedPatternId,
  patternUploadHook 
}: PatternUploaderProps) => {
  const [editingPattern, setEditingPattern] = useState<UploadedPattern | null>(null);
  const [directEditingPattern, setDirectEditingPattern] = useState<UploadedPattern | null>(null);
  
  // Use the passed hook instance or create a fallback
  const fallbackHook = usePatternUpload();
  const { uploadedPatterns, isUploading, uploadPattern, removePattern, updatePatternCrop } = patternUploadHook || fallbackHook;

  console.log('=== PatternUploader Debug ===');
  console.log('Using passed hook:', !!patternUploadHook);
  console.log('Available patterns:', uploadedPatterns);
  console.log('Pattern count:', uploadedPatterns.length);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const pattern = await uploadPattern(file);
      if (pattern) {
        console.log('✅ Pattern uploaded successfully:', pattern.id);
      }
    }
  }, [uploadPattern]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: true
  });

  const handlePatternSelect = (patternId: string) => {
    console.log('=== Pattern Selection ===');
    console.log('Selected pattern ID:', patternId);
    console.log('Target part:', selectedPart);
    onPatternSelect(patternId);
  };

  const handlePatternRemove = (patternId: string) => {
    // If this was the selected pattern, clear the selection
    if (selectedPatternId === patternId) {
      onPatternSelect('');
    }
    removePattern(patternId);
  };

  const handlePatternEdit = (pattern: UploadedPattern) => {
    setEditingPattern(pattern);
  };

  const handleDirectEdit = (pattern: UploadedPattern) => {
    console.log('🎯 Direct edit pattern on garment:', pattern.id);
    setDirectEditingPattern(pattern);
    // Apply the pattern to the current part for direct editing
    onPatternSelect(pattern.id);
  };

  const handlePatternUpdate = (patternId: string, cropData: any) => {
    updatePatternCrop(patternId, cropData);
    setEditingPattern(null);
    setDirectEditingPattern(null);
  };

  if (editingPattern) {
    return (
      <PatternEditor
        pattern={editingPattern}
        onUpdate={handlePatternUpdate}
        onClose={() => setEditingPattern(null)}
      />
    );
  }

  // Direct editing mode - show interactive controls
  if (directEditingPattern) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Move size={16} />
            Quick Edit: {directEditingPattern.name}
          </h4>
          <Button
            onClick={() => setDirectEditingPattern(null)}
            variant="outline"
            size="sm"
          >
            Done
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-blue-300">
              <img
                src={directEditingPattern.url}
                alt={directEditingPattern.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-blue-900">{directEditingPattern.name}</h5>
              <div className="text-sm text-blue-700 mt-1 space-y-1">
                <div className="flex items-center gap-1">
                  <Move size={12} />
                  Click and drag the pattern on the garment to move it
                </div>
                <div className="flex items-center gap-1">
                  <ZoomIn size={12} />
                  Use mouse wheel to resize (or use the sliders below)
                </div>
                <div className="flex items-center gap-1">
                  <RotateCw size={12} />
                  Hold Shift + scroll to rotate
                </div>
              </div>
              <div className="mt-2">
                <Button
                  onClick={() => {
                    setDirectEditingPattern(null);
                    setEditingPattern(directEditingPattern);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Edit size={12} className="mr-1" />
                  Advanced Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragActive ? 'Drop images here...' : 'Drop images or click to upload'}
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, GIF, SVG (max 5MB each)</p>
      </div>

      {/* Clear Selection Button */}
      {selectedPatternId && (
        <Button
          onClick={() => onPatternSelect('')}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear {selectedPart} pattern
        </Button>
      )}

      {/* Uploaded Patterns Grid */}
      {uploadedPatterns.length > 0 ? (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Image size={16} />
            Uploaded Patterns ({uploadedPatterns.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {uploadedPatterns.map((pattern) => (
              <DraggablePattern
                key={pattern.id}
                pattern={pattern}
                isSelected={selectedPatternId === pattern.id}
                onSelect={() => handlePatternSelect(pattern.id)}
                onRemove={() => handlePatternRemove(pattern.id)}
                onEdit={() => handlePatternEdit(pattern)}
                onDirectEdit={() => handleDirectEdit(pattern)}
              />
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 Green button: Quick edit on garment | Blue button: Advanced editor | Drag to apply to garment
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No custom patterns uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload some images to get started</p>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-2">
          <div className="text-sm text-blue-600">Uploading patterns...</div>
        </div>
      )}
    </div>
  );
};

export default PatternUploader;
