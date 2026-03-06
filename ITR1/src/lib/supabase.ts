import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

// Cast of the same client for tables not yet in generated Database types (documents, notifications, org_settings)
// Uses the SAME instance — no duplicate GoTrue/auth session conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseUntyped = supabase as any
