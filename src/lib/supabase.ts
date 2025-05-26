import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// 環境変数を最初に定義
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 環境変数のバリデーション
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
}

// Supabaseクライアントインスタンスをエクスポート
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
