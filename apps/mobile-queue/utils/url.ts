export function getFaviconUrl(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const { favicon_url } = metadata as { favicon_url?: unknown };

  return typeof favicon_url === 'string' ? favicon_url : null;
}
