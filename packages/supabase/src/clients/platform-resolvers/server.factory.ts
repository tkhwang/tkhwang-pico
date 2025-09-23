import { SupabaseAuthError, SupabaseConfigError, validateAuthToken } from '../../lib/config';
import type { ServerFactoryOptions, ServerFactoryResult } from '../../types';
import {
  createServerClient,
  createServerClientWithAuth,
  createServerServiceClient,
  SupabaseClientFactory,
} from '../server';

export function buildServerFactory(options: ServerFactoryOptions): ServerFactoryResult {
  const mode = options.mode ?? 'service';
  const config = options.config;

  const helpersFactory = () => new SupabaseClientFactory(config);

  const helpers = {
    getClientFactory: helpersFactory,
    getClientForUser: (jwt: string) => createServerClientWithAuth({ token: jwt }, config),
    getPublicClient: () => createServerClient(config),
    getServiceClient: () => createServerServiceClient(config),
  };

  if (mode === 'service') {
    const client = createServerServiceClient(config);
    return {
      platform: 'server',
      mode,
      client,
      helpers,
    };
  }

  if (mode === 'auth') {
    if (!options.auth) {
      throw new SupabaseAuthError('Auth mode for server clients requires an auth token.');
    }

    const validatedAuth = {
      token: validateAuthToken(options.auth.token),
    };

    const client = createServerClientWithAuth(validatedAuth, config);

    return {
      platform: 'server',
      mode,
      client,
      helpers,
    };
  }

  if (mode === 'public') {
    const client = createServerClient(config);
    return {
      platform: 'server',
      mode,
      client,
      helpers,
    };
  }

  throw new SupabaseConfigError(`Unsupported server mode: ${mode}`);
}
