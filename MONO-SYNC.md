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
| tag `mono-sync` | `14ba7d81` (`feat/ppwr-all`) | 2026-08-24 |

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

## 이력

- **2026-08-18** — 이 repo 의 `front/` 를 mono `e8d2f1bc` 의 `ppwr/front/` 로 맞춤(baseline 재설정).
  이때 폐기한 미커밋 작업: `review-sub-100` 정기결제 심사상품, `front/app/_debug-pay/`.
  둘 다 mono 에서 이미 시도 후 폐기된 것 — 정기결제는 KCP 정기결제 채널(MID) 미연동으로
  mono `2e8f6cdc` 에서 롤백됐고, 디버그 결과는 mono `c9cc49df` 에 반영됨.
  (백업: 세션 스크래치패드 `discarded-subscription-work.patch`)

- **2026-08-24** — **역방향 이송.** mono `feat/ppwr-all`(`14ba7d81`) 의 `ppwr/front/` 를 여기 `main` 으로 가져왔다.
  - `d6172805`·`05165f21` 은 여기 `feat/product-management`(`b3747cb`·`91505d1`) 와 같은 작업이라
    패치 재적용 대신 그 브랜치를 머지했다(트리 동일함을 확인). 충돌 2건(`Sidebar.tsx`,
    `src/shared/api.ts`)은 mono `ed0990ca` 의 해소본을 정본으로 썼다.
  - `ed0990ca` 는 여기 `3af8a94` 가 mono 로 간 것이라 되가져올 것이 없다.
  - 새로 온 것: `5e4e7d83`(AI 어시스턴트 패널 + `/api/chat`), `746273e5`(SKU·제품 상세·진단 위저드).
  - **`e48f4e2b`(제품 관리 리스트 필터 5종)은 가져오지 않았다** — mono 머지 `14ba7d81` 이
    첫 부모 `61591591` 대비 `ppwr/` 를 **한 줄도 바꾸지 않는다**. `feat/ppwr-products` 가
    리디자인 이전 지점(`3d538e15`)에서 갈라져 나와 머지가 통째로 ppwr-all 쪽으로 해소된 탓이다.
    여기에 억지로 적용하면 제품 목록이 리디자인 이전으로 되돌아간다. **mono 쪽에서 유실 여부를
    사람이 판단할 사안**이다.
  - 검증: `front/` 트리가 mono `14ba7d81:ppwr/front` 와 일치(예외 4개 제외 — 위 표 참고). `tsc --noEmit` 통과.
