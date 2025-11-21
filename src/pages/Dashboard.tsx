import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockDesigns, mockTasks, stageNames } from '@/data/workflowData';
import { Plus, Clock, AlertCircle, CheckCircle, Package, Truck, FileCheck, Factory, Send, Download } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showNewDesignDialog, setShowNewDesignDialog] = useState(false);
  
  const activeDesigns = mockDesigns.filter(d => d.status !== 'completed').length;
  const inSampling = mockDesigns.filter(d => d.stage === 'sample').length;
  const inProduction = mockDesigns.filter(d => d.stage === 'production' || d.stage === 'quality').length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'on-track': return 'default';
      case 'delayed': return 'secondary';
      case 'action-required': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'tech-pack': return <FileCheck className="w-4 h-4" />;
      case 'factory-match': return <Factory className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      case 'sample': return <Package className="w-4 h-4" />;
      case 'production': return <Factory className="w-4 h-4" />;
      case 'quality': return <CheckCircle className="w-4 h-4" />;
      case 'shipping': return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStageDescription = (stage: string) => {
    switch (stage) {
      case 'tech-pack': return 'Tech Pack Creation';
      case 'factory-match': return 'Factory Matching';
      case 'sending': return 'Tech Pack Sent';
      case 'sample': return 'Sample Review';
      case 'production': return 'Production';
      case 'quality': return 'Quality Control';
      case 'shipping': return 'In Transit';
      default: return stage;
    }
  };

  const filteredDesigns = activeTab === 'all' 
    ? mockDesigns 
    : mockDesigns.filter(d => d.status === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Production Dashboard</h1>
              <p className="text-muted-foreground">Track your designs from concept to delivery</p>
            </div>
            <Dialog open={showNewDesignDialog} onOpenChange={setShowNewDesignDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  New Design
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose Your Design Studio</DialogTitle>
                  <DialogDescription>
                    Select which studio you'd like to use to create your garment design.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => {
                      setShowNewDesignDialog(false);
                      window.location.href = '/design/simple';
                    }}
                  >
                    <span className="font-semibold">Simple Studio</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Quick and easy garment design with pre-made templates
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => {
                      setShowNewDesignDialog(false);
                      window.location.href = '/design/workspace';
                    }}
                  >
                    <span className="font-semibold">Design Studio</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Full-featured design workspace with advanced customization
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => {
                      setShowNewDesignDialog(false);
                      window.location.href = '/studio';
                    }}
                  >
                    <span className="font-semibold">Professional Studio</span>
                    <span className="text-xs text-muted-foreground text-left">
                      Advanced pro-level tools for complex garment design
                    </span>
                  </Button>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowNewDesignDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Active</CardDescription>
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{activeDesigns}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Sampling</CardDescription>
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inSampling}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Review stage</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Production</CardDescription>
                  <Factory className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inProduction}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Manufacturing</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Design Pipeline</CardTitle>
                <CardDescription>Monitor and manage all designs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Hover Button Tabs */}
            <div className="flex gap-2 mb-6 pb-4 border-b">
              {[
                { value: 'all', label: 'All' },
                { value: 'on-track', label: 'On Track' },
                { value: 'action-required', label: 'Urgent' },
                { value: 'delayed', label: 'Delayed' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  onMouseEnter={() => setHoveredTab(tab.value)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    activeTab === tab.value
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {(hoveredTab === tab.value || activeTab === tab.value) && (
                    <span
                      className={`absolute inset-0 rounded-lg transition-all ${
                        activeTab === tab.value
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted border-2 border-border'
                      }`}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-3">
              {filteredDesigns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No designs found</p>
                </div>
              ) : (
                filteredDesigns.map((design) => (
                  <Link key={design.id} to={`/design/${design.id}`}>
                    <Card className="border-border hover:border-primary/50 transition-all hover:shadow-sm cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStageIcon(design.stage)}
                              <h3 className="font-semibold text-foreground">{design.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {stageNames[design.stage]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {design.nextAction}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={getStatusVariant(design.status)}>
                              {design.status.replace('-', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {design.eta}
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar with Stage Description */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{getStageDescription(design.stage)}</span>
                            <span>{design.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${design.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
