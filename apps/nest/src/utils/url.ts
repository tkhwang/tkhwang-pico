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
    // Only reconstruct for http(s); otherwise conservatively strip query/hash
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const redacted = new URL(url.origin + url.pathname); // drop entire query by default
      return redacted.toString();
    }
    const i0 = u.search(/[?#]/);
    return i0 === -1 ? u : u.slice(0, i0);
    // If whitelisting is preferred, selectively keep safe keys:
    // const safe = new URL(u);
    // ['ref','utm_source','utm_medium','utm_campaign'].forEach((k)=> {
    //   if (safe.searchParams.has(k)) redacted.searchParams.set(k, safe.searchParams.get(k)!);
    // });
  } catch {
    // Fallback: never persist tokens in queries or fragments
    const i1 = u.search(/[?#]/);
    return i1 === -1 ? u : u.slice(0, i1);
  }
}
