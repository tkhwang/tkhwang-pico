import { nestApi } from './nest';

interface SaveContentRequest {
  url: string;
}

interface SaveContentResponse {
  id: string;
  url: string;
  title?: string;
  author?: string;
  domain?: string;
  summary?: string;
  published_at?: string;
  tags?: string[];
  word_count?: number;
}

/**
 * Save a new content URL to the backend
 */
export async function saveContent(url: string, token: string): Promise<SaveContentResponse> {
  const response = await nestApi<SaveContentResponse>('/contents/save', {
    method: 'POST',
    body: { url } as SaveContentRequest,
    token,
  });

  return response;
}
