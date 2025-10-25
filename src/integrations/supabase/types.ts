export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          area_tematica: string | null
          councilor_id: string
          created_at: string | null
          data_proposicao: string
          descricao: string
          external_id: string | null
          id: string
          numero: string | null
          status: Database["public"]["Enums"]["action_status"] | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          area_tematica?: string | null
          councilor_id: string
          created_at?: string | null
          data_proposicao: string
          descricao: string
          external_id?: string | null
          id?: string
          numero?: string | null
          status?: Database["public"]["Enums"]["action_status"] | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          area_tematica?: string | null
          councilor_id?: string
          created_at?: string | null
          data_proposicao?: string
          descricao?: string
          external_id?: string | null
          id?: string
          numero?: string | null
          status?: Database["public"]["Enums"]["action_status"] | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acoes_councilor_id_fkey"
            columns: ["councilor_id"]
            isOneToOne: false
            referencedRelation: "councilors"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          action_type: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          acao_id: string
          comentario: string | null
          created_at: string | null
          criterio_1_relevancia: number
          criterio_2_viabilidade: number
          criterio_3_impacto: number
          criterio_4_clareza: number
          criterio_5_abrangencia: number
          criterio_6_inovacao: number
          evaluator_id: string
          id: string
          tempo_leitura: number
        }
        Insert: {
          acao_id: string
          comentario?: string | null
          created_at?: string | null
          criterio_1_relevancia: number
          criterio_2_viabilidade: number
          criterio_3_impacto: number
          criterio_4_clareza: number
          criterio_5_abrangencia: number
          criterio_6_inovacao: number
          evaluator_id: string
          id?: string
          tempo_leitura: number
        }
        Update: {
          acao_id?: string
          comentario?: string | null
          created_at?: string | null
          criterio_1_relevancia?: number
          criterio_2_viabilidade?: number
          criterio_3_impacto?: number
          criterio_4_clareza?: number
          criterio_5_abrangencia?: number
          criterio_6_inovacao?: number
          evaluator_id?: string
          id?: string
          tempo_leitura?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          keywords: string[] | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_indicators: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          indicator_name: string
          indicator_unit: string | null
          indicator_value: number
          reference_date: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          indicator_name: string
          indicator_unit?: string | null
          indicator_value: number
          reference_date: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          indicator_name?: string
          indicator_unit?: string | null
          indicator_value?: number
          reference_date?: string
        }
        Relationships: []
      }
      councilors: {
        Row: {
          activity_score: number | null
          approved_proposals: number | null
          attendance_rate: number | null
          created_at: string
          district: string | null
          id: string
          name: string
          party: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["parliamentary_status"] | null
          total_proposals: number | null
          updated_at: string
        }
        Insert: {
          activity_score?: number | null
          approved_proposals?: number | null
          attendance_rate?: number | null
          created_at?: string
          district?: string | null
          id?: string
          name: string
          party?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["parliamentary_status"] | null
          total_proposals?: number | null
          updated_at?: string
        }
        Update: {
          activity_score?: number | null
          approved_proposals?: number | null
          attendance_rate?: number | null
          created_at?: string
          district?: string | null
          id?: string
          name?: string
          party?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["parliamentary_status"] | null
          total_proposals?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pesos_config: {
        Row: {
          created_at: string | null
          criterio_1_relevancia: number | null
          criterio_2_viabilidade: number | null
          criterio_3_impacto: number | null
          criterio_4_clareza: number | null
          criterio_5_abrangencia: number | null
          criterio_6_inovacao: number | null
          id: string
          lambda_recencia: number | null
          min_avaliacoes_par: number | null
          min_avaliacoes_pg: number | null
          min_avaliacoes_tec: number | null
          peso_par: number | null
          peso_pg: number | null
          peso_tec: number | null
          tempo_minimo_leitura: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criterio_1_relevancia?: number | null
          criterio_2_viabilidade?: number | null
          criterio_3_impacto?: number | null
          criterio_4_clareza?: number | null
          criterio_5_abrangencia?: number | null
          criterio_6_inovacao?: number | null
          id?: string
          lambda_recencia?: number | null
          min_avaliacoes_par?: number | null
          min_avaliacoes_pg?: number | null
          min_avaliacoes_tec?: number | null
          peso_par?: number | null
          peso_pg?: number | null
          peso_tec?: number | null
          tempo_minimo_leitura?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criterio_1_relevancia?: number | null
          criterio_2_viabilidade?: number | null
          criterio_3_impacto?: number | null
          criterio_4_clareza?: number | null
          criterio_5_abrangencia?: number | null
          criterio_6_inovacao?: number | null
          id?: string
          lambda_recencia?: number | null
          min_avaliacoes_par?: number | null
          min_avaliacoes_pg?: number | null
          min_avaliacoes_tec?: number | null
          peso_par?: number | null
          peso_pg?: number | null
          peso_tec?: number | null
          tempo_minimo_leitura?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          incident_date: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          latitude: number
          longitude: number
          neighborhood: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          latitude: number
          longitude: number
          neighborhood?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          latitude?: number
          longitude?: number
          neighborhood?: string | null
        }
        Relationships: []
      }
      scores_acao: {
        Row: {
          acao_id: string
          id: string
          num_avaliacoes_par: number | null
          num_avaliacoes_pg: number | null
          num_avaliacoes_tec: number | null
          score_par: number | null
          score_pg: number | null
          score_tec: number | null
          score_total: number | null
          updated_at: string | null
        }
        Insert: {
          acao_id: string
          id?: string
          num_avaliacoes_par?: number | null
          num_avaliacoes_pg?: number | null
          num_avaliacoes_tec?: number | null
          score_par?: number | null
          score_pg?: number | null
          score_tec?: number | null
          score_total?: number | null
          updated_at?: string | null
        }
        Update: {
          acao_id?: string
          id?: string
          num_avaliacoes_par?: number | null
          num_avaliacoes_pg?: number | null
          num_avaliacoes_tec?: number | null
          score_par?: number | null
          score_pg?: number | null
          score_tec?: number | null
          score_total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_acao_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: true
            referencedRelation: "acoes"
            referencedColumns: ["id"]
          },
        ]
      }
      scores_vereador: {
        Row: {
          councilor_id: string
          id: string
          num_acoes_avaliadas: number | null
          ranking_position: number | null
          score_medio: number | null
          score_total: number | null
          updated_at: string | null
        }
        Insert: {
          councilor_id: string
          id?: string
          num_acoes_avaliadas?: number | null
          ranking_position?: number | null
          score_medio?: number | null
          score_total?: number | null
          updated_at?: string | null
        }
        Update: {
          councilor_id?: string
          id?: string
          num_acoes_avaliadas?: number | null
          ranking_position?: number | null
          score_medio?: number | null
          score_total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_vereador_councilor_id_fkey"
            columns: ["councilor_id"]
            isOneToOne: true
            referencedRelation: "councilors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          evaluator_status:
            | Database["public"]["Enums"]["evaluator_status"]
            | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          evaluator_status?:
            | Database["public"]["Enums"]["evaluator_status"]
            | null
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          evaluator_status?:
            | Database["public"]["Enums"]["evaluator_status"]
            | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_action_score: {
        Args: { action_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_evaluator: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      action_status: "draft" | "under_evaluation" | "completed" | "archived"
      app_role:
        | "admin"
        | "avaliador_pg"
        | "avaliador_tec"
        | "avaliador_par"
        | "visitante"
      evaluator_status: "pending" | "approved" | "rejected" | "suspended"
      incident_type:
        | "furto"
        | "roubo"
        | "homicidio"
        | "lesao_corporal"
        | "outros"
      parliamentary_status: "active" | "inactive" | "on_leave"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_status: ["draft", "under_evaluation", "completed", "archived"],
      app_role: [
        "admin",
        "avaliador_pg",
        "avaliador_tec",
        "avaliador_par",
        "visitante",
      ],
      evaluator_status: ["pending", "approved", "rejected", "suspended"],
      incident_type: [
        "furto",
        "roubo",
        "homicidio",
        "lesao_corporal",
        "outros",
      ],
      parliamentary_status: ["active", "inactive", "on_leave"],
    },
  },
} as const
