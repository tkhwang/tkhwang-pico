import type { Enums } from '@tkhwang-pico/supabase';

import { DEFAULT_PRIORITY, PRIORITY_VALUES, type PriorityValue } from '@/utils/priority';

// Unified action styles for consistent theming across swipe actions and modal buttons

// Core action styles - single source of truth
export const ACTION_STYLES = {
  like: {
    liked: {
      container: 'bg-pink-100 dark:bg-pink-900/30',
      icon: 'text-pink-600 dark:text-pink-400',
      text: 'text-pink-600 dark:text-pink-400',
      fillIcon: 'fill-pink-600 text-pink-600 dark:fill-pink-400 dark:text-pink-400',
      label: 'Unlike',
    },
    unliked: {
      container: 'bg-pink-50 dark:bg-pink-950/20',
      icon: 'text-pink-500 dark:text-pink-300',
      text: 'text-pink-500 dark:text-pink-300',
      fillIcon: 'text-pink-500 dark:text-pink-300',
      label: 'Like',
    },
    completed: {
      container: 'bg-pink-500',
      wrapper: 'shadow-lg shadow-pink-500/20',
      icon: 'text-white',
      text: 'text-white',
      fillIcon: 'fill-white text-white',
      label: 'Liked!',
    },
  },
  complete: {
    completed: {
      container: 'bg-purple-50 dark:bg-purple-950/20',
      icon: 'text-purple-500 dark:text-purple-300',
      text: 'text-purple-500 dark:text-purple-300',
      label: 'Reopen',
    },
    pending: {
      container: 'bg-purple-100 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400',
      label: 'Complete',
    },
    success: {
      container: 'bg-purple-500',
      wrapper: 'shadow-lg shadow-purple-500/20',
      icon: 'text-white',
      text: 'text-white',
      label: 'Done!',
    },
  },
  delete: {
    default: {
      container: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-600 dark:text-red-400',
      label: 'Delete',
    },
    completed: {
      container: 'bg-red-500',
      wrapper: 'shadow-lg shadow-red-500/20',
      icon: 'text-white',
      text: 'text-white',
      label: 'Deleted!',
    },
  },
  reopen: {
    default: {
      container: 'bg-purple-50 dark:bg-purple-950/20',
      icon: 'text-purple-500 dark:text-purple-300',
      text: 'text-purple-500 dark:text-purple-300',
      label: 'Reopen',
    },
    success: {
      container: 'bg-purple-500',
      wrapper: 'shadow-lg shadow-purple-500/20',
      icon: 'text-white',
      text: 'text-white',
      label: 'Reopened!',
    },
  },
  open: {
    container: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-700 dark:text-gray-400',
    label: 'Open',
  },
  addToQueue: {
    default: {
      container: 'bg-green-100 dark:bg-green-900/30',
      wrapper: '',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-700 dark:text-green-400',
      label: 'Add Queue',
    },
    completed: {
      container: 'bg-green-500',
      wrapper: 'shadow-lg shadow-green-500/20',
      icon: 'text-white',
      text: 'text-white',
      label: 'Added!',
    },
  },
  notInterested: {
    default: {
      container: 'bg-orange-100 dark:bg-orange-900/30',
      wrapper: '',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-600 dark:text-orange-400',
      label: 'Skip',
    },
    completed: {
      container: 'bg-orange-500',
      wrapper: 'shadow-lg shadow-orange-500/20',
      icon: 'text-white',
      text: 'text-white',
      label: 'Removed',
    },
  },
} as const;

// ============================================
// Backwards compatibility exports for swipe components
// ============================================

// Like action styles with liked/unliked states (for swipe components)
export const LIKE_STYLES = {
  liked: {
    bg: ACTION_STYLES.like.liked.container,
    icon: ACTION_STYLES.like.liked.icon,
    text: ACTION_STYLES.like.liked.text,
    label: ACTION_STYLES.like.liked.label,
  },
  unliked: {
    bg: ACTION_STYLES.like.unliked.container,
    icon: ACTION_STYLES.like.unliked.icon,
    text: ACTION_STYLES.like.unliked.text,
    label: ACTION_STYLES.like.unliked.label,
  },
} as const;

// Completion action styles with completed/pending states (for swipe components)
export const COMPLETION_STYLES = {
  completed: {
    bg: ACTION_STYLES.complete.completed.container,
    icon: ACTION_STYLES.complete.completed.icon,
    text: ACTION_STYLES.complete.completed.text,
  },
  pending: {
    bg: ACTION_STYLES.complete.pending.container,
    icon: ACTION_STYLES.complete.pending.icon,
    text: ACTION_STYLES.complete.pending.text,
  },
} as const;

// Delete action styles (for swipe components)
export const DELETE_STYLES = {
  bg: ACTION_STYLES.delete.default.container,
  icon: ACTION_STYLES.delete.default.icon,
  text: ACTION_STYLES.delete.default.text,
} as const;

// Reopen action styles (for swipe components)
export const REOPEN_STYLES = {
  bg: ACTION_STYLES.reopen.default.container,
  icon: ACTION_STYLES.reopen.default.icon,
  text: ACTION_STYLES.reopen.default.text,
} as const;

// Recommend swipe action styles
export const RECOMMEND_ADD_STYLES = {
  default: {
    wrapper: ACTION_STYLES.addToQueue.default.wrapper,
    container: ACTION_STYLES.addToQueue.default.container,
    icon: ACTION_STYLES.addToQueue.default.icon,
    text: ACTION_STYLES.addToQueue.default.text,
  },
  completed: {
    wrapper: ACTION_STYLES.addToQueue.completed.wrapper,
    container: ACTION_STYLES.addToQueue.completed.container,
    icon: ACTION_STYLES.addToQueue.completed.icon,
    text: ACTION_STYLES.addToQueue.completed.text,
  },
} as const;

export const RECOMMEND_SKIP_STYLES = {
  default: {
    wrapper: ACTION_STYLES.notInterested.default.wrapper,
    container: ACTION_STYLES.notInterested.default.container,
    icon: ACTION_STYLES.notInterested.default.icon,
    text: ACTION_STYLES.notInterested.default.text,
  },
  completed: {
    wrapper: ACTION_STYLES.notInterested.completed.wrapper,
    container: ACTION_STYLES.notInterested.completed.container,
    icon: ACTION_STYLES.notInterested.completed.icon,
    text: ACTION_STYLES.notInterested.completed.text,
  },
} as const;

// ============================================
// Modal action button styles (for ContentDetailModal)
// ============================================

export const MODAL_ACTION_STYLES = {
  like: {
    liked: {
      container: ACTION_STYLES.like.liked.container,
      icon: ACTION_STYLES.like.liked.fillIcon,
      text: ACTION_STYLES.like.liked.text,
    },
    unliked: {
      container: ACTION_STYLES.like.unliked.container,
      icon: ACTION_STYLES.like.unliked.fillIcon,
      text: ACTION_STYLES.like.unliked.text,
    },
  },
  complete: {
    completed: {
      container: ACTION_STYLES.complete.completed.container,
      icon: ACTION_STYLES.complete.completed.icon,
      text: ACTION_STYLES.complete.completed.text,
    },
    pending: {
      container: ACTION_STYLES.complete.pending.container,
      icon: ACTION_STYLES.complete.pending.icon,
      text: ACTION_STYLES.complete.pending.text,
    },
  },
  open: {
    container: ACTION_STYLES.open.container,
    icon: ACTION_STYLES.open.icon,
    text: ACTION_STYLES.open.text,
  },
  delete: {
    container: ACTION_STYLES.delete.default.container,
    icon: ACTION_STYLES.delete.default.icon,
    text: ACTION_STYLES.delete.default.text,
  },
  addToQueue: {
    container: ACTION_STYLES.addToQueue.default.container,
    icon: ACTION_STYLES.addToQueue.default.icon,
    text: ACTION_STYLES.addToQueue.default.text,
  },
  notInterested: {
    container: ACTION_STYLES.notInterested.default.container,
    icon: ACTION_STYLES.notInterested.default.icon,
    text: ACTION_STYLES.notInterested.default.text,
  },
} as const;

/*
 * Priority styles for the FAB modal
 */
type PriorityKey = Enums<'content_priority'>;

const BASE_PRIORITY_STYLES: Partial<
  Record<PriorityValue, { badge: string; dot: string; text: string }>
> = {
  low: {
    badge: 'bg-emerald-100 dark:bg-emerald-500/10',
    dot: 'bg-emerald-500 dark:bg-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-200',
  },
  normal: {
    badge: 'bg-blue-100 dark:bg-blue-500/10',
    dot: 'bg-blue-500 dark:bg-blue-300',
    text: 'text-blue-700 dark:text-blue-200',
  },
  high: {
    badge: 'bg-rose-100 dark:bg-rose-500/10',
    dot: 'bg-rose-500 dark:bg-rose-300',
    text: 'text-rose-700 dark:text-rose-200',
  },
};

const FALLBACK_PRIORITY_STYLE = BASE_PRIORITY_STYLES[DEFAULT_PRIORITY] ?? {
  badge: 'bg-blue-100 dark:bg-blue-500/10',
  dot: 'bg-blue-500 dark:bg-blue-300',
  text: 'text-blue-700 dark:text-blue-200',
};

export const PRIORITY_STYLES = PRIORITY_VALUES.reduce<
  Record<PriorityKey, { badge: string; dot: string; text: string }>
>(
  (acc, value) => {
    acc[value] = BASE_PRIORITY_STYLES[value] ?? FALLBACK_PRIORITY_STYLE;
    return acc;
  },
  {} as Record<PriorityKey, { badge: string; dot: string; text: string }>,
);
