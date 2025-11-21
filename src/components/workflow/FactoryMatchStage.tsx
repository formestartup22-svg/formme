import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Check, AlertCircle, Filter, Search } from 'lucide-react';
import { Design, mockFactories } from '@/data/workflowData';

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  const [quantity, setQuantity] = useState('500');
  const [leadTime, setLeadTime] = useState('4-6 weeks');
  const [location, setLocation] = useState('any');
  const [sustainability, setSustainability] = useState('gots');
  const [priceRange, setPriceRange] = useState('budget');
  const [fabricType, setFabricType] = useState('cotton');

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Filters */}
      <Card className="w-80 shrink-0 border-border sticky top-6 h-fit">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Filter Factories</CardTitle>
          </div>
          <CardDescription>Refine your search criteria</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">Quantity Needed</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 500"
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">Minimum order quantity</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTime" className="text-sm font-medium">Lead Time</Label>
            <Select value={leadTime} onValueChange={setLeadTime}>
              <SelectTrigger id="leadTime" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-6 weeks">4-6 weeks</SelectItem>
                <SelectItem value="6-8 weeks">6-8 weeks</SelectItem>
                <SelectItem value="8-12 weeks">8-12 weeks</SelectItem>
                <SelectItem value="12+ weeks">12+ weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Location</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sustainability" className="text-sm font-medium">Sustainability</Label>
            <Select value={sustainability} onValueChange={setSustainability}>
              <SelectTrigger id="sustainability" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gots">GOTS Certified</SelectItem>
                <SelectItem value="organic">Organic Only</SelectItem>
                <SelectItem value="fair-trade">Fair Trade</SelectItem>
                <SelectItem value="any">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange" className="text-sm font-medium">Price Range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger id="priceRange" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget ($10-$15)</SelectItem>
                <SelectItem value="mid">Mid-range ($15-$25)</SelectItem>
                <SelectItem value="premium">Premium ($25+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fabricType" className="text-sm font-medium">Fabric Type</Label>
            <Select value={fabricType} onValueChange={setFabricType}>
              <SelectTrigger id="fabricType" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="linen">Linen</SelectItem>
                <SelectItem value="silk">Silk</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
                <SelectItem value="wool">Wool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full gap-2">
            <Search className="w-4 h-4" />
            Find Factories
          </Button>
        </CardContent>
      </Card>

      {/* Right - Factory Results */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Top Matches</h3>
            <p className="text-sm text-muted-foreground mt-1">{mockFactories.length} factories found</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Check className="w-3 h-3" />
            {mockFactories.length} matches
          </Badge>
        </div>

        <div className="space-y-4">
          {mockFactories.map((factory, index) => (
            <Card key={factory.id} className="border-border hover:border-primary/50 transition-all group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{factory.name}</CardTitle>
                      {factory.score >= 90 && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Top Match
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {factory.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        {factory.leadTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-primary" />
                        {factory.priceRange}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-bold text-primary">{factory.score}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Match</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <h4 className="text-sm font-semibold text-foreground">Strengths</h4>
                    </div>
                    <ul className="space-y-2">
                      {factory.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-accent rounded-full" />
                      <h4 className="text-sm font-semibold text-foreground">Considerations</h4>
                    </div>
                    <ul className="space-y-2">
                      {factory.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm font-medium text-foreground">Minimum Order</span>
                  <span className="text-lg font-bold text-foreground">{factory.minOrder} units</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1">Select Factory</Button>
                  <Button variant="outline" className="flex-1">Request Quote</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FactoryMatchStage;
