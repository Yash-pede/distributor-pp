export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string
          created_at: string
          distributor_id: string
          email: string | null
          full_name: string
          id: number
          phone: string
          sales_id: string
          specialization: string | null
        }
        Insert: {
          address: string
          created_at?: string
          distributor_id: string
          email?: string | null
          full_name: string
          id?: number
          phone: string
          sales_id: string
          specialization?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          distributor_id?: string
          email?: string | null
          full_name?: string
          id?: number
          phone?: string
          sales_id?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_id: string
          created_at: string
          distributor_id: string
          id: number
          product_id: number
          quantity: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          distributor_id: string
          id?: number
          product_id: number
          quantity: number
          updated_at: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          distributor_id?: string
          id?: number
          product_id?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          author: string
          created_at: string
          data: Json | null
          id: number
          meta: Json | null
          metaData: Json | null
          previousData: Json | null
          resource: string
        }
        Insert: {
          action: string
          author: string
          created_at?: string
          data?: Json | null
          id?: number
          meta?: Json | null
          metaData?: Json | null
          previousData?: Json | null
          resource: string
        }
        Update: {
          action?: string
          author?: string
          created_at?: string
          data?: Json | null
          id?: number
          meta?: Json | null
          metaData?: Json | null
          previousData?: Json | null
          resource?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          distributor_id: string
          id: number
          order: Json
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string
          distributor_id: string
          id?: number
          order: Json
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string
          distributor_id?: string
          id?: number
          order?: Json
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_q: number
          created_at: string
          description: string
          free_q: number
          id: number
          imageURL: string
          mrp: number
          name: string
          selling_price: number
        }
        Insert: {
          base_q: number
          created_at?: string
          description: string
          free_q: number
          id?: number
          imageURL: string
          mrp: number
          name: string
          selling_price: number
        }
        Update: {
          base_q?: number
          created_at?: string
          description?: string
          free_q?: number
          id?: number
          imageURL?: string
          mrp?: number
          name?: string
          selling_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          boss_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["ROLES"] | null
          username: string | null
        }
        Insert: {
          boss_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["ROLES"] | null
          username?: string | null
        }
        Update: {
          boss_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["ROLES"] | null
          username?: string | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          available_quantity: number
          created_at: string
          expiry_date: string
          id: string
          ordered_quantity: number
          product_id: number
        }
        Insert: {
          available_quantity: number
          created_at?: string
          expiry_date: string
          id: string
          ordered_quantity?: number
          product_id: number
        }
        Update: {
          available_quantity?: number
          created_at?: string
          expiry_date?: string
          id?: string
          ordered_quantity?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_batch_info_to_order: {
        Args: {
          order_id: number
          product_id: number
          key_value: number
          batch_id: string
          quantity_value: number
        }
        Returns: undefined
      }
      add_to_d_inventory: {
        Args: {
          distributor_id_param: string
          product_id_param: number
          batch_id_param: string
          batch_quantity_param: number
        }
        Returns: undefined
      }
    }
    Enums: {
      order_status:
        | "Pending"
        | "Fulfilled"
        | "Cancelled"
        | "InProcess"
        | "Defected"
      ROLES: "admin" | "distributor" | "sales" | "null" | "customer"
      transfer_status: "Credit" | "Debit" | "Requested" | "Approved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
