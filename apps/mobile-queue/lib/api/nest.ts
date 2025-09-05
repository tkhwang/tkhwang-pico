import { getRequiredEnv } from '@/utils/env';

/**
 * Nest.js API client configuration
 */

const NEST_API_URL = process.env.EXPO_PUBLIC_NEST_API_URL!;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

/**
 * Make an authenticated request to the Nest.js backend
 */
export async function nestApi<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options;

  // Ensure proper URL construction
  const base = NEST_API_URL.endsWith('/') ? NEST_API_URL.slice(0, -1) : NEST_API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (token) requestHeaders['Authorization'] = `Bearer ${token}`;

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') requestOptions.body = JSON.stringify(body);

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage: string;

      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || parsedError.error || `HTTP ${response.status}`;
      } catch {
        errorMessage = errorData || `HTTP ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      // Provide more context for network errors
      if (error.message === 'Network request failed') {
        throw new Error(
          `Network request failed. Please check if the server is running at ${NEST_API_URL}`
        );
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}
