-- Enable realtime for orders table (for production status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for production_updates table
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_updates;

-- Set REPLICA IDENTITY FULL for better realtime updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.production_updates REPLICA IDENTITY FULL;