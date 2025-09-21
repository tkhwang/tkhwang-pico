import React, { useState } from 'react';
import { View } from 'react-native';

import { ContentList } from '../content/list/content-list';
import { FAB } from '../fab';
import { FabModal } from './fab-modal';

export function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContentSaved = () => {
    console.log('Content saved successfully');
    setIsModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
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
