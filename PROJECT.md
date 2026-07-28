# PPWR 프로젝트 — 세션 인수인계 / 온보딩 컨텍스트

> 이 문서 하나로 프로젝트 전체를 이해하고 바로 이어서 작업할 수 있게 정리한 **단일 진입점**.
> 작업 목록은 [`TODO.md`](./TODO.md). 최종 갱신: 2026-07-24.
> **다음 세션의 즉시 과제 = §10 "Figma 디자인 리뷰" 참고.**

---

## 1. 한 줄 정의
**EU 포장폐기물 규정(PPWR, 2025/40)에 제품 포장이 적합한지 진단하고, 부족 증빙 보완·리포트 발행·수출 대행까지 연결하는 규제 대응 SaaS.**
- 운영: 규제 컨설팅사 **리베이션(Revation)**. 개발: **블라스트(Blast)**. 기존 **RESTUDIO**(친환경 포장·견적 SaaS)의 확장 제품.
- 타깃: EU 수출 국내 제조/브랜드사 (화장품·식품·생활소비재·전자 등). 역할: 제조사/수입자/공급사/유통사.
- BM: **DIY 셀프진단 30만원/제품** vs **전문가 매니지드 180만원~/프로젝트**. (진단→보완→수출대행 업셀 퍼널)

---

## 2. ⚡ 지금 상태 (가장 중요)

**브랜치: `feat/ppwr` (단일)** · 최신 커밋 `127d765e` · 리모트 push 안 됨(로컬만).
> 이전엔 `feat/ppwr-ui`(프론트)와 `feat/ppwr-schema`(백엔드 스키마)로 나뉘어 있었으나 **`feat/ppwr` 하나로 통합, 옛 브랜치 삭제.**

### ✅ 완료 (실제로 동작)
- **로컬 Supabase 개발환경** (Docker). 전체 RESTUDIO 마이그레이션 + PPWR 스키마 적용됨.
- **DB 스키마 12테이블** — 전용 `ppwr` 스키마, RLS 완비 (§5).
- **인증** — 기존 RESTUDIO `User`/auth 공유. 로그인/로그아웃, `/app` 미들웨어 보호. 로컬 검증 완료.
- **제품 관리 (슬라이스 1) — end-to-end 작동**: 등록·목록·상세. `ppwr.Product`에 실제 저장 확인.
- **앱 셸**: 사이드바 섹션(대시보드/제품관리=활성/나머지 "준비중").
- **UX**: 로그인 후 홈 유지 + "대시보드로 이동" 버튼.

### ⛔ 미구현 (스키마만 있고 기능 없음 / placeholder)
- 부품 관리(ComponentMaster), 진단, 리포트, 결제, 프로필 — "준비중" placeholder 페이지만.
- 제품 폼: **10개 핵심 컬럼만** (문서의 전체 ~20필드는 스키마 확장 필요, §7).
- 제품 **수정** 화면, Topbar 실유저명(현재 "리베이션 담당자" 하드코딩).
- 원격 RESTUDIO Supabase 연결 (지금은 로컬만).
- **UI 디자인 미확정** — Figma 시안 리뷰 대기 (§10).

---

## 3. 실행 방법 (로컬)

```bash
cd /Users/ycha/Desktop/blast/restudio-mono
supabase start                              # 로컬 Supabase (Docker 필요)
corepack pnpm --filter ppwr-front dev        # 프론트 → http://localhost:3002
```
- **접속**: http://localhost:3002 · 로그인 `tester@ppwr.local` / `test1234!`
- **DB Studio**: http://127.0.0.1:54323 (스키마 선택을 `public`→**`ppwr`** 로 바꿔야 테이블 보임)
- pnpm/node 엔진 불일치로 막히면 `pnpm` 대신 **`corepack pnpm`** 사용.
- 로컬 env(`ppwr/front/.env.local`, gitignore됨): `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`

### ⚠️ 로컬 Supabase 함정 (겪은 것들)
- **`ppwr` 스키마 노출 필수**: `config.toml`의 `[api] schemas = ["public","graphql_public","ppwr"]`. 없으면 supabase-js가 못 읽음.
- **컨테이너 env 캐시**: `config.toml`의 schemas를 바꿔도 `db reset`만으론 rest 컨테이너 env(`PGRST_DB_SCHEMAS`)가 안 바뀜 → **`supabase stop && supabase start`(컨테이너 재생성)** 필요.
- **닭-달걀**: config가 `ppwr` 노출을 요구하는데 볼륨엔 스키마가 없으면 `supabase start`가 503. → 볼륨 비우고 fresh start(`docker volume rm ... && supabase start`)하면 마이그레이션이 처음부터 적용돼 해결.
- **새 키 형식**: 로컬 키는 `sb_publishable_...`(anon) / `sb_secret_...`(service). supabase-js 2.53에서 정상 동작.
- **테스트 유저 생성**: GoTrue admin API(`POST /auth/v1/admin/users`, secret 키)로 auth 유저 만들고 `public."User"`에 `auth_id` 매핑 row insert (role='user').

---

## 4. 아키텍처 결정 (확정)
- **위치**: `restudio-mono` 모노레포. 신규 폴더 `ppwr/`.
- **backend = 기존 `supabase` 패키지 재사용** (별도 서버 X). Postgres + Auth + Storage + Edge Functions.
- **전용 `ppwr` 스키마로 격리** — `public`(RESTUDIO) 오염 0. 단, **auth/`User`/`Project` FK는 같은 DB라 그대로 공유.** (별도 DB 아님, 스키마 격리)
  - RLS 헬퍼 `ppwr.current_user_id()`가 `auth.uid()(uuid) → public."User".id(int)` 매핑.
- **frontend `ppwr/front`** (Next.js 15 + React 19). `@restudio/supabase` 워크스페이스 패키지 import.
- 서비스 레이어는 `supabase/src/services/`에 추가 (`.schema('ppwr').from('Product')`).

---

## 5. DB 스키마 (`ppwr` 네임스페이스, 12테이블)
> 마이그레이션: `supabase/migrations/20260720100001~100008_ppwr_*.sql`
> 핵심 원칙: **원천 데이터는 부품·소재 단위 저장, PPWR 판단은 제품·포장시스템 단위 집계.**

```
Product(제품/SKU) ─ owner_user_id FK→User, source(revation_supplied/customer_own), RLS: 본인+admin
  └ PackagingSet(포장구성 1·2·3차)
      └ ComponentInstance(제품 내 부품 사용: 수량·중량·역할) ─ ComponentMaster(부품 마스터, 재사용)
            └ Material(소재/레이어) ─ EvidenceDocument(증빙, 다형 연결)
Supplier(공급사) · AssessmentResult(진단결과) · Report · Notification · ImprovementRequest · ConsultationRequest
```
- **Master ↔ Instance 분리**: 같은 "PP캡"을 여러 제품이 재사용 (마스터=자재, 인스턴스=이 제품에서 어떻게 쓰나).
- 상태값: `TEXT + CHECK` (미확정 값 많아 ENUM 대신). "모름/확인필요/자료없음" 허용 → 리포트에서 누락자료 = 유료전환 근거.
- RLS: `authenticated`는 본인 소유(owner)만, 공용 라이브러리(owner NULL)는 읽기 공개, admin 전권. `service_role`은 bypass.
- `ppwr.Product` 실제 컬럼(현재): id, owner_user_id, source, name, sku, category, net_weight, manufacturing_country, eu_market_status, sales_channel, contact_sensitive, customer_role, created_at, updated_at. **← 문서 전체 필드 대비 축소판. 확장 필요.**

---

## 6. 코드 구조
```
ppwr/front/
├── app/
│   ├── page.tsx                      # 홈(랜딩, auth-aware CTA)
│   ├── layout.tsx  globals.css        # Chrome(조건부 헤더/푸터) + ReactQueryProvider
│   ├── auth/{login,signup,find-pw}/    # 인증 (login만 실동작, 나머지 UI)
│   └── app/                          # 로그인 후 워크스페이스 (사이드바 셸)
│       ├── page.tsx                   # 대시보드
│       ├── products/{page,new,[id]}   # 제품 목록·등록·상세 (실 DB)
│       └── {components,diagnosis,reports,billing,profile}/  # "준비중" placeholder
├── components/  Header Footer Chrome primitives  app/{Sidebar,Topbar,ComingSoon}  auth/fields
└── src/
    ├── shared/api.ts                  # getAuthService / getPpwrProductService / getSupabaseClient
    ├── shared/supabase/{client,server,middleware}.ts  # @supabase/ssr
    └── features/auth/{use-login,session}.ts
middleware.ts                          # /app 보호
supabase/src/services/ppwr-product/    # PpwrProductService (.schema('ppwr'))
```

---

## 7. 참조 문서 & 데이터 필드 스펙
| 자료 | 성격 |
|------|------|
| 프로토타입 `ppwr-report.neopress.app` | 초기 화면 시안 (목업) |
| Notion PackCheck `(서비스 구조 및 데이터 형식)` | 데이터 모델 7테이블 + 화면 A~E + 입력 UX (§5 근거). page 5 = 무료 준비도 진단 리포트 디자인 |
| Notion PRD `리베이션 2차 고도화` | 기능 요구·확정 답변 (로그인/프로필 RESTUDIO 연동 등) |
| **과업지시서** `리베이션_PPWR_과업지시서_1차` (xlsx) | 정식 SOW — 고객화면 ~30개, 어드민, 우선순위, 컨펌필요 |
| **단계별 수집 데이터** (pdf) | **제품/부품 확정 필드 목록** (필수여부·항목형태·객관식옵션). 제품 폼 확장 기준 |
| Coolset (coolset.com/ppwr) | 경쟁사 레퍼런스 — 부품 포트폴리오 마스터-디테일 + assessment 스냅샷(버전이력) |

**제품 필드(문서 기준, 스키마 확장 대상)**: 제품ID·제품명 국/영·모델/SKU·카테고리·제조국·HS Code·내용물형태·보관조건·Net/Gross 중량·치수·EU 출시형태(거래주체/채널/방식)·출시일·국가·수량·적용 EU법령·식품접촉·Contact-sensitive.
**부품(BOM) 필드**: 제조자·책임주체·포장재명·BOM ID·구성요소구분·재질코드·색상·투명도·치수·공급사·개당중량·다층/복합·금속포함·분리여부·PCR함량·식품접촉·포장용도.

---

## 8. 미결정 사항 (리베이션 컨펌 대기)
1. AI 진단 방식 (Rulebase / LLM / OCR 조합)  2. 문서 인식 OCR 여부  3. 필수/선택 자료 정의  4. 리포트 종류·템플릿  5. PG사·과금모델  6. 어드민 개선 범위  7. 제품 20필드 확정(카테고리 옵션·EU출시형태 3축·Contact-sensitive 기준 등 TOM 코멘트).

---

## 9. 다음 기능 순서 (권장)
1. **부품 라이브러리 (ComponentMaster)** — 슬라이스 1(제품)과 동일 패턴 복붙. (서비스 + `.schema('ppwr').from('ComponentMaster')` + 마스터-디테일 UI)
2. 제품 스키마 확장(문서 전체 필드) + 제품 수정 화면.
3. 포장 구조(PackagingSet) → ComponentInstance 연결.
4. 증빙(EvidenceDocument) 업로드(Storage) → 다형 연결.
5. 진단·리포트·결제·프로필 (미정 항목 확정 후).

---

## 10. 🎯 다음 세션 즉시 과제 — Figma 디자인 리뷰
사용자가 **Figma 시안을 뽑았고, 리뷰/피드백 + 그대로 UI 생성**을 원함.

- **Figma 링크**: `https://www.figma.com/design/lmkVHGl1BhM1pdLT8Z5VNM/고객-계정--PPWR-?node-id=2-2&m=dev`  (파일: "고객 계정 PPWR", 시작 노드 `2:2`)
- **접근 준비 (이전 세션에선 못 봄 — 비공개 파일)**:
  - `figma@claude-plugins-official` 플러그인 **설치 완료** (scope: user). 단 **세션 재시작해야 MCP 도구 로드됨.**
  - 재시작 후 **figma MCP OAuth 인증** 필요 (`/mcp` 또는 첫 사용 프롬프트). **Figma 데스크톱 앱에서 해당 파일을 열어두면** Dev Mode MCP 연동이 잘 됨.
  - 대안: 사용자가 스크린샷 붙여넣기, 또는 파일을 "Anyone with link can view"로 공개.
- **리뷰 관점 (이 문서 + 아래 기준으로)**:
  1. 우리 **데이터 모델·필드 스펙**(§5, §7)과 정합한가 (제품/부품/증빙 구조, Master-Instance, 상태값).
  2. **과업지시서 화면 목록**과 커버리지 (제품·부품·진단·리포트·결제·프로필·알림).
  3. 정보구조/플로우 (제품중심 입력 흐름: 제품→포장구조→부품→증빙→진단).
  4. **이미 만든 UI**(feat/ppwr의 `/app` 셸·제품 등록)와의 차이/통합 방향.
  5. Coolset식 마스터-디테일 + 스냅샷(버전) 개념 반영 여부.
- 리뷰 후: 확정 시안대로 `ppwr/front`에 컴포넌트/화면 생성 (기존 primitives·앱 셸 재사용).

---
_이 문서를 최신으로 유지할 것. 큰 결정/구조 변경 시 여기부터 갱신._
