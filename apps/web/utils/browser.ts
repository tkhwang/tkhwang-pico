/**
 * Checks if the code is running in a browser environment
 * @returns {boolean} True if running in browser, false if running in server
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Checks if the code is running in a server environment (SSR)
 * @returns {boolean} True if running in server, false if running in browser
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}
