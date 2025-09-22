# Repository Guidelines

## Project Structure & Module Organization
- Yarn 기반 모노레포이며 주요 앱은 `apps/` 아래에 위치: `web`(Next.js), `mobile-queue`(Expo), `nest`(NestJS API), `langchain`(LangGraph 도구), `mastra`(Mastra 워크플로).
- 공용 패키지는 `packages/`, 문서는 `docs/`; 각 앱 전용 유틸은 인접 폴더(`apps/web/lib`, `apps/mobile-queue/components`)에 둔다.
- 테스트는 프레임워크 규칙을 따른다: Nest 단위 테스트는 `apps/nest/src/**`, e2e는 `apps/nest/test`; LangChain 단위는 `.test.ts`, 통합은 `.int.test.ts`를 `apps/langchain/src/**/tests`에서 유지.

## Build, Test, and Development Commands
- `yarn workspace @tkhwang-pico/web dev|build|start|lint` — Next.js 웹 앱 로컬 실행, 빌드, 린트.
- `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web` — Expo 런처로 플랫폼별 개발 세션 시작.
- `cd apps/nest && yarn start:dev|build|test` — Nest API 워치 실행, 빌드, Jest 테스트 수행.
- `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format` — LangGraph 에이전트 개발, 빌드, 단위/통합 검사.
- `yarn workspace @tkhwang-pico/mastra dev|build|start` — Mastra 서비스 개발 서버 및 배포 실행 흐름 제어.

## 작업 계획 및 리뷰 프로세스
- 모든 작업자는 실행이나 코드 변경 전에 단계별 계획을 작성해 공유하고 리뷰 승인을 받은 뒤 진행한다.
- 계획이 바뀌면 즉시 공유하고, 주요 단계 완료 후 상태를 갱신한다.

## Coding Style & Naming Conventions
- 전역 TypeScript/TSX 사용, 2칸 들여쓰기, ESLint + Prettier(웹/모바일 Tailwind 플러그인 포함)로 포맷 자동화.
- 디렉터리·패키지는 케밥 케이스, React 컴포넌트는 PascalCase, 유틸은 앱 맥락에 맞춰 명명.
- 스타일과 훅은 가능하면 기능 근처에 배치하고, 다중 앱에서 공유할 때만 공용 디렉터리를 사용.

## Testing Guidelines
- Jest가 Nest와 LangChain 테스트를 담당하며, 신규 기능에는 결정적 단위 테스트와 필요한 통합 시나리오를 추가.
- API 검증은 `apps/nest`에서 `yarn test`, 에이전트는 `yarn workspace @tkhwang-pico/langchain test` 또는 `test:int`로 수행.
- 스펙과 연동된 픽스처는 테스트 폴더에 보관하고 변경 시 동기화한다.

## Commit & Pull Request Guidelines
- 커밋 메시지는 `emoji type(scope): summary` 형식(예: `✨ feat(mobile/queue): add Content component`)을 지키며, scope는 앱 또는 기능 단위로 제한.
- PR에는 변경 동기, 수동/자동 테스트 단계, 필요 시 UI 스크린샷, 관련 이슈 링크를 포함한다.

## Security & Configuration Tips
- 비밀 값은 `.env.example`을 복사한 로컬 `.env`로 관리하고 런타임 주입 도구를 사용한다.
- LangChain 워크스페이스는 Node 18 이상, Mastra는 Node 20 이상을 요구하므로 환경과 Yarn Plug'n'Play 설정을 확인한다.
- Clerk, Supabase, Mastra Cloud 연동에는 유효한 키가 필수이니 배포 전 액세스를 검증한다.
