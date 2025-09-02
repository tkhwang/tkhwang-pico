import { Injectable } from '@nestjs/common';
import got from 'got';

@Injectable()
export class IngestExtractService {
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
}
