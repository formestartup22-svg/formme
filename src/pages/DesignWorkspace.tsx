import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDesigns } from '@/data/workflowData';
import { ArrowLeft } from 'lucide-react';
import { WorkflowProvider, useWorkflow } from '@/context/WorkflowContext';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import TechPackStage from '@/components/workflow/TechPackStage';
import FactoryMatchStage from '@/components/workflow/FactoryMatchStage';
import PaymentStage from '@/components/workflow/PaymentStage';
import ProductionStage from '@/components/workflow/ProductionStage';
import SampleStage from '@/components/workflow/SampleStage';
import QualityStage from '@/components/workflow/QualityStage';
import ShippingStage from '@/components/workflow/ShippingStage';

const WorkspaceContent = ({ design }: { design: any }) => {
  const { currentStage, getProgress } = useWorkflow();

  const renderStage = () => {
    switch (currentStage) {
      case 'tech-pack':
        return <TechPackStage design={design} />;
      case 'factory-match':
        return <FactoryMatchStage design={design} />;
      case 'payment':
        return <PaymentStage design={design} />;
      case 'production':
        return <ProductionStage design={design} />;
      case 'sample':
        return <SampleStage design={design} />;
      case 'quality':
        return <QualityStage design={design} />;
      case 'shipping':
        return <ShippingStage design={design} />;
      default:
        return <TechPackStage design={design} />;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Stepper */}
      <div className="w-72 shrink-0">
        <div className="sticky top-6">
          <Card className="border-border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm mb-1">Production Pipeline</h3>
              <p className="text-xs text-muted-foreground">
                Follow each step to complete your order
              </p>
            </div>
            <div className="p-4">
              <WorkflowStepper />
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {renderStage()}
      </div>
    </div>
  );
};

const DesignWorkspace = () => {
  const { id } = useParams();
  const design = mockDesigns.find(d => d.id === id);

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
    <WorkflowProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-6 py-6 mt-20 max-w-7xl">
          {/* Compact Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{design.name}</h1>
                <Badge variant="outline" className={getStatusColor(design.status)}>
                  {design.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <Card className="border-border">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">{design.progress}%</span>
                    </div>
                    <Progress value={design.progress} className="h-1.5" />
                  </div>
                  <div className="text-xs text-muted-foreground">{design.nextAction}</div>
                </div>
              </div>
            </Card>
          </div>

          <WorkspaceContent design={design} />
        </main>
      </div>
    </WorkflowProvider>
  );
};

export default DesignWorkspace;
