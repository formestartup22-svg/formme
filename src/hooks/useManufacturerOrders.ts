import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  design_id: string;
  designer_id: string;
  manufacturer_id: string | null;
  quantity: number | null;
  status: string | null;
  created_at: string;
  designs: {
    name: string;
    user_id: string;
  };
  profiles: {
    full_name: string | null;
  };
}

export const useManufacturerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get manufacturer record for this user
      const { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!manufacturer) {
        setLoading(false);
        return;
      }

      // Fetch orders for this manufacturer
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          designs (
            name,
            user_id
          )
        `)
        .eq('manufacturer_id', manufacturer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch designer profiles separately
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', order.designer_id)
            .single();
          
          return {
            ...order,
            profiles: profile || { full_name: null }
          };
        })
      );

      setOrders(ordersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, refetch: fetchOrders };
};
