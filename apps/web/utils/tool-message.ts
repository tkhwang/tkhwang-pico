export function generateGenericToolMessage(
  name: string,
  status: string
): string {
  if (status === "complete") {
    return `Used ${name}`;
  }
  return `Using ${name}...`;
}
