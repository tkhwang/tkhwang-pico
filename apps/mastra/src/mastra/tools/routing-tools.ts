import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { routingNetwork } from '../network/routing-network';
import { detectLanguage, generateFallbackMessage } from './fallback-tools';

export const checkRequestIntent = createTool({
  id: 'checkRequestIntent',
  description: 'Analyze user request intent for routing',
  inputSchema: z.object({
    message: z.string().describe('User message to analyze'),
  }),
  outputSchema: z.object({
    isWeatherRelated: z.boolean().describe('Whether request is weather-related'),
    needsFallback: z.boolean().describe('Whether request needs fallback response'),
  }),
  execute: async ({ context }) => {
    const message = context.message.toLowerCase();
    const weatherKeywords = [
      '날씨',
      '기온',
      '예보',
      '비',
      '눈',
      'weather',
      'temperature',
      'forecast',
      'rain',
      'snow',
    ];
    const activityKeywords = ['활동', '계획', '야외', 'activity', 'plan', 'outdoor'];

    const hasWeather = weatherKeywords.some((keyword) => message.includes(keyword));
    const hasActivity = activityKeywords.some((keyword) => message.includes(keyword));

    return {
      isWeatherRelated: hasWeather,
      // Only fallback when neither weather nor activity context is present.
      needsFallback: !hasWeather && !hasActivity,
    };
  },
});

export const handleUserRequest = createTool({
  id: 'handleUserRequest',
  description: 'Handle user requests using the intelligent routing network',
  inputSchema: z.object({
    message: z.string().describe('User message to process'),
  }),
  outputSchema: z.object({
    response: z.string().describe('Network response'),
    handler: z.string().optional().describe('Handler used'),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      // Use routingNetwork to intelligently handle the request
      const response = await routingNetwork.generate(
        [
          {
            role: 'user',
            content: context.message,
          },
        ],
        {
          runtimeContext,
        },
      );

      return {
        response: response.result || '응답을 생성할 수 없습니다.',
        handler: response.resourceId || 'unknown',
      };
    } catch {
      // Fallback error handling
      const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(context.message || '');

      const fallbackResponse = hasKorean
        ? `죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.`
        : `I'm sorry, there was an error processing your request. Please try again.`;

      return {
        response: fallbackResponse,
        handler: 'fallback',
      };
    }
  },
});

export { detectLanguage, generateFallbackMessage };
