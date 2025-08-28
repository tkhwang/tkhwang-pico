import type { useSession } from "@clerk/nextjs";

export type AuthClerkSession = ReturnType<typeof useSession>["session"];
