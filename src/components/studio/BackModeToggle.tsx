
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

interface BackModeToggleProps {
  isBackMode: boolean;
  onToggle: () => void;
}

const BackModeToggle = ({ isBackMode, onToggle }: BackModeToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <RotateCcw className={`h-5 w-5 ${isBackMode ? 'text-gray-800' : 'text-gray-500'} transition-colors`} />
      <Label htmlFor="back-mode" className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
        See Back Mode
      </Label>
      <Switch
        id="back-mode"
        checked={isBackMode}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default BackModeToggle;
