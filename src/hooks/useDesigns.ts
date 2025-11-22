import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Design {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  category: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useDesigns = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDesigns(data || []);
    } catch (error: any) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  return { designs, loading, refetch: fetchDesigns };
};
