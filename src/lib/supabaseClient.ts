// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Supabase の URL と Anon Key を環境変数から取得
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;


// Supabase クライアントの作成
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default supabase;
