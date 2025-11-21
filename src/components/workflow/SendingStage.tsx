import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, DollarSign, Send } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface SendingStageProps {
  design: Design;
}

const SendingStage = ({ design }: SendingStageProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Order Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Total Quantity</Label>
            <Input type="number" placeholder="500" className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Delivery Date</Label>
            <Input type="date" className="h-8 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Cost Estimate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unit Cost</span>
            <span className="font-medium">$18.50</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">$450</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-emerald-600">$9,700</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Submit to Factory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Submit Order</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendingStage;
