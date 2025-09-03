import { createAuthenticatedSupabaseClient } from "./client";
import type { AuthClerkSession } from "../../types/auth";
import type {
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@tkhwang-pico/common/supabase";

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
 * Create a new chat thread (client-side with authentication)
 * Use this in React components that need Clerk authentication
 */
export async function createThread(
  session: AuthClerkSession,
  { userId, title, metadata = {} }: CreateThreadParams
): Promise<Thread> {
  const supabase = createAuthenticatedSupabaseClient(session);

  const { data, error } = await supabase
    .from("threads")
    .insert({
      user_id: userId,
      title: title?.trim() || null,
      metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create thread: ${error.message}`);

  return data;
}

/**
 * Save a message to a thread (client-side with authentication)
 */
export async function saveMessage(
  session: AuthClerkSession,
  { threadId, role, content, metadata = {} }: SaveMessageParams
): Promise<Message> {
  const supabase = createAuthenticatedSupabaseClient(session);

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
  const { error: bumpError } = await supabase
    .from("threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (bumpError) {
    // Non-fatal; message already saved
    console.warn("Failed to bump thread.updated_at", bumpError);
  }

  return data;
}

/**
 * Get all threads for a user with optional pagination (client-side with authentication)
 */
export async function getUserThreads(
  session: AuthClerkSession,
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ThreadWithLastMessage[]> {
  const supabase = createAuthenticatedSupabaseClient(session);

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
    // Ensure nested messages are chronologically ordered
    .order("created_at", { foreignTable: "messages", ascending: true })
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
 * Get thread with its messages (client-side with authentication)
 */
export async function getThreadWithMessages(
  session: AuthClerkSession,
  threadId: string
): Promise<{ thread: Thread; messages: Message[] } | null> {
  const supabase = createAuthenticatedSupabaseClient(session);

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
 * Update a thread's title (client-side with authentication)
 */
export async function updateThreadTitle(
  session: AuthClerkSession,
  threadId: string,
  title: string
): Promise<Thread> {
  const supabase = createAuthenticatedSupabaseClient(session);

  const { data, error } = await supabase
    .from("threads")
    .update({ title: title.trim() || null })
    .eq("id", threadId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update thread title: ${error.message}`);
  }

  return data;
}

/**
 * Delete a thread and all its messages (client-side with authentication)
 */
export async function deleteThread(
  session: AuthClerkSession,
  threadId: string
): Promise<void> {
  const supabase = createAuthenticatedSupabaseClient(session);

  const { error } = await supabase.from("threads").delete().eq("id", threadId);

  if (error) {
    throw new Error(`Failed to delete thread: ${error.message}`);
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
