
import * as React from "react";
import { useState, useEffect } from "react";

interface TextOverlayProps {
  textOverlays: string[];
}

const TextOverlay: React.FC<TextOverlayProps> = ({ textOverlays }) => {
  const [currentOverlay, setCurrentOverlay] = useState<number>(0);

  // Handle text overlay cycling
  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentOverlay((prev) => (prev + 1) % textOverlays.length);
    }, 5000); // Change text every 5 seconds
    
    return () => clearInterval(textInterval);
  }, [textOverlays.length]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className="px-6 md:px-8 py-3 md:py-4 bg-black/30 backdrop-blur-sm rounded-lg text-white text-2xl md:text-4xl lg:text-5xl font-light tracking-wider text-center"
      >
        <p className="animate-pulse-text">
          {textOverlays[currentOverlay]}
        </p>
      </div>
    </div>
  );
};

export default TextOverlay;
