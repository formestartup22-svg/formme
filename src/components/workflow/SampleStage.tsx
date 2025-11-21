import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface SampleStageProps {
  design: Design;
}

const SampleStage = ({ design }: SampleStageProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Upload Fit Photos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Upload photos</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fit Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            className="min-h-[100px] text-sm resize-none"
            placeholder="Add notes about fit, sizing..."
          />
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sample Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <CheckCircle className="w-3 h-3" />
              Approve Sample
            </Button>
            <Button variant="outline" size="sm">Request Revisions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleStage;
