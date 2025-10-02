import type { UserContentWithDetails } from '@tkhwang-pico/supabase';
import { CircleCheckBig, ExternalLink, Heart } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { PRIORITY_STYLES } from '@/consts/app-styles';
import { useContentActions } from '@/hooks/use-content-actions';
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
  showCompletedTime: _showCompletedTime = false,
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
  const scheduleAccentClass = priorityValue === 'high' ? priorityStyle.dot : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      className="relative flex-row items-center overflow-hidden rounded-lg bg-white px-3 py-2.5 dark:bg-gray-800"
    >
      {scheduleAccentClass ? (
        <View className={`absolute bottom-0 left-0 top-0 w-1 ${scheduleAccentClass}`} />
      ) : null}

      {/* Status Icon */}
      <View className="mr-2.5">
        {isCompleted ? (
          <Icon as={CircleCheckBig} className="h-4 w-4 text-green-500" />
        ) : (
          <View className="h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 bg-transparent" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 pr-2">
        {/* Title */}
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100" numberOfLines={1}>
          {content.title || 'Untitled'}
        </Text>

        {/* Metadata row */}
        <View className="mt-0.5 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center pr-3">
            <SiteFavicon url={faviconUrl} size={10} className="mr-1" />
            <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {content.domain || 'CONTENT'}
            </Text>
          </View>
        </View>
      </View>

      {/* Right side indicators */}
      <View className="flex-row items-center gap-1.5">
        <View className="h-3.5 w-3.5 items-center justify-center">
          {isLiked && <Icon as={Heart} className="h-3.5 w-3.5 fill-rose-200 text-rose-500" />}
        </View>
        <View className="opacity-40">
          <Icon as={ExternalLink} className="h-3 w-3 text-gray-400 dark:text-gray-500" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
