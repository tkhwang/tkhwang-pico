# Bottom sheet interaction guide

This document describes how the detail and reading schedule bottom sheets should behave across tabs in the mobile queue app. The current approach keeps the detail sheet mounted while the reading schedule sheet temporarily overlays it, so we avoid closing and re-opening the detail sheet unless the final flow explicitly requires no sheets.

## Bottom sheet types

- **Detail bottom sheet**: shows metadata, summary, and primary actions for the selected content card.
- **Reading schedule bottom sheet**: lets the user adjust reading cadence and reminders.

## Shared rules

- Card taps open the detail sheet unless another rule below overrides it.
- Opening the reading schedule sheet never unmounts the detail sheet; instead it sets the schedule sheet as the active layer on top of the existing stack.
- When the reading schedule sheet closes, the reducer inspects the stored `returnTo` metadata to decide whether to reveal the preserved detail sheet or drop to an idle state.
- `dispatch` 호출 간 상태 전환을 reducer 내부에서 처리해 중복 액션(예: detail 닫고 다시 열기)을 피한다.

## Reducer actions

| Action                   | Payload 필드                                                  | 설명                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `OPEN_DETAIL`            | `tab`, `contentId`, `context?`                                | 선택한 카드 정보와 탭 컨텍스트를 저장하고 detail bottom sheet를 활성화한다. 기존 시트 스택은 초기화한다.                                   |
| `OPEN_READING_SCHEDULE`  | `tab`, `contentId`, `returnTo` (`detail`\|`none`), `context?` | 읽기 일정 시트를 detail 위에 올린다. `returnTo` 값으로 닫힐 때 어떤 시트로 돌아갈지 결정한다. detail 시트는 비활성화 상태로 스택에 남는다. |
| `CLOSE_READING_SCHEDULE` | `reason` (`save`\|`cancel`\|`dismiss`)                        | 읽기 일정 시트를 닫고 `returnTo`를 확인해 detail을 다시 활성화하거나 idle 상태로 전환한다.                                                 |
| `CLOSE_DETAIL`           | `reason` (`cancel`\|`dismiss`)                                | detail bottom sheet를 닫고 idle 상태로 전환한다.                                                                                           |

```tsx
// 상태 예시
interface BottomSheetState {
  active: 'detail' | 'reading-schedule' | null;
  stack: Array<'detail'>;
  tab: 'queue' | 'discover' | 'archive';
  contentId: string | null;
  returnTo?: 'detail' | 'none';
  lastAction?: string;
}
```

## Queue tab

### Interaction rules

1. 탭에서 어떤 카드(대형, 소형, 리스트)를 탭하면 detail bottom sheet가 열린다.
2. detail bottom sheet에서 `Edit reading settings`를 누르면 reading schedule bottom sheet가 detail 위에 열린다. detail sheet는 비활성화된 상태로 스택에 유지된다.
3. reading schedule bottom sheet에서 `Save changes`, `Close`, 혹은 시트 외부 탭 시 reading schedule sheet만 닫히고 detail sheet가 즉시 다시 활성화된다.

### Dispatch sequence

```ts
dispatch({ type: 'OPEN_DETAIL', payload: { tab: 'queue', contentId } });
dispatch({
  type: 'OPEN_READING_SCHEDULE',
  payload: { tab: 'queue', contentId, returnTo: 'detail' },
});
// on save/close/dismiss
dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason } });
```

## Discover tab

### Add to queue 흐름

1. 카드 탭 → detail bottom sheet가 열린다.
2. `Add to queue` 선택 → reading schedule bottom sheet가 detail 위에 열린다. detail sheet는 스택에 남지만 비활성화된다.
3. 읽기 일정 시트에서 `Save changes` → reducer가 `returnTo: 'none'`을 확인해 detail sheet를 함께 정리하고 idle 상태로 전환한다.

```ts
dispatch({ type: 'OPEN_DETAIL', payload: { tab: 'discover', contentId } });
dispatch({
  type: 'OPEN_READING_SCHEDULE',
  payload: { tab: 'discover', contentId, returnTo: 'none' },
});
dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'save' } });
```

### Cancel 흐름

1. 카드 탭 → detail bottom sheet가 열린다.
2. `Add to queue` → reading schedule bottom sheet가 detail 위에 열린다.
3. 읽기 일정 시트에서 `Cancel` → reducer가 `returnTo: 'none'`을 확인해 두 시트를 모두 닫고 idle 상태로 전환한다.

```ts
dispatch({ type: 'OPEN_DETAIL', payload: { tab: 'discover', contentId } });
dispatch({
  type: 'OPEN_READING_SCHEDULE',
  payload: { tab: 'discover', contentId, returnTo: 'none' },
});
dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'cancel' } });
```

## Archive (completed) tab

1. 카드 탭 → detail bottom sheet가 열린다.
2. `Reopen` 선택 → reading schedule bottom sheet가 detail 위에 열린다. detail sheet는 비활성화된 채 스택에 남는다.
3. 읽기 일정 시트에서 `Cancel` → reducer가 `returnTo: 'detail'`을 확인해 detail sheet를 다시 활성화한다.
4. 읽기 일정 시트에서 `Save changes` → reopen 완료 후 detail sheet를 닫고 idle 상태로 전환한다(선택 사항, 제품 요구에 맞춰 결정).

```ts
dispatch({ type: 'OPEN_DETAIL', payload: { tab: 'archive', contentId } });
dispatch({
  type: 'OPEN_READING_SCHEDULE',
  payload: { tab: 'archive', contentId, returnTo: 'detail' },
});
// on cancel/dismiss
dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'cancel' } });
// on save (필요 시)
dispatch({ type: 'CLOSE_READING_SCHEDULE', payload: { reason: 'save' } });
dispatch({ type: 'CLOSE_DETAIL', payload: { reason: 'save' } });
```

## Implementation notes

- 읽기 일정 시트를 열 때 detail 시트를 닫지 말고, reducer에서 `active` 상태만 업데이트해 overlay 느낌을 유지한다.
- `returnTo` 메타데이터는 reducer가 후속 전환을 결정하는 핵심 정보이므로 액션 payload로 항상 제공한다.
- 애널리틱스 이벤트 추적 시 `dispatch` 직후에 로깅해 detail → reading schedule → detail 복귀 흐름이 정확히 기록되도록 한다.
