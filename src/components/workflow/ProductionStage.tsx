import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, CheckCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface ProductionStageProps {
  design: Design;
}

const ProductionStage = ({ design }: ProductionStageProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Lab Dips Review</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {['Navy', 'Green', 'Gray'].map((color) => (
              <div key={color} className="space-y-1.5">
                <div className="aspect-square bg-muted rounded border" />
                <p className="text-xs text-center">{color}</p>
              </div>
            ))}
          </div>
          <Button size="sm" className="w-full mt-3">Approve Colors</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Material Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fabric</span>
            <span className="font-medium">100% Cotton</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GSM</span>
            <span className="font-medium">180 gsm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shrinkage</span>
            <span className="font-medium">3-5%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">First Batch Photos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Factory will upload photos once production begins
          </p>
          <div className="flex gap-2">
            <Button size="sm" disabled>Approve Batch</Button>
            <Button variant="outline" size="sm" disabled>Request Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionStage;
