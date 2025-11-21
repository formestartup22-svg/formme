
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CropData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  clipRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UploadedPattern {
  id: string;
  name: string;
  url: string;
  file: File;
  cropData?: CropData;
}

export interface PatternUploadHook {
  uploadedPatterns: UploadedPattern[];
  isUploading: boolean;
  uploadPattern: (file: File) => Promise<UploadedPattern | null>;
  updatePatternCrop: (patternId: string, cropData: CropData) => void;
  removePattern: (patternId: string) => void;
  getPatternById: (patternId: string) => UploadedPattern | undefined;
  cleanup: () => void;
}

export const usePatternUpload = (): PatternUploadHook => {
  const [uploadedPatterns, setUploadedPatterns] = useState<UploadedPattern[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPattern = useCallback(async (file: File): Promise<UploadedPattern | null> => {
    setIsUploading(true);
    
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return null;
      }

      // Create object URL for the image
      const url = URL.createObjectURL(file);
      
      const pattern: UploadedPattern = {
        id: `pattern-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        url,
        file,
        cropData: { x: 0, y: 0, scale: 0.8, rotation: 0 } // Default crop settings
      };

      setUploadedPatterns(prev => [...prev, pattern]);
      toast.success(`Pattern "${pattern.name}" uploaded successfully`);
      
      return pattern;
    } catch (error) {
      console.error('Error uploading pattern:', error);
      toast.error('Failed to upload pattern');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const updatePatternCrop = useCallback((patternId: string, cropData: CropData) => {
    setUploadedPatterns(prev => 
      prev.map(pattern => 
        pattern.id === patternId 
          ? { ...pattern, cropData }
          : pattern
      )
    );
  }, []);

  const removePattern = useCallback((patternId: string) => {
    setUploadedPatterns(prev => {
      const pattern = prev.find(p => p.id === patternId);
      if (pattern) {
        URL.revokeObjectURL(pattern.url);
      }
      return prev.filter(p => p.id !== patternId);
    });
    toast.success('Pattern removed');
  }, []);

  const getPatternById = useCallback((patternId: string) => {
    return uploadedPatterns.find(p => p.id === patternId);
  }, [uploadedPatterns]);

  // Cleanup URLs on unmount
  const cleanup = useCallback(() => {
    uploadedPatterns.forEach(pattern => {
      URL.revokeObjectURL(pattern.url);
    });
  }, [uploadedPatterns]);

  return {
    uploadedPatterns,
    isUploading,
    uploadPattern,
    updatePatternCrop,
    removePattern,
    getPatternById,
    cleanup
  };
};
