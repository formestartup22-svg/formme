import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Design, mockFactories } from '@/data/workflowData';

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  return (
    <div className="flex gap-4">
      {/* Left Sidebar - Filters */}
      <Card className="w-64 shrink-0 border-border">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Quantity</Label>
            <Input type="number" placeholder="500" className="h-8 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Lead Time</Label>
            <Select defaultValue="4-6">
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-6">4-6 weeks</SelectItem>
                <SelectItem value="6-8">6-8 weeks</SelectItem>
                <SelectItem value="8-12">8-12 weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Select defaultValue="any">
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Price Range</Label>
            <Select defaultValue="budget">
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget ($10-$15)</SelectItem>
                <SelectItem value="mid">Mid-range ($15-$25)</SelectItem>
                <SelectItem value="premium">Premium ($25+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Find Factories
          </Button>
        </CardContent>
      </Card>

      {/* Right - Factory Results */}
      <div className="flex-1 space-y-3">
        {mockFactories.map((factory) => (
          <Card key={factory.id} className="border-border hover:border-emerald-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base">{factory.name}</h3>
                    {factory.score >= 90 && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        Top Match
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {factory.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {factory.leadTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {factory.priceRange}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{factory.score}</div>
                  <div className="text-xs text-muted-foreground">Match</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Strengths</p>
                  {factory.strengths.slice(0, 2).map((strength, idx) => (
                    <p key={idx} className="text-xs flex items-start gap-1.5 mb-1">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Considerations</p>
                  {factory.weaknesses.slice(0, 2).map((weakness, idx) => (
                    <p key={idx} className="text-xs flex items-start gap-1.5 mb-1">
                      <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{weakness}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded text-xs">
                <span>Min Order</span>
                <span className="font-semibold">{factory.minOrder} units</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Select Factory
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FactoryMatchStage;
