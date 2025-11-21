import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, MapPin, CheckCircle, Truck } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface ShippingStageProps {
  design: Design;
}

const ShippingStage = ({ design }: ShippingStageProps) => {
  return (
    <div className="space-y-6">
      {/* Packing Details */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>Packing Details</CardTitle>
          </div>
          <CardDescription>Factory submitted packed quantities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { size: 'XS', qty: 50, boxes: 2 },
              { size: 'S', qty: 100, boxes: 3 },
              { size: 'M', qty: 150, boxes: 4 },
              { size: 'L', qty: 125, boxes: 3 },
              { size: 'XL', qty: 75, boxes: 2 }
            ].map((item) => (
              <div key={item.size} className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Size {item.size}</p>
                <p className="text-2xl font-bold text-foreground">{item.qty}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.boxes} boxes</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total Units</span>
              <span className="text-xl font-bold text-primary">500 pieces</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Total Boxes</span>
              <span className="font-medium text-foreground">14 boxes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Shipping Label</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[8.5/11] bg-muted rounded-lg border border-border flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <Button variant="outline" className="w-full">Download Label</Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Invoice</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[8.5/11] bg-muted rounded-lg border border-border flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <Button variant="outline" className="w-full">Download Invoice</Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Packing List</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[8.5/11] bg-muted rounded-lg border border-border flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <Button variant="outline" className="w-full">Download List</Button>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Timeline */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <CardTitle>Shipment Tracking</CardTitle>
          </div>
          <CardDescription>Live updates on your order's location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground flex-1">Tracking Number:</p>
              <code className="text-sm font-mono bg-background px-3 py-1 rounded border border-border">DHL7392847582</code>
              <Button size="sm" variant="outline">Copy</Button>
            </div>

            <div className="relative pl-8 space-y-6 mt-6">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
              
              {[
                { 
                  status: 'Picked up from factory', 
                  location: 'Portugal', 
                  date: 'Dec 21, 9:00 AM',
                  completed: true
                },
                { 
                  status: 'In transit to hub', 
                  location: 'Lisbon Hub', 
                  date: 'Dec 21, 2:30 PM',
                  completed: true
                },
                { 
                  status: 'Cleared customs', 
                  location: 'Portugal Customs', 
                  date: 'Dec 22, 10:15 AM',
                  completed: true
                },
                { 
                  status: 'In transit', 
                  location: 'International flight', 
                  date: 'Dec 23 (Expected)',
                  completed: false
                },
                { 
                  status: 'Out for delivery', 
                  location: 'Your city', 
                  date: 'Dec 24 (Expected)',
                  completed: false
                }
              ].map((event, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 ${
                    event.completed 
                      ? 'bg-primary border-primary' 
                      : 'bg-background border-border'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium text-sm ${
                        event.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {event.status}
                      </p>
                      {event.completed && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Confirmation */}
      <Card className="border-border bg-primary/5">
        <CardHeader>
          <CardTitle>Delivery Confirmation</CardTitle>
          <CardDescription>Confirm receipt of your order</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Delivery Received
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Expected delivery: Dec 24, 2025
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingStage;
