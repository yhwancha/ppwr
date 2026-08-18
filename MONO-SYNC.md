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

## SYNC POINT

| 이 repo | = mono | 시점 |
|---|---|---|
| tag `mono-sync` | `e8d2f1bc` | 2026-08-18 |

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

같은 파일이지만 mono 값이 맞다. patch 로 되돌리지 말 것.

| 위치 | 이 repo | mono (정답) |
|---|---|---|
| `payments/config.ts` `hostingProvider` | Vercel Inc. | Microsoft Azure — Azure Container Apps 구동. 개인정보처리방침 수탁자 고지와 일치해야 함 |
| `payments/config.ts` `review-test-100` | "결제 테스트 (심사용 100원)" | "PPWR AI 진단 (1건)" — 상품명에 TEST 가 들어가면 카드사 심사가 진행되지 않음 |
| `payments/config.ts` `SUBSCRIPTION_ENABLED` | 없음 | `false` — 정기결제 롤백 플래그. 재개 절차가 주석에 있음 |

## 두 트리의 상시 차이

동기화해도 남는, 의도된 차이 2개. `to-mono.sh` 로 이송할 때 이 파일이 patch 에 끼면 손으로 판단한다.

| 파일 | 차이 |
|---|---|
| `next.config.ts` | mono 만 `basePath:"/ppwr"` + `output:"standalone"` + `outputFileTracingRoot`. 여기는 루트(`/`)로 서빙해야 로컬 개발이 편하므로 동기화에서 제외한다. `BASE_PATH` 는 `NEXT_PUBLIC_BASE_PATH ?? ""` 라 여기선 자동으로 `""` 가 되어 그대로 동작한다 |
| `pnpm-lock.yaml` | 여기만 있음. mono 는 루트 워크스페이스 lock 하나를 쓴다. 동기화에서 제외 |

## 이력

- **2026-08-18** — 이 repo 의 `front/` 를 mono `e8d2f1bc` 의 `ppwr/front/` 로 맞춤(baseline 재설정).
  이때 폐기한 미커밋 작업: `review-sub-100` 정기결제 심사상품, `front/app/_debug-pay/`.
  둘 다 mono 에서 이미 시도 후 폐기된 것 — 정기결제는 KCP 정기결제 채널(MID) 미연동으로
  mono `2e8f6cdc` 에서 롤백됐고, 디버그 결과는 mono `c9cc49df` 에 반영됨.
  (백업: 세션 스크래치패드 `discarded-subscription-work.patch`)
