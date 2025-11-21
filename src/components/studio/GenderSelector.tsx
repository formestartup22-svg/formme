import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface GenderSelectorProps {
  selectedGender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
}
const GenderSelector = ({
  selectedGender,
  onGenderChange
}: GenderSelectorProps) => {
  return <Card className="p-6 mb-6 bg-card border border-border shadow-sm">
      <h3 className="text-xl font-semibold mb-6 text-center text-foreground">Select Gender</h3>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <Button
          variant="outline"
          className={`h-16 flex items-center justify-center space-x-3 transition-all duration-200 border-2 ${
            selectedGender === 'male'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
          }`}
          onClick={() => onGenderChange('male')}
        >
          <span className="font-semibold text-lg">Men</span>
        </Button>
        
        <Button
          variant="outline"
          className={`h-16 flex items-center justify-center space-x-3 transition-all duration-200 border-2 ${
            selectedGender === 'female'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted'
          }`}
          onClick={() => onGenderChange('female')}
        >
          <span className="font-semibold text-lg">Women</span>
        </Button>
      </div>
    </Card>;
};
export default GenderSelector;