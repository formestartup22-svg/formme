import React from 'react';
import * as THREE from 'three';

export interface FabricMaterial {
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  normalScale: number;
  bumpScale: number;
  emissive?: string;
  emissiveIntensity?: number;
  displacement?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

export const fabricPresets: { [key: string]: FabricMaterial } = {
  cotton: {
    name: 'Cotton',
    color: '#f5f5f5',
    roughness: 0.85,
    metalness: 0.0,
    normalScale: 0.8,
    bumpScale: 0.4,
    displacement: 0.02,
  },
  polyester: {
    name: 'Polyester',
    color: '#ffffff',
    roughness: 0.4,
    metalness: 0.05,
    normalScale: 0.3,
    bumpScale: 0.15,
    displacement: 0.01,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
  },
  silk: {
    name: 'Silk',
    color: '#f8f8ff',
    roughness: 0.15,
    metalness: 0.1,
    normalScale: 0.2,
    bumpScale: 0.08,
    emissive: '#ffffff',
    emissiveIntensity: 0.02,
    clearcoat: 0.8,
    clearcoatRoughness: 0.05,
  },
  denim: {
    name: 'Denim',
    color: '#2c3e50',
    roughness: 0.95,
    metalness: 0.0,
    normalScale: 1.2,
    bumpScale: 0.8,
    displacement: 0.05,
  },
  wool: {
    name: 'Wool',
    color: '#f5f5dc',
    roughness: 0.98,
    metalness: 0.0,
    normalScale: 1.5,
    bumpScale: 1.0,
    displacement: 0.08,
  },
  leather: {
    name: 'Leather',
    color: '#8b4513',
    roughness: 0.6,
    metalness: 0.0,
    normalScale: 0.7,
    bumpScale: 0.5,
    displacement: 0.03,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
  },
};

interface FabricMaterialProps {
  fabricType: string;
  color?: string;
}

export const FabricMaterial: React.FC<FabricMaterialProps> = ({ fabricType, color }) => {
  const preset = fabricPresets[fabricType] || fabricPresets.cotton;
  
  // Create realistic fabric texture with proper weave patterns
  const createFabricTexture = (type: 'diffuse' | 'normal' | 'roughness') => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    if (type === 'diffuse') {
      // Create fabric weave pattern for diffuse
      ctx.fillStyle = color || preset.color;
      ctx.fillRect(0, 0, size, size);
      
      // Add weave pattern
      const weaveSize = fabricType === 'denim' ? 8 : fabricType === 'wool' ? 12 : 6;
      for (let x = 0; x < size; x += weaveSize) {
        for (let y = 0; y < size; y += weaveSize) {
          const brightness = 0.9 + Math.random() * 0.2;
          const alpha = 0.1 + Math.random() * 0.1;
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
          if ((x + y) % (weaveSize * 2) === 0) {
            ctx.fillRect(x, y, weaveSize, weaveSize);
          }
        }
      }
      
      // Add fiber texture
      for (let i = 0; i < size * 20; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const intensity = Math.random() * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
        ctx.fillRect(x, y, 1, 1);
      }
      
    } else if (type === 'normal') {
      // Create normal map for fabric bumps
      const imageData = ctx.createImageData(size, size);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % size;
        const y = Math.floor((i / 4) / size);
        
        // Create fabric weave normal
        const weaveX = Math.sin(x * 0.1) * 0.5 + 0.5;
        const weaveY = Math.sin(y * 0.1) * 0.5 + 0.5;
        const noise = Math.random() * 0.2;
        
        imageData.data[i] = (weaveX + noise) * 255;     // R (X normal)
        imageData.data[i + 1] = (weaveY + noise) * 255; // G (Y normal)
        imageData.data[i + 2] = 255;                     // B (Z normal)
        imageData.data[i + 3] = 255;                     // A
      }
      ctx.putImageData(imageData, 0, 0);
      
    } else if (type === 'roughness') {
      // Create roughness map
      ctx.fillStyle = `rgb(${preset.roughness * 255}, ${preset.roughness * 255}, ${preset.roughness * 255})`;
      ctx.fillRect(0, 0, size, size);
      
      // Add variation
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 20 + 5;
        const intensity = Math.random() * 100 + 100;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${intensity}, ${intensity}, ${intensity}, 0.3)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.needsUpdate = true;
    return texture;
  };

  // Create stitching texture for realistic garment look
  const createStitchingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw stitching lines
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.lineWidth = 2;
    
    // Vertical stitching
    for (let x = 50; x < 512; x += 100) {
      ctx.beginPath();
      ctx.setLineDash([5, 10]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    
    // Horizontal stitching
    for (let y = 50; y < 512; y += 100) {
      ctx.beginPath();
      ctx.setLineDash([5, 10]);
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  const diffuseMap = createFabricTexture('diffuse');
  const normalMap = createFabricTexture('normal');
  const roughnessMap = createFabricTexture('roughness');
  const stitchingMap = createStitchingTexture();
  
  return (
    <meshPhysicalMaterial
      map={diffuseMap}
      normalMap={normalMap}
      normalScale={new THREE.Vector2(preset.normalScale, preset.normalScale)}
      roughnessMap={roughnessMap}
      roughness={preset.roughness}
      metalness={preset.metalness}
      emissive={preset.emissive ? new THREE.Color(preset.emissive) : undefined}
      emissiveIntensity={preset.emissiveIntensity}
      clearcoat={preset.clearcoat || 0}
      clearcoatRoughness={preset.clearcoatRoughness || 0}
      transmission={fabricType === 'silk' ? 0.1 : 0}
      thickness={0.5}
      ior={1.4}
      side={THREE.DoubleSide}
      transparent={fabricType === 'silk'}
      opacity={fabricType === 'silk' ? 0.95 : 1}
    />
  );
};
