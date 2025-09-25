import type {
  Message as SupabaseMessage,
  MessageInsert as SupabaseMessageInsert,
  SaveMessageParams,
} from '@tkhwang-pico/supabase';
import { MessagesRepository } from '@tkhwang-pico/supabase';

import { createAuthenticatedSupabaseClient } from '../../services/supabase/supabase-client';
import type { AuthClerkSession } from '../../types/auth';

function createMessagesRepository(session: AuthClerkSession) {
  const supabase = createAuthenticatedSupabaseClient(session);
  return new MessagesRepository(supabase);
}

/**
 * 스레드에 메시지를 저장합니다.
 */
export async function saveMessage(
  session: AuthClerkSession,
  params: SaveMessageParams,
): Promise<SupabaseMessage> {
  const messages = createMessagesRepository(session);
  return messages.saveMessage(params);
}

export type Message = SupabaseMessage;
export type MessageInsert = SupabaseMessageInsert;
export type { SaveMessageParams } from '@tkhwang-pico/supabase';
