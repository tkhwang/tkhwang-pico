export function generateToolMessage(
  status: string,
  icon: string,
  action: string
): string {
  return `${icon} ${action} ${status !== "complete" ? "..." : ""}`;
}
