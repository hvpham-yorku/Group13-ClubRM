import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Untyped client for tables not yet in generated Database types (documents, notifications, org_settings)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseUntyped = createClient(supabaseUrl, supabaseAnonKey) as any
