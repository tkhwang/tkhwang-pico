import {
  TextMessage,
  Role as copilotKitRole,
} from "@copilotkit/runtime-client-gql";
import type { Message } from "../lib/supabase/chat";

/**
 * Converts a single database message to CopilotKit message format
 */
export function convertToCopilotMessage(message: Message): TextMessage {
  const role =
    message.role === "user" ? copilotKitRole.User : copilotKitRole.Assistant;
  return new TextMessage({
    id: message.id,
    role,
    content: message.content,
    createdAt: message.created_at,
  });
}

/**
 * Converts database messages to CopilotKit message format
 */
export function convertToCopilotMessages(messages: Message[]): TextMessage[] {
  return messages.map((message: Message) => {
    return convertToCopilotMessage(message);
  });
}
