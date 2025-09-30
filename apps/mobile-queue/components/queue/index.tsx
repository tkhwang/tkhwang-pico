import { QueueProvider } from '@/contexts/queue-context';

import { QueueView } from '../content/queue/queue-view';

export function Queue() {
  return (
    <QueueProvider>
      <QueueView />
    </QueueProvider>
  );
}
