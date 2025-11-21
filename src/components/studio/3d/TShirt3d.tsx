
// "use client";
// import React, { useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from "@react-three/drei";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import { Separator } from "@/components/ui/separator";
// import { RotateCw, Move3D, Eye, EyeOff, Layout } from "lucide-react";
// import TemplateLibrary from '../TemplateLibrary';
// import { useTemplateLibrary } from '@/hooks/useTemplateLibrary';

// interface PieceControlsProps {
//   name: string;
//   visible: boolean;
//   onVisibilityToggle: () => void;
//   position: [number, number, number];
//   onPositionChange: (axis: 'x' | 'y' | 'z', value: number) => void;
//   rotation: [number, number, number];
//   onRotationChange: (axis: 'x' | 'y' | 'z', value: number) => void;
//   color: string;
//   onColorChange: (color: string) => void;
// }

// const PieceControls = ({
//   name,
//   visible,
//   onVisibilityToggle,
//   position,
//   onPositionChange,
//   rotation,
//   onRotationChange,
//   color,
//   onColorChange
// }: PieceControlsProps) => {
//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="font-semibold text-gray-800">{name}</h3>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={onVisibilityToggle}
//           className="p-2"
//         >
//           {visible ? <Eye size={16} /> : <EyeOff size={16} />}
//         </Button>
//       </div>

//       {visible && (
//         <>
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-600">Color</label>
//             <input
//               type="color"
//               value={color}
//               onChange={(e) => onColorChange(e.target.value)}
//               className="w-full h-8 rounded border"
//             />
//           </div>

//           <Separator />

//           <div className="space-y-3">
//             <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
//               <Move3D size={14} />
//               Position
//             </label>
            
//             {(['x', 'y', 'z'] as const).map((axis, index) => (
//               <div key={axis} className="space-y-1">
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>{axis.toUpperCase()}</span>
//                   <span>{position[index].toFixed(2)}</span>
//                 </div>
//                 <Slider
//                   value={[position[index]]}
//                   onValueChange={([value]) => onPositionChange(axis, value)}
//                   min={-2}
//                   max={2}
//                   step={0.01}
//                   className="w-full"
//                 />
//               </div>
//             ))}
//           </div>

//           <Separator />

//           <div className="space-y-3">
//             <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
//               <RotateCw size={14} />
//               Rotation
//             </label>
            
//             {(['x', 'y', 'z'] as const).map((axis, index) => (
//               <div key={axis} className="space-y-1">
//                 <div className="flex justify-between text-xs text-gray-500">
//                   <span>{axis.toUpperCase()}</span>
//                   <span>{(rotation[index] * 180 / Math.PI).toFixed(0)}°</span>
//                 </div>
//                 <Slider
//                   value={[rotation[index]]}
//                   onValueChange={([value]) => onRotationChange(axis, value)}
//                   min={-Math.PI}
//                   max={Math.PI}
//                   step={0.01}
//                   className="w-full"
//                 />
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// interface GarmentPieceProps {
//   modelPath: string;
//   position: [number, number, number];
//   rotation: [number, number, number];
//   color: string;
//   visible: boolean;
// }

// const GarmentPiece = ({ modelPath, position, rotation, color, visible }: GarmentPieceProps) => {
//   const { scene } = useGLTF(modelPath);
  
//   if (!visible) return null;

//   // Clone the scene to avoid sharing materials between instances
//   const clonedScene = scene.clone();
  
//   // Apply color to all meshes in the model
//   clonedScene.traverse((child: any) => {
//     if (child.isMesh && child.material) {
//       child.material = child.material.clone();
//       child.material.color.set(color);
//     }
//   });

//   return (
//     <primitive 
//       object={clonedScene} 
//       position={position}
//       rotation={rotation}
//     />
//   );
// };

// const TShirt3d = () => {
//   const [showTemplateLibrary, setShowTemplateLibrary] = useState(true);
//   const templateLibrary = useTemplateLibrary();

//   // Dynamic piece states based on selected pieces by category
//   const [pieceStates, setPieceStates] = useState<{
//     [category: string]: {
//       visible: boolean;
//       position: [number, number, number];
//       rotation: [number, number, number];
//       color: string;
//     }
//   }>({});

//   const updatePiecePosition = (category: string, axis: 'x' | 'y' | 'z', value: number) => {
//     const axisIndex = { x: 0, y: 1, z: 2 }[axis];
//     setPieceStates(prev => {
//       const currentState = prev[category] || {
//         visible: true,
//         position: [0, 0, 0] as [number, number, number],
//         rotation: [0, 0, 0] as [number, number, number],
//         color: "#ffffff"
//       };
//       const newPosition = [...currentState.position] as [number, number, number];
//       newPosition[axisIndex] = value;
//       return {
//         ...prev,
//         [category]: { ...currentState, position: newPosition }
//       };
//     });
//   };

//   const updatePieceRotation = (category: string, axis: 'x' | 'y' | 'z', value: number) => {
//     const axisIndex = { x: 0, y: 1, z: 2 }[axis];
//     setPieceStates(prev => {
//       const currentState = prev[category] || {
//         visible: true,
//         position: [0, 0, 0] as [number, number, number],
//         rotation: [0, 0, 0] as [number, number, number],
//         color: "#ffffff"
//       };
//       const newRotation = [...currentState.rotation] as [number, number, number];
//       newRotation[axisIndex] = value;
//       return {
//         ...prev,
//         [category]: { ...currentState, rotation: newRotation }
//       };
//     });
//   };

//   const getPieceState = (category: string) => {
//     return pieceStates[category] || {
//       visible: true,
//       position: [0, 0, 0] as [number, number, number],
//       rotation: [0, 0, 0] as [number, number, number],
//       color: "#ffffff"
//     };
//   };

//   const setPieceVisibility = (category: string, visible: boolean) => {
//     setPieceStates(prev => ({
//       ...prev,
//       [category]: { ...getPieceState(category), visible }
//     }));
//   };

//   const setPieceColor = (category: string, color: string) => {
//     setPieceStates(prev => ({
//       ...prev,
//       [category]: { ...getPieceState(category), color }
//     }));
//   };

//   return (
//     <div className="h-screen flex">
//       {/* Template Library Sidebar */}
//       {showTemplateLibrary && (
//         <TemplateLibrary
//           onPieceSelect={templateLibrary.handlePieceSelect}
//           selectedPieces={templateLibrary.getSelectedPieceIds()}
//         />
//       )}

//       {/* 3D Viewport */}
//       <div className="flex-1 bg-gray-100 relative">
//         {/* Toggle Template Library Button */}
//         <div className="absolute top-4 left-4 z-10">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
//             className="bg-white/90 backdrop-blur-sm"
//           >
//             <Layout size={16} className="mr-2" />
//             {showTemplateLibrary ? 'Hide' : 'Show'} Templates
//           </Button>
//         </div>

//         <Canvas>
//           <PerspectiveCamera makeDefault position={[0, 0, 4]} />
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[10, 10, 5]} intensity={1} />
//           <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
//           {/* Render selected pieces dynamically by category */}
//           {Object.entries(templateLibrary.selectedModels).map(([category, modelPath]) => {
//             const state = getPieceState(category);
//             return (
//               <GarmentPiece
//                 key={category}
//                 modelPath={modelPath}
//                 position={state.position}
//                 rotation={state.rotation}
//                 color={state.color}
//                 visible={state.visible}
//               />
//             );
//           })}
          
//           <OrbitControls 
//             enablePan={true}
//             enableZoom={true}
//             enableRotate={true}
//             minDistance={1}
//             maxDistance={10}
//           />
          
//           <Environment preset="studio" />
//         </Canvas>
//       </div>

//       {/* Control Panel */}
//       <div className="w-80 bg-gray-50 p-4 overflow-y-auto border-l">
//         <div className="space-y-6">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800 mb-4">3D Garment Assembly</h2>
//             <p className="text-sm text-gray-600 mb-6">
//               Select pieces from each category to build your garment. Each category can have only one active piece.
//             </p>
//           </div>

//           {/* Selected Pieces Info */}
//           {Object.keys(templateLibrary.selectedPieces).length > 0 && (
//             <div className="bg-blue-50 p-3 rounded-lg">
//               <h4 className="font-medium text-blue-900 mb-2">Active Assembly</h4>
//               {Object.entries(templateLibrary.selectedPieces).map(([category, pieceId]) => (
//                 <div key={category} className="text-sm text-blue-700 mb-1">
//                   <span className="font-medium">{category}:</span> {pieceId.replace('-1', '').replace('-', ' ')}
//                 </div>
//               ))}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={templateLibrary.clearSelection}
//                 className="mt-2 text-xs"
//               >
//                 Clear All
//               </Button>
//             </div>
//           )}

//           {/* Dynamic piece controls by category */}
//           {Object.entries(templateLibrary.selectedPieces).map(([category, pieceId]) => {
//             const state = getPieceState(category);
            
//             return (
//               <PieceControls
//                 key={category}
//                 name={category}
//                 visible={state.visible}
//                 onVisibilityToggle={() => setPieceVisibility(category, !state.visible)}
//                 position={state.position}
//                 onPositionChange={(axis, value) => updatePiecePosition(category, axis, value)}
//                 rotation={state.rotation}
//                 onRotationChange={(axis, value) => updatePieceRotation(category, axis, value)}
//                 color={state.color}
//                 onColorChange={(color) => setPieceColor(category, color)}
//               />
//             );
//           })}

//           <div className="pt-4">
//             <Button 
//               className="w-full" 
//               onClick={() => {
//                 // Reset all pieces to default positions
//                 setPieceStates({});
//                 templateLibrary.clearSelection();
//               }}
//             >
//               Reset Assembly
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Preload the GLB models
// useGLTF.preload("/models/bodyTshirt.glb");
// useGLTF.preload("/models/sleeves.glb");

// export default TShirt3d;


'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TShirt3DPreviewProps {
  bodyColor: string;
  sleevesColor: string;
  collarColor: string;
  bodyPatternURL?: string | null;
  sleevesPatternURL?: string | null;
  collarPatternURL?: string | null;
}

const TShirt3DPreview: React.FC<TShirt3DPreviewProps> = ({
  bodyColor,
  sleevesColor,
  collarColor,
  bodyPatternURL,
  sleevesPatternURL,
  collarPatternURL,
}) => {
  const { scene } = useGLTF('/models/recoloured.glb');

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    scene.traverse((child: any) => {
      if (!child.isMesh) return;

      const meshName = child.name.toLowerCase();
      const material = new THREE.MeshStandardMaterial();

      if (meshName.includes('body')) {
        if (bodyPatternURL) {
          const tex = loader.load(bodyPatternURL);
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, 1);
          material.map = tex;
        } else {
          material.color = new THREE.Color(bodyColor);
        }
      } else if (meshName.includes('sleeve')) {
        if (sleevesPatternURL) {
          const tex = loader.load(sleevesPatternURL);
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, 1);
          material.map = tex;
        } else {
          material.color = new THREE.Color(sleevesColor);
        }
      } else if (meshName.includes('collar')) {
        if (collarPatternURL) {
          const tex = loader.load(collarPatternURL);
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, 1);
          material.map = tex;
        } else {
          material.color = new THREE.Color(collarColor);
        }
      }

      child.material = material;
    });
  }, [scene, bodyColor, sleevesColor, collarColor, bodyPatternURL, sleevesPatternURL, collarPatternURL]);

  return (
<Canvas camera={{ position: [0, 1.6, 3], fov: 50 }}>
<ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 3]} />
      <OrbitControls />
      <primitive object={scene} />
    </Canvas>
  );
};

export default TShirt3DPreview;
