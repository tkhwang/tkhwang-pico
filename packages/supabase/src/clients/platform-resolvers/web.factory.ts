import { SupabaseAuthError, SupabaseConfigError, validateAuthToken } from '../../lib/config';
import type { WebFactoryOptions, WebFactoryResult, WebRuntime } from '../../types';
import type { ClerkSession, ServerCookieMethods } from '../web';
import {
  createWebClientWithAuth,
  createWebServerClient,
  createWebServerClientWithAuth,
  getClerkToken,
} from '../web';

function resolveWebRuntime(runtime?: WebRuntime): WebRuntime {
  return runtime ?? 'browser';
}

export function buildWebFactory(options: WebFactoryOptions): WebFactoryResult {
  const runtime = resolveWebRuntime(options.runtime);
  const defaultMode = runtime === 'browser' ? 'auth' : 'public';
  const mode = options.mode ?? defaultMode;

  if (runtime === 'browser') {
    if (mode !== 'auth') {
      throw new SupabaseConfigError(
        'Auth mode is the only supported option in the browser runtime.',
      );
    }
    const session: ClerkSession | null = options.session ?? null;
    const client = createWebClientWithAuth(session, options.config);

    return {
      platform: 'web',
      mode,
      client,
      helpers: {
        runtime,
        getClerkToken,
      },
    };
  }

  if (!options.cookies) {
    throw new SupabaseConfigError('Cookies instance is required when using the server runtime.');
  }

  const cookies: ServerCookieMethods = options.cookies;

  if (mode === 'auth') {
    if (!options.auth) {
      throw new SupabaseAuthError('Auth mode on the server runtime requires an auth token.');
    }

    const validatedAuth = {
      token: validateAuthToken(options.auth.token),
    };

    const client = createWebServerClientWithAuth(cookies, validatedAuth, options.config);

    return {
      platform: 'web',
      mode,
      client,
      helpers: {
        runtime,
        getClerkToken,
      },
    };
  }

  if (mode !== 'public') {
    throw new SupabaseConfigError(`Unsupported web mode: ${mode}`);
  }

  const client = createWebServerClient(cookies, options.config);

  return {
    platform: 'web',
    mode,
    client,
    helpers: {
      runtime,
      getClerkToken,
    },
  };
}
