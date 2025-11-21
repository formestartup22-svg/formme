
import { useState, useEffect, useRef } from "react";

interface Annotation {
  time: number;
  text: string;
  duration: number;
}

interface InfoBlock {
  title: string;
  text: string;
}

interface Position {
  x: number;
  y: number;
}

export function useCraftsmanshipVideo(annotations: Annotation[], infoBlocks?: InfoBlock[]) {
  const [showAnnotation, setShowAnnotation] = useState<boolean>(false);
  const [annotationText, setAnnotationText] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [activeInfoBlock, setActiveInfoBlock] = useState<number | null>(null);
  const [infoBlockPosition, setInfoBlockPosition] = useState<Position>({ x: 50, y: 50 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const infoBlockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define specific positions for the info blocks to cycle through
  const positions = [
    { x: 25, y: 25 },  // Top left
    { x: 75, y: 25 },  // Top right
    { x: 75, y: 75 },  // Bottom right
    { x: 25, y: 75 },  // Bottom left
  ];

  // Handle video annotations
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      
      // Update progress bar
      const duration = videoElement.duration;
      if (duration) {
        setProgress((currentTime / duration) * 100);
      }
      
      // Check if we should show an annotation
      const activeAnnotation = annotations.find(
        anno => currentTime >= anno.time && currentTime < anno.time + anno.duration
      );
      
      if (activeAnnotation) {
        setShowAnnotation(true);
        setAnnotationText(activeAnnotation.text);
      } else {
        setShowAnnotation(false);
      }
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [annotations]);

  // Handle info blocks appearance with controlled cycling
  useEffect(() => {
    if (!infoBlocks || infoBlocks.length === 0) return;
    
    let positionIndex = 0;
    let blockIndex = 0;
    
    const showInfoBlock = () => {
      // Show a block at the current position
      setActiveInfoBlock(blockIndex);
      setInfoBlockPosition(positions[positionIndex]);
      
      // Schedule to hide after 2-3 seconds
      infoBlockTimerRef.current = setTimeout(() => {
        setActiveInfoBlock(null);
        
        // Move to next position and block
        positionIndex = (positionIndex + 1) % positions.length;
        blockIndex = (blockIndex + 1) % infoBlocks.length;
        
        // Schedule next block to appear after 1.5-2 seconds
        infoBlockTimerRef.current = setTimeout(showInfoBlock, 1500 + Math.random() * 500);
      }, 2000 + Math.random() * 1000); // Random duration between 2-3 seconds
    };
    
    // Start the cycle after initial delay
    infoBlockTimerRef.current = setTimeout(showInfoBlock, 1000);
    
    return () => {
      if (infoBlockTimerRef.current) {
        clearTimeout(infoBlockTimerRef.current);
      }
    };
  }, [infoBlocks]);

  // Handle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Skip forward 5 seconds
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.currentTime + 5, video.duration);
  };

  // Skip backward 5 seconds
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(video.currentTime - 5, 0);
  };

  return {
    videoRef,
    showAnnotation,
    annotationText,
    isMuted,
    isPlaying,
    progress,
    togglePlayPause,
    toggleMute,
    skipForward,
    skipBackward,
    setProgress,
    activeInfoBlock,
    infoBlockPosition
  };
}
