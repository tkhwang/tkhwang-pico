import React, { useState } from 'react';
import { View } from 'react-native';
import { FAB } from '../fab';
import { FabModal } from './fab-modal';
import { ContentList } from '../content/content-list';
import { HomeSearch } from '@/components/home/home-search';

export function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContentSaved = () => {
    console.log('Content saved successfully');
    setIsModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
      <HomeSearch />

      {/* Content List */}
      <ContentList />

      {/* Floating Action Button */}
      <FAB onPress={() => setIsModalVisible(true)} />

      {/* Add Content Modal */}
      <FabModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={handleContentSaved}
      />
    </View>
  );
}
