import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class IngestSummaryService {
  private readonly logger = new Logger(IngestSummaryService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel = 'gpt-4o-mini';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key not configured.');
      throw new Error('OpenAI API key not configured.');
    }

    this.openai = new OpenAI({
      apiKey,
      timeout: 15_000, // 15s
      maxRetries: 2, // SDK default is 2; keep explicit
    });
  }

  async generateSummary(content: string, lang = 'en'): Promise<string | null> {
    if (!content || content.trim().length < 100) {
      return null;
    }

    try {
      const model = this.configService.get<string>('OPENAI_MODEL') || this.defaultModel;

      const systemPrompt = this.getSystemPrompt(lang);
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Please summarize the following content:\n\n${content.substring(0, 8000)}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      const summary = response.choices[0]?.message?.content?.trim();

      if (!summary) {
        this.logger.warn('Empty summary generated');
        return null;
      }

      return summary;
    } catch (error) {
      this.logger.error(
        `Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  async extractKeywords(text: string): Promise<string[]> {
    if (!text) {
      return [];
    }

    try {
      const model = this.configService.get<string>('OPENAI_MODEL') || this.defaultModel;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Extract 3-5 key topics or keywords from the text. Return only a comma-separated list of keywords.',
          },
          {
            role: 'user',
            content: text.substring(0, 4000),
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const keywords = response.choices[0]?.message?.content?.trim();

      if (!keywords) {
        return [];
      }

      return keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
        .slice(0, 5);
    } catch (error) {
      this.logger.error(
        `Failed to extract keywords: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /*
   *  Private
   */
  private getSystemPrompt(rawLang: string) {
    const norm = (rawLang ?? 'en').toLowerCase();
    const isKO = norm === 'ko' || norm.startsWith('ko-') || norm === 'kor';
    return isKO
      ? '당신은 웹 콘텐츠를 요약하는 전문가입니다. 다음 내용을 5-7문장으로 상세히 요약해주세요. 주제와 목적, 핵심 주장이나 발견, 중요한 세부사항과 예시, 결론이나 시사점을 포함해주세요.'
      : 'You are an expert at summarizing web content. Provide a comprehensive summary in 5-7 sentences covering: main topic and purpose, key arguments or findings, important details and examples, conclusions or implications.';
  }
}
