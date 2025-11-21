
import React from 'react';
import ThreeDTshirtViewer from './ThreeDTshirtViewer';

export interface TShirt3DPreviewProps {
  bodyColor: string;
  sleevesColor: string;
  collarColor: string;
}

const TShirt3DPreview = ({ bodyColor, sleevesColor, collarColor }: TShirt3DPreviewProps) => {
  return (
    <div className="w-full h-full">
      <ThreeDTshirtViewer
        colors={{ body: bodyColor, sleeves: sleevesColor, collar: collarColor }}
        patterns={{ body: '', sleeves: '', collar: '', stripesColor: '' }}
        fabric={{ name: 'Cotton', texture: 'cotton', roughness: 0.8, metalness: 0.1 }}
        selectedTemplate="crew-neck-basic"
      />
    </div>
  );
};

export default TShirt3DPreview;
