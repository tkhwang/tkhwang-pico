jest.mock('src/utils/url', () => ({
  detectLang: () => 'en',
}));

import { IngestExtractService } from './ingest-extract.service';

describe('IngestExtractService', () => {
  const service = new IngestExtractService();

  describe('extractMetadata', () => {
    it('normalizes relative image URLs using the base URL', () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta property="og:title" content="Sample" />
            <meta property="og:image" content="/img/facebook.png" />
          </head>
          <body>
            <h1>Sample</h1>
          </body>
        </html>
      `;

      const metadata = service.extractMetadata(html, 'https://playbook.samaltman.com/');

      expect(metadata.imageUrl).toBe('https://playbook.samaltman.com/img/facebook.png');
    });
  });
});
