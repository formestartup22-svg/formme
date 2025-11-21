import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockDesigns, mockTasks, stageNames } from '@/data/workflowData';
import { Plus, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const Workflow = () => {
  const activeDesigns = mockDesigns.filter(d => d.status !== 'completed').length;
  const inSampling = mockDesigns.filter(d => d.stage === 'sample').length;
  const inProduction = mockDesigns.filter(d => d.stage === 'production' || d.stage === 'quality').length;
  const awaitingApproval = mockDesigns.filter(d => d.status === 'action-required').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'delayed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'action-required': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-rose-500/20 bg-rose-500/10';
      case 'medium': return 'border-amber-500/20 bg-amber-500/10';
      case 'low': return 'border-emerald-500/20 bg-emerald-500/10';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 mt-24 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Workflow</h1>
            <p className="text-muted-foreground text-lg">Track all your designs from tech pack to delivery</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Design
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm text-muted-foreground">Active Designs</CardDescription>
              <CardTitle className="text-4xl font-bold text-foreground">{activeDesigns}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>In progress</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm text-muted-foreground">In Sampling</CardDescription>
              <CardTitle className="text-4xl font-bold text-foreground">{inSampling}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Under review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm text-muted-foreground">In Production</CardDescription>
              <CardTitle className="text-4xl font-bold text-foreground">{inProduction}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Manufacturing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm text-muted-foreground">Awaiting Approval</CardDescription>
              <CardTitle className="text-4xl font-bold text-rose-500">{awaitingApproval}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-rose-500">
                <AlertCircle className="w-4 h-4" />
                <span>Action required</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Active Designs</CardTitle>
                <CardDescription>Manage and track your design pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Design Name</TableHead>
                      <TableHead>Current Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Action</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDesigns.map((design) => (
                      <TableRow key={design.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{design.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {stageNames[design.stage]}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(design.status)}>
                            {design.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {design.nextAction}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{design.eta}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/design/${design.id}`}>Open Workspace</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions Sidebar */}
          <div>
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Your Pending Actions
                </CardTitle>
                <CardDescription>Tasks requiring your attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTasks.map((task) => (
                  <Link key={task.id} to={`/design/${task.designId}`}>
                    <Card className={`border transition-all hover:shadow-md cursor-pointer ${getPriorityColor(task.priority)}`}>
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm mb-1">{task.action}</p>
                            <p className="text-xs text-muted-foreground">{task.designName}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs whitespace-nowrap ${
                            task.priority === 'high' ? 'border-rose-500 text-rose-500' :
                            task.priority === 'medium' ? 'border-amber-500 text-amber-500' :
                            'border-emerald-500 text-emerald-500'
                          }`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Due: {task.dueDate}</p>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workflow;
