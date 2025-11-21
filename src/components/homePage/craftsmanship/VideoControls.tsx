
import * as React from "react";
import { Play, Pause, Volume, VolumeOff, SkipForward, SkipBack } from "lucide-react";

interface VideoControlsProps {
  isHovering: boolean;
  isMobile: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  togglePlayPause: () => void;
  toggleMute: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  handleProgressBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  progressBarRef: React.RefObject<HTMLDivElement>;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isHovering,
  isMobile,
  isPlaying,
  isMuted,
  progress,
  togglePlayPause,
  toggleMute,
  skipForward,
  skipBackward,
  handleProgressBarClick,
  progressBarRef,
}) => {
  return (
    <>
      {/* Progress bar */}
      <div 
        ref={progressBarRef}
        className={`absolute bottom-14 md:bottom-16 left-0 right-0 h-1 bg-gray-700/50 mx-4 cursor-pointer transition-opacity duration-300 ${isHovering || isMobile ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleProgressBarClick}
      >
        <div 
          className="h-full bg-white/80 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full transform translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
        </div>
      </div>
      
      {/* Video controls that appear on hover */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 flex justify-between items-center transition-opacity duration-300 backdrop-blur-sm bg-black/30 ${isHovering || isMobile ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <button 
            onClick={togglePlayPause}
            className="bg-white/20 text-white p-1.5 md:p-2 rounded-full hover:bg-white/40 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button 
            onClick={skipBackward}
            className="bg-white/10 text-white p-1 md:p-1.5 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Skip backward"
          >
            <SkipBack className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </button>
          
          <button 
            onClick={skipForward}
            className="bg-white/10 text-white p-1 md:p-1.5 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Skip forward"
          >
            <SkipForward className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </button>
          
          <button 
            onClick={toggleMute}
            className="bg-white/20 text-white p-1.5 md:p-2 rounded-full hover:bg-white/40 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeOff className="h-4 w-4" /> : <Volume className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="text-white text-xs md:text-sm bg-white/20 px-2 md:px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
          Craftsmanship in action
        </div>
      </div>
    </>
  );
};

export default VideoControls;
