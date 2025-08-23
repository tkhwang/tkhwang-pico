export const queryKey = {
  threads: {
    byUserId: (userId: string | undefined) =>
      ["threads", "by-user-id", userId] as const,
  },
  messages: {
    byThreadId: (threadId: string | undefined) =>
      ["threads", "by-id", threadId, "messages"] as const,
  },
};
