import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { LOCAL_STORAGE_KEYS } from '@/consts/app-consts';

export type QueueStatus = 'pending' | 'completed';
export type ViewMode = 'bigCard' | 'smallCard' | 'list';

interface QueueState {
  status: QueueStatus;
  viewMode: ViewMode;
  setStatus: (status: QueueStatus) => void;
  setViewMode: (mode: ViewMode) => void;
}

const QueueContext = createContext<QueueState | undefined>(undefined);

interface QueueProviderProps {
  children: ReactNode;
}

export function QueueProvider({ children }: QueueProviderProps) {
  const [status, setStatus] = useState<QueueStatus>('pending');
  const [viewModes, setViewModes] = useState<Record<QueueStatus, ViewMode>>({
    pending: 'bigCard',
    completed: 'bigCard',
  });

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LOCAL_STORAGE_KEYS.queueViewModes)
      .then((stored) => {
        if (!stored || !isMounted) return;
        try {
          const parsed = JSON.parse(stored) as Partial<Record<QueueStatus, ViewMode>>;
          setViewModes((prev) => ({
            pending: parsed.pending ?? prev.pending,
            completed: parsed.completed ?? prev.completed,
          }));
        } catch (error) {
          console.warn('Failed to parse queue view modes', error);
        }
      })
      .catch((error) => {
        console.warn('Failed to load queue view modes', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const viewMode = viewModes[status];

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModes((prev) => {
        if (prev[status] === mode) return prev;

        const next = {
          ...prev,
          [status]: mode,
        };

        AsyncStorage.setItem(LOCAL_STORAGE_KEYS.queueViewModes, JSON.stringify(next)).catch(
          (error) => {
            console.warn('Failed to persist queue view modes', error);
          },
        );

        return next;
      });
    },
    [status],
  );

  return (
    <QueueContext.Provider value={{ status, viewMode, setStatus, setViewMode }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueState() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueueState must be used within QueueProvider');
  }
  return context;
}
