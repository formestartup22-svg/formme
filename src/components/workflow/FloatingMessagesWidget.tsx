import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FactoryMessaging } from './FactoryMessaging';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FloatingMessagesWidgetProps {
  designId: string;
}

export const FloatingMessagesWidget: React.FC<FloatingMessagesWidgetProps> = ({ designId }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchSelectedManufacturer();
  }, [designId]);

  useEffect(() => {
    if (!orderId) return;

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          // Only count messages not sent by current user
          if (payload.new.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchSelectedManufacturer = async () => {
    // Get the order with manufacturer_review status (finalized manufacturer)
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        manufacturer_id,
        manufacturers (
          id,
          name,
          location
        )
      `)
      .eq('design_id', designId)
      .eq('status', 'manufacturer_review')
      .maybeSingle();

    if (order?.manufacturers) {
      setSelectedManufacturer(order.manufacturers);
      setOrderId(order.id);
    }
  };

  const fetchUnreadCount = async () => {
    if (!orderId) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)
      .neq('sender_id', user?.id)
      .eq('is_read', false);

    setUnreadCount(count || 0);
  };

  const handleOpenChat = () => {
    setOpen(true);
    // Mark messages as read when opening
    markMessagesAsRead();
  };

  const markMessagesAsRead = async () => {
    if (!orderId) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .neq('sender_id', user?.id)
      .eq('is_read', false);

    setUnreadCount(0);
  };

  // Don't show widget if no manufacturer selected
  if (!selectedManufacturer || !orderId) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpenChat}
          className="flex items-center gap-3 bg-[#262626] hover:bg-[#363636] text-white px-6 py-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-destructive text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <span className="font-medium">Messages</span>
          
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
              {selectedManufacturer.name.charAt(0)}
            </div>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <div className="p-2">
            <h2 className="text-lg font-semibold mb-4">Chat with {selectedManufacturer.name}</h2>
            {orderId && (
              <FactoryMessaging
                designId={designId}
                orderId={orderId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
