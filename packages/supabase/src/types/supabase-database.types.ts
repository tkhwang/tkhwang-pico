export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      content_embeddings: {
        Row: {
          chunk_index: number | null;
          content_id: string;
          created_at: string;
          embedding: string;
          embedding_model: string;
          id: number;
          scope: Database['public']['Enums']['embedding_scope'];
        };
        Insert: {
          chunk_index?: number | null;
          content_id: string;
          created_at?: string;
          embedding: string;
          embedding_model: string;
          id?: number;
          scope?: Database['public']['Enums']['embedding_scope'];
        };
        Update: {
          chunk_index?: number | null;
          content_id?: string;
          created_at?: string;
          embedding?: string;
          embedding_model?: string;
          id?: number;
          scope?: Database['public']['Enums']['embedding_scope'];
        };
        Relationships: [
          {
            foreignKeyName: 'content_embeddings_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'contents';
            referencedColumns: ['id'];
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
          status: Database['public']['Enums']['content_status'];
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
          status?: Database['public']['Enums']['content_status'];
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
          status?: Database['public']['Enums']['content_status'];
          summary?: string | null;
          tags?: string[] | null;
          title?: string | null;
          token_count?: number | null;
          url?: string;
          word_count?: number | null;
        };
        Relationships: [];
      };
      debug_failed_contents: {
        Row: {
          attempted_at: string;
          error_code: number | null;
          error_message: string;
          error_type: string | null;
          id: string;
          metadata: Json;
          url: string;
          user_id: string;
        };
        Insert: {
          attempted_at?: string;
          error_code?: number | null;
          error_message: string;
          error_type?: string | null;
          id?: string;
          metadata?: Json;
          url: string;
          user_id: string;
        };
        Update: {
          attempted_at?: string;
          error_code?: number | null;
          error_message?: string;
          error_type?: string | null;
          id?: string;
          metadata?: Json;
          url?: string;
          user_id?: string;
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
            foreignKeyName: 'messages_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'threads';
            referencedColumns: ['id'];
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
      user_content_preferences: {
        Row: {
          content_id: string;
          created_at: string;
          id: string;
          preference_type: string;
          reason: string | null;
          user_id: string;
        };
        Insert: {
          content_id: string;
          created_at?: string;
          id?: string;
          preference_type?: string;
          reason?: string | null;
          user_id: string;
        };
        Update: {
          content_id?: string;
          created_at?: string;
          id?: string;
          preference_type?: string;
          reason?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_content_preferences_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'contents';
            referencedColumns: ['id'];
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
          priority: Database['public']['Enums']['content_priority'];
          saved_at: string;
          scheduled_for: string | null;
          todo_status: Database['public']['Enums']['content_todo_status'];
          user_id: string;
        };
        Insert: {
          archived?: boolean;
          completed_at?: string | null;
          content_id: string;
          id?: string;
          labels?: string[] | null;
          note?: string | null;
          priority?: Database['public']['Enums']['content_priority'];
          saved_at?: string;
          scheduled_for?: string | null;
          todo_status?: Database['public']['Enums']['content_todo_status'];
          user_id: string;
        };
        Update: {
          archived?: boolean;
          completed_at?: string | null;
          content_id?: string;
          id?: string;
          labels?: string[] | null;
          note?: string | null;
          priority?: Database['public']['Enums']['content_priority'];
          saved_at?: string;
          scheduled_for?: string | null;
          todo_status?: Database['public']['Enums']['content_todo_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_contents_content_id_fkey';
            columns: ['content_id'];
            isOneToOne: false;
            referencedRelation: 'contents';
            referencedColumns: ['id'];
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
    };
    Views: Record<never, never>;
    Functions: {
      armor: {
        Args: { '': string };
        Returns: string;
      };
      binary_quantize: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      current_clerk_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      dearmor: {
        Args: { '': string };
        Returns: string;
      };
      gen_random_bytes: {
        Args: { '': number };
        Returns: string;
      };
      gen_random_uuid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      gen_salt: {
        Args: { '': string };
        Returns: string;
      };
      get_user_contents: {
        Args: { p_status?: Database['public']['Enums']['content_todo_status'] };
        Returns: {
          archived: boolean;
          completed_at: string;
          content_id: string;
          contents: Json;
          id: string;
          labels: string[];
          note: string;
          preferences: Json;
          priority: Database['public']['Enums']['content_priority'];
          saved_at: string;
          scheduled_for: string;
          todo_status: Database['public']['Enums']['content_todo_status'];
          user_id: string;
        }[];
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: { '': number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { '': unknown } | { '': unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      pgp_armor_headers: {
        Args: { '': string };
        Returns: Record<string, unknown>[];
      };
      pgp_key_id: {
        Args: { '': string };
        Returns: string;
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
        Args: { '': number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
      similar_to_content: {
        Args:
          | { p_content_id: string; p_limit?: number; p_model?: string }
          | {
              p_content_id: string;
              p_limit?: number;
              p_model?: string;
              p_user_id?: string;
            };
        Returns: {
          content_id: string;
          distance: number;
        }[];
      };
      sparsevec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      toggle_user_content_status: {
        Args: { p_user_content_id: string };
        Returns: Database['public']['Enums']['content_todo_status'];
      };
      vector_avg: {
        Args: { '': number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { '': string } | { '': unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { '': string };
        Returns: number;
      };
      vector_out: {
        Args: { '': string };
        Returns: unknown;
      };
      vector_send: {
        Args: { '': string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
    };
    Enums: {
      content_priority: 'low' | 'normal' | 'high';
      content_status: 'pending' | 'ready' | 'failed' | 'archived';
      content_todo_status: 'pending' | 'completed';
      embedding_scope: 'summary' | 'chunk' | 'title' | 'tags';
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      content_priority: ['low', 'normal', 'high'],
      content_status: ['pending', 'ready', 'failed', 'archived'],
      content_todo_status: ['pending', 'completed'],
      embedding_scope: ['summary', 'chunk', 'title', 'tags'],
    },
  },
} as const;
