-- =================================================================
-- CLEANUP UNUSED user_sessions TABLE
-- =================================================================
-- Run this in Supabase SQL Editor to remove the problematic table

-- Drop the user_sessions table since we're using localStorage only
DROP TABLE IF EXISTS public.user_sessions CASCADE;

-- Verify it's gone
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_sessions';