"use client";

import Link from 'next/link';
import { ThemeSwitcher } from './theme-switcher';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
}

// デフォルト値
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signInWithPassword: async () => ({ success: false, error: null }),
  signOut: async () => {},
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(session?.user?.user_metadata?.role === 'admin' ?? false);
      } catch (error) {
        console.error('初期セッション取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(session?.user?.user_metadata?.role === 'admin' ?? false);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ログイン関数
  const signInWithPassword = async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('ログインエラー:', error);
      return { 
        success: false, 
        error: error as AuthError 
      };
    }
  };

  // ログアウト関数
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAdmin,
    signInWithPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default function Header() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              マッスルクラブ
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ホーム
            </Link>
            <Link href="/members" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              部員紹介
            </Link>
            <Link href="/achievements" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              大会実績
            </Link>
            <Link href="/posts" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ブログ
            </Link>
            <Link href="/events" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              イベント
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <Link 
              href="/admin" 
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              管理者
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}