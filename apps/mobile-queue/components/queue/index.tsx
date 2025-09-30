import { QueueProvider } from '@/contexts/queue-context';

import { QueueView } from './queue-view';

export function Queue() {
  return (
    <QueueProvider>
      <QueueView />
    </QueueProvider>
  );
}
