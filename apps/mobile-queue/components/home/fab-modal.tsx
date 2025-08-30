import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { Text } from '../ui/text';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface FabModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (url: string, responseData: any) => void;
}

export function FabModal({ visible, onClose, onSubmit }: FabModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const handleSubmitUrl = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response data
      const mockResponse = {
        title: 'Understanding React Native Navigation',
        source: 'Medium',
        category: 'Development',
        type: 'article',
        readTime: '8 min read',
        thumbnail: '📱',
        url: url,
      };

      setResponseData(mockResponse);
      onSubmit?.(url, mockResponse);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setUrl('');
    setResponseData(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}>
      {/* 외부 클릭 감지용 전체 영역 */}
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View className="flex-1 justify-end bg-black/50">
          {/* 실제 모달 콘텐츠 - 클릭 이벤트 차단 */}
          <Pressable className="max-h-[90%]">
            <View className="rounded-t-3xl bg-white dark:bg-gray-900">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text className="text-blue-500 dark:text-blue-400">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add Content
                </Text>
                <View className="w-12" />
              </View>

              <ScrollView className="px-4 py-6" showsVerticalScrollIndicator={false}>
                {/* URL Input */}
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content URL
                  </Text>
                  <Input
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://example.com/article"
                    className="h-12 rounded-lg border-gray-300 bg-gray-50 px-4 dark:border-gray-600 dark:bg-gray-800"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>

                {/* Submit Button */}
                <Button
                  onPress={handleSubmitUrl}
                  disabled={!url.trim() || isLoading}
                  className="mb-6 h-12 rounded-lg bg-blue-500 active:bg-blue-600 disabled:opacity-50">
                  <Text className="font-semibold text-white">
                    {isLoading ? 'Fetching...' : 'Add Content'}
                  </Text>
                </Button>

                {/* Response Display */}
                {responseData && (
                  <View className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Content Preview
                    </Text>
                    <View className="space-y-2">
                      <View>
                        <Text className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">
                          {responseData.type}
                        </Text>
                        <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {responseData.title}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        {responseData.source}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 dark:text-gray-500">
                          {responseData.category}
                        </Text>
                        {responseData.readTime && (
                          <>
                            <Text className="mx-2 text-xs text-gray-400">•</Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-500">
                              {responseData.readTime}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
