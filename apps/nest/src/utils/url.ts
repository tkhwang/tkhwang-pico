import * as crypto from 'crypto';

import { franc } from 'franc-min';

import { Url } from '../shared/domain/value-objects/url.value-object';

export function toCanonicalUrl(url: string): string {
  return Url.create(url).toCanonical().href;
}

export function redactUrl(u: string): string {
  const url = Url.tryCreate(u);
  if (url) {
    return url.redact().href;
  }
  // Fallback: never persist tokens in queries or fragments
  const i1 = u.search(/[?#]/);
  return i1 === -1 ? u : u.slice(0, i1);
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
  return Url.tryCreate(url)?.hostname ?? null;
}

export function countWords(text: string): number {
  return (text?.trim().match(/\S+/g) || []).length;
}
