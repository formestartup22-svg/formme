
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Layers, Shirt, Sparkles, Zap, Shield, Waves, Crown, Leaf } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FabricOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  premium?: boolean;
}

interface FabricCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  options: FabricOption[];
}

interface FabricSelectorProps {
  selectedFabric: string;
  onFabricChange: (fabric: string) => void;
}

const fabricCategories: FabricCategory[] = [
  {
    id: 'cotton',
    name: 'Cotton',
    icon: Shirt,
    color: 'bg-green-500',
    description: 'Natural, breathable, comfortable',
    options: [
      { id: 'regular-cotton', name: 'Regular Cotton', description: 'Standard cotton blend', icon: '🧵' },
      { id: 'organic-cotton', name: 'Organic Cotton', description: 'Eco-friendly organic', icon: '🌱' },
      { id: 'pima-cotton', name: 'Pima Cotton', description: 'Premium long-staple', icon: '✨', premium: true },
      { id: 'egyptian-cotton', name: 'Egyptian Cotton', description: 'Ultra-premium quality', icon: '👑', premium: true },
    ]
  },
  {
    id: 'silk',
    name: 'Silk',
    icon: Sparkles,
    color: 'bg-purple-500',
    description: 'Luxurious, smooth, elegant',
    options: [
      { id: 'mulberry-silk', name: 'Mulberry Silk', description: 'Finest quality silk', icon: '🍃', premium: true },
      { id: 'charmeuse-silk', name: 'Charmeuse Silk', description: 'Satin weave finish', icon: '✨', premium: true },
      { id: 'dupioni-silk', name: 'Dupioni Silk', description: 'Textured irregular slubs', icon: '🎭', premium: true },
      { id: 'habotai-silk', name: 'Habotai Silk', description: 'Lightweight plain weave', icon: '🪶' },
    ]
  },
  {
    id: 'polyester',
    name: 'Polyester',
    icon: Zap,
    color: 'bg-blue-500',
    description: 'Durable, quick-dry, athletic',
    options: [
      { id: 'athletic-polyester', name: 'Athletic Polyester', description: 'Moisture-wicking performance', icon: '⚡' },
      { id: 'recycled-polyester', name: 'Recycled Polyester', description: 'Eco-friendly recycled', icon: '♻️' },
      { id: 'microfiber-polyester', name: 'Microfiber Polyester', description: 'Ultra-fine synthetic', icon: '🧬' },
      { id: 'stretch-polyester', name: 'Stretch Polyester', description: 'Flexible blend', icon: '🤸' }
    ]
  },
  {
    id: 'denim',
    name: 'Denim',
    icon: Shield,
    color: 'bg-indigo-500',
    description: 'Sturdy, classic, timeless',
    options: [
      { id: 'raw-denim', name: 'Raw Denim', description: 'Unwashed, authentic', icon: '🔷' },
      { id: 'washed-denim', name: 'Washed Denim', description: 'Pre-washed comfort', icon: '💧' },
      { id: 'stretch-denim', name: 'Stretch Denim', description: 'Flexible denim blend', icon: '🎯' },
      { id: 'selvedge-denim', name: 'Selvedge Denim', description: 'Premium self-edge', icon: '🏆', premium: true }
    ]
  },
  {
    id: 'linen',
    name: 'Linen',
    icon: Waves,
    color: 'bg-amber-500',
    description: 'Breathable, natural, relaxed',
    options: [
      { id: 'pure-linen', name: 'Pure Linen', description: '100% flax fiber', icon: '🌾' },
      { id: 'linen-cotton', name: 'Linen-Cotton Blend', description: 'Balanced comfort', icon: '🤝' },
      { id: 'belgian-linen', name: 'Belgian Linen', description: 'European premium', icon: '🇧🇪', premium: true },
      { id: 'irish-linen', name: 'Irish Linen', description: 'Traditional quality', icon: '☘️', premium: true }
    ]
  },
  {
    id: 'wool',
    name: 'Wool',
    icon: Crown,
    color: 'bg-red-500',
    description: 'Warm, natural, premium',
    options: [
      { id: 'merino-wool', name: 'Merino Wool', description: 'Fine Australian wool', icon: '🐑', premium: true },
      { id: 'cashmere', name: 'Cashmere', description: 'Ultra-luxury softness', icon: '👑', premium: true },
      { id: 'alpaca-wool', name: 'Alpaca Wool', description: 'Hypoallergenic luxury', icon: '🦙', premium: true },
      { id: 'wool-blend', name: 'Wool Blend', description: 'Practical wool mix', icon: '🧶' }
    ]
  }
];

export const FabricSelector: React.FC<FabricSelectorProps> = ({
  selectedFabric,
  onFabricChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('cotton');
  const [selectedOption, setSelectedOption] = useState<string>('regular-cotton');

  const currentCategory = fabricCategories.find(cat => cat.id === selectedCategory);

  const handleOptionSelect = (option: FabricOption) => {
    setSelectedOption(option.id);
    onFabricChange(option.name);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Fabric Library</h3>
        <p className="text-xs text-gray-600 mb-3">Choose from our premium fabric collection</p>
      </div>

      {/* Category Dropdown */}
      <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
        <SelectTrigger className="w-full h-10 bg-white border-gray-300 rounded-lg">
          <SelectValue placeholder="Select a fabric category" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {fabricCategories.map((category) => {
            const Icon = category.icon;
            return (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Fabric Options Grid */}
      {currentCategory && (
        <div className="grid grid-cols-2 gap-2">
          {currentCategory.options.map((option) => {
            const isSelected = selectedOption === option.id || selectedFabric === option.name;
            
            return (
              <div
                key={option.id}
                className={`
                  bg-white border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm
                  ${isSelected 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                    {option.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <h4 className={`text-xs font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                        {option.name}
                      </h4>
                      {option.premium && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 py-0">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className={`text-[10px] leading-tight ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FabricSelector;
