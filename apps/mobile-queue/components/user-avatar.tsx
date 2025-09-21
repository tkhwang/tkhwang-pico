import { useUser } from '@clerk/clerk-expo';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

interface UserAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, 'alt'> {}

export function UserAvatar(props: UserAvatarProps) {
  const { user } = useUser();

  const { initials, imageSource, userName } = React.useMemo(() => {
    const userName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'Unknown';
    const initials = userName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();

    const imageSource = user?.imageUrl ? { uri: user.imageUrl } : undefined;
    return { initials, imageSource, userName };
  }, [user]);

  return (
    <Avatar alt={`${userName}'s avatar`} {...props}>
      <AvatarImage source={imageSource} />
      <AvatarFallback>
        <Text>{initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
