import type {
  Message as SupabaseMessage,
  MessageInsert as SupabaseMessageInsert,
  SaveMessageParams,
} from '@tkhwang-pico/supabase';
import { MessagesRepository as BaseMessagesRepository } from '@tkhwang-pico/supabase';

import { createAuthenticatedSupabaseClient } from '@/services/client';
import type { AuthClerkSession } from '@/types/auth';

/**
 * 웹 애플리케이션 전용 메시지 리포지토리 래퍼
 * Clerk 세션을 사용해 인증된 Supabase 클라이언트를 생성하고 공유 리포지토리를 감싼다.
 */
export class MessagesRepository {
  private readonly repository: BaseMessagesRepository;

  constructor(session: AuthClerkSession) {
    if (!session) throw new Error('Authentication required');

    const supabase = createAuthenticatedSupabaseClient(session);
    this.repository = new BaseMessagesRepository(supabase);
  }

  async saveMessage(params: SaveMessageParams): Promise<SupabaseMessage> {
    return this.repository.saveMessage(params);
  }
}

export type Message = SupabaseMessage;
export type MessageInsert = SupabaseMessageInsert;
export type { SaveMessageParams } from '@tkhwang-pico/supabase';
