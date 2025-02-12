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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          hometown: string | null
          stance: string | null
          skating_since: string | null
          total_sessions: number
          decks_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          hometown?: string | null
          stance?: string | null
          skating_since?: string | null
          total_sessions?: number
          decks_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          hometown?: string | null
          stance?: string | null
          skating_since?: string | null
          total_sessions?: number
          decks_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      skate_gear: {
        Row: {
          id: string
          user_id: string
          category: 'deck' | 'truck' | 'wheel' | 'bearing' | 'griptape' | 'tool'
          name: string
          brand: string
          specs: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'deck' | 'truck' | 'wheel' | 'bearing' | 'griptape' | 'tool'
          name: string
          brand: string
          specs?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'deck' | 'truck' | 'wheel' | 'bearing' | 'griptape' | 'tool'
          name?: string
          brand?: string
          specs?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skate_sessions: {
        Row: {
          id: string
          user_id: string
          place_name: string
          address: string | null
          session_date: string
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_name: string
          address?: string | null
          session_date: string
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_name?: string
          address?: string | null
          session_date?: string
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deck_details: {
        Row: {
          gear_id: string
          model: string
          size: string
          price: number | null
          purchase_date: string | null
          currently_using: 'Yes' | 'No' | 'Stock'
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          model: string
          size: string
          price?: number | null
          purchase_date?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          model?: string
          size?: string
          price?: number | null
          purchase_date?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
      truck_details: {
        Row: {
          gear_id: string
          width: string
          height: string
          color: string | null
          axle_type: string | null
          weight: number | null
          currently_using: 'Yes' | 'No' | 'Stock'
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          width: string
          height: string
          color?: string | null
          axle_type?: string | null
          weight?: number | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          width?: string
          height?: string
          color?: string | null
          axle_type?: string | null
          weight?: number | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
      wheel_details: {
        Row: {
          gear_id: string
          diameter: number
          durometer: string
          contact_patch: number | null
          color: string | null
          currently_using: 'Yes' | 'No' | 'Stock'
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          diameter: number
          durometer: string
          contact_patch?: number | null
          color?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          diameter?: number
          durometer?: string
          contact_patch?: number | null
          color?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
      bearing_details: {
        Row: {
          gear_id: string
          abec_rating: string | null
          material: string | null
          shields_type: string | null
          currently_using: 'Yes' | 'No' | 'Stock'
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          abec_rating?: string | null
          material?: string | null
          shields_type?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          abec_rating?: string | null
          material?: string | null
          shields_type?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
      griptape_details: {
        Row: {
          gear_id: string
          width: string
          length: string
          grit: string | null
          color: string | null
          currently_using: 'Yes' | 'No' | 'Stock'
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          width: string
          length: string
          grit?: string | null
          color?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          width?: string
          length?: string
          grit?: string | null
          color?: string | null
          currently_using?: 'Yes' | 'No' | 'Stock'
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
      tool_details: {
        Row: {
          gear_id: string
          tool_type: string
          material: string | null
          included_tools: string[] | null
          color: string | null
          condition: 'New' | 'Poor' | 'Brooken'
        }
        Insert: {
          gear_id: string
          tool_type: string
          material?: string | null
          included_tools?: string[] | null
          color?: string | null
          condition?: 'New' | 'Poor' | 'Brooken'
        }
        Update: {
          gear_id?: string
          tool_type?: string
          material?: string | null
          included_tools?: string[] | null
          color?: string | null
          condition?: 'New' | 'Poor' | 'Brooken'
        }
      }
    }
    Enums: {
      gear_category: 'deck' | 'truck' | 'wheel' | 'bearing' | 'griptape' | 'tool'
      usage_status: 'Yes' | 'No' | 'Stock'
      condition_status: 'New' | 'Poor' | 'Brooken'
    }
  }
}