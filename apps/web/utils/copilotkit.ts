import {
  TextMessage,
  Role as copilotKitRole,
} from "@copilotkit/runtime-client-gql";
import type { Message } from "../lib/supabase/chat";
import { CopilotKitRole, DatabaseRole } from "@/types/role";

/**
 *   Converts CopilotKit role to database role string
 *
 * @export
 * @param {CopilotKitRole} role
 * @return {*}  {DatabaseRole}
 */
export function copilotRoleToString(role: CopilotKitRole): DatabaseRole {
  switch (role) {
    case copilotKitRole.User:
      return "user";
    case copilotKitRole.Assistant:
      return "assistant";
    case copilotKitRole.System:
      return "system";
    default:
      return "assistant";
  }
}

/**
 * Converts database role string to CopilotKit role
 *
 * @export
 * @param {DatabaseRole} role
 * @return {*}  {CopilotKitRole}
 */
export function stringToCopilotRole(role: DatabaseRole): CopilotKitRole {
  switch (role) {
    case "user":
      return copilotKitRole.User;
    case "assistant":
      return copilotKitRole.Assistant;
    case "system":
      return copilotKitRole.System;
    default:
      return copilotKitRole.Assistant;
  }
}

/**
 * Converts a single database message to CopilotKit message format
 *
 * @export
 * @param {Message} message
 * @return {*}  {TextMessage}
 */
export function convertToCopilotMessage(message: Message): TextMessage {
  const role = stringToCopilotRole(message.role as DatabaseRole);
  return new TextMessage({
    id: message.id,
    role,
    content: message.content,
    createdAt: message.created_at,
  });
}

/**
 *  Converts database messages to CopilotKit message format
 *
 * @export
 * @param {Message[]} messages
 * @return {*}  {TextMessage[]}
 */
export function convertToCopilotMessages(messages: Message[]): TextMessage[] {
  return messages.map((message: Message) => {
    return convertToCopilotMessage(message);
  });
}
