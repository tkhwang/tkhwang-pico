import { getDefaultSchedule } from '@/utils/date';
import { DEFAULT_PRIORITY, type PriorityValue } from '@/utils/priority';

declare const __DEV__: boolean | undefined;

export type SheetReturnTarget = 'detail' | 'none';
export type ScheduleCloseReason = 'save' | 'cancel' | 'dismiss';

export type ScheduleContext =
  | { type: 'add'; url: string; contentId: string }
  | { type: 'reopen'; userContentId: string };

export interface BottomSheetState {
  detailVisible: boolean;
  active: 'detail' | 'reading-schedule' | null;
  schedule: {
    visible: boolean;
    context: ScheduleContext | null;
    date: Date;
    priority: PriorityValue;
    returnTo: SheetReturnTarget;
    closeDetailOnConfirm: boolean;
  };
}

export type BottomSheetAction =
  | { type: 'RESET' }
  | { type: 'OPEN_DETAIL' }
  | { type: 'CLOSE_DETAIL' }
  | {
      type: 'OPEN_READING_SCHEDULE';
      payload: {
        context: ScheduleContext;
        date: Date;
        priority: PriorityValue;
        returnTo: SheetReturnTarget;
        closeDetailOnConfirm: boolean;
      };
    }
  | { type: 'UPDATE_SCHEDULE_DATE'; payload: Date }
  | { type: 'UPDATE_SCHEDULE_PRIORITY'; payload: PriorityValue }
  | { type: 'CLOSE_READING_SCHEDULE'; payload: { reason: ScheduleCloseReason } };

export interface ScheduleOpenOptions {
  returnTo: SheetReturnTarget;
  closeDetailOnConfirm?: boolean;
}

export const createInitialState = (): BottomSheetState => ({
  detailVisible: false,
  active: null,
  schedule: {
    visible: false,
    context: null,
    date: getDefaultSchedule(),
    priority: DEFAULT_PRIORITY,
    returnTo: 'detail',
    closeDetailOnConfirm: false,
  },
});

const isDebugEnabled = (() => {
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== 'production';
  }
  return false;
})();

function logTransition(
  prevState: BottomSheetState,
  action: BottomSheetAction,
  nextState: BottomSheetState,
) {
  if (!isDebugEnabled || prevState === nextState) return;

  console.log('[bottomSheetReducer]', action.type, {
    action,
    prevState,
    nextState,
  });
}

export const bottomSheetReducer = (
  state: BottomSheetState,
  action: BottomSheetAction,
): BottomSheetState => {
  switch (action.type) {
    case 'RESET': {
      const nextState = createInitialState();
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'OPEN_DETAIL': {
      if (state.detailVisible) return state;

      const nextState: BottomSheetState = {
        ...state,
        detailVisible: true,
        active: state.schedule.visible ? 'reading-schedule' : 'detail',
      };
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'CLOSE_DETAIL': {
      if (!state.detailVisible && !state.schedule.visible) return state;

      const nextState = createInitialState();
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'OPEN_READING_SCHEDULE': {
      const nextState: BottomSheetState = {
        detailVisible: true,
        active: 'reading-schedule',
        schedule: {
          visible: true,
          context: action.payload.context,
          date: action.payload.date,
          priority: action.payload.priority,
          returnTo: action.payload.returnTo,
          closeDetailOnConfirm: action.payload.closeDetailOnConfirm,
        },
      };
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'UPDATE_SCHEDULE_DATE': {
      if (state.schedule.visible && state.schedule.date.getTime() === action.payload.getTime()) {
        return state;
      }

      const nextState: BottomSheetState = {
        ...state,
        schedule: {
          ...state.schedule,
          date: action.payload,
        },
      };
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'UPDATE_SCHEDULE_PRIORITY': {
      if (state.schedule.visible && state.schedule.priority === action.payload) return state;

      const nextState: BottomSheetState = {
        ...state,
        schedule: {
          ...state.schedule,
          priority: action.payload,
        },
      };
      logTransition(state, action, nextState);
      return nextState;
    }
    case 'CLOSE_READING_SCHEDULE': {
      if (!state.schedule.visible) return state;

      const shouldKeepDetail =
        state.schedule.returnTo === 'detail' &&
        !(action.payload.reason === 'save' && state.schedule.closeDetailOnConfirm);

      const nextState: BottomSheetState = {
        detailVisible: shouldKeepDetail ? true : false,
        active: shouldKeepDetail ? 'detail' : null,
        schedule: {
          visible: false,
          context: null,
          date: getDefaultSchedule(),
          priority: DEFAULT_PRIORITY,
          returnTo: 'detail',
          closeDetailOnConfirm: false,
        },
      };
      logTransition(state, action, nextState);
      return nextState;
    }

    default:
      return state;
  }
};
