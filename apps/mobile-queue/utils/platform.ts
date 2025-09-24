import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the appropriate API URL based on the platform
 * - iOS Simulator: localhost works fine
 * - Android Emulator: Use 10.0.2.2 (special alias to host machine)
 * - Physical Device: Use the machine's IP address
 * - Web: Use localhost
 */
export function getApiUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_NEST_API_URL || 'http://localhost:3000';

  // For web, always use the env variable as-is
  if (Platform.OS === 'web') return baseUrl;

  // For iOS, localhost works fine
  if (Platform.OS === 'ios') return baseUrl;

  // For Android, we need special handling
  if (Platform.OS === 'android') {
    // Check if we have a specific Android URL in env (for physical devices)
    const androidUrl = process.env.EXPO_PUBLIC_NEST_API_URL_ANDROID;
    if (androidUrl) return androidUrl;

    // Check if running on emulator vs physical device
    // Constants.isDevice is false for emulators, true for physical devices
    if (!Constants.isDevice) {
      // Running on Android emulator - use special IP that routes to host machine
      return baseUrl.replace('localhost', '10.0.2.2');
    }

    // For physical devices, must use machine's IP address
    // User needs to set EXPO_PUBLIC_NEST_API_URL_ANDROID
    console.warn(
      '⚠️ Running on Android physical device. ' +
        "Please set EXPO_PUBLIC_NEST_API_URL_ANDROID with your machine's IP address",
    );
    return baseUrl; // Will fail, but provides clear error message
  }

  return baseUrl;
}
