import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { mockDesigns, mockTasks, stageNames } from '@/data/workflowData';
import { Plus, ChevronDown, Clock } from 'lucide-react';

const Workflow = () => {
  const [expandedDesigns, setExpandedDesigns] = useState<string[]>([]);

  const toggleDesign = (id: string) => {
    setExpandedDesigns(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Group designs by stage
  const designsByStage = {
    'tech-pack': mockDesigns.filter(d => d.stage === 'tech-pack'),
    'factory-match': mockDesigns.filter(d => d.stage === 'factory-match'),
    'sample': mockDesigns.filter(d => d.stage === 'sample'),
    'production': mockDesigns.filter(d => d.stage === 'production' || d.stage === 'quality'),
  };

  // Get tasks for a design
  const getDesignTasks = (designId: string) => {
    return mockTasks.filter(t => t.designId === designId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-primary/10 text-primary border-primary/20';
      case 'delayed': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'action-required': return 'bg-accent/10 text-accent border-accent/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-accent text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-primary text-white';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Production Workflow</h1>
            <p className="text-muted-foreground">Track your designs from concept to delivery</p>
          </div>
          <Button className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4" />
            New Design
          </Button>
        </div>

        {/* Subtle Stage Summary */}
        <div className="flex gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Tech Pack</span>
            <span className="font-semibold text-foreground">{designsByStage['tech-pack'].length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Factory Match</span>
            <span className="font-semibold text-foreground">{designsByStage['factory-match'].length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Sampling</span>
            <span className="font-semibold text-foreground">{designsByStage['sample'].length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Production & QC</span>
            <span className="font-semibold text-foreground">{designsByStage['production'].length}</span>
          </div>
        </div>

        {/* Pipeline Sections */}
        <div className="space-y-8">
          {/* Tech Pack Section */}
          {designsByStage['tech-pack'].length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                Tech Pack ({designsByStage['tech-pack'].length})
              </h2>
              <div className="space-y-3">
                {designsByStage['tech-pack'].map((design) => {
                  const tasks = getDesignTasks(design.id);
                  const isExpanded = expandedDesigns.includes(design.id);
                  
                  return (
                    <Collapsible key={design.id} open={isExpanded} onOpenChange={() => toggleDesign(design.id)}>
                      <Card className="border-border hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-base">{design.name}</CardTitle>
                                <Badge variant="outline" className={getStatusColor(design.status) + ' text-xs'}>
                                  {design.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{design.nextAction}</p>
                              
                              {/* Progress Bar */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${design.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{design.progress}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link to={`/design/${design.id}`}>Open</Link>
                              </Button>
                              
                              {tasks.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button size="sm" variant="ghost" className="gap-1">
                                    <span className="text-xs">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {/* Collapsible Tasks */}
                        {tasks.length > 0 && (
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="border-t pt-3 space-y-2">
                                {tasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">{task.action}</p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        Due {task.dueDate}
                                      </p>
                                    </div>
                                    <Badge className={getPriorityBadge(task.priority) + ' text-xs'}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        )}
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </section>
          )}

          {/* Factory Match Section */}
          {designsByStage['factory-match'].length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                Factory Match ({designsByStage['factory-match'].length})
              </h2>
              <div className="space-y-3">
                {designsByStage['factory-match'].map((design) => {
                  const tasks = getDesignTasks(design.id);
                  const isExpanded = expandedDesigns.includes(design.id);
                  
                  return (
                    <Collapsible key={design.id} open={isExpanded} onOpenChange={() => toggleDesign(design.id)}>
                      <Card className="border-border hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-base">{design.name}</CardTitle>
                                <Badge variant="outline" className={getStatusColor(design.status) + ' text-xs'}>
                                  {design.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{design.nextAction}</p>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${design.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{design.progress}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link to={`/design/${design.id}`}>Open</Link>
                              </Button>
                              
                              {tasks.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button size="sm" variant="ghost" className="gap-1">
                                    <span className="text-xs">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {tasks.length > 0 && (
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="border-t pt-3 space-y-2">
                                {tasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">{task.action}</p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        Due {task.dueDate}
                                      </p>
                                    </div>
                                    <Badge className={getPriorityBadge(task.priority) + ' text-xs'}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        )}
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            </section>
          )}

          {/* Continue with other sections... */}
          {['sample', 'production'].map((stageKey) => {
            const designs = designsByStage[stageKey as keyof typeof designsByStage];
            if (designs.length === 0) return null;

            const sectionTitle = stageKey === 'sample' ? 'Sampling' : 'Production & QC';
            
            return (
              <section key={stageKey}>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  {sectionTitle} ({designs.length})
                </h2>
                <div className="space-y-3">
                  {designs.map((design) => {
                    const tasks = getDesignTasks(design.id);
                    const isExpanded = expandedDesigns.includes(design.id);
                    
                    return (
                      <Collapsible key={design.id} open={isExpanded} onOpenChange={() => toggleDesign(design.id)}>
                        <Card className="border-border hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-base">{design.name}</CardTitle>
                                  <Badge variant="outline" className={getStatusColor(design.status) + ' text-xs'}>
                                    {design.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{design.nextAction}</p>
                                
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${design.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{design.progress}%</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/design/${design.id}`}>Open</Link>
                                </Button>
                                
                                {tasks.length > 0 && (
                                  <CollapsibleTrigger asChild>
                                    <Button size="sm" variant="ghost" className="gap-1">
                                      <span className="text-xs">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>
                                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </Button>
                                  </CollapsibleTrigger>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {tasks.length > 0 && (
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="border-t pt-3 space-y-2">
                                  {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{task.action}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                          <Clock className="w-3 h-3" />
                                          Due {task.dueDate}
                                        </p>
                                      </div>
                                      <Badge className={getPriorityBadge(task.priority) + ' text-xs'}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          )}
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Workflow;
