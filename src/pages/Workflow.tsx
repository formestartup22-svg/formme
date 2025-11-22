import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, AlertCircle, CheckCircle, Package, Truck, FileCheck, Factory, Send, CreditCard } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useUserRole } from '@/hooks/useUserRole';

const Workflow = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { designs, loading } = useDesigns();
  const { role, loading: roleLoading } = useUserRole();
  
  // Redirect to manufacturer dashboard if user is a manufacturer
  useEffect(() => {
    if (!roleLoading && role === 'manufacturer') {
      navigate('/manufacturer');
    }
  }, [role, roleLoading, navigate]);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }
  
  const activeDesigns = designs.filter(d => d.status !== 'completed').length;
  const inSampling = designs.filter(d => d.status === 'sample_development').length;
  const inProduction = designs.filter(d => 
    d.status === 'production_approval' || d.status === 'quality_check'
  ).length;
  const awaitingApproval = 0; // TODO: Calculate based on orders requiring action

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
            <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/new-design')}>
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
                    {loading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Loading designs...</p>
                      </div>
                    ) : designs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No designs found</p>
                      </div>
                    ) : (
                      designs.map((design) => (
                        <Card key={design.id} className="border-border hover:border-primary/50 transition-all hover:shadow-sm cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-2">{design.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {design.category || 'Uncategorized'}
                                </p>
                                <Badge variant="outline">{design.status || 'draft'}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
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
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workflow;
