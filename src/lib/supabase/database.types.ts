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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          brand: string
          model: string
          category: string
          region: string | null
          product_type: string | null
          accessories: Json | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          brand: string
          model: string
          category: string
          region?: string | null
          product_type?: string | null
          accessories?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          brand?: string
          model?: string
          category?: string
          region?: string | null
          product_type?: string | null
          accessories?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          company: string
          name: string
          cif: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string
          phone: string | null
          business_email: string | null
          approved: boolean
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          company: string
          name: string
          cif?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          phone?: string | null
          business_email?: string | null
          approved?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company?: string
          name?: string
          cif?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          phone?: string | null
          business_email?: string | null
          approved?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: string
          total_amount: number
          shipping_cost: number
          shipping_type: string
          shipping_country: string
          shipping_speed: string
          payment_method: string
          shipping_info: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: string
          total_amount: number
          shipping_cost?: number
          shipping_type: string
          shipping_country: string
          shipping_speed: string
          payment_method: string
          shipping_info: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: string
          total_amount?: number
          shipping_cost?: number
          shipping_type?: string
          shipping_country?: string
          shipping_speed?: string
          payment_method?: string
          shipping_info?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          selected_storage: string
          selected_color: string
          selected_condition: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          selected_storage: string
          selected_color: string
          selected_condition: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          selected_storage?: string
          selected_color?: string
          selected_condition?: string
          created_at?: string
        }
      }
      product_variations: {
        Row: {
          id: string
          product_id: string
          storage: string
          color: string
          condition: string
          product_type: string
          price: number
          stock_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage: string
          color: string
          condition: string
          product_type: string
          price: number
          stock_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage?: string
          color?: string
          condition?: string
          product_type?: string
          price?: number
          stock_quantity?: number
          created_at?: string
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
