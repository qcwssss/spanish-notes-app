import { createBrowserClient as createBrowserClientSupabase } from '@supabase/ssr'
import { getSupabaseConfig } from './config'

export function createBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  return createBrowserClientSupabase(supabaseUrl, supabaseAnonKey)
}
