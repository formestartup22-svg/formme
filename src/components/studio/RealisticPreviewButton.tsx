
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface RealisticPreviewButtonProps {
  onConvertToRealistic?: () => void;
  className?: string;
}

const RealisticPreviewButton = ({ onConvertToRealistic, className = "" }: RealisticPreviewButtonProps) => {
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      if (onConvertToRealistic) {
        await onConvertToRealistic();
      }
    } catch (error) {
      console.error("Error converting to realistic preview:", error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <Button
        onClick={handleConvert}
        disabled={isConverting}
        size="lg"
        className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {isConverting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Converting to Realistic...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Convert to Realistic Preview
          </>
        )}
      </Button>
    </div>
  );
};

export default RealisticPreviewButton;
