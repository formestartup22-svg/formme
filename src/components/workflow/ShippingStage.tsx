import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, CheckCircle, Download, Package, MapPin } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface ShippingStageProps { design: Design; }

const ShippingStage = ({ design }: ShippingStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [currentStatus, setCurrentStatus] = useState<'dispatched' | 'shipped' | 'carrier' | 'out-for-delivery' | 'delivered'>('shipped');

  const shipmentStages = [
    { key: 'dispatched', label: 'Dispatched', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'carrier', label: 'At Carrier Facility', icon: MapPin },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const currentStageIndex = shipmentStages.findIndex(s => s.key === currentStatus);

  const mockInvoices = [
    { name: 'Shipping Invoice', date: 'Nov 20, 2025' },
    { name: 'Customs Document', date: 'Nov 18, 2025' }
  ];

  return (
    <div>
      <StageHeader icon={Truck} title="Shipping & Logistics" description="Track your shipment and access shipping documents." />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Tracking Information - Removed */}

          {/* Shipment Progress */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Status</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {shipmentStages.map((stage, idx) => {
                        const Icon = stage.icon;
                        const isComplete = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        
                        return (
                          <div key={stage.key} className="flex flex-col items-center relative flex-1">
                            {idx < shipmentStages.length - 1 && (
                              <div 
                                className={`absolute left-1/2 top-5 h-0.5 w-full ${
                                  isComplete ? 'bg-primary' : 'bg-border'
                                }`}
                              />
                            )}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                                isComplete 
                                  ? 'bg-primary border-primary' 
                                  : 'bg-background border-border'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isComplete ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </div>
                            <p className={`text-xs mt-2 text-center max-w-[80px] ${
                              isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                            }`}>
                              {stage.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="bg-muted/50 rounded-lg p-4 mt-6">
                    <p className="text-sm font-medium mb-1">Latest Update</p>
                    <p className="text-sm text-muted-foreground">
                      Your order is currently {shipmentStages[currentStageIndex].label.toLowerCase()}.
                      Expected delivery: Dec 5, 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Invoices & Documents */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Documents</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {mockInvoices.map((invoice, idx) => (
                    <div key={idx} className="group relative">
                      <span className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                        {invoice.name}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {invoice.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Confirm Delivery */}
          <section>
            <Card className="border-border">
              <CardContent className="p-6">
                <Button 
                  variant={workflowData.deliveryConfirmed ? 'default' : 'outline'} 
                  className="w-full gap-2" 
                  onClick={() => updateWorkflowData({ deliveryConfirmed: !workflowData.deliveryConfirmed })}
                >
                  <CheckCircle className="w-4 h-4" />
                  {workflowData.deliveryConfirmed ? 'Confirmed ✓' : 'Confirm Delivery'}
                </Button>
              </CardContent>
            </Card>
          </section>

          <StageNavigation 
            onNext={() => true} 
            nextLabel="Mark as Complete"
            showBack={true}
          />
        </div>
        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default ShippingStage;
