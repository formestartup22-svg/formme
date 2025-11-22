import React from 'react';
import { Check } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { stageNames } from '@/data/workflowData';

const stages = [
  'tech-pack',
  'factory-match',
  'sending',
  'payment',
  'production',
  'sample',
  'quality',
  'shipping'
];

export const WorkflowStepper = () => {
  const { currentStage, completedStages, setCurrentStage } = useWorkflow();

  const getStageStatus = (stage: string, index: number) => {
    if (completedStages.includes(stage)) return 'completed';
    if (stage === currentStage) return 'current';
    return 'accessible'; // All stages are accessible for non-linear navigation
  };

  return (
    <div className="space-y-1">
      {stages.map((stage, index) => {
        const status = getStageStatus(stage, index);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';
        const isAccessible = status === 'accessible' || isCompleted || isCurrent;

        return (
          <div key={stage} className="relative">
            {/* Connector Line - Centered with circle */}
            {index < stages.length - 1 && (
              <div
                className={`absolute left-[16px] top-8 w-0.5 h-8 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}

            {/* Step Item */}
            <button
              onClick={() => setCurrentStage(stage)}
              className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-primary/5'
                  : 'hover:bg-muted/50 cursor-pointer'
              }`}
            >
              {/* Circle/Check */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary'
                    : isCurrent
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stageNames[stage as keyof typeof stageNames]}
                </p>
                {isCompleted && (
                  <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};
