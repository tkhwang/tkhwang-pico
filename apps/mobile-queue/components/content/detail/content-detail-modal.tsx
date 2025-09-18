import React from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  X,
  ExternalLink,
  CheckCircle,
  Circle,
  Trash2,
  Clock,
  Calendar,
  Tag,
  Globe,
  FileText,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  Heart,
} from 'lucide-react-native';
import {
  formatFullDate,
  formatReadingTimeWithSuffix,
  getThumbnailUrl,
} from '@/hooks/use-content-formatters';
import { useContentActions } from '@/hooks/use-content-actions';
import { ContentTags } from '@/components/content/sub/content-tags';
import { ContentThumbnail } from '@/components/content/sub/content-thumbnail';
import { MODAL_ACTION_STYLES, ACTION_STYLES } from '@/consts/app-styles';
import type { UserContentWithDetails, Recommendation } from '@tkhwang-pico/common';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useSimilarContents } from '@/hooks/queries/use-similar-contents';
import { SwipeableRecommendItem } from '@/components/recommend/swipe/swipeable-recommend-item';

interface ContentDetailModalProps {
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

export function ContentDetailModal({
  visible,
  item,
  onClose,
  mode = 'home',
  onToggleComplete,
  onDelete,
  onLike,
  onAddToQueue,
  onNotInterested,
}: ContentDetailModalProps) {
  const { openURL, deleteContent } = useContentActions();

  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const isAndroid = Platform.OS === 'android';
  const sheetBottomOffset = 0;
  const desiredSheetHeight = screenHeight * 0.7;
  const sheetHeight = isAndroid ? desiredSheetHeight : undefined;
  const sheetPaddingBottom = insets.bottom + (isAndroid ? 24 : 16);
  const scrollContentPaddingBottom = 16;
  const { executeWithHapticFeedback } = useHapticFeedback();
  const contentId = item?.content_id;
  const {
    data: similarContents = [],
    isLoading: isSimilarLoading,
    removeFromCache: removeSimilarFromCache,
  } = useSimilarContents(visible ? contentId : undefined, {
    enabled: visible && !!contentId,
    limit: 5,
  });

  if (!item || !item.contents) {
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
  const completeStyles = isCompleted
    ? MODAL_ACTION_STYLES.complete.completed
    : MODAL_ACTION_STYLES.complete.pending;

  const handleToggleComplete = () =>
    executeWithHapticFeedback(() => {
      if (onToggleComplete && 'id' in item) {
        onToggleComplete(item.id);
        onClose(); // Dismiss modal after action
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

  const filteredSimilarContents = similarContents.filter((similar) => {
    if (!similar || similar.content_id === item.content_id) return false;
    const similarContent = similar.contents;
    const url = similarContent?.canonical_url || similarContent?.url;
    return Boolean(similarContent && url);
  });

  const hasSimilarContents = filteredSimilarContents.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen">
      {/* Ensure Modal's direct child is a View to avoid stray text nodes */}
      <View className="flex-1">
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-black/50"
        />

        {/* Content Container */}
        <View
          style={{
            position: 'absolute',
            bottom: sheetBottomOffset,
            left: 0,
            right: 0,
            maxHeight: desiredSheetHeight,
            height: sheetHeight,
          }}>
          <View className="flex-1 rounded-t-2xl bg-white dark:bg-gray-800">
            {/* Modal Handle */}
            <View className="items-center py-2">
              <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 dark:border-gray-700">
              {isRecommendation ? (
                // Recommendation mode header
                <View className="flex-row items-center">
                  <Icon as={Sparkles} className="mr-2 h-4 w-4 text-purple-500" />
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recommendation
                  </Text>
                </View>
              ) : (
                // Home mode header with toggle complete
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={handleToggleComplete} className="mr-3 p-2">
                    <Icon
                      as={isCompleted ? CheckCircle : Circle}
                      className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}
                    />
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              )}
              <View className="flex-row">
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Icon as={X} className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView
              className="flex-1 px-4 py-4"
              showsVerticalScrollIndicator={false}
              bounces={true}
              nestedScrollEnabled={true}
              contentContainerStyle={{
                paddingBottom: scrollContentPaddingBottom,
              }}>
              {/* Title */}
              <Text
                className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100"
                numberOfLines={3}
                adjustsFontSizeToFit={false}>
                {content.title || 'Untitled'}
              </Text>

              {/* Metadata */}
              <View className="mb-4 flex-row flex-wrap">
                {content.domain && (
                  <View className="mb-2 mr-3 flex-row items-center">
                    <Icon as={Globe} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {content.domain}
                    </Text>
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
                    <Icon
                      as={FileText}
                      className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                    />
                    <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Note
                    </Text>
                  </View>
                  <Text className="text-sm italic text-gray-700 dark:text-gray-300">
                    {item.note}
                  </Text>
                </View>
              )}

              {/* Tags (from content) */}
              {content.tags && content.tags.length > 0 && (
                <View className="mb-4">
                  <View className="mb-2 flex-row items-center">
                    <Icon as={Tag} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tags
                    </Text>
                  </View>
                  <ContentTags
                    tags={content.tags}
                    expandable={true}
                    initialMaxTags={6}
                    className="flex-row flex-wrap"
                  />
                </View>
              )}

              {/* Similar Contents */}
              {(isSimilarLoading || hasSimilarContents) && (
                <View className="mb-5">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Icon as={Sparkles} className="mr-1 h-3.5 w-3.5 text-purple-500" />
                      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Similar Contents
                      </Text>
                    </View>
                    {isSimilarLoading && <ActivityIndicator size="small" color="#a855f7" />}
                  </View>

                  {hasSimilarContents
                    ? filteredSimilarContents.map((similar) => (
                        <SwipeableRecommendItem
                          key={similar.content_id}
                          recommendation={similar}
                          onPress={(recommendation) =>
                            executeWithHapticFeedback(() => {
                              const target = recommendation.contents;
                              const url = target?.canonical_url || target?.url;
                              if (url) {
                                openURL(url, onClose);
                              }
                            })
                          }
                          onAddToQueue={
                            onAddToQueue
                              ? (url, similarContentId) => {
                                  onAddToQueue(url, similarContentId);
                                  removeSimilarFromCache(similarContentId);
                                }
                              : undefined
                          }
                          onNotInterested={
                            onNotInterested
                              ? (similarContentId) => {
                                  onNotInterested(similarContentId);
                                  removeSimilarFromCache(similarContentId);
                                }
                              : undefined
                          }
                        />
                      ))
                    : !isSimilarLoading && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          Add more content to get personalized recommendations.
                        </Text>
                      )}
                </View>
              )}
            </ScrollView>

            {/* Fixed Action Bar */}
            <View
              className="border-t border-gray-200 bg-white px-4 pt-2 dark:border-gray-700 dark:bg-gray-800"
              style={{ paddingBottom: sheetPaddingBottom }}>
              <View className="flex-row gap-2">
                {isRecommendation ? (
                  <>
                    {/* Add to Queue Button */}
                    <TouchableOpacity
                      onPress={handleAddToQueue}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.addToQueue.container}`}>
                      <Icon
                        as={ThumbsUp}
                        className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.addToQueue.icon}`}
                      />
                      <Text
                        className={`text-xs font-semibold ${MODAL_ACTION_STYLES.addToQueue.text}`}>
                        Add to Queue
                      </Text>
                    </TouchableOpacity>

                    {/* Open in Browser Button */}
                    <TouchableOpacity
                      onPress={handleOpenURL}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.open.container}`}>
                      <Icon
                        as={ExternalLink}
                        className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.open.icon}`}
                      />
                      <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.open.text}`}>
                        Open
                      </Text>
                    </TouchableOpacity>

                    {/* Not Interested Button */}
                    <TouchableOpacity
                      onPress={handleNotInterested}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.notInterested.container}`}>
                      <Icon
                        as={ThumbsDown}
                        className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.notInterested.icon}`}
                      />
                      <Text
                        className={`text-xs font-semibold ${MODAL_ACTION_STYLES.notInterested.text}`}>
                        Not Interested
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Like Button */}
                    <TouchableOpacity
                      onPress={handleLike}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${
                        isLiked
                          ? MODAL_ACTION_STYLES.like.liked.container
                          : MODAL_ACTION_STYLES.like.unliked.container
                      }`}>
                      <Icon
                        as={Heart}
                        className={`mb-1 h-5 w-5 ${
                          isLiked
                            ? MODAL_ACTION_STYLES.like.liked.icon
                            : MODAL_ACTION_STYLES.like.unliked.icon
                        }`}
                        fill={isLiked ? 'currentColor' : 'none'}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          isLiked
                            ? MODAL_ACTION_STYLES.like.liked.text
                            : MODAL_ACTION_STYLES.like.unliked.text
                        }`}>
                        {isLiked ? 'Unlike' : 'Like'}
                      </Text>
                    </TouchableOpacity>

                    {/* Toggle Complete Button */}
                    <TouchableOpacity
                      onPress={handleToggleComplete}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${completeStyles.container}`}>
                      <Icon
                        as={isCompleted ? RotateCcw : CheckCircle}
                        className={`mb-1 h-5 w-5 ${completeStyles.icon}`}
                      />
                      <Text className={`text-xs font-semibold ${completeStyles.text}`}>
                        {isCompleted
                          ? ACTION_STYLES.complete.completed.label
                          : ACTION_STYLES.complete.pending.label}
                      </Text>
                    </TouchableOpacity>

                    {/* Open in Browser Button */}
                    <TouchableOpacity
                      onPress={handleOpenURL}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.open.container}`}>
                      <Icon
                        as={ExternalLink}
                        className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.open.icon}`}
                      />
                      <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.open.text}`}>
                        Open
                      </Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={handleDelete}
                      className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${MODAL_ACTION_STYLES.delete.container}`}>
                      <Icon
                        as={Trash2}
                        className={`mb-1 h-5 w-5 ${MODAL_ACTION_STYLES.delete.icon}`}
                      />
                      <Text className={`text-xs font-semibold ${MODAL_ACTION_STYLES.delete.text}`}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
