import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Check, Factory as FactoryIcon } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Design {
  id: string;
  name: string;
}

interface Manufacturer {
  id: string;
  name: string;
  location: string | null;
  lead_time_days: number | null;
  price_range: string | null;
  specialties: string[] | null;
  sustainability_score: number | null;
}

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [showFactories, setShowFactories] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch manufacturers from database
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('manufacturers')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setManufacturers(data || []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load manufacturers');
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, []);

  const handleFactorySelect = (factory: Manufacturer) => {
    updateWorkflowData({
      selectedFactory: {
        id: factory.id,
        name: factory.name,
        location: factory.location || '',
        leadTime: factory.lead_time_days?.toString() || '',
        priceRange: factory.price_range || ''
      }
    });
    toast.success(`Selected ${factory.name}`);
  };

  const handleNext = () => {
    return true;
  };

  return (
    <div>
      <StageHeader
        icon={FactoryIcon}
        title="Find Your Manufacturing Partner"
        description="Select production quantity and preferences. We'll match you with the best factories for your needs."
        contextInfo={[
          { label: 'Design', value: 'Ready' },
          { label: 'Measurements', value: 'Complete' }
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Requirements */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Production Requirements</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={workflowData.quantity}
                      onChange={(e) => updateWorkflowData({ quantity: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Lead Time</Label>
                    <Select
                      value={workflowData.leadTime}
                      onValueChange={(value) => updateWorkflowData({ leadTime: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-6">4-6 weeks</SelectItem>
                        <SelectItem value="6-8">6-8 weeks</SelectItem>
                        <SelectItem value="8-12">8-12 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Location</Label>
                    <Select
                      value={workflowData.location}
                      onValueChange={(value) => updateWorkflowData({ location: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Price Range</Label>
                    <Select
                      value={workflowData.priceRange}
                      onValueChange={(value) => updateWorkflowData({ priceRange: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="mid">Mid-range</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Find Match Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setShowFactories(true)}
              className="gap-2"
            >
              <FactoryIcon className="w-4 h-4" />
              Find Your Match!
            </Button>
          </div>

          {/* Factory Results */}
          {showFactories && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Matched Factories</h3>
              {loading ? (
                <p className="text-muted-foreground">Loading manufacturers...</p>
              ) : manufacturers.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No manufacturers found</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {manufacturers.map((factory) => {
                    const isSelected = workflowData.selectedFactory?.id === factory.id;
                    
                    return (
                      <Card
                        key={factory.id}
                        className={`border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => handleFactorySelect(factory)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{factory.name}</h4>
                                {factory.sustainability_score && factory.sustainability_score >= 8 && (
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                    Top Match
                                  </Badge>
                                )}
                                {isSelected && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">Selected</Badge>
                                )}
                              </div>
                              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {factory.location || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {factory.lead_time_days || 'N/A'} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {factory.price_range || 'Varies'}
                                </span>
                              </div>
                              {factory.specialties && factory.specialties.length > 0 && (
                                <div className="flex gap-2 text-xs">
                                  {factory.specialties.slice(0, 3).map((specialty, idx) => (
                                    <span key={idx} className="flex items-center gap-1">
                                      <Check className="w-3 h-3 text-primary" />
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {factory.sustainability_score && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{factory.sustainability_score}</div>
                                <div className="text-xs text-muted-foreground">Rating</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <StageNavigation 
            onNext={handleNext}
            nextLabel="Continue to Sending"
            showBack={true}
          />
        </div>

        <div className="space-y-4">
          <FactoryCommunication />
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default FactoryMatchStage;
