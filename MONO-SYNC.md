# restudio-mono 이송 가이드

이 repo(`yhwancha/ppwr`)에서 한 작업은 최종적으로
`Revation-Dev/restudio-mono` 의 `ppwr/` 하위로 옮긴다.

## 경로 매핑

```
ppwr/front/**   ->   restudio-mono/ppwr/front/**
```

프리픽스 `ppwr/` 하나만 붙는다. 그 아래 구조(app/, components/, src/, public/)는 동일.

## 이송 방법

**디렉터리 복사 금지.** 커밋 단위 patch 로 옮긴다.

```bash
scripts/to-mono.sh mono-sync
```

내부적으로:
```bash
git format-patch <base>..HEAD --relative=front -o /tmp/p   # front/ 프리픽스 제거
cd restudio-mono && git am --3way --directory=ppwr/front /tmp/p/*.patch   # ppwr/front/ 로 다시 붙임
```

## 역방향 이송 (mono -> 여기)

mono 에서 먼저 한 작업을 여기로 되가져올 때도 **패치 단위**다. 방향만 뒤집는다.

```bash
git -C <mono> format-patch <base>..<tip> --relative=ppwr/front -o /tmp/p -- ppwr/front
git am --3way --directory=front /tmp/p/*.patch
```

`--relative=ppwr/front` 로 프리픽스를 떼고 `--directory=front` 로 다시 붙인다.
충돌은 mono 쪽 머지 커밋에 이미 해소본이 있으면 그것을 정본으로 삼는다.

## SYNC POINT

| 이 repo | = mono | 시점 |
|---|---|---|
| tag `mono-sync` | `89d151df` (`feat/ppwr-all`) | 2026-08-24 (3차) |

> 이송 기준점은 **`mono-sync` 태그**다. 커밋 hash 는 amend/rebase 로 바뀌므로 쓰지 않는다.
> 이송을 끝낼 때마다 태그를 옮긴다: `git tag -f mono-sync HEAD` (그리고 위 표의 mono 쪽을 갱신).

## 덮으면 안 되는 것 — mono 전용

이 repo 에는 없고 mono 에만 있는, 모노레포 서빙 구조 때문에 필요한 것들.
patch 가 이 파일들을 건드리면 반드시 손으로 확인한다.

| 파일 | 이유 |
|---|---|
| `next.config.ts` | `basePath:"/ppwr"`, `output:"standalone"`, `outputFileTracingRoot` — web 앱이 `/ppwr/*` 를 rewrites 프록시함 |
| `src/shared/base-path.ts` | `BASE_PATH`. 브라우저가 만드는 **절대 URL**(OAuth redirectTo, 포트원 redirectUrl, 클라이언트 → 내부 API fetch)은 basePath 자동적용이 안 되므로 직접 프리픽스 |
| `src/shared/safe-redirect.ts` | `?redirect=` 오픈 리다이렉트 차단 |
| `components/app/AppFooter.tsx` | `/app/*` 사업자정보 상시 노출 (PG·카드사 입점심사 요건) |
| `docker/Dockerfile.ppwr`, `.github/workflows/ppwr-dev-deployment.yml` | mono 루트. 이 repo 에 대응물 없음 |

**새 파일을 추가할 때**: 클라이언트에서 절대 URL 을 만든다면 mono 쪽에서 `BASE_PATH` 프리픽스가 필요하다. 여기서는 basePath 가 없어 잘 돌아가도 mono 에서 깨진다.

## 내용이 의도적으로 다른 곳

**(2026-08-24 해소)** `src/shared/payments/config.ts` 는 이제 mono 와 바이트 단위로 같다.
`hostingProvider`(Microsoft Azure) · `review-test-100` 상품명 · `SUBSCRIPTION_ENABLED=false`
세 값 모두 여기도 mono 값을 갖는다. 이 파일에서 두 트리가 갈리면 그건 의도가 아니라 드리프트다.

> 이 세 값은 PG·카드사 심사와 개인정보처리방침 고지에 걸려 있다. 바꾸기 전에 심사 영향을 먼저 본다.

## 두 트리의 상시 차이

동기화해도 남는, 의도된 차이 2개. `to-mono.sh` 로 이송할 때 이 파일이 patch 에 끼면 손으로 판단한다.

| 파일 | 차이 |
|---|---|
| `next.config.ts` | mono 만 `basePath:"/ppwr"` + `output:"standalone"` + `outputFileTracingRoot`. 여기는 루트(`/`)로 서빙해야 로컬 개발이 편하므로 동기화에서 제외한다. `BASE_PATH` 는 `NEXT_PUBLIC_BASE_PATH ?? ""` 라 여기선 자동으로 `""` 가 되어 그대로 동작한다 |
| `pnpm-lock.yaml` | 여기만 있음. mono 는 루트 워크스페이스 lock 하나를 쓴다. 동기화에서 제외. 단 `package.json` 이 바뀌면 여기서 `pnpm install --lockfile-only` 로 다시 만든다 |
| `.env.local.example` | mono 만 추적. 여기는 `front/.gitignore` 의 `.env*` 가 통째로 무시한다. 새 환경변수는 패치가 아니라 손으로 옮긴다 |
| `.claude/launch.json` | 여기만 있음 (로컬 dev 서버 정의, 포트 3002) |

## mono 에만 있는, 가져오지 않은 작업

`feat/ppwr-all` 에 **머지되지 않은** mono 브랜치에 ppwr 작업이 남아 있다. 정본 라인이
의도적으로 안 받은 것인지 유실인지는 **mono 쪽에서 사람이 판단할 사안**이다. 아래는
"기계적으로 이송하면 리디자인이 되돌아간다"는 사실만 기록한 것이고, 이송 지시가 아니다.

| mono 브랜치 | 커밋 | 내용 | 기계적 이송 시 |
|---|---|---|---|
| `feat/profile` | `facbb8f3` (08-14) | 설정 > 프로필 관리 (담당자·기업·EU·EPR) | **충돌·회귀.** 건드리는 파일 중 새 파일 2개(`src/lib/ppwr-profile-service.ts`, `settings/profile/edit/`)만 빼고 전부 여기서 갈렸다 — `Sidebar.tsx`(3722→5529), `src/shared/api.ts`(2840→3409), `settings/security/page.tsx`(당시 없음→Figma 시안 3287). `settings/team/` 은 리디자인에서 `settings/members/` 로 이름이 바뀌었으므로 죽은 라우트가 되살아난다 |
| `feat/profile` | `b207508a` (08-14) | 진단 관리 (리스트·상세피드·진단시작 위저드) | 같은 화면을 `746273e5`·`39071559` 가 다시 만들었다 |
| `feat/dashboard` | `a6d0ba68` (08-14) | 부품 관리 (리스트·유형선택·등록·상세·수정) | **회귀.** `app/app/components/page.tsx` 가 08-13 베이스(6503) → 이 커밋(10642) 인데 여기 정본은 Figma 리디자인(`b3747cb`, 17201). 덮으면 목록이 리디자인 이전으로 돌아간다 |
| `feat/ppwr` | `a76b7f50`…`362dc8ed` (7월) | 최초 ppwr 서비스 라인 | 폐기된 라인. `ppwr/front` 45 파일 vs 정본 182 파일. `1e0fc46c`(PR #1067 모노레포 머지)의 조상이 **아니다** |

> 참고: `feat/profile` 의 프로필 관리는 여기 `settings/profile/page.tsx` 가 아직
> `ComingSoon` 스텁(402 B)이라 **덮어쓸 대상이 아니라 빈 자리**다. 남은 스텁은
> `documents`·`notifications`·`reports`·`resources`·`settings/members`·`settings/profile` 6개.

## 이력

- **2026-08-18** — 이 repo 의 `front/` 를 mono `e8d2f1bc` 의 `ppwr/front/` 로 맞춤(baseline 재설정).
  이때 폐기한 미커밋 작업: `review-sub-100` 정기결제 심사상품, `front/app/_debug-pay/`.
  둘 다 mono 에서 이미 시도 후 폐기된 것 — 정기결제는 KCP 정기결제 채널(MID) 미연동으로
  mono `2e8f6cdc` 에서 롤백됐고, 디버그 결과는 mono `c9cc49df` 에 반영됨.
  (백업: 세션 스크래치패드 `discarded-subscription-work.patch`)

- **2026-08-24** — **역방향 이송.** mono `feat/ppwr-all`(`7895b829`) 의 `ppwr/front/` 를 여기 `main` 으로 가져왔다.
  - `d6172805`·`05165f21` 은 여기 `feat/product-management`(`b3747cb`·`91505d1`) 와 같은 작업이라
    패치 재적용 대신 그 브랜치를 머지했다(트리 동일함을 확인). 충돌 2건(`Sidebar.tsx`,
    `src/shared/api.ts`)은 mono `ed0990ca` 의 해소본을 정본으로 썼다.
  - `ed0990ca` 는 여기 `3af8a94` 가 mono 로 간 것이라 되가져올 것이 없다.
  - 새로 온 것: `5e4e7d83`(AI 어시스턴트 패널 + `/api/chat`), `746273e5`(SKU·제품 상세·진단 위저드), `39071559`(진단 관리 메인·문서 관리), `7895b829`(삭제 확인 모달 문구).
  - **`e48f4e2b`(제품 관리 리스트 필터 5종)은 가져오지 않았다** — mono 머지 `14ba7d81` 이
    첫 부모 `61591591` 대비 `ppwr/` 를 **한 줄도 바꾸지 않는다**. `feat/ppwr-products` 가
    리디자인 이전 지점(`3d538e15`)에서 갈라져 나와 머지가 통째로 ppwr-all 쪽으로 해소된 탓이다.
    여기에 억지로 적용하면 제품 목록이 리디자인 이전으로 되돌아간다. **mono 쪽에서 유실 여부를
    사람이 판단할 사안**이다.
  - 검증: `front/` 트리가 mono `7895b829:ppwr/front` 와 일치(예외 4개 제외 — 위 표 참고). `tsc --noEmit` 통과.

- **2026-08-24 (2차, 검증만)** — 이송할 것 없음. mono 정본 라인 `feat/ppwr-all` 이
  `7895b829` 에서 움직이지 않았고(`origin/feat/ppwr-all` 도 동일), 여기 `main`(`4673e9e`,
  tag `mono-sync`)의 `front/` 는 `7895b829:ppwr/front` 와 **파일 단위 blob hash 까지 일치**한다
  (182 vs 183 파일, 차이는 상시 예외 4개뿐 — `next.config.ts`·`.claude/launch.json`·
  `pnpm-lock.yaml`·`.env.local.example`). 워크트리 6개 전부 clean.
  - `tsc --noEmit`: 소스 에러 0. 유일한 에러는 추적되지 않는(`front/.gitignore:9`) 스테일
    빌드 산출물 `.next/types/validator.ts` 가 삭제된 라우트 `app/products/new/agency` 를
    참조하는 것 — `rm -rf front/.next` 로 사라진다.
  - 이번에 새로 확인: 위 **"mono 에만 있는, 가져오지 않은 작업"** 절. `e48f4e2b` 와 같은 종류의
    판단 대기 항목이 3건 더 있다(`facbb8f3`·`b207508a`·`a6d0ba68`).

- **2026-08-24 (3차, 검증만)** — 이송할 것 없음. mono 정본 라인 `feat/ppwr-all` 이
  `7895b829` → `89d151df` 로 **2 커밋 전진했지만 `ppwr/` 를 한 줄도 바꾸지 않는다**
  (`git diff --stat 7895b829 89d151df -- ppwr/` 가 비어 있음). 두 커밋 모두
  `supabase/migrations/**` 전용이고, 이 repo 는 SQL 을 추적하지 않는다(경로 매핑은
  `front/` 하나뿐) — 그래서 이송 대상이 아니다. SYNC POINT 만 `89d151df` 로 옮긴다.
  - `2788e171` — `ComponentMaster`·`Product` 에 `attributes` JSONB + GIN 인덱스.
    시안 입력값이 `material_summary`·`memo` TEXT 에 JSON 으로 직렬화돼 있던 부채를 푸는 것.
    원본 TEXT 컬럼은 비우지 않았다(롤백 여지).
  - `89d151df` — `AssessmentResult.estimated_completion_at` TIMESTAMPTZ + 부분 인덱스.
    '진행 중' 카드가 `assessed_at`(진단 *시작* 시각)을 '예상 완료' 자리에 넣고 있던 것을
    받아 줄 컬럼. 백필 없음.
  - **프론트는 아직 두 컬럼 중 어느 것도 쓰지 않는다** — 여기도 mono 도 `grep` 결과 0건이고,
    `front/src/types/database.types.ts`(마지막 갱신 `9a6db9f`)에 두 컬럼이 **없다**.
    양쪽 트리가 같은 스테일 상태라 드리프트가 아니라 **mono 쪽 후속 작업**이다.
    프론트가 이 컬럼들로 넘어갈 때 타입 재생성이 선행돼야 한다.
  - 검증: `front/` 가 `89d151df:ppwr/front` 와 **blob hash 까지 일치**(182 vs 183 파일,
    차이는 상시 예외 4개뿐 — `next.config.ts`·`.claude/launch.json`·`pnpm-lock.yaml`·
    `.env.local.example`). mono 워크트리 6개 전부 clean. `feat/ppwr-front-sync`·
    `feat/ppwr-sku`·`feat/ppwr-chat`·`feat/ppwr-diagnosis`·`feat/ppwr-products` 는
    모두 `feat/ppwr-all` 에 머지 완료(0 ahead).
  - `tsc --noEmit`: **에러 0**. 지난 회차의 스테일 `.next/types/validator.ts` 에러는
    `rm -rf front/.next` 로 해소했다(추적되지 않는 빌드 산출물).
  - **판단 대기 항목은 그대로 4건** — `e48f4e2b`(제품 필터 5종) + `facbb8f3`·`b207508a`·
    `a6d0ba68`. 위 "mono 에만 있는, 가져오지 않은 작업" 절 참고. 이번에도 손대지 않았다.
