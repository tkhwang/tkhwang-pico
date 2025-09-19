import React from 'react';
import { View, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CheckCircle, Circle, Clock, Calendar, Tag, FileText, Sparkles } from 'lucide-react-native';
import {
  formatFullDate,
  formatReadingTimeWithSuffix,
  getThumbnailUrl,
} from '@/utils/content-formatters';
import { useContentActions } from '@/hooks/use-content-actions';
import { ContentTags } from '@/components/content/sub/content-tags';
import { ContentThumbnail } from '@/components/content/sub/content-thumbnail';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { ContentDetailBottomActions } from './content-detail-bottom-actions';
import type { UserContentWithDetails, Recommendation } from '@tkhwang-pico/common';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

interface ContentDetailProps {
  visible: boolean;
  item: UserContentWithDetails | Recommendation | null;
  onClose: () => void;
  mode?: 'home' | 'recommend';
  // Home mode callbacks
  onToggleComplete?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onLike?: (contentId: string) => void;
  // Recommend mode callbacks
  onAddToQueue?: (url: string, contentId: string) => void;
  onNotInterested?: (contentId: string) => void;
}

export function ContentDetail({
  visible,
  item,
  onClose,
  mode = 'home',
  onToggleComplete,
  onDelete,
  onLike,
  onAddToQueue,
  onNotInterested,
}: ContentDetailProps) {
  const { openURL, deleteContent } = useContentActions();

  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const sheetPaddingBottom = insets.bottom + (isAndroid ? 24 : 16);
  const scrollContentPaddingBottom = 16;
  const scrollBottomInset = scrollContentPaddingBottom + sheetPaddingBottom;
  const { executeWithHapticFeedback } = useHapticFeedback();
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const isPresentedRef = React.useRef(false);
  const hasContent = Boolean(item && item.contents);

  const snapPoints = React.useMemo(() => ['70%'], []);

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const renderHandle = React.useCallback(
    () => (
      <View className="items-center py-2">
        <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
      </View>
    ),
    []
  );

  const handleDismiss = React.useCallback(() => {
    isPresentedRef.current = false;
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  React.useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    if (visible && hasContent && !isPresentedRef.current) {
      sheet.present();
      isPresentedRef.current = true;
    } else if ((!visible || !hasContent) && isPresentedRef.current) {
      sheet.dismiss();
    }
  }, [visible, hasContent]);

  if (!hasContent || !item || !item.contents) {
    return null;
  }

  const content = item.contents;
  const isCompleted = 'todo_status' in item ? item.todo_status === 'completed' : false;
  const isRecommendation = mode === 'recommend';
  const thumbnailUrl = getThumbnailUrl(content);
  const isLiked =
    'preferences' in item
      ? (item.preferences?.some((preference) => preference.preference_type === 'liked') ?? false)
      : false;

  const handleToggleComplete = () =>
    executeWithHapticFeedback(() => {
      if (onToggleComplete && 'id' in item) {
        onToggleComplete(item.id);
        onClose();
      }
    });

  const handleDelete = () =>
    executeWithHapticFeedback(() => {
      deleteContent(item.content_id, onDelete, onClose);
    });

  const handleLike = () =>
    executeWithHapticFeedback(() => {
      if (onLike) {
        onLike(item.content_id);
      }
    });

  const handleAddToQueue = () =>
    executeWithHapticFeedback(() => {
      if (onAddToQueue) {
        const url = content.canonical_url || content.url;
        if (url) {
          onAddToQueue(url, item.content_id);
          onClose();
        } else {
          Alert.alert('Error', 'No URL available for this content');
        }
      }
    });

  const handleNotInterested = () =>
    executeWithHapticFeedback(() => {
      if (onNotInterested) {
        onNotInterested(item.content_id);
        onClose();
      }
    });

  const handleOpenURL = () =>
    executeWithHapticFeedback(() => {
      const url = content.canonical_url || content.url;
      openURL(url, onClose);
    });

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      index={0}
      handleComponent={renderHandle}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      topInset={insets.top}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      style={{ overflow: 'hidden' }}
      android_keyboardInputMode="adjustResize">
      <View className="flex-1 rounded-t-2xl bg-white dark:bg-gray-800">
        {/* Header */}
        <View className="flex-row items-center justify-center border-b border-gray-200 px-4 pb-3 pt-4 dark:border-gray-700">
          {isRecommendation ? (
            // Recommendation mode header
            <View className="flex-row items-center gap-2">
              <Icon as={Sparkles} className="h-5 w-5 text-purple-500" />
              <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                Recommendation
              </Text>
            </View>
          ) : (
            // Home mode header with toggle complete
            <View className="flex-row items-center gap-2">
              <View className="p-1">
                <Icon
                  as={isCompleted ? CheckCircle : Circle}
                  className={`h-6 w-6 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}
                />
              </View>
              <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <BottomSheetScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          bounces
          contentContainerStyle={{
            paddingBottom: scrollBottomInset,
          }}>
          {/* Metadata */}
          <View className="mb-1 flex-row flex-wrap">
            {content.domain && (
              <View className="mb-2 mr-3 flex-row items-center">
                <SiteFavicon
                  url={(content.metadata as any)?.favicon_url || null}
                  size={14}
                  className="mr-1"
                />
                <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
              </View>
            )}
            {'saved_at' in item && item.saved_at && (
              <View className="mb-2 mr-3 flex-row items-center">
                <Icon as={Calendar} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {formatFullDate(item.saved_at)}
                </Text>
              </View>
            )}
            {content.word_count !== null &&
              content.word_count !== undefined &&
              content.word_count > 0 && (
                <View className="mb-2 flex-row items-center">
                  <Icon as={Clock} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {formatReadingTimeWithSuffix(content.word_count)}
                  </Text>
                </View>
              )}
          </View>

          {/* Title */}
          <Text
            className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100"
            numberOfLines={3}
            adjustsFontSizeToFit={false}>
            {content.title || 'Untitled'}
          </Text>

          {/* Thumbnail */}
          {thumbnailUrl && (
            <View className="mb-4 items-center">
              <ContentThumbnail imageUrl={thumbnailUrl} size="large" className="h-48 w-full" />
            </View>
          )}

          {/* Summary */}
          {content.summary && (
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Summary
              </Text>
              <Text className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {content.summary}
              </Text>
            </View>
          )}

          {/* Note - only for UserContentWithDetails */}
          {'note' in item && item.note && (
            <View className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <View className="mb-1 flex-row items-center">
                <Icon as={FileText} className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">Note</Text>
              </View>
              <Text className="text-sm italic text-gray-700 dark:text-gray-300">{item.note}</Text>
            </View>
          )}

          {/* Tags (from content) */}
          {content.tags && content.tags.length > 0 && (
            <View className="mb-4">
              <View className="mb-2 flex-row items-center">
                <Icon as={Tag} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</Text>
              </View>
              <ContentTags
                tags={content.tags}
                expandable={true}
                initialMaxTags={6}
                className="flex-row flex-wrap"
              />
            </View>
          )}
        </BottomSheetScrollView>

        {/* Fixed Action Bar */}
        <ContentDetailBottomActions
          mode={mode}
          isCompleted={isCompleted}
          isLiked={isLiked}
          sheetPaddingBottom={sheetPaddingBottom}
          onToggleComplete={handleToggleComplete}
          onLike={handleLike}
          onDelete={handleDelete}
          onOpenURL={handleOpenURL}
          onAddToQueue={handleAddToQueue}
          onNotInterested={handleNotInterested}
        />
      </View>
    </BottomSheetModal>
  );
}
