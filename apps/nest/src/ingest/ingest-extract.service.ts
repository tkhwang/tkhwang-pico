import { Injectable, Logger } from '@nestjs/common';
import got from 'got';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { franc } from 'franc-min';

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
    const res = await got(url, {
      timeout: { request: 15000 },
      headers: {
        'user-agent': 'Mozilla/5.0 ReadItLaterBot/1.0 (+support@example.com)',
      },
      retry: { limit: 2 },
      followRedirect: true,
      https: { rejectUnauthorized: true },
    });
    return res.body;
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
    let lang = htmlLang || 'en';
    if (!htmlLang && (title || summary)) {
      const textSample = `${title} ${summary}`.substring(0, 500);
      const detectedLang = franc(textSample);
      if (detectedLang !== 'und') {
        lang = detectedLang;
      }
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
      try {
        publishedAt = new Date(articlePublished);
      } catch {
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
}
