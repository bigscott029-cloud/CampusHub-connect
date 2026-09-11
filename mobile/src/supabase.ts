import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ynxcisktlwnghozprpab.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3WQuja0WVmPGDQ62vLS0YA_2CASwmTg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
