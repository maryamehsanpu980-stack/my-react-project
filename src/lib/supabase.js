import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public client — respects RLS (use in frontend + public API routes)
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Service client — bypasses RLS (use ONLY in server-side API routes)
export function getServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);
}