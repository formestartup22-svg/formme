import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { FabricMaterial } from './FabricMaterialSystem';
import { ClothPhysics } from './ClothPhysics';
import * as THREE from 'three';

interface RealisticGarmentPieceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  visible: boolean;
  sleeveLength?: number;
  category: string;
  pieceId: string;
  fabricType: string;
  useClothPhysics: boolean;
}

export const RealisticGarmentPiece: React.FC<RealisticGarmentPieceProps> = ({ 
  position, 
  rotation, 
  color, 
  visible, 
  sleeveLength, 
  category, 
  pieceId, 
  fabricType,
  useClothPhysics 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(pieceId);

  const isSleeveCategory = category.toLowerCase().includes('sleeve');
  const isBodyCategory = category.toLowerCase().includes('full body');

  const scale: [number, number, number] = isSleeveCategory && sleeveLength !== undefined 
    ? [1, sleeveLength, 1] 
    : [1, 1, 1];

  useFrame((state) => {
    if (!useClothPhysics && meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.002);
    }
  });

  if (!visible) return null;

  if (useClothPhysics && (isBodyCategory || isSleeveCategory)) {
    const size: [number, number] = isSleeveCategory 
      ? [0.4, 0.8 * (sleeveLength || 1)] 
      : [1.2, 1.6];

    return (
      <ClothPhysics
        position={position}
        size={size}
        segments={[30, 30]}
        fabricType={fabricType}
        color={color}
        windForce={0.4}
      />
    );
  }

  const clone = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    });
    return cloned;
  }, [scene, color]);

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clone} />
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial 
          color="#666666" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
