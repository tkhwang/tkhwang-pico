export function generateToolMessage(
  status: string,
  icon: string,
  action: string,
  showIcon = false
): string {
  return `${showIcon ? icon : ""} ${action} ${status !== "complete" ? "..." : ""}`;
}
