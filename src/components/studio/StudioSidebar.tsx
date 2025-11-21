import React from 'react';
import { Sparkles, LayoutTemplate, Palette, PenTool, Type, Square, Upload, FileScan, Star, Shirt } from 'lucide-react';

const aiRealTool = {
  id: 'ai-real',
  icon: (
    <span className="bg-gradient-to-br from-pink-500 via-yellow-400 to-orange-400 w-10 h-10 rounded-lg flex flex-col items-center justify-center shadow-lg relative">
      <Sparkles className="w-4 h-4 text-white drop-shadow" />
      <span className="absolute bottom-1 left-0 right-0 text-[8px] font-bold text-white tracking-wide leading-none">AI Real</span>
      <span className="absolute -right-1 -top-1 bg-yellow-400 w-2 h-2 rounded-full ring-1 ring-white"></span>
    </span>
  ),
};

const sidebarTools = [
  {
    id: 'templates',
    Icon: LayoutTemplate,
    label: 'Templates',
    tooltip: 'Templates',
    color: '#16a34a',
    bgColor: '#dcfce7',
  },
  {
    id: 'colors',
    Icon: Palette,
    label: 'Colors',
    tooltip: 'Colors',
    color: '#4b5563',
    bgColor: '#f3f4f6',
  },
  {
    id: 'patterns',
    Icon: Star,
    label: 'Patterns',
    tooltip: 'Patterns',
    color: '#ca8a04',
    bgColor: '#fef9c3',
  },
  {
    id: 'fabric',
    Icon: Shirt,
    label: 'Fabric',
    tooltip: 'Fabric',
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
  },
  {
    id: 'elements',
    Icon: PenTool,
    label: 'Elements',
    tooltip: 'Elements',
    color: '#2563eb',
    bgColor: '#dbeafe',
  },
  {
    id: 'buttons',
    Icon: Square,
    label: 'Buttons',
    tooltip: 'Buttons',
    color: '#4b5563',
    bgColor: '#f3f4f6',
  },
  {
    id: 'text',
    Icon: Type,
    label: 'Text',
    tooltip: 'Text Tool',
    color: '#9333ea',
    bgColor: '#f3e8ff',
  },
  {
    id: 'upload',
    Icon: Upload,
    label: 'Upload',
    tooltip: 'Upload',
    color: '#1f2937',
    bgColor: '#f3f4f6',
  },
  {
    id: 'sketch-svg',
    Icon: FileScan,
    label: 'Sketch to SVG',
    tooltip: 'Sketch to SVG (Pro)',
    color: '#7e22ce',
    bgColor: '#f3e8ff',
  }
];

interface StudioSidebarProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  onConvertToRealistic: () => void;
}

const StudioSidebar = ({ activeTool, onToolChange, onConvertToRealistic }: StudioSidebarProps) => {
  return (
    <div className="w-20 min-w-20 h-full bg-sidebar text-sidebar-foreground flex flex-col items-center py-4 px-1 border-r border-sidebar-border shadow-none z-40 relative"
      style={{ boxShadow: "2.5px 0 14px 0 rgba(35,50,41,0.04)" }}
    >
      {/* AI Real */}
      <div className="mb-3">
        <button type="button" onClick={onConvertToRealistic} title="Generate realistic preview">
          {aiRealTool.icon}
        </button>
      </div>
      <div className="w-7 h-[2.5px] bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 rounded-full mb-3" />
      {/* Actual tools */}
      <nav className="flex flex-col gap-3 w-full">
        {sidebarTools.map((tool) => {
          const showDivider = ['buttons', 'sketch-svg'].includes(tool.id);
          const isActive = activeTool === tool.id;
          const { Icon } = tool;
          
          return (
            <React.Fragment key={tool.id}>
              <button
                type="button"
                tabIndex={0}
                title={tool.tooltip}
                onClick={() => onToolChange(tool.id)}
                aria-pressed={isActive}
                className={`
                  group relative w-full flex flex-col items-center p-2
                  transition-all duration-150 border-0 bg-transparent focus:outline-none
                  rounded-xl
                  ${isActive ? '' : 'hover:bg-sidebar-accent/60'}
                `}
              >
                <Icon
                  className="w-4 h-4"
                  color={isActive ? tool.color : '#4b5563'}
                  strokeWidth={isActive ? 2 : 1.7}
                />
                {tool.id === 'sketch-svg' && (
                  <span className="absolute top-1 right-1 text-[10px] bg-purple-500 text-white px-1.5 py-0.25 rounded-full font-bold" style={{fontSize: 9}}>Pro</span>
                )}
                  <span className={`text-[10px] font-bold leading-tight text-center select-none tracking-wide mt-1 mb-0.5 transition-colors ${
                    isActive
                      ? 'text-sidebar-foreground'
                      : 'text-muted-foreground'
                  }`}>
                  {tool.label}
                </span>
                {/* Active underline */}
                {isActive && (
                  <span className="block mt-0.5 w-5 h-0.5 rounded-full" style={{backgroundColor: tool.color}}></span>
                )}
              </button>
              {showDivider && (
                <span className="w-6 h-[1.5px] mx-auto bg-border rounded-full my-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
      {/* Flexible growth bottom */}
      <div className="flex-1" />
    </div>
  );
};

export default StudioSidebar;
