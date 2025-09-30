import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

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
  const [viewMode, setViewMode] = useState<ViewMode>('bigCard');

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
