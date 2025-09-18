import { Url } from './url.value-object';

describe('Url Value Object', () => {
  describe('Creation', () => {
    describe('create()', () => {
      it('should create a valid Url instance', () => {
        const url = Url.create('https://example.com');
        expect(url).toBeInstanceOf(Url);
        expect(url.href).toBe('https://example.com/');
      });

      it('should throw error for invalid URL', () => {
        expect(() => Url.create('not a url')).toThrow();
        expect(() => Url.create('')).toThrow();
        expect(() => Url.create('///')).toThrow();
      });

      it('should handle URLs with various components', () => {
        const url = Url.create(
          'https://user:pass@example.com:8080/path?query=1#hash',
        );
        expect(url.href).toBe(
          'https://user:pass@example.com:8080/path?query=1#hash',
        );
        expect(url.hostname).toBe('example.com');
        expect(url.pathname).toBe('/path');
      });
    });

    describe('tryCreate()', () => {
      it('should return Url instance for valid URL', () => {
        const url = Url.tryCreate('https://example.com');
        expect(url).toBeInstanceOf(Url);
        expect(url?.href).toBe('https://example.com/');
      });

      it('should return null for invalid URL', () => {
        expect(Url.tryCreate('not a url')).toBeNull();
        expect(Url.tryCreate('')).toBeNull();
        expect(Url.tryCreate('///')).toBeNull();
      });
    });
  });

  describe('Getters', () => {
    let url: Url;

    beforeEach(() => {
      url = Url.create(
        'https://www.example.com:8080/path/to/resource?query=1&test=2#section',
      );
    });

    describe('hostname', () => {
      it('should return hostname without www prefix', () => {
        expect(url.hostname).toBe('example.com');
      });

      it('should handle URLs without www', () => {
        const urlNoWww = Url.create('https://example.com');
        expect(urlNoWww.hostname).toBe('example.com');
      });

      it('should handle subdomains', () => {
        const subUrl = Url.create('https://api.example.com');
        expect(subUrl.hostname).toBe('api.example.com');
      });

      it('should remove www but keep other subdomains', () => {
        const subUrl = Url.create('https://www.api.example.com');
        expect(subUrl.hostname).toBe('api.example.com');
      });
    });

    describe('domain', () => {
      it('should be an alias for hostname', () => {
        expect(url.domain).toBe(url.hostname);
        expect(url.domain).toBe('example.com');
      });
    });

    describe('origin', () => {
      it('should return the origin', () => {
        expect(url.origin).toBe('https://www.example.com:8080');
      });

      it('should handle default ports', () => {
        const httpUrl = Url.create('http://example.com/path');
        const httpsUrl = Url.create('https://example.com/path');
        expect(httpUrl.origin).toBe('http://example.com');
        expect(httpsUrl.origin).toBe('https://example.com');
      });
    });

    describe('pathname', () => {
      it('should return the pathname', () => {
        expect(url.pathname).toBe('/path/to/resource');
      });

      it('should handle root path', () => {
        const rootUrl = Url.create('https://example.com');
        expect(rootUrl.pathname).toBe('/');
      });
    });

    describe('protocol', () => {
      it('should return the protocol with colon', () => {
        expect(url.protocol).toBe('https:');
      });

      it('should handle different protocols', () => {
        const httpUrl = Url.create('http://example.com');
        const ftpUrl = Url.create('ftp://example.com');
        expect(httpUrl.protocol).toBe('http:');
        expect(ftpUrl.protocol).toBe('ftp:');
      });
    });

    describe('href', () => {
      it('should return the normalized href', () => {
        expect(url.href).toBe(
          'https://www.example.com:8080/path/to/resource?query=1&test=2#section',
        );
      });

      it('should normalize URLs with trailing slash', () => {
        const urlWithSlash = Url.create('https://example.com/');
        const urlWithoutSlash = Url.create('https://example.com');
        expect(urlWithSlash.href).toBe('https://example.com/');
        expect(urlWithoutSlash.href).toBe('https://example.com/');
      });
    });

    describe('searchParams', () => {
      it('should return URLSearchParams instance', () => {
        expect(url.searchParams).toBeInstanceOf(URLSearchParams);
      });

      it('should contain query parameters', () => {
        expect(url.searchParams.get('query')).toBe('1');
        expect(url.searchParams.get('test')).toBe('2');
      });

      it('should return new instance each time', () => {
        const params1 = url.searchParams;
        const params2 = url.searchParams;
        expect(params1).not.toBe(params2);
      });
    });
  });

  describe('URL Type Checks', () => {
    describe('isHttp()', () => {
      it('should return true for http and https', () => {
        const httpUrl = Url.create('http://example.com');
        const httpsUrl = Url.create('https://example.com');
        expect(httpUrl.isHttp()).toBe(true);
        expect(httpsUrl.isHttp()).toBe(true);
      });

      it('should return false for other protocols', () => {
        const ftpUrl = Url.create('ftp://example.com');
        const fileUrl = Url.create('file:///path/to/file');
        expect(ftpUrl.isHttp()).toBe(false);
        expect(fileUrl.isHttp()).toBe(false);
      });
    });

    describe('isSecure()', () => {
      it('should return true for https', () => {
        const httpsUrl = Url.create('https://example.com');
        expect(httpsUrl.isSecure()).toBe(true);
      });

      it('should return false for http and other protocols', () => {
        const httpUrl = Url.create('http://example.com');
        const ftpUrl = Url.create('ftp://example.com');
        expect(httpUrl.isSecure()).toBe(false);
        expect(ftpUrl.isSecure()).toBe(false);
      });
    });

    describe('isLocalhost()', () => {
      it('should return true for localhost', () => {
        const localhost = Url.create('http://localhost:3000');
        const localhostHttps = Url.create('https://localhost');
        expect(localhost.isLocalhost()).toBe(true);
        expect(localhostHttps.isLocalhost()).toBe(true);
      });

      it('should return true for 127.0.0.1', () => {
        const loopback = Url.create('http://127.0.0.1:8080');
        expect(loopback.isLocalhost()).toBe(true);
      });

      it('should return false for other domains', () => {
        const example = Url.create('https://example.com');
        const localDomain = Url.create('http://local.com');
        expect(example.isLocalhost()).toBe(false);
        expect(localDomain.isLocalhost()).toBe(false);
      });
    });
  });

  describe('URL Transformations', () => {
    describe('toCanonical()', () => {
      it('should remove www prefix', () => {
        const url = Url.create('https://www.example.com/path');
        const canonical = url.toCanonical();
        expect(canonical.href).toBe('https://example.com/path');
      });

      it('should remove trailing slash', () => {
        const url = Url.create('https://example.com/path/');
        const canonical = url.toCanonical();
        expect(canonical.href).toBe('https://example.com/path');
      });

      it('should remove UTM parameters', () => {
        const url = Url.create(
          'https://example.com?utm_source=test&utm_medium=email&keep=this',
        );
        const canonical = url.toCanonical();
        expect(canonical.href).toContain('keep=this');
        expect(canonical.href).not.toContain('utm_source');
        expect(canonical.href).not.toContain('utm_medium');
      });

      it('should remove hash', () => {
        const url = Url.create('https://example.com/path#section');
        const canonical = url.toCanonical();
        expect(canonical.href).toBe('https://example.com/path');
      });

      it('should handle all transformations together', () => {
        const url = Url.create(
          'https://www.example.com/path/?utm_source=test#section',
        );
        const canonical = url.toCanonical();
        expect(canonical.href).toBe('https://example.com/path');
      });
    });

    describe('redact()', () => {
      it('should remove query parameters and hash for http URLs', () => {
        const url = Url.create('https://example.com/path?secret=123#section');
        const redacted = url.redact();
        expect(redacted.href).toBe('https://example.com/path');
      });

      it('should preserve path for http URLs', () => {
        const url = Url.create('http://example.com/api/v1/users');
        const redacted = url.redact();
        expect(redacted.href).toBe('http://example.com/api/v1/users');
      });

      it('should handle non-http URLs', () => {
        const url = Url.create('ftp://example.com/file?param=value#hash');
        const redacted = url.redact();
        expect(redacted.href).toBe('ftp://example.com/file');
      });
    });

    describe('resolveRelative()', () => {
      let baseUrl: Url;

      beforeEach(() => {
        baseUrl = Url.create('https://example.com/base/page.html');
      });

      it('should return null for empty relative path', () => {
        expect(baseUrl.resolveRelative('')).toBeNull();
      });

      it('should return absolute URLs unchanged', () => {
        const resolved = baseUrl.resolveRelative('https://other.com/page');
        expect(resolved?.href).toBe('https://other.com/page');
      });

      it('should handle protocol-relative URLs', () => {
        const resolved = baseUrl.resolveRelative('//cdn.example.com/resource');
        expect(resolved?.href).toBe('https://cdn.example.com/resource');
      });

      it('should handle absolute paths', () => {
        const resolved = baseUrl.resolveRelative('/absolute/path');
        expect(resolved?.href).toBe('https://example.com/absolute/path');
      });

      it('should handle relative paths', () => {
        const resolved = baseUrl.resolveRelative('relative/path');
        expect(resolved?.href).toBe('https://example.com/base/relative/path');
      });

      it('should handle parent directory paths', () => {
        const resolved = baseUrl.resolveRelative('../sibling/page.html');
        expect(resolved?.href).toBe('https://example.com/sibling/page.html');
      });

      it('should handle data URLs', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
        const resolved = baseUrl.resolveRelative(dataUrl);
        expect(resolved?.href).toBe(dataUrl);
      });

      it('should handle invalid relative paths as relative URLs', () => {
        // URL constructor treats this as a relative path, not an invalid URL
        const resolved = baseUrl.resolveRelative('ht!tp://invalid url');
        expect(resolved).not.toBeNull();
        expect(resolved?.href).toContain('ht!tp://invalid%20url');
      });
    });
  });

  describe('Static Methods', () => {
    describe('normalizeImageUrl()', () => {
      const baseUrl = Url.create('https://example.com/page');

      it('should return null for empty input', () => {
        expect(Url.normalizeImageUrl(null)).toBeNull();
        expect(Url.normalizeImageUrl(undefined)).toBeNull();
        expect(Url.normalizeImageUrl('')).toBeNull();
      });

      it('should return absolute URLs unchanged', () => {
        expect(Url.normalizeImageUrl('https://cdn.example.com/image.jpg')).toBe(
          'https://cdn.example.com/image.jpg',
        );
      });

      it('should handle protocol-relative URLs', () => {
        expect(Url.normalizeImageUrl('//cdn.example.com/image.jpg')).toBe(
          'https://cdn.example.com/image.jpg',
        );
      });

      it('should resolve relative URLs with baseUrl', () => {
        expect(Url.normalizeImageUrl('/images/photo.jpg', baseUrl)).toBe(
          'https://example.com/images/photo.jpg',
        );
        expect(Url.normalizeImageUrl('images/photo.jpg', baseUrl)).toBe(
          'https://example.com/images/photo.jpg',
        );
      });

      it('should use domain fallback when no baseUrl', () => {
        expect(
          Url.normalizeImageUrl('/images/photo.jpg', null, 'example.com'),
        ).toBe('https://example.com/images/photo.jpg');
      });

      it('should use http for localhost domain', () => {
        expect(
          Url.normalizeImageUrl('/images/photo.jpg', null, 'localhost'),
        ).toBe('http://localhost/images/photo.jpg');
      });

      it('should return original URL if cannot normalize', () => {
        expect(Url.normalizeImageUrl('relative/path.jpg', null, null)).toBe(
          'relative/path.jpg',
        );
      });

      it('should handle data URLs', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
        expect(Url.normalizeImageUrl(dataUrl)).toBe(dataUrl);
      });
    });
  });

  describe('Value Object Methods', () => {
    describe('equals()', () => {
      it('should return true for same href', () => {
        const url1 = Url.create('https://example.com/path');
        const url2 = Url.create('https://example.com/path');
        expect(url1.equals(url2)).toBe(true);
      });

      it('should return false for different href', () => {
        const url1 = Url.create('https://example.com/path1');
        const url2 = Url.create('https://example.com/path2');
        expect(url1.equals(url2)).toBe(false);
      });

      it('should handle normalized vs non-normalized URLs', () => {
        const url1 = Url.create('https://example.com');
        const url2 = Url.create('https://example.com/');
        // Both normalize to same href with trailing slash
        expect(url1.equals(url2)).toBe(true);
      });

      it('should return false for null/undefined', () => {
        const url = Url.create('https://example.com');
        // @ts-expect-error Testing null input
        expect(url.equals(null)).toBe(false);
        // @ts-expect-error Testing undefined input
        expect(url.equals(undefined)).toBe(false);
      });
    });

    describe('toString()', () => {
      it('should return the href', () => {
        const url = Url.create('https://example.com/path');
        expect(url.toString()).toBe('https://example.com/path');
        expect(url.toString()).toBe(url.href);
      });
    });

    describe('toOriginalString()', () => {
      it('should return the original input string', () => {
        const original = 'https://example.com/path';
        const url = Url.create(original);
        expect(url.toOriginalString()).toBe(original);
      });

      it('should preserve original even if href is normalized', () => {
        const original = 'https://example.com';
        const url = Url.create(original);
        expect(url.toOriginalString()).toBe(original);
        expect(url.href).toBe('https://example.com/'); // normalized with trailing slash
      });
    });
  });

  describe('Immutability', () => {
    it('should be immutable', () => {
      const url = Url.create('https://example.com');

      // Try to modify properties (should fail silently or throw in strict mode)
      expect(() => {
        // @ts-expect-error Testing immutability
        url._href = 'https://modified.com';
      }).toThrow();

      expect(() => {
        // @ts-expect-error Testing immutability
        url._originalString = 'modified';
      }).toThrow();

      // Verify values unchanged
      expect(url.href).toBe('https://example.com/');
    });

    it('should freeze the instance', () => {
      const url = Url.create('https://example.com');
      expect(Object.isFrozen(url)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with special characters', () => {
      const url = Url.create('https://example.com/path%20with%20spaces');
      expect(url.pathname).toBe('/path%20with%20spaces');
    });

    it('should handle URLs with unicode characters', () => {
      const url = Url.create('https://example.com/한글/path');
      expect(url).toBeInstanceOf(Url);
      // Unicode characters are URL-encoded in the pathname
      expect(url.pathname).toBe('/%ED%95%9C%EA%B8%80/path');
      // The original string still contains the unicode
      expect(url.toOriginalString()).toContain('한글');
    });

    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(2000);
      const url = Url.create(`https://example.com/${longPath}`);
      expect(url.pathname.length).toBeGreaterThan(2000);
    });

    it('should handle URLs with multiple query parameters with same key', () => {
      const url = Url.create('https://example.com?key=1&key=2&key=3');
      const values = url.searchParams.getAll('key');
      expect(values).toEqual(['1', '2', '3']);
    });
  });
});
