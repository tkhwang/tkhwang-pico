import { nestApi } from './nest';

interface SaveContentRequest {
  url: string;
}

interface SaveContentResponse {
  contentId: string;
  status: 'pending' | 'ready' | 'failed' | 'archived';
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
