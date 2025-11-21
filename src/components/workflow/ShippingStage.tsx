import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface ShippingStageProps {
  design: Design;
}

const ShippingStage = ({ design }: ShippingStageProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Packing Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total Units</span>
            <span className="font-bold text-emerald-600">500 pieces</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Boxes</span>
            <span className="font-medium">14 boxes</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Tracking</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs mb-3">
            <span className="text-muted-foreground">Tracking #:</span>
            <code className="font-mono">DHL7392847582</code>
          </div>

          <div className="space-y-3">
            {[
              { status: 'Picked up', location: 'Portugal', done: true },
              { status: 'In transit', location: 'Lisbon Hub', done: true },
              { status: 'Customs cleared', location: 'Portugal', done: true },
              { status: 'Out for delivery', location: 'Your city', done: false }
            ].map((event, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  event.done ? 'bg-emerald-600' : 'bg-muted'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${event.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {event.status}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </p>
                </div>
                {event.done && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Delivery Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            Confirm Delivery Received
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingStage;
