// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Supabase の URL と Anon Key を環境変数から取得
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabase クライアントの作成
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
