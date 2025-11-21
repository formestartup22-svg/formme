import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { stageOrder } from '@/data/workflowData';

interface StageNavigationProps {
  onNext?: () => boolean; // Return true if can proceed
  nextLabel?: string;
  showBack?: boolean;
}

export const StageNavigation = ({ 
  onNext, 
  nextLabel = 'Continue to Next Step',
  showBack = true 
}: StageNavigationProps) => {
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();

  const currentIndex = stageOrder.indexOf(currentStage as any);
  const hasNext = currentIndex < stageOrder.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleNext = () => {
    // Run validation if provided
    const canProceed = onNext ? onNext() : true;
    
    if (canProceed && hasNext) {
      markStageComplete(currentStage);
      setCurrentStage(stageOrder[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (hasPrevious) {
      setCurrentStage(stageOrder[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-8">
      {showBack && hasPrevious ? (
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {hasNext && (
        <Button 
          onClick={handleNext}
          className="bg-accent hover:bg-accent/90 gap-2"
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
