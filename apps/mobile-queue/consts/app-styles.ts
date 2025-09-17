// Swipe action styles for consistent theming across swipeable components

// Like action styles with liked/unliked states
export const LIKE_STYLES = {
  liked: {
    bg: 'bg-gray-200 dark:bg-gray-700',
    icon: 'text-gray-700 dark:text-gray-200',
    text: 'text-gray-700 dark:text-gray-200',
    label: 'Unlike',
  },
  unliked: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'Like',
  },
} as const;

// Completion action styles with completed/pending states
export const COMPLETION_STYLES = {
  completed: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  pending: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
} as const;

// Delete action styles
export const DELETE_STYLES = {
  bg: 'bg-gray-100 dark:bg-gray-800',
  icon: 'text-gray-600 dark:text-gray-400',
  text: 'text-gray-600 dark:text-gray-400',
} as const;

// Reopen action styles
export const REOPEN_STYLES = {
  bg: 'bg-gray-100 dark:bg-gray-800',
  icon: 'text-gray-600 dark:text-gray-400',
  text: 'text-gray-600 dark:text-gray-400',
  border: 'border-blue-100',
} as const;

// Recommend swipe action styles
export const RECOMMEND_ADD_STYLES = {
  default: {
    wrapper: '',
    container: 'bg-green-200 dark:bg-green-900/30',
    icon: 'text-green-700 dark:text-green-400',
    text: 'text-green-700 dark:text-green-400',
  },
  completed: {
    wrapper: 'shadow-lg shadow-green-500/20',
    container: 'bg-green-500',
    icon: 'text-white',
    text: 'text-white',
  },
} as const;

export const RECOMMEND_SKIP_STYLES = {
  default: {
    wrapper: '',
    container: 'bg-orange-200 dark:bg-orange-900/30',
    icon: 'text-orange-700 dark:text-orange-400',
    text: 'text-orange-700 dark:text-orange-400',
  },
  completed: {
    wrapper: 'shadow-lg shadow-red-500/20',
    container: 'bg-red-500',
    icon: 'text-white',
    text: 'text-white',
  },
} as const;
