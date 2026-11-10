import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type GlobalSupabaseAdmin = typeof globalThis & {
  __supabaseAdmin?: SupabaseClient<Database>
}

const globalSupabaseAdmin = globalThis as GlobalSupabaseAdmin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin =
  globalSupabaseAdmin.__supabaseAdmin ??
  createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

globalSupabaseAdmin.__supabaseAdmin = supabaseAdmin