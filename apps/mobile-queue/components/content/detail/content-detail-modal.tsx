import React from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
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
} from 'lucide-react-native';
import { formatFullDate, formatReadingTimeWithSuffix } from '@/hooks/use-content-formatters';
import { useContentActions } from '@/hooks/use-content-actions';
import { ContentTags } from '@/components/content/sub/content-tags';
import { ContentThumbnail } from '@/components/content/sub/content-thumbnail';
import type { UserContentWithDetails, Recommendation } from '@tkhwang-pico/common';

interface ContentDetailModalProps {
  visible: boolean;
  item: UserContentWithDetails | Recommendation | null;
  onClose: () => void;
  mode?: 'home' | 'recommend';
  // Home mode callbacks
  onToggleComplete?: (id: string) => void;
  onDelete?: (contentId: string) => void;
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
  onAddToQueue,
  onNotInterested,
}: ContentDetailModalProps) {
  const { openURL, deleteContent } = useContentActions();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  if (!item || !item.contents) {
    return null;
  }

  const content = item.contents;
  const isCompleted = 'todo_status' in item ? item.todo_status === 'completed' : false;
  const isRecommendation = mode === 'recommend';

  // Extract thumbnail URL from metadata
  const thumbnailUrl =
    content.metadata && typeof content.metadata === 'object' && 'image_url' in content.metadata
      ? (content.metadata.image_url as string)
      : null;

  const handleToggleComplete = () => {
    if (onToggleComplete && 'id' in item) {
      onToggleComplete(item.id);
      onClose(); // Dismiss modal after action
    }
  };

  const handleDelete = () => {
    deleteContent(item.content_id, onDelete, onClose);
  };

  const handleAddToQueue = () => {
    if (onAddToQueue) {
      const url = content.canonical_url || content.url;
      if (url) {
        onAddToQueue(url, item.content_id);
        onClose();
      } else {
        Alert.alert('Error', 'No URL available for this content');
      }
    }
  };

  const handleNotInterested = () => {
    if (onNotInterested) {
      onNotInterested(item.content_id);
      onClose();
    }
  };

  const handleOpenURL = () => {
    const url = content.canonical_url || content.url;
    openURL(url, onClose);
  };

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
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View
                className="rounded-t-2xl bg-white dark:bg-gray-800"
                style={{
                  maxHeight: screenHeight * 0.7,
                  paddingBottom: insets.bottom
                }}>
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
                  className="px-4 py-4"
                  showsVerticalScrollIndicator={false}
                  bounces={true}
                  contentContainerStyle={{
                    paddingBottom: Platform.OS === 'android' ? 60 : 40,
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
                      <ContentThumbnail
                        imageUrl={thumbnailUrl}
                        size="large"
                        className="h-48 w-full"
                      />
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

                  {/* Actions Section */}
                  <View className="mb-4">
                    <Text className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </Text>
                    <View className="flex-row gap-2">
                      {isRecommendation ? (
                        <>
                          {/* Add to Queue Button */}
                          <TouchableOpacity
                            onPress={handleAddToQueue}
                            className="flex-1 items-center justify-center rounded-lg bg-green-100 px-2 py-3 dark:bg-green-900/30">
                            <Icon
                              as={ThumbsUp}
                              className="mb-1 h-5 w-5 text-green-600 dark:text-green-400"
                            />
                            <Text className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Add to Queue
                            </Text>
                          </TouchableOpacity>

                          {/* Open in Browser Button */}
                          <TouchableOpacity
                            onPress={handleOpenURL}
                            className="flex-1 items-center justify-center rounded-lg bg-gray-100 px-2 py-3 dark:bg-gray-800">
                            <Icon
                              as={ExternalLink}
                              className="mb-1 h-5 w-5 text-gray-600 dark:text-gray-400"
                            />
                            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                              Open
                            </Text>
                          </TouchableOpacity>

                          {/* Not Interested Button */}
                          <TouchableOpacity
                            onPress={handleNotInterested}
                            className="flex-1 items-center justify-center rounded-lg bg-red-100 px-2 py-3 dark:bg-red-900/30">
                            <Icon
                              as={ThumbsDown}
                              className="mb-1 h-5 w-5 text-red-600 dark:text-red-400"
                            />
                            <Text className="text-xs font-semibold text-red-700 dark:text-red-400">
                              Not Interested
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          {/* Toggle Complete Button */}
                          <TouchableOpacity
                            onPress={handleToggleComplete}
                            className={`flex-1 items-center justify-center rounded-lg px-2 py-3 ${
                              isCompleted
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                            <Icon
                              as={isCompleted ? RotateCcw : CheckCircle}
                              className={`mb-1 h-5 w-5 ${
                                isCompleted
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-green-600 dark:text-green-500'
                              }`}
                            />
                            <Text
                              className={`text-xs font-semibold ${
                                isCompleted
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-green-700 dark:text-green-400'
                              }`}>
                              {isCompleted ? 'Pending' : 'Complete'}
                            </Text>
                          </TouchableOpacity>

                          {/* Open in Browser Button */}
                          <TouchableOpacity
                            onPress={handleOpenURL}
                            className="flex-1 items-center justify-center rounded-lg bg-gray-100 px-2 py-3 dark:bg-gray-800">
                            <Icon
                              as={ExternalLink}
                              className="mb-1 h-5 w-5 text-gray-600 dark:text-gray-400"
                            />
                            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                              Open
                            </Text>
                          </TouchableOpacity>

                          {/* Delete Button */}
                          <TouchableOpacity
                            onPress={handleDelete}
                            className="flex-1 items-center justify-center rounded-lg bg-red-100 px-2 py-3 dark:bg-red-900/30">
                            <Icon
                              as={Trash2}
                              className="mb-1 h-5 w-5 text-red-600 dark:text-red-400"
                            />
                            <Text className="text-xs font-semibold text-red-700 dark:text-red-400">
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}
