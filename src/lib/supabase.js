import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://tijsmxzbigfaybjdwzat.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpanNteHpiaWdmYXliamR3emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTIxMzgsImV4cCI6MjA5MDg2ODEzOH0.1GkyokqFsu0GvRPg-k_6MIG8IF0vs76O83jNDifsvNo'
)
