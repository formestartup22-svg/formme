
import * as React from "react";

interface VideoAnnotationProps {
  showAnnotation: boolean;
  annotationText: string;
}

const VideoAnnotation: React.FC<VideoAnnotationProps> = ({ showAnnotation, annotationText }) => {
  if (!showAnnotation) return null;
  
  return (
    <div 
      className="absolute bottom-28 left-10 md:left-20 px-4 md:px-6 py-2 md:py-3 bg-black/60 text-white text-base md:text-lg rounded-md animate-slide-in backdrop-blur-sm border border-white/20"
    >
      <span className="font-semibold">{annotationText}</span>
      <div className="h-[2px] bg-white/80 mt-1 md:mt-2 animate-expand-line"></div>
    </div>
  );
};

export default VideoAnnotation;
