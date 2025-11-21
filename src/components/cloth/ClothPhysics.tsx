import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface ClothPhysicsProps {
  position: [number, number, number];
  size: [number, number];
  segments: [number, number];
  fabricType: string;
  color: string;
  windForce?: number;
}

const ClothMesh: React.FC<ClothPhysicsProps> = ({ 
  position, 
  size, 
  segments, 
  fabricType, 
  color,
  windForce = 0.2 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create more detailed cloth geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
    const vertices = geo.attributes.position.array as Float32Array;
    
    // Create more natural cloth draping
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // Add natural cloth sag
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      const sag = Math.pow(distanceFromCenter, 2) * 0.02;
      
      // Add subtle random variation for realism
      const randomOffset = (Math.random() - 0.5) * 0.05;
      
      vertices[i + 2] = -sag + randomOffset + 
        Math.sin(x * 3) * 0.02 + 
        Math.sin(y * 2) * 0.03;
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [size, segments]);

  // Enhanced cloth animation with realistic physics
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Apply fabric-specific physics
    const stiffness = fabricType === 'denim' ? 0.8 : 
                     fabricType === 'silk' ? 0.2 : 
                     fabricType === 'leather' ? 0.9 : 0.5;
    
    const damping = fabricType === 'wool' ? 0.8 : 
                    fabricType === 'silk' ? 0.3 : 0.6;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // Wind simulation with fabric response
      const windX = Math.sin(x * 2 + time * 3) * windForce * (1 - stiffness);
      const windY = Math.sin(y * 1.5 + time * 2) * windForce * 0.5 * (1 - stiffness);
      const windZ = Math.sin(time * 4 + x + y) * windForce * 0.3;
      
      // Gravity effect
      const gravity = Math.sin(time * 0.5) * 0.01 * (1 - stiffness);
      
      // Natural cloth movement
      const naturalWave = Math.sin(x * 3 + time * 2) * 0.02 * (1 - stiffness) +
                         Math.sin(y * 2.5 + time * 1.8) * 0.015 * (1 - stiffness);
      
      // Apply all forces with damping
      vertices[i + 2] = (windX + windY + windZ + gravity + naturalWave) * damping;
      
      // Keep some points fixed (like seams)
      if (Math.abs(x) > size[0] * 0.4 || Math.abs(y) > size[1] * 0.4) {
        vertices[i + 2] *= 0.3; // Reduce movement at edges
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Add subtle overall movement
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
    }
  });

  // Enhanced material properties for realistic look
  const getMaterialProps = () => {
    switch (fabricType) {
      case 'denim':
        return {
          roughness: 0.9,
          metalness: 0.0,
          bumpScale: 0.02,
        };
      case 'silk':
        return {
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.95,
          transmission: 0.1,
        };
      case 'wool':
        return {
          roughness: 0.95,
          metalness: 0.0,
          bumpScale: 0.03,
        };
      case 'leather':
        return {
          roughness: 0.6,
          metalness: 0.0,
          clearcoat: 0.4,
          clearcoatRoughness: 0.3,
        };
      default:
        return {
          roughness: 0.8,
          metalness: 0.0,
        };
    }
  };

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        side={THREE.DoubleSide}
        {...getMaterialProps()}
      />
    </mesh>
  );
};

export const ClothPhysics: React.FC<ClothPhysicsProps> = (props) => {
  return (
    <Physics gravity={[0, -2, 0]} iterations={20} tolerance={0.0001}>
      <ClothMesh {...props} />
    </Physics>
  );
};
