import type {
  CreateThreadParams,
  Thread as SupabaseThread,
  ThreadInsert as SupabaseThreadInsert,
  ThreadUpdate as SupabaseThreadUpdate,
  ThreadWithLastMessage,
  ThreadWithMessagesResult,
} from '@tkhwang-pico/supabase';
import { ThreadsRepository } from '@tkhwang-pico/supabase';

import { createAuthenticatedSupabaseClient } from '@/services/supabase/client';
import type { AuthClerkSession } from '@/types/auth';

function createThreadsRepository(session: AuthClerkSession) {
  const supabase = createAuthenticatedSupabaseClient(session);
  return new ThreadsRepository(supabase);
}

/**
 * 새 스레드를 생성합니다.
 */
export async function createThread(
  session: AuthClerkSession,
  params: CreateThreadParams,
): Promise<SupabaseThread> {
  const threads = createThreadsRepository(session);
  return threads.createThread(params);
}

/**
 * 사용자 스레드 목록을 조회합니다.
 */
export async function getUserThreads(
  session: AuthClerkSession,
  userId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<ThreadWithLastMessage[]> {
  const threads = createThreadsRepository(session);
  return threads.getUserThreads(userId, options);
}

/**
 * 지정한 스레드와 메시지를 함께 조회합니다.
 */
export async function getThreadWithMessages(
  session: AuthClerkSession,
  threadId: string,
): Promise<ThreadWithMessagesResult | null> {
  const threads = createThreadsRepository(session);
  return threads.getThreadWithMessages(threadId);
}

/**
 * 스레드의 제목을 업데이트합니다.
 */
export async function updateThreadTitle(
  session: AuthClerkSession,
  threadId: string,
  title: string,
): Promise<SupabaseThread> {
  const threads = createThreadsRepository(session);
  return threads.updateThreadTitle(threadId, title);
}

/**
 * 스레드와 관련 메시지를 모두 삭제합니다.
 */
export async function deleteThread(session: AuthClerkSession, threadId: string): Promise<void> {
  const threads = createThreadsRepository(session);
  await threads.deleteThread(threadId);
}

/**
 * 첫 번째 사용자 메시지 기반으로 스레드 제목을 생성합니다.
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
