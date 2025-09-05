export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      co_visitation: {
        Row: {
          dst_content_id: string;
          score: number;
          src_content_id: string;
          updated_at: string;
        };
        Insert: {
          dst_content_id: string;
          score: number;
          src_content_id: string;
          updated_at?: string;
        };
        Update: {
          dst_content_id?: string;
          score?: number;
          src_content_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "co_visitation_dst_content_id_fkey";
            columns: ["dst_content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "co_visitation_src_content_id_fkey";
            columns: ["src_content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      content_embeddings: {
        Row: {
          chunk_index: number | null;
          content_id: string;
          created_at: string;
          embedding: string;
          embedding_model: string;
          id: number;
          scope: Database["public"]["Enums"]["embedding_scope"];
        };
        Insert: {
          chunk_index?: number | null;
          content_id: string;
          created_at?: string;
          embedding: string;
          embedding_model: string;
          id?: number;
          scope?: Database["public"]["Enums"]["embedding_scope"];
        };
        Update: {
          chunk_index?: number | null;
          content_id?: string;
          created_at?: string;
          embedding?: string;
          embedding_model?: string;
          id?: number;
          scope?: Database["public"]["Enums"]["embedding_scope"];
        };
        Relationships: [
          {
            foreignKeyName: "content_embeddings_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      content_factors: {
        Row: {
          bias: number | null;
          content_id: string;
          factors: string;
          updated_at: string;
        };
        Insert: {
          bias?: number | null;
          content_id: string;
          factors: string;
          updated_at?: string;
        };
        Update: {
          bias?: number | null;
          content_id?: string;
          factors?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_factors_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: true;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      contents: {
        Row: {
          author: string | null;
          canonical_url: string | null;
          domain: string | null;
          fetched_at: string | null;
          id: string;
          lang: string | null;
          metadata: Json;
          published_at: string | null;
          status: Database["public"]["Enums"]["content_status"];
          summary: string | null;
          tags: string[] | null;
          title: string | null;
          token_count: number | null;
          url: string;
          word_count: number | null;
        };
        Insert: {
          author?: string | null;
          canonical_url?: string | null;
          domain?: string | null;
          fetched_at?: string | null;
          id?: string;
          lang?: string | null;
          metadata?: Json;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          tags?: string[] | null;
          title?: string | null;
          token_count?: number | null;
          url: string;
          word_count?: number | null;
        };
        Update: {
          author?: string | null;
          canonical_url?: string | null;
          domain?: string | null;
          fetched_at?: string | null;
          id?: string;
          lang?: string | null;
          metadata?: Json;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          summary?: string | null;
          tags?: string[] | null;
          title?: string | null;
          token_count?: number | null;
          url?: string;
          word_count?: number | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          metadata: Json;
          role: string;
          thread_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          role: string;
          thread_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          role?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      recommendation_logs: {
        Row: {
          algo: string;
          clicked_id: string | null;
          converted_id: string | null;
          id: number;
          request_ctx: Json;
          results: Json;
          served_at: string;
          user_id: string;
        };
        Insert: {
          algo: string;
          clicked_id?: string | null;
          converted_id?: string | null;
          id?: number;
          request_ctx?: Json;
          results: Json;
          served_at?: string;
          user_id: string;
        };
        Update: {
          algo?: string;
          clicked_id?: string | null;
          converted_id?: string | null;
          id?: number;
          request_ctx?: Json;
          results?: Json;
          served_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      similar_items_cf: {
        Row: {
          content_id: string;
          neighbor_id: string;
          score: number;
        };
        Insert: {
          content_id: string;
          neighbor_id: string;
          score: number;
        };
        Update: {
          content_id?: string;
          neighbor_id?: string;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "similar_items_cf_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "similar_items_cf_neighbor_id_fkey";
            columns: ["neighbor_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      threads: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_content_interactions: {
        Row: {
          content_id: string;
          created_at: string;
          dwell_ms: number | null;
          id: number;
          type: Database["public"]["Enums"]["interaction_type"];
          user_id: string;
          value: number | null;
          weight: number | null;
        };
        Insert: {
          content_id: string;
          created_at?: string;
          dwell_ms?: number | null;
          id?: number;
          type: Database["public"]["Enums"]["interaction_type"];
          user_id: string;
          value?: number | null;
          weight?: number | null;
        };
        Update: {
          content_id?: string;
          created_at?: string;
          dwell_ms?: number | null;
          id?: number;
          type?: Database["public"]["Enums"]["interaction_type"];
          user_id?: string;
          value?: number | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_content_interactions_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      user_contents: {
        Row: {
          archived: boolean;
          completed_at: string | null;
          content_id: string;
          id: string;
          labels: string[] | null;
          note: string | null;
          saved_at: string;
          todo_status: Database["public"]["Enums"]["content_todo_status"];
          user_id: string;
        };
        Insert: {
          archived?: boolean;
          completed_at?: string | null;
          content_id: string;
          id?: string;
          labels?: string[] | null;
          note?: string | null;
          saved_at?: string;
          todo_status?: Database["public"]["Enums"]["content_todo_status"];
          user_id: string;
        };
        Update: {
          archived?: boolean;
          completed_at?: string | null;
          content_id?: string;
          id?: string;
          labels?: string[] | null;
          note?: string | null;
          saved_at?: string;
          todo_status?: Database["public"]["Enums"]["content_todo_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_contents_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "contents";
            referencedColumns: ["id"];
          },
        ];
      };
      user_embeddings: {
        Row: {
          embedding: string;
          embedding_model: string;
          source: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          embedding: string;
          embedding_model: string;
          source?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          embedding?: string;
          embedding_model?: string;
          source?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_factors: {
        Row: {
          bias: number | null;
          factors: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bias?: number | null;
          factors: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bias?: number | null;
          factors?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown };
        Returns: unknown;
      };
      current_clerk_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: { "": number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { "": unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { "": unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { "": unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { "": unknown } | { "": unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown };
        Returns: unknown;
      };
      recommend_feed: {
        Args: { p_lang?: string; p_limit?: number; p_model?: string };
        Returns: {
          content_id: string;
          distance: number;
        }[];
      };
      recommend_for_user: {
        Args:
          | { p_limit?: number; p_model?: string }
          | { p_limit?: number; p_model?: string; p_user_id: string };
        Returns: {
          content_id: string;
          distance: number;
        }[];
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
      similar_to_content: {
        Args: { p_content_id: string; p_limit?: number; p_model?: string };
        Returns: {
          content_id: string;
          distance: number;
        }[];
      };
      similar_to_content_cf: {
        Args: { p_content_id: string; p_limit?: number };
        Returns: {
          neighbor_id: string;
          score: number;
        }[];
      };
      sparsevec_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { "": unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
      vector_avg: {
        Args: { "": number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { "": string } | { "": unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { "": string };
        Returns: number;
      };
      vector_out: {
        Args: { "": string };
        Returns: unknown;
      };
      vector_send: {
        Args: { "": string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { "": unknown[] };
        Returns: number;
      };
    };
    Enums: {
      content_status: "pending" | "ready" | "failed" | "archived";
      content_todo_status: "pending" | "completed";
      embedding_scope: "summary" | "chunk" | "title" | "tags";
      interaction_type:
        | "save"
        | "open"
        | "click"
        | "like"
        | "complete"
        | "share"
        | "archive"
        | "dismiss"
        | "rating";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      content_status: ["pending", "ready", "failed", "archived"],
      content_todo_status: ["pending", "completed"],
      embedding_scope: ["summary", "chunk", "title", "tags"],
      interaction_type: [
        "save",
        "open",
        "click",
        "like",
        "complete",
        "share",
        "archive",
        "dismiss",
        "rating",
      ],
    },
  },
} as const;
