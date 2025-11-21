
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutTemplate, 
  Palette, 
  Sparkles, 
  PenTool, 
  Circle, 
  Eraser, 
  FileImage, 
  Upload,
  Wand2
} from 'lucide-react';

interface CanvaStyleToolbarProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  isProfessional?: boolean;
  onUpgradePrompt?: () => void;
  onConvertToRealistic?: () => void;
}

const CanvaStyleToolbar = ({ 
  activeTool, 
  onToolChange, 
  isProfessional = false,
  onUpgradePrompt,
  onConvertToRealistic
}: CanvaStyleToolbarProps) => {
  const tools = [
    {
      id: 'templates',
      icon: LayoutTemplate,
      label: 'Templates',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'colors',
      icon: Palette,
      label: 'Colors',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'patterns',
      icon: Sparkles,
      label: 'Patterns',
      color: 'bg-yellow-500',
      available: true
    },
    {
      id: 'draw',
      icon: PenTool,
      label: 'Draw',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'buttons',
      icon: Circle,
      label: 'Buttons',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'erase',
      icon: Eraser,
      label: 'Erase',
      color: 'bg-red-500',
      available: true
    },
    {
      id: 'sketch',
      icon: FileImage,
      label: 'Sketch to SVG',
      color: 'bg-pink-500',
      available: isProfessional,
      isPro: true
    },
    {
      id: 'upload',
      icon: Upload,
      label: 'Upload',
      color: 'bg-gray-500',
      available: true
    }
  ];

  const handleToolClick = (tool: any) => {
    if (!tool.available && tool.isPro) {
      onUpgradePrompt?.();
      return;
    }
    
    const newActiveTool = activeTool === tool.id ? null : tool.id;
    onToolChange(newActiveTool);
  };

  return (
    <div className="w-20 bg-gradient-to-b from-[#FFF8F0] to-[#FEF7CD]/30 border-r flex flex-col items-center py-6 space-y-3">
      {/* Convert to Realistic Button - Featured at top */}
      <div className="relative mb-4">
        <Button
          onClick={onConvertToRealistic}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20 backdrop-blur-sm flex flex-col items-center justify-center p-2"
          title="Convert to Realistic Preview"
        >
          <Wand2 className="w-6 h-6 mb-1" />
          <span className="text-[8px] font-bold leading-tight text-center">
            AI Real
          </span>
        </Button>
        
        {/* Sparkle effects */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
      </div>

      <Separator className="w-8 my-2 bg-gradient-to-r from-purple-400 to-pink-400" />

      {tools.map((tool, index) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <React.Fragment key={tool.id}>
            <div className="relative">
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`
                  w-14 h-14 rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200
                  ${isActive 
                    ? `${tool.color} text-white shadow-lg transform scale-105` 
                    : 'hover:bg-white/80 hover:shadow-md text-gray-600 hover:text-gray-800'
                  }
                  ${!tool.available ? 'opacity-60' : ''}
                `}
                onClick={() => handleToolClick(tool)}
                disabled={!tool.available && !tool.isPro}
                title={tool.label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-medium leading-tight text-center">
                  {tool.label.split(' ')[0]}
                </span>
                {tool.label.includes(' ') && (
                  <span className="text-[8px] font-medium leading-tight text-center -mt-0.5">
                    {tool.label.split(' ').slice(1).join(' ')}
                  </span>
                )}
              </Button>
              
              {tool.isPro && !isProfessional && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 text-[8px] px-1 py-0 h-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
                >
                  Pro
                </Badge>
              )}
            </div>
            
            {/* Add separator after Draw tool */}
            {index === 3 && (
              <Separator className="w-8 my-2 bg-gray-300" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CanvaStyleToolbar;
