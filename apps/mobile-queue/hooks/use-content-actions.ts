import { Alert, Linking } from 'react-native';

/**
 * Hook for shared content actions
 */
export function useContentActions() {
  /**
   * Open URL in external browser
   * @param url - URL to open
   * @param onSuccess - Optional callback on successful open
   */
  const openURL = async (url: string | undefined, onSuccess?: () => void) => {
    if (!url) {
      Alert.alert('No URL', 'No URL available for this content');
      return;
    }

    // Only allow http(s) URLs
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Unsafe URL', 'Only http(s) URLs are allowed.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onSuccess?.();
      } else {
        Alert.alert('Unable to open', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
      if (__DEV__) console.error('Error opening URL:', error);
    }
  };

  /**
   * Delete content with confirmation
   * @param contentId - Content ID to delete
   * @param onDelete - Delete handler
   * @param onSuccess - Optional callback on successful deletion
   */
  const deleteContent = (
    contentId: string,
    onDelete?: (contentId: string) => void,
    onSuccess?: () => void,
  ) => {
    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete?.(contentId);
          onSuccess?.();
        },
      },
    ]);
  };

  /**
   * Share content (for future implementation)
   * @param url - URL to share
   * @param title - Title of the content
   */
  const shareContent = async (url: string | undefined, title?: string) => {
    if (!url) {
      Alert.alert('No URL', 'No URL available to share');
      return;
    }

    // This can be expanded with React Native Share API
    // For now, we'll just show a placeholder
    Alert.alert('Share', `Share functionality coming soon for: ${title || url}`);
  };

  /**
   * Validate URL safety
   * @param url - URL to validate
   * @returns boolean indicating if URL is safe
   */
  const isValidURL = (url: string): boolean => {
    return /^https?:\/\//i.test(url);
  };

  return {
    openURL,
    deleteContent,
    shareContent,
    isValidURL,
  };
}
