import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Box, User, Palette, Layers3, RotateCcw, ZoomIn } from 'lucide-react';

const ComingSoon = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const feature = searchParams.get('feature');

  const is3DFeature = feature === '3d';
  const isMannequinFeature = feature === 'mannequin';

  const getFeatureContent = () => {
    if (is3DFeature) {
      return {
        title: "3D Visualization",
        subtitle: "Coming Soon",
        description: "Experience your designs in stunning three-dimensional detail with our advanced 3D visualization engine.",
        features: [
          {
            icon: <Box className="w-5 h-5" />,
            text: "Real-time 3D rendering with photorealistic materials and lighting"
          },
          {
            icon: <RotateCcw className="w-5 h-5" />,
            text: "360° rotation and interactive viewing from every angle"
          },
          {
            icon: <Layers3 className="w-5 h-5" />,
            text: "Advanced fabric simulation with realistic draping and textures"
          },
          {
            icon: <ZoomIn className="w-5 h-5" />,
            text: "Zoom and inspect fine details of your custom designs"
          },
          {
            icon: <Palette className="w-5 h-5" />,
            text: "Dynamic color and pattern preview in 3D space"
          }
        ]
      };
    }

    if (isMannequinFeature) {
      return {
        title: "Virtual Try-On",
        subtitle: "Coming Soon",
        description: "See how your custom designs look when worn with our realistic mannequin display system.",
        features: [
          {
            icon: <User className="w-5 h-5" />,
            text: "Realistic mannequin models in various sizes and poses"
          },
          {
            icon: <Layers3 className="w-5 h-5" />,
            text: "Accurate fit visualization and draping simulation"
          },
          {
            icon: <Palette className="w-5 h-5" />,
            text: "See how colors and patterns appear when worn"
          },
          {
            icon: <RotateCcw className="w-5 h-5" />,
            text: "Multiple viewing angles and lighting conditions"
          }
        ]
      };
    }

    // Default content for professional studio
    return {
      title: "Professional Studio",
      subtitle: "Coming Soon",
      description: "The Professional Studio is currently under development. We're working hard to bring you the most advanced design tools for fashion professionals.",
      features: [
        {
          icon: <Palette className="w-5 h-5" />,
          text: "Advanced design toolkit with professional-grade features"
        },
        {
          icon: <User className="w-5 h-5" />,
          text: "White-label packaging and full branding control"
        },
        {
          icon: <Layers3 className="w-5 h-5" />,
          text: "Design API and seamless e-commerce integrations"
        },
        {
          icon: <Box className="w-5 h-5" />,
          text: "Bulk ordering and manufacturing partnerships"
        }
      ]
    };
  };

  const content = getFeatureContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] to-[#efede6]">
      <Navbar />
      
      <div className="pt-32 px-6 pb-20 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-light text-gray-800 mb-4">
              {content.title}
            </h1>
            <h2 className="text-3xl md:text-4xl font-light text-[#4A6B4A] mb-6">
              {content.subtitle}
            </h2>
            <div className="h-[1px] w-24 bg-[#4A6B4A] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed">
              {content.description}
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-light text-gray-800 mb-6">What to expect:</h3>
            <ul className="text-left space-y-4 text-gray-600">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#4A6B4A] mr-3 mt-1">
                    {feature.icon}
                  </span>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              {is3DFeature || isMannequinFeature 
                ? "In the meantime, continue designing in 2D flat view with our powerful design tools."
                : "In the meantime, try our Personal Creation Studio for intuitive design tools."
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={is3DFeature || isMannequinFeature ? "/designer" : "/studio-selection"}>
                <Button className="bg-[#4A6B4A] hover:bg-[#3E5A3E] text-white px-8 py-3 rounded-xl transition-all duration-300 flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {is3DFeature || isMannequinFeature ? "Back to Designer" : "Back to Studio Selection"}
                </Button>
              </Link>
              
              {!is3DFeature && !isMannequinFeature && (
                <Link to="/designer">
                  <Button className="bg-[#A0714A] hover:bg-[#8B5F42] text-white px-8 py-3 rounded-xl transition-all duration-300">
                    Try Personal Studio
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
