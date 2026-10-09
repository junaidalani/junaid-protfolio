import { createClient } from '@supabase/supabase-js';

// Public-by-design values: the anon key ships in the browser bundle and the
// database's row level security only allows public reads.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);
