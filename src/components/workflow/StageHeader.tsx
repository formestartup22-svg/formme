import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  contextInfo?: {
    label: string;
    value: string;
  }[];
}

export const StageHeader = ({ icon: Icon, title, description, contextInfo }: StageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      
      <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
        {description}
      </p>

      {contextInfo && contextInfo.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {contextInfo.map((info, idx) => (
            <Badge key={idx} variant="outline" className="bg-muted/50 text-xs">
              <span className="text-muted-foreground">{info.label}:</span>
              <span className="ml-1 font-medium text-foreground">{info.value}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
