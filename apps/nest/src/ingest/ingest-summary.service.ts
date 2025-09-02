import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class IngestSummaryService {
  private readonly logger = new Logger(IngestSummaryService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        'OpenAI API key not configured. AI summaries will be unavailable.',
      );
    }
  }

  async generateSummary(
    content: string,
    lang: string = 'en',
  ): Promise<string | null> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured, skipping summary generation');
      return null;
    }

    if (!content || content.trim().length < 100) {
      return null;
    }

    try {
      const model =
        this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';

      const systemPrompt = this.getSystemPrompt(lang);
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Please summarize the following content:\n\n${content.substring(0, 3000)}`,
          },
        ],
        max_tokens: 200,
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
        `Failed to generate summary: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      return null;
    }
  }

  async extractKeywords(text: string): Promise<string[]> {
    if (!this.openai || !text) {
      return [];
    }

    try {
      const model =
        this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';

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
            content: text.substring(0, 2000),
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
        `Failed to extract keywords: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
      ? '당신은 웹 콘텐츠를 요약하는 전문가입니다. 주어진 텍스트의 핵심 내용을 2-3문장으로 간결하게 요약해주세요.'
      : 'You are an expert at summarizing web content. Summarize the key points of the given text in 2-3 sentences.';
  }
}
