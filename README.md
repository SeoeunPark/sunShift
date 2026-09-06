# SHIFT

4조 교대근무자를 위한 모바일 중심 교대근무 관리 PWA 서비스입니다.

> 특정 회사의 공식 앱이 아니며, 공식 브랜드 자산을 사용하지 않습니다.

## 기술 스택

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Zustand
- **Backend** (Phase 3+): Supabase, PostgreSQL, Supabase Auth, RLS
- **Local Cache** (Phase 4+): IndexedDB, Dexie.js
- **PWA**: Web App Manifest, Service Worker
- **Push** (Phase 10+): Web Push, VAPID, Supabase Edge Functions
- **Date**: date-fns, date-fns-tz (Asia/Seoul)
- **Testing**: Vitest, React Testing Library, Playwright (Phase 15+)

## 현재 진행 상태

### Phase 1~2 완료

- [x] Next.js 프로젝트 초기화
- [x] Tailwind CSS + shadcn/ui
- [x] 기본 모바일 레이아웃 (하단 네비게이션)
- [x] PWA 기본 설정 (manifest, service worker)
- [x] 교대 계산 엔진 (shift engine)
- [x] Vitest 단위 테스트 (61개 통과)

### Phase 7 완료

- [x] 휴무 화면 (다음 휴무 D-Day)
- [x] 이번 달 휴무 일수
- [x] 연속 휴무 블록 목록 (현재/다가오는/지난)
- [x] `useDaysOff` hook

### Phase 8 완료

- [x] 연차 현황 (총/사용/잔여, 총량 수정)
- [x] 연차 등록·수정·삭제 (날짜별 upsert)
- [x] 연차 전후 OFF 포함 휴식 분석 미리보기
- [x] 메모 탭 (캘린더 `?date=&tab=memo` 연동)
- [x] `useLeaveBalance`, `useLeaveRestAnalysis` hook
- [x] leaveSettings 로컬 저장 + Supabase profile 동기화

### Phase 9 완료

- [x] 전용 메모 화면 (`/memo`)
- [x] 메모 현황 (전체/이번 달/다가오는)
- [x] 날짜별 메모 등록·수정·삭제 (Textarea, 근무조 표시)
- [x] 다가오는/지난 메모 목록 (D-Day 라벨)
- [x] 캘린더 연동 (`/memo?date=`, `/calendar?date=`, DateDetailSheet)
- [x] `/leave?tab=memo` → `/memo` 리다이렉트
- [x] `useMemoGroups`, `memoUtils` + 테스트

### Phase 10 완료

- [x] Web Push 구독 (권한 요청, VAPID, `push_subscriptions` 저장)
- [x] 알림 설정 UI (오늘/내일/출근 전/휴무/연차)
- [x] Service Worker push/click handler
- [x] 테스트 알림 API (`POST /api/push/test`)
- [x] Cron dispatch API (`POST /api/cron/shift-notifications`)
- [x] Edge Function `send-shift-notifications` (Cron 연동용)
- [x] `notificationPlanner` + 메시지 빌더

### Phase 11 완료

- [x] 조별 수면 알림 설정 UI (A/B/C ON/OFF + 시간)
- [x] 근무 시간 표시 + Push 연동
- [x] `sleepPlanner` — 해당 근무조일 설정 시간에 수면 알림
- [x] Cron dispatch에 수면 알림 포함

### Phase 12 완료

- [x] Manifest 고도화 (shortcuts, categories, scope)
- [x] PWA 아이콘 생성 (`npm run generate:icons`)
- [x] Service Worker v2 (앱 셸 precache, navigation network-first, offline fallback)
- [x] `/offline` 페이지 + 상단 오프라인 배너
- [x] 앱 설치 UI (beforeinstallprompt + iOS/Android 안내)
- [x] SW 업데이트 배너 (새 버전 새로고침)

### Phase 13 완료

- [x] 통계 전용 화면 (`/stats`)
- [x] 월별 통계 (A/B/C/휴무/야간/연차/근무일/근무시간)
- [x] 근무 분포 bar chart
- [x] 전월 대비 비교
- [x] 연간 근무일 추이 (12개월)
- [x] `statsUtils` + 테스트, 홈 요약 → 통계 링크

### Phase 14 완료

- [x] 월간 근무표 텍스트 포맷 (`scheduleText`)
- [x] Canvas PNG 이미지 생성 (`scheduleImage`)
- [x] Web Share API 우선 + 이미지 저장/텍스트 복사 fallback
- [x] 달력 화면 공유 UI (`ShareScheduleActions`)

### Phase 15 완료

- [x] 첫 실행 교대 설정 온보딩 (`/onboarding`)
- [x] 기존 사용자 자동 마이그레이션 (기존 shiftSettings 보유 시 onboarding 완료 처리)
- [x] 공통 UI: PageHeader, LoadingCard, EmptyState, Skeleton
- [x] 주요 화면 로딩 skeleton + 페이지 헤더 통일
- [x] 설정에서 교대 설정 변경 (`/onboarding?edit=1`)
- [x] 페이지 전환 애니메이션 + 모바일 tap highlight 제거
- [x] 온보딩/인증 화면 하단 네비 숨김

## 설치

```bash
npm install
```

## 환경변수

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요.

```bash
cp .env.example .env.local
```

Phase 1~2에서는 Supabase 환경변수 없이도 로컬 개발 및 교대 계산이 가능합니다.

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. Project Settings → API에서 URL과 anon key 확인
3. `.env.local`에 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Migration 실행

**방법 A: Supabase Dashboard SQL Editor**

`supabase/migrations/` 폴더의 SQL 파일을 순서대로 실행:

1. `001_initial_schema.sql`
2. `002_rls.sql`
3. `003_push_subscriptions.sql`

**방법 B: Supabase CLI**

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작 (선택)
supabase start

# 원격 프로젝트 연결
supabase link --project-ref your-project-ref

# Migration 적용
supabase db push
```

### 3. Auth Redirect URL 설정

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (개발) / 배포 URL (프로덕션)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`

### 4. 이메일 Auth 활성화

Authentication → Providers → Email:

- Enable Email provider
- Magic Link 사용 시 Confirm email 설정 확인

### Database Schema

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 |
| `shift_settings` | 교대 설정 (기준일, 패턴) |
| `shift_definitions` | 근무 시간 정의 |
| `leave_records` | 연차 기록 |
| `memo_records` | 날짜별 메모 |
| `notification_settings` | 알림 설정 |
| `sleep_settings` | 수면 알림 (조별) |
| `push_subscriptions` | Web Push 구독 |

모든 테이블에 `user_id` 기반 RLS가 적용되어 있습니다.

신규 가입 시 `handle_new_user` trigger가 기본 교대 설정을 자동 생성합니다:

- 기준일: 2026-09-02, B조
- 4조 6근2휴 패턴
- 기본 알림/수면 설정

## 로컬 캐시 (IndexedDB)

Dexie.js 기반 `shift-db`에 다음 데이터를 저장합니다:

| Store | 설명 |
|-------|------|
| `shiftSettings` | 교대 설정 (계산 패턴, 기준일) |
| `leaveRecords` | 연차 기록 |
| `memoRecords` | 날짜별 메모 |
| `notificationSettings` | 알림 설정 |
| `sleepSettings` | 조별 수면 알림 |

**교대 날짜 전체는 저장하지 않습니다.** 필요 시 shift engine에서 계산합니다.

로그인하지 않은 사용자는 `local` userId로 IndexedDB에 저장됩니다.

### Repository 구조

```
UI → Hook → Repository → Local (IndexedDB) / Remote (Supabase)
```

- **읽기**: IndexedDB 우선 (즉시 표시)
- **쓰기**: IndexedDB 즉시 저장 → Sync Queue → Supabase (온라인 시)

### 동기화 (Phase 5)

```
로컬 저장 → syncQueue enqueue → (온라인) push → Supabase
                                    ↑
              (로그인/온라인 복구) pull + LWW merge
```

| 상태 | 설명 |
|------|------|
| 동기화 완료 | Supabase와 일치 |
| 동기화 중 | push/pull 진행 |
| 오프라인 | 큐에 저장, 연결 복구 시 재시도 |
| 동기화 필요 | pending queue 존재 |

충돌 처리: `updatedAt` 기준 **Last-Write-Wins**

## 로컬 개발

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 테스트

```bash
npm test          # 단위 테스트 실행
npm run test:watch  # watch 모드
```

### 핵심 검증 케이스

교대 계산 엔진은 다음 결과를 보장합니다 (기준일: 2026-09-02 = B조):

| 날짜 | 근무조 |
|------|--------|
| 2026-09-02 ~ 09-07 | B |
| 2026-09-08 ~ 09-09 | OFF |
| 2026-09-10 ~ 09-15 | C |
| 2026-09-16 ~ 09-17 | OFF |
| 2026-09-18 ~ 09-23 | A |
| 2026-09-24 ~ 09-25 | OFF |
| 2026-09-26 ~ 10-01 | B |
| 2026-10-02 ~ 10-03 | OFF |

C조 야간근무: 2026-09-10 23:00 ~ 2026-09-11 07:00

## 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 홈 (오늘 근무)
│   ├── calendar/
│   ├── days-off/
│   ├── leave/
│   └── settings/
├── components/
│   ├── auth/               # AuthProvider, LoginForm
│   ├── layout/             # AppShell, BottomNavigation
│   ├── settings/           # AccountSection
│   ├── shift/              # ShiftBadge
│   └── ui/                 # shadcn/ui
├── hooks/                  # useShiftSettings, useLeave, ...
├── lib/
│   ├── db/                 # Dexie IndexedDB ★
│   ├── repositories/       # Local / Remote Repository ★
│   ├── shift/
│   ├── supabase/
│   ├── date/
│   ├── theme/
│   └── pwa/
├── stores/                 # authStore (Zustand)
└── types/                  # database.ts
supabase/
├── migrations/             # 001~003 SQL
├── config.toml
└── seed.sql
public/
├── manifest.json
├── sw.js
└── icons/
```

## 교대 패턴

24일 주기 (4조 6근2휴):

```
A A A A A A | OFF OFF | B B B B B B | OFF OFF | C C C C C C | OFF OFF
```

근무시간:

- A조: 07:00 ~ 15:00
- B조: 15:00 ~ 23:00
- C조: 23:00 ~ 07:00 (익일)
- OFF: 휴무

## PWA 설치

1. `npm run dev` 또는 배포 URL 접속
2. **설정 → 앱 설치**에서 설치 버튼 사용 (지원 브라우저)
3. Chrome: 주소창 설치 아이콘
4. iOS Safari: 공유 → 홈 화면에 추가

아이콘 재생성:

```bash
npm run generate:icons
```

오프라인에서도 IndexedDB에 저장된 교대 데이터와 열어둔 화면을 사용할 수 있습니다.

## Edge Function / Cron (Phase 10+)

### 1. VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

`.env.local` 예시:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
CRON_SECRET=your-random-secret
```

### 2. Cron API (Next.js)

매 분(또는 원하는 주기) 아래 엔드포인트를 호출합니다.

```bash
curl -X POST https://your-app.example.com/api/cron/shift-notifications \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 3. Supabase Edge Function

`send-shift-notifications` 함수는 배포된 Next.js Cron API를 호출합니다.

필요 secrets:

- `APP_URL` — 배포된 Next.js URL
- `CRON_SECRET` — Cron API Bearer token

Supabase Dashboard에서 Cron schedule(예: `* * * * *`)을 연결하거나, 외부 Cron 서비스로 `/api/cron/shift-notifications`를 직접 호출할 수 있습니다.

## 라이선스

Private project.
