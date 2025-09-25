import type {
  CreateThreadParams,
  Thread as SupabaseThread,
  ThreadInsert as SupabaseThreadInsert,
  ThreadUpdate as SupabaseThreadUpdate,
  ThreadWithLastMessage,
  ThreadWithMessagesResult,
} from '@tkhwang-pico/supabase';
import { ThreadsRepository as BaseThreadsRepository } from '@tkhwang-pico/supabase';

import { createAuthenticatedSupabaseClient } from '@/services/client';
import type { AuthClerkSession } from '@/types/auth';

/**
 * 웹 애플리케이션 전용 스레드 리포지토리 래퍼
 * Clerk 세션으로 인증된 Supabase 클라이언트를 생성해 공유 리포지토리를 감싼다.
 */
export class ThreadsRepository {
  private readonly repository: BaseThreadsRepository;

  constructor(session: AuthClerkSession) {
    if (!session) {
      throw new Error('Authentication required');
    }

    const supabase = createAuthenticatedSupabaseClient(session);
    this.repository = new BaseThreadsRepository(supabase);
  }

  async createThread(params: CreateThreadParams): Promise<SupabaseThread> {
    return this.repository.createThread(params);
  }

  async getUserThreads(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<ThreadWithLastMessage[]> {
    return this.repository.getUserThreads(userId, options);
  }

  async getThreadWithMessages(threadId: string): Promise<ThreadWithMessagesResult | null> {
    return this.repository.getThreadWithMessages(threadId);
  }

  async updateThreadTitle(threadId: string, title: string): Promise<SupabaseThread> {
    return this.repository.updateThreadTitle(threadId, title);
  }

  async deleteThread(threadId: string): Promise<void> {
    return this.repository.deleteThread(threadId);
  }
}

/**
 * 첫 번째 사용자 메시지 기반으로 스레드 제목을 생성한다.
 */
export function generateThreadTitle(firstUserMessage: string): string {
  const maxLength = 60;

  const cleaned = firstUserMessage.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.7) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
}

export type Thread = SupabaseThread;
export type ThreadInsert = SupabaseThreadInsert;
export type ThreadUpdate = SupabaseThreadUpdate;
export type {
  CreateThreadParams,
  ThreadWithLastMessage,
  ThreadWithMessagesResult,
} from '@tkhwang-pico/supabase';
