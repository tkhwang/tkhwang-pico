/**
 * Supabase Repository Layer
 *
 * Provides a consistent Repository pattern interface for all Supabase operations
 * Similar to the architecture used in the Nest.js backend
 */

export { UserContentsRepository } from './user-contents.repository';
export {
  type PreferenceType,
  type UserContentPreference,
  UserContentsPreferencesRepository,
} from './user-contents-preferences.repository';
