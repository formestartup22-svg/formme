
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Group, Vector3, Mesh, DoubleSide } from 'three';
import { useElementContext } from '@/context/ElementContext';

// Simple easing function to replace maath dependency
const dampE = (current: any, target: any, smoothing: number, delta: number) => {
  const diff = {
    x: target[0] - current.x,
    y: target[1] - current.y,
    z: target[2] - current.z
  };
  
  current.x += diff.x * smoothing * delta;
  current.y += diff.y * smoothing * delta;
  current.z += diff.z * smoothing * delta;
};

interface TShirtModelProps {
  position?: [number, number, number];
  customColors?: {
    body: string;
  };
}

const TShirtModel = ({ 
  position = [0, 0, 0], 
  customColors = { body: '#ffffff' }
}: TShirtModelProps) => {
  const groupRef = useRef<Group>(null);
  const tshirtRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [rotate, setRotate] = useState(true);
  const { modelSettings } = useElementContext();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      dampE(
        groupRef.current.rotation,
        [0, rotate ? state.clock.getElapsedTime() * 0.1 : 0, 0],
        0.25,
        delta
      );
      
      if (tshirtRef.current) {
        tshirtRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      }
    }
  });

  // Define dimensions at the component level so they're accessible to all functions
  const scale = 0.15;
  const dimensions = {
    height: (26.75) * scale,
    width: (21.5) * scale,
    depth: 0.1
  };

  const renderTShirtBody = () => {
    return (
      <>
        <mesh position={[0, 0, dimensions.depth / 2]}>
          <planeGeometry args={[dimensions.width, dimensions.height]} />
          <meshStandardMaterial 
            color={customColors.body}
            side={DoubleSide}
            roughness={modelSettings.roughness}
            metalness={modelSettings.metalness}
          />
        </mesh>

        <mesh position={[0, 0, -dimensions.depth / 2]}>
          <planeGeometry args={[dimensions.width, dimensions.height]} />
          <meshStandardMaterial 
            color={customColors.body}
            side={DoubleSide}
            roughness={modelSettings.roughness}
            metalness={modelSettings.metalness}
          />
        </mesh>
      </>
    );
  };

  const renderCollar = () => {
    const neckMeasurements = {
      opening: 8 * scale,
      frontDrop: 3.75 * scale,
      trimHeight: (5/8) * scale
    };

    const collarRadius = neckMeasurements.opening / (2 * Math.PI);

    return (
      <group position={[0, dimensions.height / 2 - neckMeasurements.frontDrop, 0]}>
        <mesh>
          <torusGeometry args={[collarRadius, neckMeasurements.trimHeight, 16, 32, Math.PI]} />
          <meshStandardMaterial 
            color={customColors.body} 
            side={DoubleSide}
            roughness={modelSettings.roughness}
            metalness={modelSettings.metalness}
          />
        </mesh>
      </group>
    );
  };

  const renderSleeves = () => {
    const sleeveLength = 0.5;
    const sleeveWidth = 0.25;
    
    return (
      <>
        <group position={[-0.8, 0.3, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0.2]}>
            <cylinderGeometry args={[sleeveWidth, sleeveWidth * 0.9, sleeveLength, 16, 1, true]} />
            <meshStandardMaterial 
              color={customColors.body} 
              side={DoubleSide}
              roughness={modelSettings.roughness}
              metalness={modelSettings.metalness}
            />
          </mesh>
        </group>

        <group position={[0.8, 0.3, 0]}>
          <mesh rotation={[0, Math.PI / 2, -0.2]}>
            <cylinderGeometry args={[sleeveWidth, sleeveWidth * 0.9, sleeveLength, 16, 1, true]} />
            <meshStandardMaterial 
              color={customColors.body} 
              side={DoubleSide}
              roughness={modelSettings.roughness}
              metalness={modelSettings.metalness}
            />
          </mesh>
        </group>
      </>
    );
  };

  return (
    <group ref={groupRef} position={new Vector3(...position)} dispose={null}>
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        onClick={() => setRotate(!rotate)}
      />
      
      <mesh
        ref={tshirtRef}
        castShadow
        receiveShadow
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
      >
        {renderTShirtBody()}
        {renderSleeves()}
        {renderCollar()}
      </mesh>
      
      <Environment preset="city" />
    </group>
  );
};

export default TShirtModel;
