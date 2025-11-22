import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'designer' | 'manufacturer' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Check user_roles table for role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        setRole(data?.role as UserRole || null);
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  return { role, loading };
};
