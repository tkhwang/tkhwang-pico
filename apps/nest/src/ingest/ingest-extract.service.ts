import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { detectLang } from 'src/utils/url';

export interface ContentMetadata {
  title: string;
  summary?: string;
  author?: string | null;
  publishedAt?: Date | null;
  imageUrl?: string | null;
  siteName?: string | null;
  tags?: string[];
  lang?: string;
  wordCount?: number;
  domain?: string;
}

@Injectable()
export class IngestExtractService {
  private readonly logger = new Logger(IngestExtractService.name);

  async fetchHtml(url: string): Promise<string> {
    // Basic protocol allowlist
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) {
      throw new Error(`Unsupported protocol: ${u.protocol}`);
    }

    // SSRF guard: block private/reserved IPs for initial URL
    await this.assertPublicHost(u);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 ReadItLaterBot/1.0 (+contact@yourdomain)',
          accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }

      const ctype = res.headers.get('content-type') || '';
      if (!/(text\/html|application\/xhtml\+xml)/i.test(ctype)) {
        throw new Error(`Unsupported content-type: ${ctype}`);
      }

      // Guard extremely large bodies
      const len = res.headers.get('content-length');
      const MAX = 2_000_000; // ~2 MB
      if (len && Number(len) > MAX) {
        throw new Error(`Response too large: ${len} bytes`);
      }
      // Re-validate final URL after redirects
      if (res.url) {
        await this.assertPublicHost(new URL(res.url));
      }
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  extractMetadata(html: string, url: string): ContentMetadata {
    const $ = cheerio.load(html);

    // Extract Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    const articleAuthor = $('meta[property="article:author"]').attr('content');
    const articlePublished = $('meta[property="article:published_time"]').attr(
      'content',
    );
    const articleTags = $('meta[property="article:tag"]')
      .map((_, el) => $(el).attr('content'))
      .get();

    // Extract Twitter Card tags
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const twitterDescription = $('meta[name="twitter:description"]').attr(
      'content',
    );
    const twitterImage = $('meta[name="twitter:image"]').attr('content');

    // Extract standard meta tags
    const metaDescription = $('meta[name="description"]').attr('content');
    const metaAuthor = $('meta[name="author"]').attr('content');
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    const pageTitle = $('title').text();

    // Extract language
    const htmlLang = $('html').attr('lang');

    // Use Readability.js as fallback for content extraction
    interface ReadabilityParsed {
      title?: string;
      byline?: string;
      excerpt?: string;
      siteName?: string;
      textContent?: string;
    }

    let readabilityContent: ReadabilityParsed | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const dom = new JSDOM(html, { url });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const reader = new Readability(dom.window.document);
      readabilityContent = reader.parse() as ReadabilityParsed | null;
    } catch (error) {
      this.logger.warn(
        `Readability parsing failed for ${url}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    // Determine final values with priority
    const title =
      ogTitle ||
      twitterTitle ||
      readabilityContent?.title ||
      pageTitle ||
      'Untitled';
    const summary =
      ogDescription ||
      twitterDescription ||
      metaDescription ||
      readabilityContent?.excerpt ||
      '';
    const author =
      articleAuthor || metaAuthor || readabilityContent?.byline || null;
    const imageUrl = ogImage || twitterImage || null;
    const siteName = ogSiteName || readabilityContent?.siteName || null;

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Detect language
    let lang = htmlLang || null;
    if (!lang) {
      const textSample = `${title} ${summary}`.substring(0, 500);
      lang = detectLang(textSample) || 'en';
    }

    // Parse tags
    const tags =
      articleTags.length > 0
        ? articleTags
        : metaKeywords
          ? metaKeywords
              .split(',')
              .map((k) => k.trim())
              .filter((k) => k.length > 0)
          : [];

    // Parse published date
    let publishedAt: Date | null = null;
    if (articlePublished) {
      const ts = Date.parse(articlePublished);
      if (!Number.isNaN(ts)) {
        publishedAt = new Date(ts);
      } else {
        this.logger.warn(`Failed to parse published date: ${articlePublished}`);
      }
    }

    // Calculate word count if we have content
    let wordCount = 0;
    if (readabilityContent?.textContent) {
      wordCount = readabilityContent.textContent.split(/\s+/).length;
    }

    return {
      title,
      summary,
      author,
      publishedAt,
      imageUrl,
      siteName,
      tags,
      lang,
      wordCount,
      domain,
    };
  }

  /*
   *  Private
   */
  // Place inside IngestExtractService
  private async assertPublicHost(u: URL) {
    // localhost / explicit IPs
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      throw new Error(`Blocked private host: ${host}`);
    }
    // DNS resolve and block private ranges
    const { promises: dns } = await import('node:dns');
    const results = await dns.lookup(host, { all: true, verbatim: true });
    for (const r of results) {
      if (this.isPrivateAddress(r.address)) {
        throw new Error(`Blocked private address: ${r.address}`);
      }
    }
  }

  private isPrivateAddress(addr: string): boolean {
    // IPv4
    const m = addr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      return (
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 127 ||
        (a === 169 && b === 254)
      );
    }
    // IPv6: loopback, link-local, unique-local
    const lower = addr.toLowerCase();
    return (
      lower === '::1' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc') ||
      lower.startsWith('fd')
    );
  }
}
