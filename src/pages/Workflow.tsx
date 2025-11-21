import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDesigns, mockTasks, stageNames } from '@/data/workflowData';
import { Plus, Clock, AlertCircle, CheckCircle, Package, Truck, FileCheck, Factory, Send, CreditCard } from 'lucide-react';

const Workflow = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const activeDesigns = mockDesigns.filter(d => d.status !== 'completed').length;
  const inSampling = mockDesigns.filter(d => d.stage === 'sample').length;
  const inProduction = mockDesigns.filter(d => d.stage === 'production' || d.stage === 'quality').length;
  const awaitingApproval = mockDesigns.filter(d => d.status === 'action-required').length;

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
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'production': return <Factory className="w-4 h-4" />;
      case 'sample': return <Package className="w-4 h-4" />;
      case 'quality': return <CheckCircle className="w-4 h-4" />;
      case 'shipping': return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Production Workflow</h1>
              <p className="text-muted-foreground">Track your designs from concept to delivery</p>
            </div>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Design
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  <Package className="w-4 h-4 text-accent" />
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

            <Card className="border-border hover:border-destructive/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Urgent</CardDescription>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-bold text-destructive">{awaitingApproval}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Action needed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
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
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="on-track">On Track</TabsTrigger>
                    <TabsTrigger value="action-required">Urgent</TabsTrigger>
                    <TabsTrigger value="delayed">Delayed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="space-y-3">
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
                              {/* Progress Bar */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Action Items Sidebar */}
          <div>
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Action Items
                </CardTitle>
                <CardDescription>Tasks needing your attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  mockTasks.map((task) => (
                    <Link key={task.id} to={`/design/${task.designId}`}>
                      <Card className={`border transition-all hover:shadow-md cursor-pointer ${
                        task.priority === 'high' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : task.priority === 'medium'
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-accent/30 bg-accent/5'
                      }`}>
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-foreground text-sm flex-1">
                              {task.action}
                            </p>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {task.designName}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Due {task.dueDate}</span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workflow;
