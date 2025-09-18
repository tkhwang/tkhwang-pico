import normalizeUrl from 'normalize-url';

/**
 * URL Value Object - Immutable representation of a URL
 * Encapsulates all URL-related operations following DDD principles
 */
export class Url {
  private readonly _href: string;
  private readonly _originalString: string;

  private constructor(href: string, originalString: string) {
    this._href = href;
    this._originalString = originalString;
    Object.freeze(this);
  }

  /**
   * Creates a new Url instance
   * @throws Error if the URL string is invalid
   */
  static create(url: string): Url {
    const urlObject = Url.parse(url);
    return new Url(urlObject.href, url);
  }

  /**
   * Tries to create a Url instance, returns null on failure
   */
  static tryCreate(url: string): Url | null {
    try {
      return Url.create(url);
    } catch {
      return null;
    }
  }

  private static parse(url: string): URL {
    return new URL(url);
  }

  private get parsed(): URL {
    return new URL(this._href);
  }

  // ===== Getters (from native URL object) =====

  /**
   * Returns the hostname without www prefix
   * Migrated from: utils/url.ts hostname()
   */
  get hostname(): string {
    const { hostname } = this.parsed;
    return hostname.replace(/^www\./, '');
  }

  /**
   * Alias for hostname
   */
  get domain(): string {
    return this.hostname;
  }

  get origin(): string {
    return this.parsed.origin;
  }

  get pathname(): string {
    return this.parsed.pathname;
  }

  get protocol(): string {
    return this.parsed.protocol;
  }

  get href(): string {
    return this._href;
  }

  get searchParams(): URLSearchParams {
    return new URLSearchParams(this.parsed.searchParams);
  }

  // ===== URL Type Checks =====

  isHttp(): boolean {
    return this.protocol === 'http:' || this.protocol === 'https:';
  }

  isSecure(): boolean {
    return this.protocol === 'https:';
  }

  isLocalhost(): boolean {
    return (
      this.hostname === 'localhost' ||
      this.hostname === '127.0.0.1' ||
      this.hostname === '::1'
    );
  }

  // ===== URL Transformations =====

  /**
   * Returns a canonical version of the URL
   * Migrated from: utils/url.ts toCanonicalUrl()
   */
  toCanonical(): Url {
    const canonical = normalizeUrl(this._originalString, {
      stripWWW: true,
      removeTrailingSlash: true,
      removeQueryParameters: [/^utm_\w+/i], // Remove marketing parameters
      stripHash: true,
    });
    return Url.create(canonical);
  }

  /**
   * Returns a redacted version of the URL (removes query params and hash)
   * Migrated from: utils/url.ts redactUrl()
   */
  redact(): Url {
    if (this.isHttp()) {
      const parsed = this.parsed;
      return Url.create(`${parsed.origin}${parsed.pathname}`);
    }

    const cleanUrl = this._originalString.split(/[?#]/)[0];
    return Url.create(cleanUrl);
  }

  /**
   * Resolves a relative path against this URL
   * Migrated from: utils/url-normalizer.ts (relative path handling logic)
   */
  resolveRelative(relativePath: string): Url | null {
    if (!relativePath) return null;

    // Already absolute URL
    if (
      relativePath.startsWith('http://') ||
      relativePath.startsWith('https://') ||
      relativePath.startsWith('data:')
    ) {
      return Url.tryCreate(relativePath);
    }

    // Protocol-relative URL
    if (relativePath.startsWith('//')) {
      return Url.tryCreate(`${this.protocol}${relativePath}`);
    }

    // Absolute path (starts with /)
    if (relativePath.startsWith('/')) {
      return Url.create(`${this.origin}${relativePath}`);
    }

    // Other relative paths (e.g., 'images/photo.jpg', '../images/photo.jpg')
    try {
      const absoluteUrl = new URL(relativePath, this.href);
      return Url.create(absoluteUrl.href);
    } catch {
      return null;
    }
  }

  // ===== Static Helper Methods =====

  /**
   * Normalizes an image URL (converts relative to absolute)
   * Migrated from: utils/url-normalizer.ts normalizeImageUrl()
   */
  static normalizeImageUrl(
    imageUrl: string | null | undefined,
    baseUrl?: Url | null,
    domain?: string | null,
  ): string | null {
    if (!imageUrl) return null;
    const trimmed = imageUrl.trim();
    const lower = trimmed.toLowerCase();

    // Disallow dangerous schemes outright
    if (
      /^(javascript|vbscript|file|filesystem|about|chrome|chrome-extension):/.test(
        lower,
      )
    ) {
      return null;
    }

    // Allow only image data URLs
    if (lower.startsWith('data:')) {
      return lower.startsWith('data:image/') ? trimmed : null;
    }

    // Already absolute HTTP(S)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Protocol-relative URLs
    if (trimmed.startsWith('//')) {
      return `${baseUrl ? baseUrl.protocol : 'https:'}${trimmed}`;
    }

    // Try to resolve using baseUrl
    if (baseUrl) {
      const resolved = baseUrl.resolveRelative(imageUrl);
      if (resolved) return resolved.href;
    }

    // Fallback to domain if available
    if (domain && trimmed.startsWith('/')) {
      const host =
        domain.includes(':') && !domain.startsWith('[')
          ? `[${domain}]`
          : domain;
      const domainUrl =
        Url.tryCreate(`https://${host}`) ?? Url.tryCreate(`http://${host}`);
      if (domainUrl) {
        const resolved = domainUrl.resolveRelative(trimmed);
        if (resolved) return resolved.href;
      }
    }

    // Return original if we can't normalize
    return imageUrl;
  }

  // ===== Value Object Methods =====

  /**
   * Checks equality with another Url
   */
  equals(other: Url): boolean {
    if (!other) return false;
    return this.href === other.href;
  }

  /**
   * Returns string representation of the URL
   */
  toString(): string {
    return this.href;
  }

  /**
   * Returns the original string used to create this URL
   */
  toOriginalString(): string {
    return this._originalString;
  }
}
