import type { SupabaseClientWithDatabase } from '../lib/config';
import type { Json, Tables, TablesInsert } from '../types';
import { BaseRepository } from './base.repository';

export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;

export interface SaveMessageParams {
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Json;
}

export class MessagesRepository extends BaseRepository {
  constructor(client: SupabaseClientWithDatabase) {
    super(client);
  }

  async saveMessage({
    threadId,
    role,
    content,
    metadata = {},
  }: SaveMessageParams): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        thread_id: threadId,
        role,
        content,
        metadata,
      })
      .select()
      .single();

    this.throwIfError(error, 'Failed to save message');

    const { error: bumpError } = await this.client
      .from('threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (bumpError) {
      console.warn('Failed to bump thread.updated_at', bumpError);
    }

    return data as Message;
  }

  async listByThreadId(threadId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    this.throwIfError(error, 'Failed to get messages');

    return (data || []) as Message[];
  }
}
