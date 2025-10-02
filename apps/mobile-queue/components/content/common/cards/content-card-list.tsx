import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { CheckCircle, CircleCheckBig, Heart } from 'lucide-react-native';
import { View } from 'react-native';

import { BaseContentCard } from '@/components/content/common/cards/base-content-card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { ContentDate } from '@/domains/value-object/content-date';
import { useContentActions } from '@/hooks/use-content-actions';
import { getThumbnailUrl } from '@/utils/content-formatters';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';
import { getFaviconUrl } from '@/utils/url';

interface ContentCardListProps {
  item: UserContentWithDetails;
  onPress?: (item: UserContentWithDetails) => void;
  isLiked?: boolean;
  showCompletedTime?: boolean;
}

export function ContentCardList({
  item,
  onPress,
  isLiked = false,
  showCompletedTime = false,
}: ContentCardListProps) {
  const { openURL } = useContentActions();
  const content = item.contents;
  const faviconUrl = getFaviconUrl(content?.metadata);

  if (!item || !content) return null;

  const handlePress = () => {
    if (onPress) onPress(item);
  };

  const handleLongPress = () => {
    const url = content.canonical_url || content.url;
    openURL(url);
  };

  const isCompleted = item.todo_status === 'completed';
  const priorityValue = (item.priority ?? DEFAULT_PRIORITY) as PriorityValue;
  const priorityStyle = PRIORITY_STYLES[priorityValue];
  const sideAccentClassName = priorityValue === 'high' ? priorityStyle.dot : undefined;

  const thumbnailUrl = getThumbnailUrl(content);
  const completedLabel =
    showCompletedTime && item.completed_at
      ? new ContentDate(item.completed_at).toSimpleString()
      : undefined;

  const leftSlot = (
    <View className="mr-2">
      <View className="relative">
        {isCompleted ? (
          <Icon as={CircleCheckBig} className="h-4 w-4 text-green-500" />
        ) : (
          <View className="h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 bg-transparent" />
        )}
        {isLiked ? (
          <View className="absolute -bottom-1 -right-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-200">
            <Icon as={Heart} className="h-2 w-2 text-rose-600" fill="currentColor" />
          </View>
        ) : null}
      </View>
    </View>
  );

  const metadataRightElement = completedLabel ? (
    <View className="flex-row items-center gap-1">
      <Icon as={CheckCircle} className="h-3.5 w-3.5 text-green-500" />
      <Text className="text-xs text-gray-500 dark:text-gray-400">{completedLabel}</Text>
    </View>
  ) : undefined;

  return (
    <BaseContentCard
      title={content.title || 'Untitled'}
      thumbnailUrl={thumbnailUrl || undefined}
      thumbnailSize="small"
      metadataProps={{
        domain: content.domain || 'CONTENT',
        faviconUrl,
        rightElement: metadataRightElement,
      }}
      leftSlot={leftSlot}
      isCompleted={item.todo_status === 'completed' && !showCompletedTime}
      onPress={handlePress}
      onLongPress={handleLongPress}
      sideAccentClassName={sideAccentClassName}
      containerClassName="p-3"
    />
  );
}
