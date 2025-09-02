import normalizeUrl from 'normalize-url';

export function toCanonicalUrl(url: string): string {
  return normalizeUrl(url, {
    stripWWW: true,
    removeTrailingSlash: true,
    removeQueryParameters: [/^utm_\w+/i], // 마케팅 파라미터 제거
    stripHash: true,
  });
}

export function redactUrl(u: string): string {
  try {
    const url = new URL(u);
    const redacted = new URL(url.origin + url.pathname); // drop entire query by default
    // If whitelisting is preferred, selectively keep safe keys:
    // const safe = new URL(u);
    // ['ref','utm_source','utm_medium','utm_campaign'].forEach((k)=> {
    //   if (safe.searchParams.has(k)) redacted.searchParams.set(k, safe.searchParams.get(k)!);
    // });
    return redacted.toString();
  } catch {
    return u; // fallback: return as-is; upstream will still canonicalize/validate
  }
}
