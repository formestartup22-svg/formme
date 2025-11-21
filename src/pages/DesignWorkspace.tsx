import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDesigns, stageNames, stageOrder } from '@/data/workflowData';
import { ArrowLeft, Upload, MessageSquare, FileText } from 'lucide-react';
import TechPackStage from '@/components/workflow/TechPackStage';
import FactoryMatchStage from '@/components/workflow/FactoryMatchStage';
import SendingStage from '@/components/workflow/SendingStage';
import SampleStage from '@/components/workflow/SampleStage';
import ProductionStage from '@/components/workflow/ProductionStage';
import QualityStage from '@/components/workflow/QualityStage';
import ShippingStage from '@/components/workflow/ShippingStage';

const DesignWorkspace = () => {
  const { id } = useParams();
  const design = mockDesigns.find(d => d.id === id);
  const [activeStage, setActiveStage] = useState<string>(design?.stage || 'tech-pack');

  if (!design) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-24 mt-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Design not found</h1>
          <Button asChild>
            <Link to="/workflow">Back to Workflow</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'delayed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'action-required': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 mt-24 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link to="/workflow" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Workflow
            </Link>
          </Button>
          
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{design.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{stageNames[design.stage]}</span>
                <Badge variant="outline" className={getStatusColor(design.status)}>
                  {design.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Add Note
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message Factory
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-foreground">{design.progress}%</span>
                </div>
                <Progress value={design.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{design.nextAction}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Navigation Tabs */}
        <Tabs value={activeStage} onValueChange={setActiveStage} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {stageOrder.map((stage) => (
              <TabsTrigger key={stage} value={stage} className="whitespace-nowrap">
                {stageNames[stage]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tech-pack">
            <TechPackStage design={design} />
          </TabsContent>

          <TabsContent value="factory-match">
            <FactoryMatchStage design={design} />
          </TabsContent>

          <TabsContent value="sending">
            <SendingStage design={design} />
          </TabsContent>

          <TabsContent value="sample">
            <SampleStage design={design} />
          </TabsContent>

          <TabsContent value="production">
            <ProductionStage design={design} />
          </TabsContent>

          <TabsContent value="quality">
            <QualityStage design={design} />
          </TabsContent>

          <TabsContent value="shipping">
            <ShippingStage design={design} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DesignWorkspace;
