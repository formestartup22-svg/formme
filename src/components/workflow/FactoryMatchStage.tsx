import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Check, Factory as FactoryIcon, Star } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateMatchScore } from '@/utils/matchingAlgorithm';

interface Design {
  id: string;
  name: string;
  category?: string;
}

interface Manufacturer {
  id: string;
  name: string;
  location: string | null;
  lead_time_days: number | null;
  price_range: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  min_order_quantity: number | null;
  max_capacity: number | null;
  rating: number | null;
}

interface ManufacturerWithScore extends Manufacturer {
  matchScore: number;
}

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [showFactories, setShowFactories] = useState(false);
  const [manufacturers, setManufacturers] = useState<ManufacturerWithScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [designCategory, setDesignCategory] = useState<string>('');

  // Fetch design category
  useEffect(() => {
    const fetchDesignCategory = async () => {
      const { data, error } = await supabase
        .from('designs')
        .select('category')
        .eq('id', design.id)
        .single();
      
      if (!error && data?.category) {
        setDesignCategory(data.category);
      }
    };

    fetchDesignCategory();
  }, [design.id]);

  const calculateAndSortManufacturers = (manufacturersList: Manufacturer[], applyFilters: boolean = true): ManufacturerWithScore[] => {
    // Filter by category first only if filters are applied
    let filtered = manufacturersList;
    
    if (designCategory && applyFilters && !viewAll) {
      filtered = manufacturersList.filter(m => 
        m.certifications?.some(cert => 
          cert.toLowerCase().includes(designCategory.toLowerCase()) ||
          designCategory.toLowerCase().includes(cert.toLowerCase())
        )
      );
    }

    // Calculate match scores
    const withScores = filtered.map(manufacturer => {
      const matchScore = calculateMatchScore(
        {
          quantity: parseInt(workflowData.quantity || '0'),
          leadTime: workflowData.leadTime || '4-6',
          location: workflowData.location || 'any',
          priceRange: workflowData.priceRange || 'mid'
        },
        {
          moq: manufacturer.min_order_quantity || 0,
          maxCapacity: manufacturer.max_capacity || undefined,
          leadTime: manufacturer.lead_time_days || 30,
          location: manufacturer.location || '',
          priceTier: manufacturer.price_range || 'mid',
          rating: manufacturer.rating || undefined
        }
      );

      return { ...manufacturer, matchScore };
    });

    // Sort by match score descending
    return withScores.sort((a, b) => b.matchScore - a.matchScore);
  };

  const fetchFilteredManufacturers = async () => {
    try {
      setLoading(true);
      setShowFactories(true);
      
      let query = supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      // Apply filters based on user criteria
      if (workflowData.location && workflowData.location !== 'any') {
        query = query.ilike('location', `%${workflowData.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter by custom price range if specified
      let filtered = data || [];
      if (workflowData.minPrice || workflowData.maxPrice) {
        filtered = filtered.filter(m => {
          if (!m.price_range) return true;
          
          // Extract price from format like "$15-$30 per unit"
          const priceMatch = m.price_range.match(/\$(\d+)-\$(\d+)/);
          if (priceMatch) {
            const manufacturerMin = parseInt(priceMatch[1]);
            const manufacturerMax = parseInt(priceMatch[2]);
            const userMin = workflowData.minPrice ? parseInt(workflowData.minPrice) : 0;
            const userMax = workflowData.maxPrice ? parseInt(workflowData.maxPrice) : Infinity;
            
            // Check if ranges overlap
            return manufacturerMin <= userMax && manufacturerMax >= userMin;
          }
          return true;
        });
      }
      
      const manufacturersWithScores = calculateAndSortManufacturers(filtered, true);
      setManufacturers(manufacturersWithScores);
      setViewAll(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllManufacturers = async () => {
    try {
      setLoading(true);
      setShowFactories(true);
      
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      setViewAll(true);
      const manufacturersWithScores = calculateAndSortManufacturers(data || [], false);
      setManufacturers(manufacturersWithScores);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

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
                    <Label className="text-xs mb-1.5 block">Min Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={workflowData.minPrice || ''}
                      onChange={(e) => updateWorkflowData({ minPrice: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Max Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={workflowData.maxPrice || ''}
                      onChange={(e) => updateWorkflowData({ maxPrice: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Find Match Button */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={fetchFilteredManufacturers}
              className="gap-2"
            >
              <FactoryIcon className="w-4 h-4" />
              Find Your Match!
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={fetchAllManufacturers}
              className="gap-2"
            >
              View All Manufacturers
            </Button>
          </div>

          {/* Factory Results */}
          {showFactories && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {viewAll ? 'All Manufacturers' : 'Matched Factories'}
              </h3>
              {loading ? (
                <p className="text-muted-foreground">Loading manufacturers...</p>
              ) : manufacturers.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {viewAll 
                      ? 'No manufacturers exist in the database' 
                      : 'No such manufacturers exist matching your criteria. Try adjusting your filters or view all manufacturers.'}
                  </p>
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
                                {factory.matchScore >= 80 && (
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
                                {factory.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {factory.rating.toFixed(1)}
                                  </span>
                                )}
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
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{factory.matchScore}</div>
                              <div className="text-xs text-muted-foreground">Match Score</div>
                            </div>
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
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default FactoryMatchStage;
