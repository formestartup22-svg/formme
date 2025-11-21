import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Interactive3DGarmentProps {
  selectedTemplate: string;
  colors: {
    body: string;
    sleeves: string;
    collar: string;
  };
  onPartClick: (part: 'body' | 'sleeves' | 'collar') => void;
  selectedPart: 'body' | 'sleeves' | 'collar' | null;
  onColorChange: (part: 'body' | 'sleeves' | 'collar', color: string) => void;
}

// Individual garment part component
const GarmentPart = ({ 
  part, 
  color, 
  position, 
  geometry, 
  isSelected, 
  onClick 
}: {
  part: 'body' | 'sleeves' | 'collar';
  color: string;
  position: [number, number, number];
  geometry: THREE.BufferGeometry;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      // Add a subtle pulse effect for selected parts
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={hovered ? 0.8 : 1}
        roughness={0.7}
        metalness={0.1}
      />
      {isSelected && (
        <meshBasicMaterial
          color="#00ff00"
          wireframe
          transparent
          opacity={0.3}
        />
      )}
    </mesh>
  );
};

// Main 3D T-shirt model
const TShirtModel = ({ 
  colors, 
  onPartClick, 
  selectedPart 
}: {
  colors: { body: string; sleeves: string; collar: string };
  onPartClick: (part: 'body' | 'sleeves' | 'collar') => void;
  selectedPart: 'body' | 'sleeves' | 'collar' | null;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create geometries for different parts
  const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.1);
  const sleeveGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
  const collarGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <GarmentPart
        part="body"
        color={colors.body}
        position={[0, 0, 0]}
        geometry={bodyGeometry}
        isSelected={selectedPart === 'body'}
        onClick={() => onPartClick('body')}
      />
      
      {/* Left Sleeve */}
      <GarmentPart
        part="sleeves"
        color={colors.sleeves}
        position={[-0.8, 0.3, 0]}
        geometry={sleeveGeometry}
        isSelected={selectedPart === 'sleeves'}
        onClick={() => onPartClick('sleeves')}
      />
      
      {/* Right Sleeve */}
      <GarmentPart
        part="sleeves"
        color={colors.sleeves}
        position={[0.8, 0.3, 0]}
        geometry={sleeveGeometry}
        isSelected={selectedPart === 'sleeves'}
        onClick={() => onPartClick('sleeves')}
      />
      
      {/* Collar */}
      <GarmentPart
        part="collar"
        color={colors.collar}
        position={[0, 0.7, 0]}
        geometry={collarGeometry}
        isSelected={selectedPart === 'collar'}
        onClick={() => onPartClick('collar')}
      />
    </group>
  );
};

const Interactive3DGarment = ({
  selectedTemplate,
  colors,
  onPartClick,
  selectedPart,
  onColorChange
}: Interactive3DGarmentProps) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <TShirtModel
          colors={colors}
          onPartClick={onPartClick}
          selectedPart={selectedPart}
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <Environment preset="studio" />
      </Canvas>
      
      {/* Selection indicator */}
      {selectedPart && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg">
          <p className="text-sm font-medium">Selected: {selectedPart}</p>
          <p className="text-xs opacity-75">Click to apply colors</p>
        </div>
      )}
    </div>
  );
};

export default Interactive3DGarment;