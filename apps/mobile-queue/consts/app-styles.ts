// Unified action styles for consistent theming across swipe actions and modal buttons

// Core action styles - single source of truth
export const ACTION_STYLES = {
  like: {
    liked: {
      container: 'bg-gray-200 dark:bg-gray-700',
      icon: 'text-gray-700 dark:text-gray-200',
      text: 'text-gray-700 dark:text-gray-200',
      fillIcon: 'fill-gray-700 text-gray-700 dark:fill-gray-200 dark:text-gray-200',
      label: 'Unlike',
    },
    unliked: {
      container: 'bg-gray-100 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-600 dark:text-gray-400',
      fillIcon: 'text-gray-500 dark:text-gray-400',
      label: 'Like',
    },
  },
  complete: {
    completed: {
      container: 'bg-gray-100 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      label: 'Pending',
    },
    pending: {
      container: 'bg-gray-100 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      label: 'Complete',
    },
  },
  delete: {
    container: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'Delete',
  },
  reopen: {
    container: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-blue-100',
    label: 'Reopen',
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
      container: 'bg-orange-200 dark:bg-orange-900/30',
      wrapper: '',
      icon: 'text-orange-700 dark:text-orange-400',
      text: 'text-orange-700 dark:text-orange-400',
      label: 'Skip',
    },
    completed: {
      container: 'bg-red-500',
      wrapper: 'shadow-lg shadow-red-500/20',
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
    border: ACTION_STYLES.complete.completed.border,
  },
  pending: {
    bg: ACTION_STYLES.complete.pending.container,
    icon: ACTION_STYLES.complete.pending.icon,
    text: ACTION_STYLES.complete.pending.text,
    border: ACTION_STYLES.complete.pending.border,
  },
} as const;

// Delete action styles (for swipe components)
export const DELETE_STYLES = {
  bg: ACTION_STYLES.delete.container,
  icon: ACTION_STYLES.delete.icon,
  text: ACTION_STYLES.delete.text,
} as const;

// Reopen action styles (for swipe components)
export const REOPEN_STYLES = {
  bg: ACTION_STYLES.reopen.container,
  icon: ACTION_STYLES.reopen.icon,
  text: ACTION_STYLES.reopen.text,
  border: ACTION_STYLES.reopen.border,
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
    container: ACTION_STYLES.complete.pending.container,
    icon: ACTION_STYLES.complete.pending.icon,
    text: ACTION_STYLES.complete.pending.text,
  },
  open: {
    container: ACTION_STYLES.open.container,
    icon: ACTION_STYLES.open.icon,
    text: ACTION_STYLES.open.text,
  },
  delete: {
    container: ACTION_STYLES.delete.container,
    icon: ACTION_STYLES.delete.icon,
    text: ACTION_STYLES.delete.text,
  },
  addToQueue: {
    container: ACTION_STYLES.addToQueue.default.container,
    icon: ACTION_STYLES.addToQueue.default.icon,
    text: ACTION_STYLES.addToQueue.default.text,
  },
  notInterested: {
    container: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
} as const;