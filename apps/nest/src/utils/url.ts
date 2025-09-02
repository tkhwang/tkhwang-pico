import normalizeUrl from 'normalize-url';

export function toCanonicalUrl(url: string): string {
  return normalizeUrl(url, {
    stripWWW: true,
    removeTrailingSlash: true,
    removeQueryParameters: [/^utm_\w+/i], // 마케팅 파라미터 제거
    stripHash: true,
  });
}
