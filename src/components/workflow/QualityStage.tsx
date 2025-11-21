import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface QualityStageProps {
  design: Design;
}

const QualityStage = ({ design }: QualityStageProps) => {
  const qcChecks = [
    { item: 'Measurements accuracy', status: 'pass' },
    { item: 'Stitch quality', status: 'pass' },
    { item: 'Fabric defects', status: 'warning' },
    { item: 'Color consistency', status: 'pass' }
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quality Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {qcChecks.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <div className="flex items-center gap-2">
                {check.status === 'pass' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                <span>{check.item}</span>
              </div>
              <Badge variant="outline" className={
                check.status === 'pass' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs'
                  : 'bg-amber-100 text-amber-700 border-amber-200 text-xs'
              }>
                {check.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Defect Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Acceptable Units</span>
            <span className="font-bold text-emerald-600">495 / 500 (99%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Minor Defects</span>
            <span className="font-medium text-amber-600">5 units</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Final Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <CheckCircle className="w-3 h-3" />
              Approve & Ship
            </Button>
            <Button variant="outline" size="sm">Request Fixes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityStage;
