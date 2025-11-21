import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Award, Clock, DollarSign, Check } from 'lucide-react';
import { Design, mockFactories } from '@/data/workflowData';

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  return (
    <div className="space-y-6">
      {/* Requirements Collection */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Factory Requirements</CardTitle>
          <CardDescription>Help us find the perfect manufacturer for your design</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity Needed</label>
              <input type="number" className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm" placeholder="e.g., 500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Lead Time</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm">
                <option>4-6 weeks</option>
                <option>6-8 weeks</option>
                <option>8-12 weeks</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location Preference</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm">
                <option>Any</option>
                <option>Europe</option>
                <option>Asia</option>
                <option>Americas</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sustainability</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm">
                <option>GOTS certified</option>
                <option>Organic only</option>
                <option>No preference</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price Range</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm">
                <option>Budget ($10-$15)</option>
                <option>Mid-range ($15-$25)</option>
                <option>Premium ($25+)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fabric Type</label>
              <select className="w-full p-2 bg-muted/50 border border-border rounded-lg text-sm">
                <option>Cotton</option>
                <option>Linen</option>
                <option>Silk</option>
                <option>Synthetic</option>
              </select>
            </div>
          </div>
          <Button className="w-full mt-4">Find Matching Factories</Button>
        </CardContent>
      </Card>

      {/* Factory Matches */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Top Factory Matches</h3>
        <div className="grid grid-cols-1 gap-4">
          {mockFactories.map((factory) => (
            <Card key={factory.id} className="border-border hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {factory.name}
                      {factory.score >= 90 && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Top Match</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
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
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{factory.score}</div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {factory.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {factory.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
                  <span className="text-sm text-foreground">Minimum Order Quantity</span>
                  <span className="font-medium text-foreground">{factory.minOrder} units</span>
                </div>
                <Button className="w-full">Select This Factory</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FactoryMatchStage;
