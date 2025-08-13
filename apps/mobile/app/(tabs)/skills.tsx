import { View } from 'react-native';

import { MainLayout } from '~/components/MainLayout';
import { Text } from '~/components/ui/text';

export default function SkillsScreen() {
  return (
    <MainLayout>
      <View className={`flex-1 justify-center items-center gap-5 p-6}`}>
        <Text>Skills</Text>
      </View>
    </MainLayout>
  );
}
