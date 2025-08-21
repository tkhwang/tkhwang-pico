import { Role as copilotKitRole } from "@copilotkit/runtime-client-gql";

/**
 * Role type : Database & CopilotKit
 */
export type DatabaseRole = "user" | "assistant" | "system";
export type CopilotKitRole =
  (typeof copilotKitRole)[keyof typeof copilotKitRole];
