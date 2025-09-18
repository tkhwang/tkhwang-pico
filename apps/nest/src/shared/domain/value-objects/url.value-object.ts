import normalizeUrl from 'normalize-url';

/**
 * URL Value Object - Immutable representation of a URL
 * Encapsulates all URL-related operations following DDD principles
 */
export class Url {
  private readonly _value: URL;
  private readonly _originalString: string;

  private constructor(value: URL, originalString: string) {
    // Freeze to ensure immutability
    this._value = Object.freeze(value);
    this._originalString = originalString;
  }

  /**
   * Creates a new Url instance
   * @throws Error if the URL string is invalid
   */
  static create(url: string): Url {
    const urlObject = new URL(url);
    return new Url(urlObject, url);
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

  // ===== Getters (from native URL object) =====

  /**
   * Returns the hostname without www prefix
   * Migrated from: utils/url.ts hostname()
   */
  get hostname(): string {
    return this._value.hostname.replace(/^www\./, '');
  }

  /**
   * Alias for hostname
   */
  get domain(): string {
    return this.hostname;
  }

  get origin(): string {
    return this._value.origin;
  }

  get pathname(): string {
    return this._value.pathname;
  }

  get protocol(): string {
    return this._value.protocol;
  }

  get href(): string {
    return this._value.href;
  }

  get searchParams(): URLSearchParams {
    return this._value.searchParams;
  }

  // ===== URL Type Checks =====

  isHttp(): boolean {
    return this.protocol === 'http:' || this.protocol === 'https:';
  }

  isSecure(): boolean {
    return this.protocol === 'https:';
  }

  isLocalhost(): boolean {
    return this.hostname === 'localhost' || this.hostname === '127.0.0.1';
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
      // For HTTP(S), keep only origin and pathname
      const redacted = new URL(this.origin + this.pathname);
      return new Url(redacted, redacted.toString());
    }
    // For other protocols, strip query and hash
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
      return Url.tryCreate(`https:${relativePath}`);
    }

    // Absolute path (starts with /)
    if (relativePath.startsWith('/')) {
      return Url.create(`${this.origin}${relativePath}`);
    }

    // Other relative paths (e.g., 'images/photo.jpg', '../images/photo.jpg')
    try {
      const absoluteUrl = new URL(relativePath, this.href);
      return new Url(absoluteUrl, absoluteUrl.href);
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

    // Check if it's already an absolute URL or data URL
    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('//')
    ) {
      // Handle protocol-relative URLs
      if (imageUrl.startsWith('//')) {
        return `https:${imageUrl}`;
      }
      return imageUrl;
    }

    // Try to resolve using baseUrl
    if (baseUrl) {
      const resolved = baseUrl.resolveRelative(imageUrl);
      if (resolved) return resolved.href;
    }

    // Fallback to domain if available
    if (domain && imageUrl.startsWith('/')) {
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const domainUrl = Url.tryCreate(`${protocol}://${domain}`);
      if (domainUrl) {
        const resolved = domainUrl.resolveRelative(imageUrl);
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
