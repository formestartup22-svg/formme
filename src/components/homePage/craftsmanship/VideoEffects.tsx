
import * as React from "react";

const VideoEffects: React.FC = () => {
  return (
    <>
      {/* Visual emphasis layer - subtle radial glow */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 90%)"
        }}
      />
      
      {/* Cinematic vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.9)"
        }}
      />
    </>
  );
};

export default VideoEffects;
