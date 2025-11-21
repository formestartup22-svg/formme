import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Send, CheckCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface SendingStageProps {
  design: Design;
}

const SendingStage = ({ design }: SendingStageProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>Order Details</CardTitle>
          </div>
          <CardDescription>Confirm quantities and specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Total Quantity</label>
              <input type="number" className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm" placeholder="e.g., 500" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Size Breakdown</label>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <div key={size} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{size}</label>
                    <input type="number" className="w-full p-2 bg-muted/50 border border-border rounded-lg text-xs text-center" placeholder="0" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Delivery Date</label>
              <input type="date" className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>Materials Selection</CardTitle>
          </div>
          <CardDescription>Choose fabric and trim sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Factory Stock Materials</span>
              </div>
              <p className="text-xs text-muted-foreground">Use materials from factory's inventory</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer opacity-60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-border" />
                <span className="font-medium text-sm text-foreground">Designer Provided</span>
              </div>
              <p className="text-xs text-muted-foreground">Ship your own materials to factory</p>
            </div>
          </div>
          <div className="pt-2">
            <label className="text-sm font-medium text-foreground mb-2 block">Special Material Notes</label>
            <textarea className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm min-h-[80px]" placeholder="Any specific requirements for materials..." />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <CardTitle>Costing Preview</CardTitle>
          </div>
          <CardDescription>Estimated production costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-foreground">Unit Cost</span>
            <span className="font-medium text-foreground">$18.50</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-foreground">Total Units</span>
            <span className="font-medium text-foreground">500</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-foreground">Shipping</span>
            <span className="font-medium text-foreground">$450</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-foreground">Total Cost</span>
              <span className="text-xl font-bold text-primary">$9,700</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            <CardTitle>Submit to Factory</CardTitle>
          </div>
          <CardDescription>Review and send your production order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Tech pack attached
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Factory selected: GreenThread Manufacturing
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Quantities confirmed
            </p>
          </div>
          <Button className="w-full" size="lg">Submit Order to Factory</Button>
          <p className="text-xs text-center text-muted-foreground">
            Factory will review and respond within 24-48 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendingStage;
