import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { Recommendation, UserContentWithDetails } from '@tkhwang-pico/supabase';
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit2,
  FileText,
  Sparkles,
  Tag,
} from 'lucide-react-native';
import React from 'react';
import { Alert, type LayoutChangeEvent, Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchedulePriorityPicker } from '@/components/content/shared/schedule-priority-picker';
import { SchedulePriorityPreview } from '@/components/content/shared/schedule-priority-preview';
import { ContentTags } from '@/components/content/sub/content-tags';
import { ContentThumbnail } from '@/components/content/sub/content-thumbnail';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SiteFavicon } from '@/components/ui/site-favicon';
import { Text } from '@/components/ui/text';
import { ContentDate } from '@/domains/value-object/content-date';
import { useContentActions } from '@/hooks/use-content-actions';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import {
  bottomSheetReducer,
  createInitialState,
  type ScheduleCloseReason,
  type ScheduleContext,
  type ScheduleOpenOptions,
} from '@/reducers/bottom-sheet/bottom-sheet.reducer';
import { formatReadingTimeWithSuffix, getThumbnailUrl } from '@/utils/content-formatters';
import { formatDateForApi, getDefaultSchedule, normalizeToStartOfDay } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';
import { getFaviconUrl } from '@/utils/url';

import { ContentEditModal } from '../edit/content-edit-modal';
import { ContentDetailBottomActions } from './content-detail-bottom-actions';

const GRID_GAP = 8;

interface ContentDetailProps {
  visible: boolean;
  item: UserContentWithDetails | Recommendation | null;
  onClose: () => void;
  mode?: 'home' | 'recommend';
  // Home mode callbacks
  onToggleComplete?: (id: string) => void;
  onDelete?: (contentId: string) => void;
  onLike?: (contentId: string) => void;
  // Recommend mode callbacks
  onAddToQueue?: (options: {
    url: string;
    contentId: string;
    scheduledFor: string;
    priority: PriorityValue;
  }) => void | Promise<void>;
  onNotInterested?: (contentId: string) => void;
  onReopen?: (options: {
    userContentId: string;
    scheduledFor: string;
    priority: PriorityValue;
  }) => void | Promise<void>;
}

export function ContentDetail({
  visible,
  item,
  onClose,
  mode = 'home',
  onToggleComplete,
  onDelete,
  onLike,
  onAddToQueue,
  onNotInterested,
  onReopen,
}: ContentDetailProps) {
  const { openURL, deleteContent } = useContentActions();

  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const sheetPaddingBottom = insets.bottom + (isAndroid ? 24 : 16);
  const scrollContentPaddingBottom = 16;
  const scrollBottomInset = scrollContentPaddingBottom + sheetPaddingBottom;
  const { executeWithHapticFeedback } = useHapticFeedback();
  const [sheetState, dispatch] = React.useReducer(
    bottomSheetReducer,
    undefined,
    createInitialState,
  );
  const sheetStateRef = React.useRef(sheetState);
  React.useEffect(() => {
    sheetStateRef.current = sheetState;
  }, [sheetState]);

  const sheetRef = React.useRef<BottomSheetModal>(null);
  const detailSheetPresentedRef = React.useRef(false);
  const scheduleSheetRef = React.useRef<BottomSheetModal>(null);
  const scheduleSheetPresentedRef = React.useRef(false);
  const detailDismissedByUserRef = React.useRef(false);
  const detailClosingProgrammaticallyRef = React.useRef(false);
  const scheduleClosingReasonRef = React.useRef<ScheduleCloseReason | null>(null);
  const hasContent = Boolean(item && item.contents);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [readingRowWidth, setReadingRowWidth] = React.useState<number | null>(null);

  const snapPoints = React.useMemo(() => ['70%'], []);
  const scheduleSnapPoints = React.useMemo(() => {
    // Dynamic calculation based on content needs
    // SchedulePriorityPicker has:
    // - Header text (60px)
    // - Preview component (80px)
    // - Schedule section with 2 rows of buttons (160px)
    // - Priority section (100px)
    // - Action buttons (80px)
    // - Padding and gaps (80px)
    // Total minimum height: ~560px
    // Add buffer for safe area and padding
    const contentHeight = 560;
    const safeAreaPadding = insets.bottom + 40; // bottom safe area + extra padding
    const minHeight = contentHeight + safeAreaPadding;

    // Use percentage for larger screens, fixed height for smaller screens
    // This ensures content is always visible
    return ['75%', `${minHeight}`];
  }, [insets.bottom]);
  const readingRowSizes = React.useMemo(() => {
    if (readingRowWidth === null) {
      return null;
    }

    const baseWidth = (readingRowWidth - GRID_GAP * 3) / 4;
    if (!Number.isFinite(baseWidth) || baseWidth <= 0) {
      return null;
    }

    return {
      cardWidth: baseWidth * 3 + GRID_GAP * 2,
      editWidth: baseWidth,
    };
  }, [readingRowWidth]);

  const detailVisible = sheetState.detailVisible;
  const {
    visible: scheduleVisible,
    context: scheduleContext,
    date: scheduleDate,
    priority: schedulePriorityValue,
    returnTo: scheduleReturnTarget,
    closeDetailOnConfirm: closeDetailOnScheduleConfirm,
  } = sheetState.schedule;

  const handleReadingRowLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setReadingRowWidth((previous) => (previous === width ? previous : width));
  }, []);

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  const renderHandle = React.useCallback(
    () => (
      <View className="items-center py-2">
        <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
      </View>
    ),
    [],
  );

  const handleDetailDismiss = React.useCallback(() => {
    detailSheetPresentedRef.current = false;
    const closingProgrammatically = detailClosingProgrammaticallyRef.current;
    detailClosingProgrammaticallyRef.current = false;

    const currentState = sheetStateRef.current;
    if (!currentState.detailVisible && !currentState.schedule.visible) {
      return;
    }

    if (!closingProgrammatically) {
      detailDismissedByUserRef.current = true;
      dispatch({ type: 'CLOSE_DETAIL' });
      onClose();
    }
  }, [dispatch, onClose]);

  React.useEffect(() => {
    if (visible && hasContent) {
      if (!detailVisible && !detailDismissedByUserRef.current) {
        dispatch({ type: 'OPEN_DETAIL' });
      }
    } else {
      if (detailVisible || scheduleVisible) {
        detailClosingProgrammaticallyRef.current = true;
        dispatch({ type: 'RESET' });
      }
      detailDismissedByUserRef.current = false;
      scheduleClosingReasonRef.current = null;
    }
  }, [dispatch, visible, hasContent, detailVisible, scheduleVisible]);

  React.useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    if (detailVisible && hasContent && !detailSheetPresentedRef.current) {
      sheet.present();
      detailSheetPresentedRef.current = true;
    } else if ((!detailVisible || !hasContent) && detailSheetPresentedRef.current) {
      detailSheetPresentedRef.current = false;
      sheet.dismiss();
    }
  }, [detailVisible, hasContent]);

  React.useEffect(() => {
    const scheduleSheet = scheduleSheetRef.current;
    if (!scheduleSheet) return;

    if (scheduleVisible && !scheduleSheetPresentedRef.current) {
      scheduleSheet.present();
      scheduleSheetPresentedRef.current = true;
    } else if (!scheduleVisible && scheduleSheetPresentedRef.current) {
      scheduleSheetPresentedRef.current = false;
      scheduleSheet.dismiss();
    }
  }, [scheduleVisible]);

  const openScheduleSheet = React.useCallback(
    (
      context: ScheduleContext,
      initialDate: Date,
      initialPriority: PriorityValue,
      options: ScheduleOpenOptions,
    ) => {
      scheduleClosingReasonRef.current = null;

      dispatch({
        type: 'OPEN_READING_SCHEDULE',
        payload: {
          context,
          date: normalizeToStartOfDay(initialDate),
          priority: initialPriority,
          returnTo: options.returnTo,
          closeDetailOnConfirm: options.closeDetailOnConfirm ?? false,
        },
      });
    },
    [dispatch],
  );

  const handleScheduleSheetDismiss = React.useCallback(() => {
    scheduleSheetPresentedRef.current = false;

    const closingReason = scheduleClosingReasonRef.current;
    if (closingReason) {
      scheduleClosingReasonRef.current = null;
      return;
    }

    const currentState = sheetStateRef.current;
    if (!currentState.schedule.visible) {
      return;
    }

    const shouldCloseDetail = currentState.schedule.returnTo === 'none';

    dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'dismiss' } });
    if (shouldCloseDetail) {
      detailDismissedByUserRef.current = true;
      onClose();
    }
  }, [dispatch, onClose]);

  const handleScheduleDateChange = React.useCallback(
    (date: Date | null) => {
      const normalizedDate = normalizeToStartOfDay(date ?? getDefaultSchedule());
      dispatch({ type: 'UPDATE_SCHEDULE_DATE', payload: normalizedDate });
    },
    [dispatch],
  );

  const handleSchedulePriorityChange = React.useCallback(
    (priority: PriorityValue) => {
      dispatch({ type: 'UPDATE_SCHEDULE_PRIORITY', payload: priority });
    },
    [dispatch],
  );

  const handleScheduleCancel = React.useCallback(() => {
    if (!scheduleVisible) return;

    scheduleClosingReasonRef.current = 'cancel';

    if (scheduleReturnTarget === 'none') {
      detailDismissedByUserRef.current = true;
      detailClosingProgrammaticallyRef.current = true;
    }

    dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'cancel' } });

    if (scheduleReturnTarget === 'none') onClose();
  }, [dispatch, onClose, scheduleReturnTarget, scheduleVisible]);

  const handleScheduleConfirm = React.useCallback(async () => {
    if (!scheduleContext) return;

    await executeWithHapticFeedback(async () => {
      try {
        const scheduledFor = formatDateForApi(scheduleDate);

        if (scheduleContext.type === 'add') {
          if (!onAddToQueue) return;
          await Promise.resolve(
            onAddToQueue({
              url: scheduleContext.url,
              contentId: scheduleContext.contentId,
              scheduledFor,
              priority: schedulePriorityValue,
            }),
          );
        } else if (scheduleContext.type === 'reopen') {
          if (onReopen) {
            await Promise.resolve(
              onReopen({
                userContentId: scheduleContext.userContentId,
                scheduledFor,
                priority: schedulePriorityValue,
              }),
            );
          } else if (onToggleComplete) {
            await Promise.resolve(onToggleComplete(scheduleContext.userContentId));
          }
        }

        scheduleClosingReasonRef.current = 'save';

        const shouldCloseDetail = scheduleReturnTarget === 'none' || closeDetailOnScheduleConfirm;

        if (shouldCloseDetail) {
          detailDismissedByUserRef.current = true;
          detailClosingProgrammaticallyRef.current = true;
        }

        dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'save' } });

        if (shouldCloseDetail) onClose();
      } catch (error) {
        console.error('Failed to update reading schedule', error);
      }
    });
  }, [
    closeDetailOnScheduleConfirm,
    executeWithHapticFeedback,
    onAddToQueue,
    onClose,
    onReopen,
    onToggleComplete,
    scheduleContext,
    scheduleDate,
    schedulePriorityValue,
    scheduleReturnTarget,
  ]);

  if (!hasContent || !item || !item.contents) {
    return null;
  }

  const content = item.contents;
  const isCompleted = 'todo_status' in item ? item.todo_status === 'completed' : false;
  const isRecommendation = mode === 'recommend';
  const thumbnailUrl = getThumbnailUrl(content);
  const faviconUrl = getFaviconUrl(content.metadata);
  const isLiked =
    'preferences' in item
      ? (item.preferences?.some((preference) => preference.preference_type === 'liked') ?? false)
      : false;

  const userContent = !isRecommendation && 'id' in item ? (item as UserContentWithDetails) : null;
  const priorityValue: PriorityValue = userContent
    ? ((userContent.priority ?? DEFAULT_PRIORITY) as PriorityValue)
    : DEFAULT_PRIORITY;
  const savedAtLabel =
    'saved_at' in item && item.saved_at
      ? new ContentDate(item.saved_at).toSimpleString('en-US')
      : null;
  const scheduledDatePreview = userContent?.scheduled_for
    ? (() => {
        const parsed = new Date(userContent.scheduled_for);
        return Number.isNaN(parsed.getTime()) ? null : normalizeToStartOfDay(parsed);
      })()
    : null;

  const handleToggleComplete = async () => {
    await executeWithHapticFeedback(async () => {
      if (onToggleComplete && 'id' in item) {
        await Promise.resolve(onToggleComplete(item.id));
        onClose();
      }
    });
  };

  const handleReopenPress = async () => {
    await executeWithHapticFeedback(async () => {
      if (!userContent) return;

      const initialDate = userContent.scheduled_for
        ? (() => {
            const parsed = new Date(userContent.scheduled_for);
            return Number.isNaN(parsed.getTime())
              ? getDefaultSchedule()
              : normalizeToStartOfDay(parsed);
          })()
        : getDefaultSchedule();

      const initialPriority = (userContent.priority ?? DEFAULT_PRIORITY) as PriorityValue;

      openScheduleSheet(
        { type: 'reopen', userContentId: userContent.id },
        initialDate,
        initialPriority,
        { returnTo: 'detail', closeDetailOnConfirm: true },
      );
    });
  };

  const handleDelete = async () => {
    await executeWithHapticFeedback(() => {
      deleteContent(item.content_id, onDelete, onClose);
    });
  };

  const handleLike = async () => {
    await executeWithHapticFeedback(async () => {
      if (onLike) {
        await Promise.resolve(onLike(item.content_id));
      }
    });
  };

  const handleAddToQueue = async () => {
    await executeWithHapticFeedback(async () => {
      if (!onAddToQueue) return;
      const url = content.canonical_url || content.url;
      if (!url) {
        Alert.alert('Error', 'No URL available for this content');
        return;
      }

      const defaultSchedule = getDefaultSchedule();
      openScheduleSheet(
        { type: 'add', url, contentId: item.content_id },
        defaultSchedule,
        DEFAULT_PRIORITY,
        { returnTo: 'detail', closeDetailOnConfirm: true },
      );
    });
  };

  const handleNotInterested = async () => {
    await executeWithHapticFeedback(async () => {
      if (onNotInterested) {
        await Promise.resolve(onNotInterested(item.content_id));
        onClose();
      }
    });
  };

  const handleOpenURL = async () => {
    await executeWithHapticFeedback(async () => {
      const url = content.canonical_url || content.url;
      await openURL(url, onClose);
    });
  };

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        index={0}
        handleComponent={renderHandle}
        backdropComponent={renderBackdrop}
        onDismiss={handleDetailDismiss}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        topInset={insets.top}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        style={{ overflow: 'hidden' }}
        stackBehavior="push"
        android_keyboardInputMode="adjustResize"
      >
        <View className="flex-1 rounded-t-2xl bg-white dark:bg-gray-800">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 pb-3 pt-4 dark:border-gray-700">
            {isRecommendation ? (
              // Recommendation mode header
              <View className="flex-1 flex-row items-center justify-center">
                <View className="flex-row items-center gap-2">
                  <Icon as={Sparkles} className="h-5 w-5 text-purple-500" />
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Recommendation
                  </Text>
                </View>
              </View>
            ) : (
              // Home mode header
              <>
                <View className="w-10" />
                <View className="flex-1 flex-row items-center justify-center gap-2">
                  <View className="p-1">
                    <Icon
                      as={isCompleted ? CheckCircle : Circle}
                      className={`h-6 w-6 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}
                    />
                  </View>
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </Text>
                </View>
                <View className="w-10" />
              </>
            )}
          </View>

          {/* Content */}
          <BottomSheetScrollView
            className="flex-1 px-4 py-4"
            showsVerticalScrollIndicator={false}
            bounces
            contentContainerStyle={{
              paddingBottom: scrollBottomInset,
            }}
          >
            {/* Title */}
            <Text
              className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100"
              numberOfLines={3}
              adjustsFontSizeToFit={false}
            >
              {content.title || 'Untitled'}
            </Text>

            {/* Metadata */}
            <View className="mb-1 flex-row flex-wrap">
              {content.domain && (
                <View className="mb-2 mr-3 flex-row items-center">
                  <SiteFavicon url={faviconUrl} size={14} className="mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{content.domain}</Text>
                </View>
              )}
              {savedAtLabel && (
                <View className="mb-2 mr-3 flex-row items-center">
                  <Icon as={Calendar} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{savedAtLabel}</Text>
                </View>
              )}
              {content.word_count !== null &&
                content.word_count !== undefined &&
                content.word_count > 0 && (
                  <View className="mb-2 flex-row items-center">
                    <Icon as={Clock} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      {formatReadingTimeWithSuffix(content.word_count)}
                    </Text>
                  </View>
                )}
            </View>

            {/* Thumbnail */}
            {thumbnailUrl && (
              <View className="mb-4 items-center">
                <ContentThumbnail imageUrl={thumbnailUrl} size="large" className="h-48 w-full" />
              </View>
            )}

            {userContent && (
              <View
                className="mb-4 flex-row"
                onLayout={!isCompleted ? handleReadingRowLayout : undefined}
              >
                <View
                  style={
                    !isCompleted && readingRowSizes
                      ? {
                          width: readingRowSizes.cardWidth,
                          marginRight: GRID_GAP,
                        }
                      : !isCompleted
                        ? {
                            flexGrow: 3,
                            flexShrink: 1,
                            marginRight: GRID_GAP,
                          }
                        : { flex: 1 }
                  }
                >
                  <SchedulePriorityPreview
                    scheduledDate={scheduledDatePreview}
                    priority={priorityValue}
                    title="Reading Settings"
                  />
                </View>
                {!isCompleted && (
                  <TouchableOpacity
                    onPress={() => setShowEditModal(true)}
                    accessibilityRole="button"
                    className="items-center justify-center rounded-lg bg-blue-50 px-2 py-3 dark:bg-blue-500/10"
                    style={
                      readingRowSizes
                        ? { width: readingRowSizes.editWidth }
                        : { flexGrow: 1, flexShrink: 1 }
                    }
                  >
                    <Icon as={Edit2} className="mb-1 h-5 w-5 text-blue-600 dark:text-blue-200" />
                    <Text className="text-xs font-semibold text-blue-600 dark:text-blue-200">
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Summary */}
            {content.summary && (
              <View className="mb-4">
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Summary
                </Text>
                <Text className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {content.summary}
                </Text>
              </View>
            )}

            {/* Note - only for UserContentWithDetails */}
            {'note' in item && item.note && (
              <View className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <View className="mb-1 flex-row items-center">
                  <Icon
                    as={FileText}
                    className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                  />
                  <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Note
                  </Text>
                </View>
                <Text className="text-sm italic text-gray-700 dark:text-gray-300">{item.note}</Text>
              </View>
            )}

            {/* Tags (from content) */}
            {content.tags && content.tags.length > 0 && (
              <View className="mb-4">
                <View className="mb-2 flex-row items-center">
                  <Icon as={Tag} className="mr-1 h-3.5 w-3.5 text-gray-400" />
                  <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tags
                  </Text>
                </View>
                <ContentTags
                  tags={content.tags}
                  expandable={true}
                  initialMaxTags={6}
                  className="flex-row flex-wrap"
                />
              </View>
            )}
          </BottomSheetScrollView>

          {/* Fixed Action Bar */}
          <ContentDetailBottomActions
            mode={mode}
            isCompleted={isCompleted}
            isLiked={isLiked}
            sheetPaddingBottom={sheetPaddingBottom}
            onToggleComplete={handleToggleComplete}
            onReopen={handleReopenPress}
            onLike={handleLike}
            onDelete={handleDelete}
            onOpenURL={handleOpenURL}
            onAddToQueue={handleAddToQueue}
            onNotInterested={handleNotInterested}
          />
        </View>
      </BottomSheetModal>

      {(onAddToQueue || onReopen) && (
        <BottomSheetModal
          ref={scheduleSheetRef}
          snapPoints={scheduleSnapPoints}
          onDismiss={handleScheduleSheetDismiss}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          enableDynamicSizing={true}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          stackBehavior="push"
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetView className="flex-1 px-4 py-4">
            <Text className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
              {scheduleContext?.type === 'reopen' ? 'Reading Schedule' : 'Add to Queue'}
            </Text>
            <Text className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {scheduleContext?.type === 'reopen'
                ? 'Choose when to revisit this content and how important it is.'
                : 'Choose when to read and how important it is.'}
            </Text>

            <SchedulePriorityPicker
              visible={scheduleVisible}
              scheduledDate={scheduleDate}
              onScheduledDateChange={handleScheduleDateChange}
              priority={schedulePriorityValue}
              onPriorityChange={handleSchedulePriorityChange}
              previewTitle="Preview"
            />

            <View className="mt-6 flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleScheduleCancel}
                disabled={!scheduleContext}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                className="flex-1 bg-blue-500"
                onPress={handleScheduleConfirm}
                disabled={!scheduleContext}
              >
                <Text className="font-semibold text-white">Save</Text>
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      )}

      {/* Edit Modal */}
      {item && 'id' in item && (
        <ContentEditModal
          visible={showEditModal}
          item={item as UserContentWithDetails}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
