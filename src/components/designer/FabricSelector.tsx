
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const fabricTypes = [
  { id: "cotton", name: "Cotton", roughness: 0.8, metalness: 0.1 },
  { id: "polyester", name: "Polyester", roughness: 0.5, metalness: 0.2 },
  { id: "linen", name: "Linen", roughness: 0.9, metalness: 0.05 },
  { id: "denim", name: "Denim", roughness: 0.7, metalness: 0.1 },
  { id: "silk", name: "Silk", roughness: 0.3, metalness: 0.3 },
];

interface FabricSelectorProps {
  fabricType: string;
  onFabricChange: (value: string) => void;
}

const FabricSelector = ({ fabricType, onFabricChange }: FabricSelectorProps) => {
  const handleFabricChange = (value: string) => {
    onFabricChange(value);
    const selectedFabric = fabricTypes.find(fabric => fabric.id === value);
    
    if (selectedFabric) {
      toast(`${selectedFabric.name} fabric selected`);
      
      // Apply fabric texture to the t-shirt display
      const tshirtSvg = document.querySelector('svg[viewBox="0 0 1332.15 1687.55"]');
      if (tshirtSvg) {
        const bodyPath = tshirtSvg.querySelector('#TORSO path[data-role="fill"]');
        const sleevePaths = tshirtSvg.querySelectorAll('#LEFT_SLEEVE path[data-role="fill"], #RIGHT_SLEEVE path[data-role="fill"]');
        const collarPath = tshirtSvg.querySelector('#COLLAR_ROUND path[data-role="fill"]');
        
        // Apply fabric texture based on selection
        if (value !== 'cotton') {
          const fabricTextureUrl = `url(#fabric-${value})`;
          
          // Create fabric texture pattern if it doesn't exist
          let defs = tshirtSvg.querySelector('defs');
          if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            tshirtSvg.insertBefore(defs, tshirtSvg.firstChild);
          }
          
          // Create the fabric pattern
          const existingPattern = defs.querySelector(`#fabric-${value}`);
          if (!existingPattern) {
            const pattern = createFabricPattern(value);
            if (pattern) {
              defs.appendChild(pattern);
            }
          }
          
          // Apply the pattern to all parts
          if (bodyPath) bodyPath.setAttribute('fill', fabricTextureUrl);
          sleevePaths.forEach(path => path.setAttribute('fill', fabricTextureUrl));
          if (collarPath) collarPath.setAttribute('fill', fabricTextureUrl);
        } else {
          // Reset to solid colors for cotton
          if (bodyPath) bodyPath.setAttribute('fill', '#ffffff');
          sleevePaths.forEach(path => path.setAttribute('fill', '#ffffff'));
          if (collarPath) collarPath.setAttribute('fill', '#ffffff');
        }
      }
    }
  };

  const createFabricPattern = (fabricName: string) => {
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', `fabric-${fabricName}`);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    switch (fabricName) {
      case 'linen':
        pattern.setAttribute('width', '12');
        pattern.setAttribute('height', '12');
        pattern.innerHTML = `
          <rect width="12" height="12" fill="#ffffff" />
          <line x1="0" y1="3" x2="12" y2="3" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="6" x2="12" y2="6" stroke="rgba(0,0,0,0.15)" strokeWidth="0.3" />
          <line x1="0" y1="9" x2="12" y2="9" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4" />
          <line x1="3" y1="0" x2="3" y2="12" stroke="rgba(0,0,0,0.1)" strokeWidth="0.3" />
          <line x1="6" y1="0" x2="6" y2="12" stroke="rgba(0,0,0,0.08)" strokeWidth="0.4" />
          <line x1="9" y1="0" x2="9" y2="12" stroke="rgba(0,0,0,0.12)" strokeWidth="0.3" />
        `;
        return pattern;
        
      case 'polyester':
        pattern.setAttribute('width', '6');
        pattern.setAttribute('height', '6');
        pattern.innerHTML = `
          <rect width="6" height="6" fill="#ffffff" />
          <rect x="0" y="0" width="2" height="2" fill="rgba(0,0,0,0.05)" />
          <rect x="4" y="0" width="2" height="2" fill="rgba(0,0,0,0.05)" />
          <rect x="2" y="2" width="2" height="2" fill="rgba(0,0,0,0.05)" />
          <rect x="0" y="4" width="2" height="2" fill="rgba(0,0,0,0.05)" />
          <rect x="4" y="4" width="2" height="2" fill="rgba(0,0,0,0.05)" />
        `;
        return pattern;
        
      case 'denim':
        pattern.setAttribute('width', '8');
        pattern.setAttribute('height', '8');
        pattern.innerHTML = `
          <rect width="8" height="8" fill="#ffffff" />
          <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.2)" />
          <circle cx="6" cy="6" r="0.5" fill="rgba(0,0,0,0.2)" />
          <line x1="0" y1="4" x2="8" y2="4" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        `;
        return pattern;
        
      case 'silk':
        pattern.setAttribute('width', '10');
        pattern.setAttribute('height', '10');
        pattern.innerHTML = `
          <rect width="10" height="10" fill="#ffffff" />
          <ellipse cx="5" cy="5" rx="3" ry="1" fill="rgba(0,0,0,0.03)" />
          <ellipse cx="2" cy="2" rx="2" ry="0.5" fill="rgba(0,0,0,0.02)" />
          <ellipse cx="8" cy="8" rx="2" ry="0.5" fill="rgba(0,0,0,0.02)" />
        `;
        return pattern;
        
      default:
        return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Process the file - in a real app, this would upload the image
      // and possibly set it as a pattern/texture
      toast("Pattern uploaded successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fabric-type">Fabric Type</Label>
        <Select 
          value={fabricType}
          onValueChange={handleFabricChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select fabric" />
          </SelectTrigger>
          <SelectContent>
            {fabricTypes.map(fabric => (
              <SelectItem key={fabric.id} value={fabric.id}>
                {fabric.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <Label htmlFor="pattern-upload" className="block mb-2">Upload Pattern</Label>
        <Input
          id="pattern-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PNG, JPG, SVG (max 5MB)
        </p>
      </div>
    </div>
  );
};

export default FabricSelector;
