import * as crypto from 'crypto';

import { franc } from 'franc-min';
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

export function contentHash(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export function detectLang(text: string): string | null {
  const code3 = franc(text || '', { minLength: 20 });
  if (code3 === 'und') return null;
  const map: Record<string, string> = {
    eng: 'en',
    kor: 'ko',
    jpn: 'ja',
    zho: 'zh',
    spa: 'es',
    fra: 'fr',
    deu: 'de',
    ita: 'it',
    nld: 'nl',
    rus: 'ru',
    por: 'pt',
  };
  return map[code3] ?? code3.slice(0, 2);
}

export function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function countWords(text: string): number {
  return (text?.trim().match(/\S+/g) || []).length;
}
