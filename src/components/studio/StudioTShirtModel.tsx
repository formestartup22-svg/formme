
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { FabricProperties, StudioPatterns } from '@/hooks/useStudioState';

interface StudioTShirtModelProps {
  colors: {
    body: string;
    sleeves: string;
    collar: string;
  };
  patterns: StudioPatterns;
  fabric: FabricProperties;
  selectedTemplate: string;
}

const StudioTShirtModel = ({ 
  colors, 
  patterns, 
  fabric, 
  selectedTemplate 
}: StudioTShirtModelProps) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const renderTShirt = () => {
    if (selectedTemplate === 'v-neck') {
      return (
        <group>
          {/* V-neck T-shirt body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 1.5, 0.1]} />
            <meshStandardMaterial 
              color={colors.body} 
              roughness={0.7} 
              metalness={0.1}
            />
          </mesh>

          {/* V-neck collar */}
          <mesh position={[0, 0.6, 0.06]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial 
              color={colors.collar} 
              roughness={0.8} 
              metalness={0.05}
            />
          </mesh>

          {/* Left sleeve */}
          <mesh position={[-0.75, 0.3, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.4, 0.6, 0.08]} />
            <meshStandardMaterial 
              color={colors.sleeves} 
              roughness={0.7} 
              metalness={0.1}
            />
          </mesh>

          {/* Right sleeve */}
          <mesh position={[0.75, 0.3, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.4, 0.6, 0.08]} />
            <meshStandardMaterial 
              color={colors.sleeves} 
              roughness={0.7} 
              metalness={0.1}
            />
          </mesh>
        </group>
      );
    }

    // Regular crew neck T-shirt
    return (
      <group>
        {/* T-shirt body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.5, 0.1]} />
          <meshStandardMaterial 
            color={colors.body} 
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>

        {/* Round collar */}
        <mesh position={[0, 0.65, 0.06]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
          <meshStandardMaterial 
            color={colors.collar} 
            roughness={0.8} 
            metalness={0.05}
          />
        </mesh>

        {/* Left sleeve */}
        <mesh position={[-0.75, 0.3, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.4, 0.6, 0.08]} />
          <meshStandardMaterial 
            color={colors.sleeves} 
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>

        {/* Right sleeve */}
        <mesh position={[0.75, 0.3, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.4, 0.6, 0.08]} />
          <meshStandardMaterial 
            color={colors.sleeves} 
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={groupRef} dispose={null}>
      {renderTShirt()}
    </group>
  );
};

export default StudioTShirtModel;
