/**
 * Shared formatters for content display
 */

/**
 * Format a date string into a relative time string
 * @param dateString - ISO date string
 * @returns Formatted relative time (e.g., "Today", "2 days ago")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format a date string into a full date/time string
 * @param dateString - ISO date string
 * @returns Formatted full date/time
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format reading time based on word count
 * @param wordCount - Number of words in content
 * @returns Formatted reading time (e.g., "5 min")
 */
export const formatReadingTime = (wordCount: number | null | undefined): string => {
  if (!wordCount || wordCount === 0) return '0 min';
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min`;
};

/**
 * Format reading time with "read" suffix
 * @param wordCount - Number of words in content
 * @returns Formatted reading time (e.g., "5 min read")
 */
export const formatReadingTimeWithSuffix = (wordCount: number | null | undefined): string => {
  if (!wordCount || wordCount === 0) return '0 min read';
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
};

/**
 * Format score as percentage
 * @param score - Score value between 0 and 1
 * @returns Percentage (0-100)
 */
export const formatScorePercentage = (score: number): number => {
  return Math.round(score * 100);
};

/**
 * Get color class based on score
 * @param score - Score value (0-100)
 * @returns Tailwind color classes for the score
 */
export const getScoreColorClass = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-600 dark:text-gray-400';
};

/**
 * Parse and format time for timeline
 * @param dateString - ISO date string
 * @returns Object with day of week, day of month, and time
 */
export const formatTimelineDate = (dateString: string) => {
  const date = new Date(dateString);

  return {
    dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    dayOfMonth: date.getDate(),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
};
