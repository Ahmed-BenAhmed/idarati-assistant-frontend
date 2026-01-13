import { createClient, SupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseEnv() {
  const meta = typeof import.meta !== "undefined" ? (import.meta as any).env || {} : {};
  const proc = typeof process !== "undefined" ? (process as any).env || {} : {};

  const url = meta.VITE_SUPABASE_URL || meta.REACT_APP_SUPABASE_URL || proc.VITE_SUPABASE_URL || proc.REACT_APP_SUPABASE_URL;
  const key = meta.VITE_SUPABASE_ANON_KEY || meta.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || proc.VITE_SUPABASE_ANON_KEY || proc.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  return { url, key };
}

const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseEnv();

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;
