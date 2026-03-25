import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fmurufnmzggarxthgzix.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p3ydNrj75e3TYbkSr3YZ7Q_YCINHTUY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
