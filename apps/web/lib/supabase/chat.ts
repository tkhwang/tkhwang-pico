import { createClient } from "./client";
import type { Tables, TablesInsert, TablesUpdate, Json } from "../../types_db";

export type Thread = Tables<"threads">;
export type Message = Tables<"messages">;
export type ThreadInsert = TablesInsert<"threads">;
export type MessageInsert = TablesInsert<"messages">;
export type ThreadUpdate = TablesUpdate<"threads">;

export interface CreateThreadParams {
  userId: string;
  title?: string;
  metadata?: Json;
}

export interface SaveMessageParams {
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Json;
}

export interface ThreadWithLastMessage extends Thread {
  lastMessage?: Message;
  messageCount?: number;
}

/**
 * Create a new chat thread
 */
export async function createThread({
  userId,
  title,
  metadata = {},
}: CreateThreadParams): Promise<Thread> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .insert({
      user_id: userId,
      title: title || null,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }

  return data;
}

/**
 * Save a message to a thread
 */
export async function saveMessage({
  threadId,
  role,
  content,
  metadata = {},
}: SaveMessageParams): Promise<Message> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      role,
      content,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  // Update thread's updated_at timestamp
  await supabase
    .from("threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  return data;
}

/**
 * Get all messages for a thread
 */
export async function getThreadMessages(threadId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to get thread messages: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all threads for a user with optional pagination
 */
export async function getUserThreads(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ThreadWithLastMessage[]> {
  const supabase = createClient();
  const { limit = 50, offset = 0 } = options;

  // Get threads with their last message
  const { data, error } = await supabase
    .from("threads")
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
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get user threads: ${error.message}`);
  }

  // Process threads to include last message and message count
  const threadsWithLastMessage = (data || []).map((thread) => {
    const messages = thread.messages || [];
    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : undefined;

    return {
      ...thread,
      lastMessage,
      messageCount: messages.length,
      messages: undefined, // Remove messages array to keep response clean
    } as ThreadWithLastMessage;
  });

  return threadsWithLastMessage;
}

/**
 * Get a specific thread by ID
 */
export async function getThread(threadId: string): Promise<Thread | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Thread not found
    }
    throw new Error(`Failed to get thread: ${error.message}`);
  }

  return data;
}

/**
 * Get thread with its messages
 */
export async function getThreadWithMessages(
  threadId: string
): Promise<{ thread: Thread; messages: Message[] } | null> {
  const supabase = createClient();

  // Get thread and messages in parallel
  const [threadResult, messagesResult] = await Promise.all([
    supabase.from("threads").select("*").eq("id", threadId).single(),
    supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true }),
  ]);

  if (threadResult.error) {
    if (threadResult.error.code === "PGRST116") {
      return null; // Thread not found
    }
    throw new Error(`Failed to get thread: ${threadResult.error.message}`);
  }

  if (messagesResult.error) {
    throw new Error(`Failed to get messages: ${messagesResult.error.message}`);
  }

  return {
    thread: threadResult.data,
    messages: messagesResult.data || [],
  };
}

/**
 * Update a thread's title
 */
export async function updateThreadTitle(
  threadId: string,
  title: string
): Promise<Thread> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .update({ title })
    .eq("id", threadId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update thread title: ${error.message}`);
  }

  return data;
}

/**
 * Delete a thread and all its messages
 */
export async function deleteThread(threadId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("threads").delete().eq("id", threadId);

  if (error) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

/**
 * Delete a specific message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

/**
 * Generate a title for a thread based on the first user message
 */
export function generateThreadTitle(firstUserMessage: string): string {
  const maxLength = 60;

  // Clean up the message
  const cleaned = firstUserMessage
    .trim()
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ");

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > maxLength * 0.7) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

/**
 * Check if user owns a thread
 */
export async function isThreadOwner(
  threadId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("threads")
    .select("user_id")
    .eq("id", threadId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}
