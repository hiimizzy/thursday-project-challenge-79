
import { createClient } from '@supabase/supabase-js'

// Temporary Supabase client - this will be replaced by the integration files
const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
