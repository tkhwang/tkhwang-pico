import { Grid2x2, List, Square } from 'lucide-react-native';
import React from 'react';

import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ViewMode = 'bigCard' | 'smallCard' | 'list';

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <Tabs value={mode} onValueChange={(value) => onModeChange(value as ViewMode)}>
      <TabsList className="gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {[
          { key: 'bigCard' as const, icon: Square },
          { key: 'smallCard' as const, icon: Grid2x2 },
          { key: 'list' as const, icon: List },
        ].map(({ key, icon: IconComponent }) => {
          const isActive = mode === key;
          const iconColor = isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400';

          return (
            <TabsTrigger
              key={key}
              value={key}
              className="flex-1 items-center justify-center rounded-md px-3 py-1.5"
            >
              <Icon as={IconComponent} className={`h-5 w-5 ${iconColor}`} />
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
