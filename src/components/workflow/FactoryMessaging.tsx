import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Factory } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_designer: boolean;
}

interface FactoryMessagingProps {
  designId: string;
  orderId?: string;
}

export const FactoryMessaging = ({ designId, orderId }: FactoryMessagingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!orderId || !currentUserId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        // First get the order to determine designer_id
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('designer_id')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages from designer (not from current user perspective)
        const messagesWithRole = data.map(msg => ({
          ...msg,
          is_designer: msg.sender_id === orderData.designer_id
        }));

        setMessages(messagesWithRole);
      } catch (error: any) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Get designer_id to properly mark messages
          const { data: orderData } = await supabase
            .from('orders')
            .select('designer_id')
            .eq('id', orderId)
            .single();
          
          setMessages(prev => [...prev, {
            ...newMsg,
            is_designer: newMsg.sender_id === orderData?.designer_id
          }]);
          
          // Scroll to bottom
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !orderId || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent');
      
      // Immediately add the message to the local state for instant feedback
      const { data: orderData } = await supabase
        .from('orders')
        .select('designer_id')
        .eq('id', orderId)
        .single();

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        is_designer: currentUserId === orderData?.designer_id
      };

      setMessages(prev => [...prev, tempMessage]);
      
      // Scroll to bottom immediately
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!orderId) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Factory Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Send your order to a manufacturer to start messaging
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[500px] px-6">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender_id !== currentUserId && (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Factory className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleDateString([], {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {msg.sender_id === currentUserId && (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="p-6 pt-4 border-t bg-background">
        <div className="flex gap-3 items-end">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="resize-none min-h-[60px]"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="lg"
            className="shrink-0 h-[60px] w-[60px] rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};