import React from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text } from '../../ui/text';
import { Icon } from '../../ui/icon';
import {
  X,
  ExternalLink,
  CheckCircle,
  Circle,
  Trash2,
  Share2,
  Clock,
  Calendar,
  Tag,
  Globe,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react-native';
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatReadingTime = (wordCount: number | null) => {
  if (!wordCount || wordCount === 0) return '0 min read';
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
};

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
  if (!item || !item.contents) {
    return null;
  }

  const content = item.contents;
  const isCompleted = 'todo_status' in item ? item.todo_status === 'completed' : false;
  const isRecommendation = mode === 'recommend';

  const handleToggleComplete = () => {
    if (onToggleComplete && 'id' in item) {
      onToggleComplete(item.id);
      onClose(); // Dismiss modal after action
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Content', 'Are you sure you want to delete this content?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (onDelete) {
            onDelete(item.content_id);
            onClose();
          }
        },
      },
    ]);
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

  const handleOpenURL = async () => {
    const url = content.canonical_url || content.url;
    if (!url) {
      Alert.alert('No URL', 'No URL available for this content');
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Unsafe URL', 'Only http(s) URLs are allowed.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose(); // Dismiss modal after successfully opening URL
      } else {
        Alert.alert('Unable to open', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const handleShare = async () => {
    const url = content.canonical_url || content.url;
    const title = content.title || 'Shared Content';

    try {
      await Share.share({
        message: `${title}\n${url}`,
        url: url,
        title: title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share content');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Ensure Modal's direct child is a View to avoid stray text nodes */}
      <View className="flex-1">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="max-h-[90%] rounded-t-2xl bg-white dark:bg-gray-800">
                {/* Modal Handle */}
                <View className="items-center py-2">
                  <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                </View>

                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 dark:border-gray-700">
                  {isRecommendation ? (
                    // Recommendation mode header
                    <View className="flex-row items-center">
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
                <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
                  {/* Title */}
                  <Text className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
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
                          {formatDate(item.saved_at)}
                        </Text>
                      </View>
                    )}
                    {content.word_count !== null &&
                      content.word_count !== undefined &&
                      content.word_count > 0 && (
                        <View className="mb-2 flex-row items-center">
                          <Icon as={Clock} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                          <Text className="text-xs text-gray-600 dark:text-gray-400">
                            {formatReadingTime(content.word_count)}
                          </Text>
                        </View>
                      )}
                  </View>

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
                      <View className="flex-row flex-wrap">
                        {content.tags.map((tag, index) => (
                          <View
                            key={index}
                            className="mb-2 mr-2 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                              {String(tag)}
                            </Text>
                          </View>
                        ))}
                      </View>
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
                            className="flex-1 items-center justify-center rounded-lg bg-blue-100 px-2 py-3 dark:bg-blue-900/30">
                            <Icon
                              as={ExternalLink}
                              className="mb-1 h-5 w-5 text-blue-600 dark:text-blue-400"
                            />
                            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-400">
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
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                            <Icon
                              as={isCompleted ? Circle : CheckCircle}
                              className={`mb-1 h-5 w-5 ${
                                isCompleted
                                  ? 'text-gray-500 dark:text-gray-400'
                                  : 'text-green-600 dark:text-green-500'
                              }`}
                            />
                            <Text
                              className={`text-xs font-semibold ${
                                isCompleted
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-green-700 dark:text-green-400'
                              }`}>
                              {isCompleted ? 'Pending' : 'Complete'}
                            </Text>
                          </TouchableOpacity>

                          {/* Open in Browser Button */}
                          <TouchableOpacity
                            onPress={handleOpenURL}
                            className="flex-1 items-center justify-center rounded-lg bg-blue-100 px-2 py-3 dark:bg-blue-900/30">
                            <Icon
                              as={ExternalLink}
                              className="mb-1 h-5 w-5 text-blue-600 dark:text-blue-400"
                            />
                            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-400">
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

                  {/* Bottom padding for safe area */}
                  <View className="h-8" />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}
