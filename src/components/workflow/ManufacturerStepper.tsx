import React from 'react';
import { Check } from 'lucide-react';

interface ManufacturerStepperProps {
  activeStep: string;
  onStepChange: (step: string) => void;
}

const manufacturerStages = [
  { id: 'techpack', label: 'Tech Pack Review' },
  { id: 'clarifications', label: 'Clarifications' },
  { id: 'sample', label: 'Sample Development' },
  { id: 'production', label: 'Production Approval' },
  { id: 'quality', label: 'Quality Check' },
  { id: 'shipping', label: 'Shipping & Logistics' },
];

export const ManufacturerStepper = ({ activeStep, onStepChange }: ManufacturerStepperProps) => {
  const currentIndex = manufacturerStages.findIndex(s => s.id === activeStep);

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'accessible';
  };

  return (
    <div className="space-y-1">
      {manufacturerStages.map((stage, index) => {
        const status = getStageStatus(index);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';

        return (
          <div key={stage.id} className="relative">
            {/* Connector Line - Centered */}
            {index < manufacturerStages.length - 1 && (
              <div
                className={`absolute left-4 top-8 w-0.5 h-8 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}

            {/* Step Item */}
            <button
              onClick={() => onStepChange(stage.id)}
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
                  {stage.label}
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
