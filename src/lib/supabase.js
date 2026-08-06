import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aulbrnhlrnspaaglykpi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bGJybmhscm5zcGFhZ2x5a3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODcxMjUsImV4cCI6MjEwMTU2MzEyNX0.aUbZBc-w6BKcCDMq-n-vyLkrnqc5O1WZeeGdSi4Mogk';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
