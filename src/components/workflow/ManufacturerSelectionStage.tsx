import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Clock, XCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FactoryMessaging } from './FactoryMessaging';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';

interface ManufacturerMatch {
  id: string;
  manufacturer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  score: number | null;
  manufacturers: {
    name: string;
    location: string | null;
    price_range: string | null;
    rating: number | null;
  };
  orders: Array<{
    id: string;
  }>;
}

interface ManufacturerSelectionStageProps {
  design: {
    id: string;
    name: string;
  };
}

export const ManufacturerSelectionStage = ({ design }: ManufacturerSelectionStageProps) => {
  const [matches, setMatches] = useState<ManufacturerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [currentChatOrderId, setCurrentChatOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { markStageComplete } = useWorkflow();

  useEffect(() => {
    fetchMatches();

    // Set up real-time subscription for match updates
    const channel = supabase
      .channel(`manufacturer-matches-${design.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturer_matches',
          filter: `design_id=eq.${design.id}`
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  const fetchMatches = async () => {
    try {
      console.log('[ManufacturerSelectionStage] Fetching matches for design:', design.id);
      
      const { data, error } = await supabase
        .from('manufacturer_matches')
        .select(`
          *,
          manufacturers (
            name,
            location,
            price_range,
            rating
          )
        `)
        .eq('design_id', design.id)
        .order('created_at', { ascending: false });

      console.log('[ManufacturerSelectionStage] Matches query result:', { data, error });

      if (error) throw error;

      // For each match, fetch the corresponding order
      const matchesWithOrders = await Promise.all(
        (data || []).map(async (match: any) => {
          const { data: order } = await supabase
            .from('orders')
            .select('id')
            .eq('design_id', design.id)
            .eq('manufacturer_id', match.manufacturer_id)
            .maybeSingle();
          
          return {
            ...match,
            orders: order ? [order] : []
          };
        })
      );

      console.log('[ManufacturerSelectionStage] Matches with orders:', matchesWithOrders);
      setMatches(matchesWithOrders as any);

      // Check if a manufacturer is already selected in the order
      const { data: order } = await supabase
        .from('orders')
        .select('manufacturer_id')
        .eq('design_id', design.id)
        .maybeSingle();

      console.log('[ManufacturerSelectionStage] Order query result:', order);

      if (order?.manufacturer_id) {
        setSelectedManufacturer(order.manufacturer_id);
      }
    } catch (error: any) {
      console.error('[ManufacturerSelectionStage] Error fetching matches:', error);
      toast.error('Failed to load manufacturer matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectManufacturer = async (manufacturerId: string) => {
    try {
      // Update order with selected manufacturer
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('design_id', design.id)
        .maybeSingle();

      if (order) {
        const { error } = await supabase
          .from('orders')
          .update({ manufacturer_id: manufacturerId })
          .eq('id', order.id);

        if (error) throw error;
      }

      setSelectedManufacturer(manufacturerId);
      toast.success('Manufacturer selected successfully!');
    } catch (error: any) {
      console.error('Error selecting manufacturer:', error);
      toast.error('Failed to select manufacturer');
    }
  };

  const handleOpenChat = (orderId: string) => {
    console.log('[ManufacturerSelectionStage] Opening chat with order ID:', orderId);
    setCurrentChatOrderId(orderId);
    setChatDialogOpen(true);
  };

  const handleProceed = async () => {
    if (!selectedManufacturer) {
      toast.error('Please select a manufacturer before proceeding');
      return false;
    }

    // Check if selected manufacturer has accepted
    const selectedMatch = matches.find(m => m.manufacturer_id === selectedManufacturer);
    if (selectedMatch?.status !== 'accepted') {
      toast.error('Please wait for the selected manufacturer to accept your request');
      return false;
    }

    markStageComplete('send-tech-pack');
    return true;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <StageHeader
        icon={Clock}
        title="Waiting for Manufacturer Approval"
        description="View all manufacturers you've sent requests to, chat with them, and select your preferred manufacturer once they accept."
      />

      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading manufacturers...</p>
            ) : matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No manufacturer requests found</p>
                <Button onClick={() => navigate(`/workflow?designId=${design.id}&stage=factory-match`)}>
                  Find Manufacturers
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className={`${selectedManufacturer === match.manufacturer_id ? 'border-primary border-2' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => {
                      console.log('[Card Click] Match:', match);
                      console.log('[Card Click] Orders:', match.orders);
                      if (match.orders && match.orders.length > 0) {
                        handleOpenChat(match.orders[0].id);
                      } else {
                        console.warn('[Card Click] No orders found for this match');
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{match.manufacturers.name}</h3>
                            {getStatusBadge(match.status)}
                            {selectedManufacturer === match.manufacturer_id && (
                              <Badge variant="outline" className="border-primary text-primary">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                            {match.manufacturers.location && (
                              <span>📍 {match.manufacturers.location}</span>
                            )}
                            {match.manufacturers.price_range && (
                              <span>💰 {match.manufacturers.price_range}</span>
                            )}
                            {match.manufacturers.rating && (
                              <span>⭐ {match.manufacturers.rating}/5</span>
                            )}
                            {match.score && (
                              <span>🎯 Match Score: {Math.round(match.score)}/100</span>
                            )}
                          </div>

                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {match.status === 'accepted' && selectedManufacturer !== match.manufacturer_id && (
                              <Button
                                size="sm"
                                onClick={() => handleSelectManufacturer(match.manufacturer_id)}
                              >
                                Select This Manufacturer
                              </Button>
                            )}
                            
                            {match.status === 'pending' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Waiting for manufacturer response...
                              </div>
                            )}
                            
                            {match.status === 'rejected' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <XCircle className="w-4 h-4" />
                                Manufacturer declined this request
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Want to send requests to more manufacturers?
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/workflow?designId=${design.id}&stage=factory-match`)}
                      className="gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Back to Manufacturer Selection
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <StageNavigation
          nextLabel="Continue to Review Timeline"
          onNext={handleProceed}
          showBack={true}
        />
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>
              {matches.find(m => m.orders?.[0]?.id === currentChatOrderId)?.manufacturers.name || 'Chat with Manufacturer'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {currentChatOrderId && (
              <FactoryMessaging designId={design.id} orderId={currentChatOrderId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
