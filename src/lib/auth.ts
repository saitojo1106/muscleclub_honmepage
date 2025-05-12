"use client";

import { supabase } from './supabase';
import { User, Session, AuthError, Provider, OAuthResponse } from '@supabase/supabase-js';

/**
 * Types for the auth system
 */
export interface AuthUser extends User {
  // Additional user profile data
  profile?: {
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'member' | 'guest';
  };
}

export interface AuthSession extends Omit<Session, 'user'> {
  user: AuthUser | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  full_name?: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  password: string;
}

export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | null;
  success: boolean;
}

/**
 * Authentication functions
 */

/**
 * Sign in with email and password
 */
export async function signInWithPassword(credentials: LoginCredentials): Promise<AuthResult<Session>> {
  try {
    // Supabase認証を使用
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    // Supabase認証が成功
    if (!error && data.session) {
      return {
        data: data.session,
        error: null,
        success: true,
      };
    }

    // Supabase認証失敗時に簡易認証をフォールバックとして使う場合（開発用）
    // if (process.env.NODE_ENV === 'development') {
    //   if (credentials.email === "admin@example.com" && credentials.password === "muscleclub2024") {
    //     // 開発環境用の簡易認証ロジック
    //     return {
    //       data: null, 
    //       error: null,
    //       success: true
    //     };
    //   }
    // }

    return {
      data: null,
      error,
      success: false,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      data: null,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('Magic link sign in error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: Provider): Promise<AuthResult<OAuthResponse>> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      data,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResult<Session>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name || '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      data: data.session,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    return {
      data: null,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(credentials: ResetPasswordCredentials): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return {
      data: null,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Update the user's password
 */
export async function updatePassword(credentials: UpdatePasswordCredentials): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: credentials.password,
    });

    return {
      data: null,
      error,
      success: !error,
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<AuthResult<Session>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      data: data.session,
      error,
      success: !error && !!data.session,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<AuthResult<User>> {
  try {
    const { data, error } = await supabase.auth.getUser();
    return {
      data: data.user,
      error,
      success: !error && !!data.user,
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      data: null,
      error: error as AuthError,
      success: false,
    };
  }
}

/**
 * Compatibility functions with old auth system
 */

// Legacy login function for backward compatibility
export async function login(username: string, password: string): Promise<boolean> {
  const result = await signInWithPassword({ email: username, password });
  return result.success;
}

// Legacy logout function for backward compatibility
export function logout(): void {
  signOut().catch(error => {
    console.error('Error during logout:', error);
  });
}

// Legacy isAuthenticated function for backward compatibility
export function isAuthenticated(): boolean {
  // This is a synchronous function, but Supabase Auth is async
  // For compatibility, we'll check if there's a session in localStorage
  if (typeof window === 'undefined') return false;
  
  try {
    // This is not ideal but maintains the synchronous nature of the original function
    const session = supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
}

/**
 * 現在のユーザーが管理者かチェック
 */
export async function isAdmin(): Promise<boolean> {
  const { data } = await getSession();
  return data?.user?.user_metadata?.role === 'admin' || false;
}
