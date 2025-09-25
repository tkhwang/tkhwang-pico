import { Role as copilotKitRole, TextMessage } from '@copilotkit/runtime-client-gql';

import type { Message } from '@/lib/supabase/messages';
import type { DatabaseRole } from '@/types/role';

type CopilotKitRole = (typeof copilotKitRole)[keyof typeof copilotKitRole];

/**
 *   Converts CopilotKit role to database role string
 *
 * @export
 * @param {CopilotKitRole} role
 * @return {*}  {DatabaseRole}
 */
const toDbRoleMap: Partial<Record<CopilotKitRole, DatabaseRole>> = {
  [copilotKitRole.User]: 'user',
  [copilotKitRole.Assistant]: 'assistant',
  [copilotKitRole.System]: 'system',
};
export function copilotRoleToString(role: CopilotKitRole): DatabaseRole {
  return toDbRoleMap[role] ?? 'assistant';
}

/**
 * Converts database role string to CopilotKit role
 *
 * @export
 * @param {DatabaseRole} role
 * @return {*}  {CopilotKitRole}
 */
const toGqlRoleMap: Record<DatabaseRole, CopilotKitRole> = {
  user: copilotKitRole.User,
  assistant: copilotKitRole.Assistant,
  system: copilotKitRole.System,
};
export function stringToCopilotRole(role: DatabaseRole): CopilotKitRole {
  return toGqlRoleMap[role];
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
