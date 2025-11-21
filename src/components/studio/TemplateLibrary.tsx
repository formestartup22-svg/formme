import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus } from 'lucide-react';

interface GarmentPiece {
  id: string;
  name: string;
  category: string;
  preview: string;
  isPremium: boolean;
  price?: number;
  modelPath?: string; // Add modelPath property
}

interface TemplateLibraryProps {
  onPieceSelect?: (piece: GarmentPiece) => void;
  selectedPieces?: string[];
}

const garmentPieces: GarmentPiece[] = [
  // Full Body
  {
    id: 'short-crew-1',
    name: 'Short Crew',
    category: 'Full Body',
    preview: '👕',
    isPremium: false,
    modelPath: '/models/bodyTshirt.glb'
  },
  {
    id: 'long-crew-1',
    name: 'Long Crew',
    category: 'Full Body',
    preview: '👔',
    isPremium: false,
    modelPath: '/models/finalSweater.glb'
  },
  {
    id: 'v-neck-1',
    name: 'V-Neck Tee',
    category: 'Full Body',
    preview: '🅥',
    isPremium: false
  },
  {
    id: 'tank-top-1',
    name: 'Tank Top',
    category: 'Full Body',
    preview: '🎽',
    isPremium: false
  },
  {
    id: 'polo-shirt-1',
    name: 'Polo Shirt',
    category: 'Full Body',
    preview: '👕',
    isPremium: true,
    price: 2.99
  },
  {
    id: 'henley-1',
    name: 'Henley Shirt',
    category: 'Full Body',
    preview: '👔',
    isPremium: true,
    price: 3.99
  },

  // Sleeve
  {
    id: 'short-sleeves-1',
    name: 'Short Sleeves',
    category: 'Sleeve',
    preview: '👔',
    isPremium: false,
    modelPath: '/models/sleeves.glb'
  },
  {
    id: 'long-sleeves-1',
    name: 'Long Sleeves',
    category: 'Sleeve',
    preview: '🧥',
    isPremium: false
  },
  {
    id: 'raglan-sleeves-1',
    name: 'Raglan Sleeves',
    category: 'Sleeve',
    preview: '⚾',
    isPremium: true,
    price: 1.99
  },
  {
    id: 'cap-sleeves-1',
    name: 'Cap Sleeves',
    category: 'Sleeve',
    preview: '🧢',
    isPremium: false
  },
  {
    id: 'bell-sleeves-1',
    name: 'Bell Sleeves',
    category: 'Sleeve',
    preview: '🔔',
    isPremium: true,
    price: 4.99
  },
  {
    id: 'puff-sleeves-1',
    name: 'Puff Sleeves',
    category: 'Sleeve',
    preview: '☁️',
    isPremium: true,
    price: 3.99
  },

  // Collar
  {
    id: 'crew-collar-1',
    name: 'Crew Collar',
    category: 'Collar',
    preview: '⭕',
    isPremium: false
  },
  {
    id: 'v-collar-1',
    name: 'V-Neck Collar',
    category: 'Collar',
    preview: '🔻',
    isPremium: false
  },
  {
    id: 'polo-collar-1',
    name: 'Polo Collar',
    category: 'Collar',
    preview: '👔',
    isPremium: true,
    price: 2.99
  },
  {
    id: 'mock-collar-1',
    name: 'Mock Neck',
    category: 'Collar',
    preview: '🎯',
    isPremium: true,
    price: 3.99
  },
  {
    id: 'hoodie-collar-1',
    name: 'Hood',
    category: 'Collar',
    preview: '🧢',
    isPremium: true,
    price: 4.99
  },

  // Bottom Hem
  {
    id: 'straight-hem-1',
    name: 'Straight Hem',
    category: 'Bottom Hem',
    preview: '📏',
    isPremium: false
  },
  {
    id: 'curved-hem-1',
    name: 'Curved Hem',
    category: 'Bottom Hem',
    preview: '🌙',
    isPremium: false
  },
  {
    id: 'asymmetric-hem-1',
    name: 'Asymmetric Hem',
    category: 'Bottom Hem',
    preview: '📐',
    isPremium: true,
    price: 2.99
  },
  {
    id: 'high-low-hem-1',
    name: 'High-Low Hem',
    category: 'Bottom Hem',
    preview: '⚖️',
    isPremium: true,
    price: 3.99
  },

  // Pockets
  {
    id: 'chest-pocket-1',
    name: 'Chest Pocket',
    category: 'Pockets',
    preview: '📦',
    isPremium: false
  },
  {
    id: 'kangaroo-pocket-1',
    name: 'Kangaroo Pocket',
    category: 'Pockets',
    preview: '🦘',
    isPremium: true,
    price: 2.99
  },
  {
    id: 'side-pockets-1',
    name: 'Side Pockets',
    category: 'Pockets',
    preview: '👖',
    isPremium: true,
    price: 3.99
  },
  {
    id: 'zip-pocket-1',
    name: 'Zip Pocket',
    category: 'Pockets',
    preview: '🤐',
    isPremium: true,
    price: 4.99
  },

  // Details & Trim
  {
    id: 'contrast-trim-1',
    name: 'Contrast Trim',
    category: 'Details & Trim',
    preview: '🎨',
    isPremium: true,
    price: 1.99
  },
  {
    id: 'ribbed-trim-1',
    name: 'Ribbed Trim',
    category: 'Details & Trim',
    preview: '🌊',
    isPremium: false
  },
  {
    id: 'piping-1',
    name: 'Piping Detail',
    category: 'Details & Trim',
    preview: '🧵',
    isPremium: true,
    price: 2.99
  },
  {
    id: 'buttons-1',
    name: 'Button Detail',
    category: 'Details & Trim',
    preview: '🔘',
    isPremium: true,
    price: 1.99
  },
  {
    id: 'embroidery-1',
    name: 'Embroidery',
    category: 'Details & Trim',
    preview: '✨',
    isPremium: true,
    price: 5.99
  }
];

const categories = ['Full Body', 'Sleeve', 'Collar', 'Bottom Hem', 'Pockets', 'Details & Trim'];

const TemplateLibrary = ({ onPieceSelect, selectedPieces = [] }: TemplateLibraryProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getPiecesByCategory = (category: string) => {
    return garmentPieces.filter(piece => piece.category === category);
  };

  const handlePieceClick = (piece: GarmentPiece) => {
    console.log('Selected piece:', piece);
    if (onPieceSelect) {
      onPieceSelect(piece);
    }
  };

  return (
    <div className="w-80 bg-gray-900 text-white p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium">Garment Assembly</h2>
            <p className="text-xs text-gray-400">Select pieces to build</p>
          </div>
        </div>
      </div>

      {/* Template Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const pieces = getPiecesByCategory(category);
          const isExpanded = expandedCategories.includes(category);
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h3 
                  className="font-medium text-sm cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </h3>
                <button 
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  {isExpanded ? 'Hide' : 'See all'}
                </button>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-3 gap-2">
                  {pieces.map((piece) => (
                    <div
                      key={piece.id}
                      className={`
                        relative aspect-square bg-gray-800 rounded-lg cursor-pointer 
                        hover:bg-gray-700 transition-all border-2
                        ${selectedPieces.includes(piece.id) 
                          ? 'border-blue-500 bg-blue-900/30' 
                          : 'border-transparent'
                        }
                      `}
                      onClick={() => handlePieceClick(piece)}
                    >
                      <div className="flex items-center justify-center h-full text-2xl">
                        {piece.preview}
                      </div>
                      
                      {piece.isPremium && (
                        <div className="absolute top-1 right-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs text-center text-gray-300 truncate">
                          {piece.name}
                        </div>
                        {piece.isPremium && (
                          <div className="text-xs text-center text-yellow-400">
                            ${piece.price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Piece Button */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <Button 
          variant="outline" 
          className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Piece
        </Button>
      </div>
    </div>
  );
};

export default TemplateLibrary;
