
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { FabricProperties, StudioPatterns } from '@/hooks/useStudioState';
import StudioTShirtModel from './StudioTShirtModel';

interface ThreeDTshirtViewerProps {
  colors: {
    body: string;
    sleeves: string;
    collar: string;
  };
  patterns: StudioPatterns;
  fabric: FabricProperties;
  selectedTemplate: string;
}

const ThreeDTshirtViewer = ({ 
  colors, 
  patterns, 
  fabric, 
  selectedTemplate 
}: ThreeDTshirtViewerProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <StudioTShirtModel
          colors={colors}
          patterns={patterns}
          fabric={fabric}
          selectedTemplate={selectedTemplate}
        />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default ThreeDTshirtViewer;
