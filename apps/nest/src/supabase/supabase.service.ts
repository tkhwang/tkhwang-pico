import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  createSupabaseClientFactory,
  type SupabaseClientWithDatabase,
} from '@tkhwang-pico/supabase/clients';
import type { ServerFactoryResult } from '@tkhwang-pico/supabase/types';

@Injectable()
export class SupabaseService {
  public readonly serviceClient: SupabaseClientWithDatabase;
  private readonly helpers: ServerFactoryResult['helpers'];

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Role Key are required');
    }

    const result = createSupabaseClientFactory({
      platform: 'server',
      mode: 'service',
      config: {
        url: supabaseUrl,
        serviceRoleKey: supabaseKey,
        anonKey: supabaseAnonKey,
      },
    });

    if (result.platform !== 'server') {
      throw new Error('Failed to initialize Supabase server client');
    }

    this.serviceClient = result.client;
    this.helpers = result.helpers;
  }

  /**
   * Create a user-scoped client that enforces RLS by forwarding the user's JWT.
   * Requires SUPABASE_ANON_KEY to be set.
   */
  getClientForUser(jwt: string): SupabaseClientWithDatabase {
    return this.helpers.getClientForUser(jwt);
  }
}
