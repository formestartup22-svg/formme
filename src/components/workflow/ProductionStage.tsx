import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface ProductionStageProps {
  design: Design;
}

const ProductionStage = ({ design }: ProductionStageProps) => {
  return (
    <div className="space-y-6">
      {/* Lab Dips & Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              <CardTitle>Lab Dips Review</CardTitle>
            </div>
            <CardDescription>Approve fabric color samples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {['Navy', 'Forest Green', 'Charcoal'].map((color) => (
                <div key={color} className="space-y-2">
                  <div className="aspect-square bg-muted rounded-lg border border-border" />
                  <p className="text-xs text-center text-foreground font-medium">{color}</p>
                  <Button size="sm" variant="outline" className="w-full text-xs">Approve</Button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Awaiting your approval to proceed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Material Details</CardTitle>
            <CardDescription>Factory submitted fabric specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Fabric Type</span>
              <span className="font-medium text-foreground">100% Organic Cotton</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">GSM</span>
              <span className="font-medium text-foreground">180 gsm</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Shrinkage</span>
              <span className="font-medium text-foreground">3-5%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Certification</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">GOTS</Badge>
            </div>
            <Button className="w-full mt-2">Approve Materials</Button>
          </CardContent>
        </Card>
      </div>

      {/* Production Plan */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Production Plan</CardTitle>
          </div>
          <CardDescription>Factory submitted production timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-medium text-foreground">Dec 1, 2025</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Expected Finish</p>
                <p className="font-medium text-foreground">Dec 20, 2025</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Units</p>
                <p className="font-medium text-foreground">500 pieces</p>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-3">Production Stages</h4>
              <div className="space-y-3">
                {[
                  { stage: 'Cutting', date: 'Dec 1-3', status: 'scheduled' },
                  { stage: 'Sewing', date: 'Dec 4-14', status: 'scheduled' },
                  { stage: 'Finishing', date: 'Dec 15-17', status: 'scheduled' },
                  { stage: 'Pressing & Packaging', date: 'Dec 18-20', status: 'scheduled' }
                ].map((item) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.stage}</span>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* First Batch Review */}
      <Card className="border-border bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <CardTitle>First Batch Photos</CardTitle>
          </div>
          <CardDescription>Review initial production samples before full run</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background border border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Factory will upload first batch photos once production begins
            </p>
          </div>
          <div className="flex gap-4">
            <Button className="flex-1" disabled>
              Approve First Batch
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              Request Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionStage;
