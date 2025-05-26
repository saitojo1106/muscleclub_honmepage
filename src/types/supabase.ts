export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: number
          title: string
          date: string
          location: string
          description: string | null
          requirements: string | null
          fee: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          date: string
          location: string
          description?: string | null
          requirements?: string | null
          fee?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          date?: string
          location?: string
          description?: string | null
          requirements?: string | null
          fee?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: number
          name: string
          role: string
          bio: string
          image_url: string | null
          joined_year: number
        }
        Insert: {
          id?: number
          name: string
          role: string
          bio: string
          image_url?: string | null
          joined_year: number
        }
        Update: {
          id?: number
          name?: string
          role?: string
          bio?: string
          image_url?: string | null
          joined_year?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

