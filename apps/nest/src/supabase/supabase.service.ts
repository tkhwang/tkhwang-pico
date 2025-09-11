import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@tkhwang-pico/common';

@Injectable()
export class SupabaseService {
  public readonly serviceClient: SupabaseClient<Database>;
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey?: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }

    this.supabaseUrl = supabaseUrl;
    this.supabaseAnonKey = supabaseAnonKey;
    this.serviceClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Create a user-scoped client that enforces RLS by forwarding the user's JWT.
   * Requires SUPABASE_ANON_KEY to be set.
   */
  getClientForUser(jwt: string): SupabaseClient<Database> {
    if (!this.supabaseAnonKey) {
      throw new Error(
        'SUPABASE_ANON_KEY is required to create user-scoped clients',
      );
    }
    return createClient<Database>(this.supabaseUrl, this.supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
