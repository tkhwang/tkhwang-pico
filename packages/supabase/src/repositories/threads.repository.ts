import type { SupabaseClientWithDatabase } from '../lib/config';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../types';
import { BaseRepository } from './base.repository';
import type { Message } from './messages.repository';

export type Thread = Tables<'threads'>;
export type ThreadInsert = TablesInsert<'threads'>;
export type ThreadUpdate = TablesUpdate<'threads'>;

export interface CreateThreadParams {
  userId: string;
  title?: string;
  metadata?: Json;
}

export interface ThreadWithLastMessage extends Thread {
  lastMessage?: Message;
  messageCount?: number;
}

export interface ThreadWithMessagesResult {
  thread: Thread;
  messages: Message[];
}

export class ThreadsRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase) {
    super(client);
  }

  async createThread({ userId, title, metadata = {} }: CreateThreadParams): Promise<Thread> {
    const { data, error } = await this.client
      .from('threads')
      .insert({
        user_id: userId,
        title: title?.trim() || null,
        metadata,
      })
      .select()
      .single();

    this.throwIfError(error, 'Failed to create thread');

    return data as Thread;
  }

  async getUserThreads(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<ThreadWithLastMessage[]> {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await this.client
      .from('threads')
      .select(
        `
        *,
        messages!messages_thread_id_fkey (
          id,
          role,
          content,
          created_at,
          metadata
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { foreignTable: 'messages', ascending: true })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    this.throwIfError(error, 'Failed to get user threads');

    const threadsWithLastMessage = (data || []).map((thread) => {
      const { messages = [], ...threadWithoutMessages } = thread as Thread & {
        messages?: Message[];
      };
      const lastMessage = messages[messages.length - 1];

      return {
        ...(threadWithoutMessages as Thread),
        lastMessage,
        messageCount: messages.length,
      } satisfies ThreadWithLastMessage;
    });

    return threadsWithLastMessage;
  }

  async getThreadById(threadId: string): Promise<Thread | null> {
    const { data, error } = await this.client
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get thread: ${error.message}`);
    }

    return data as Thread;
  }

  async getThreadWithMessages(threadId: string): Promise<ThreadWithMessagesResult | null> {
    const [threadResult, messagesResult] = await Promise.all([
      this.client.from('threads').select('*').eq('id', threadId).single(),
      this.client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true }),
    ]);

    if (threadResult.error) {
      if (threadResult.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get thread: ${threadResult.error.message}`);
    }

    if (messagesResult.error) {
      throw new Error(`Failed to get messages: ${messagesResult.error.message}`);
    }

    return {
      thread: threadResult.data as Thread,
      messages: (messagesResult.data || []) as Message[],
    };
  }

  async updateThreadTitle(threadId: string, title: string): Promise<Thread> {
    const { data, error } = await this.client
      .from('threads')
      .update({ title: title.trim() || null })
      .eq('id', threadId)
      .select()
      .single();

    this.throwIfError(error, 'Failed to update thread title');

    return data as Thread;
  }

  async deleteThread(threadId: string): Promise<void> {
    const { error } = await this.client.from('threads').delete().eq('id', threadId);

    this.throwIfError(error, 'Failed to delete thread');
  }
}
