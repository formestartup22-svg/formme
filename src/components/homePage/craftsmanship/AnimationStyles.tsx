
import * as React from "react";

const AnimationStyles: React.FC = () => {
  return (
    <style>
      {`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes expandLine {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes pulseText {
          0% { opacity: 0; transform: translateY(10px); filter: blur(4px); }
          10% { opacity: 1; transform: translateY(0); filter: blur(0); }
          90% { opacity: 1; transform: translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-10px); filter: blur(4px); }
        }
        
        .animate-pulse-text {
          animation: pulseText 5s ease-in-out;
        }
        
        .animate-slide-in {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-expand-line {
          animation: expandLine 0.8s ease-out 0.3s forwards;
        }
      `}
    </style>
  );
};

export default AnimationStyles;
