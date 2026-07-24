import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
// Dukung nama kunci baru (publishable) maupun lama (anon).
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

// Jika env belum diisi, supabase = null → aplikasi memakai data lokal (siteplan.js).
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseReady = Boolean(supabase)
