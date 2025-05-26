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
      calculation_settings: {
        Row: {
          created_at: string | null
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      coating_sizes: {
        Row: {
          coating_type_id: string | null
          cost_per_sheet: number
          created_at: string | null
          height: number
          id: string
          label: string
          minimum_cost: number
          width: number
        }
        Insert: {
          coating_type_id?: string | null
          cost_per_sheet?: number
          created_at?: string | null
          height: number
          id?: string
          label: string
          minimum_cost?: number
          width: number
        }
        Update: {
          coating_type_id?: string | null
          cost_per_sheet?: number
          created_at?: string | null
          height?: number
          id?: string
          label?: string
          minimum_cost?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "coating_sizes_coating_type_id_fkey"
            columns: ["coating_type_id"]
            isOneToOne: false
            referencedRelation: "coating_types"
            referencedColumns: ["id"]
          },
        ]
      }
      coating_types: {
        Row: {
          created_at: string | null
          id: string
          label: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          name?: string
        }
        Relationships: []
      }
      formula_settings: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      ink_costs: {
        Row: {
          cost_per_sheet: number
          created_at: string
          id: string
          ink_category: string
          minimum_cost: number
          plate_type: string
          updated_at: string
        }
        Insert: {
          cost_per_sheet?: number
          created_at?: string
          id?: string
          ink_category: string
          minimum_cost?: number
          plate_type: string
          updated_at?: string
        }
        Update: {
          cost_per_sheet?: number
          created_at?: string
          id?: string
          ink_category?: string
          minimum_cost?: number
          plate_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      paper_grammages: {
        Row: {
          created_at: string | null
          grammage: string
          id: string
          label: string
          paper_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          grammage: string
          id?: string
          label: string
          paper_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          grammage?: string
          id?: string
          label?: string
          paper_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_grammages_paper_type_id_fkey"
            columns: ["paper_type_id"]
            isOneToOne: false
            referencedRelation: "paper_types"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_prices: {
        Row: {
          created_at: string | null
          id: string
          paper_grammage_id: string | null
          paper_type_id: string | null
          price_per_kg: number
          supplier_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paper_grammage_id?: string | null
          paper_type_id?: string | null
          price_per_kg: number
          supplier_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paper_grammage_id?: string | null
          paper_type_id?: string | null
          price_per_kg?: number
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_prices_paper_grammage_id_fkey"
            columns: ["paper_grammage_id"]
            isOneToOne: false
            referencedRelation: "paper_grammages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_prices_paper_type_id_fkey"
            columns: ["paper_type_id"]
            isOneToOne: false
            referencedRelation: "paper_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_prices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_sizes: {
        Row: {
          created_at: string | null
          height: number
          id: string
          name: string
          paper_type_id: string | null
          width: number
        }
        Insert: {
          created_at?: string | null
          height: number
          id?: string
          name: string
          paper_type_id?: string | null
          width: number
        }
        Update: {
          created_at?: string | null
          height?: number
          id?: string
          name?: string
          paper_type_id?: string | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "paper_sizes_paper_type_id_fkey"
            columns: ["paper_type_id"]
            isOneToOne: false
            referencedRelation: "paper_types"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_types: {
        Row: {
          created_at: string | null
          id: string
          label: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          name?: string
        }
        Relationships: []
      }
      paper_variant: {
        Row: {
          created_at: string
          id: string
          paper_gsm_id: string
          paper_size_id: string
          paper_type_id: string
          price_per_kg: number | null
          price_per_pack: number
          price_per_ream: number | null
          sheets_per_pack: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          paper_gsm_id: string
          paper_size_id: string
          paper_type_id: string
          price_per_kg?: number | null
          price_per_pack: number
          price_per_ream?: number | null
          sheets_per_pack?: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          paper_gsm_id?: string
          paper_size_id?: string
          paper_type_id?: string
          price_per_kg?: number | null
          price_per_pack?: number
          price_per_ream?: number | null
          sheets_per_pack?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_variant_paper_gsm_id_fkey"
            columns: ["paper_gsm_id"]
            isOneToOne: false
            referencedRelation: "paper_grammages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_variant_paper_size_id_fkey"
            columns: ["paper_size_id"]
            isOneToOne: false
            referencedRelation: "paper_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_variant_paper_type_id_fkey"
            columns: ["paper_type_id"]
            isOneToOne: false
            referencedRelation: "paper_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_variant_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      plate_costs: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      spot_uv_costs: {
        Row: {
          cost_per_sheet: number
          created_at: string | null
          height: number
          id: string
          label: string
          minimum_cost: number
          width: number
        }
        Insert: {
          cost_per_sheet?: number
          created_at?: string | null
          height: number
          id?: string
          label: string
          minimum_cost?: number
          width: number
        }
        Update: {
          cost_per_sheet?: number
          created_at?: string | null
          height?: number
          id?: string
          label?: string
          minimum_cost?: number
          width?: number
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          name: string
          sheets_per_pack: number
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name: string
          sheets_per_pack?: number
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sheets_per_pack?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
