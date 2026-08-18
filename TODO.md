# PPWR 서비스 구현 TODO

> EU 포장폐기물 규정(PPWR) AI 진단 서비스. 프로토타입 <https://ppwr-report.neopress.app/> 재현 + 리베이션 2차 고도화 PRD 반영.
> 상태 범례: `[x]` 완료 · `[~]` 부분(UI만/일부) · `[ ]` 미착수 · 🆕 = 사이트맵 점검으로 추가된 누락 항목

---

## Phase 0 — 프로젝트 셋업
- [x] `ppwr/front` Next.js 15 + React 19 앱 스캐폴딩
- [x] `pnpm-workspace.yaml`에 `ppwr/*` 등록
- [x] Tailwind v4 + 디자인 토큰(primary `#406060`, ink `#101020`, Noto Sans KR)
- [x] 라우팅 골격 + Header/Footer 공통 레이아웃
- [ ] `@restudio/ui` · `@restudio/supabase` 의존성 실제 연결 (현재 self-contained)
- [ ] React Query · Zustand 프로바이더 구성

## Phase 1 — 인증 / 유저 (RESTUDIO 연동)
- [x] 로그인 화면 (`/auth/login`) — 이메일·비번·Google·비번찾기 링크 — *UI (feat/ppwr-ui)*
- [x] 회원가입 화면 (`/auth/signup`) — 간소화 폼 — *UI (feat/ppwr-ui)*
- [x] 비밀번호 찾기 (`/auth/find-pw`) — *UI (feat/ppwr-ui)*
- [x] 헤더 "로그인" 진입점 + `/auth` 전용 레이아웃(마케팅 헤더/푸터 숨김) — *UI*
- [ ] 기존 RESTUDIO Auth·유저 테이블 **연동** (별도 계정 X) — *PRD 확정사항, backend*
- [ ] 실제 로그인/세션 처리 (supabase-ssr) · AuthGuard
- [ ] 1-1 → 1-2 단계 전환 시 로그인 강제
- [ ] 프로필 설정 화면 (RESTUDIO 프로필 연동)

## Phase 2 — DB 스키마 & 서비스 레이어 (supabase)
> 핵심 원칙: **원천 데이터=부품·소재 단위 저장, PPWR 판단=제품·포장시스템 단위 집계.** (PackCheck 문서 기준)
> ⚠️ Component **Master ↔ Instance 분리** 필수 (같은 부품을 여러 제품이 재사용).
- [ ] `ppwr_products` (제품/SKU: name, sku, category, net_weight, mfg_country, eu_market_status, sales_channel, contact_sensitive · 2종류: 리베이션공급/고객자체)
- [ ] `ppwr_packaging_sets` (제품별 포장 구성: total_weight, packaging_to_product_ratio, has_primary/secondary/tertiary, minimization_status, recyclability_status)
- [ ] `ppwr_component_masters` (부품 마스터/라이브러리: type, supplier, material_summary, recycled_content, pfas_status, heavy_metal_status, compostability_status)
- [ ] `ppwr_component_instances` (제품 내 부품 사용정보: product_id, packaging_level, component_id, quantity, weight_per_unit, removable, role) — **Master와 분리**
- [ ] `ppwr_materials` (소재/레이어: material_name, material_type, layer_type, recycled_content, coating, colorant)
- [ ] `ppwr_suppliers` (공급사: 자재·증빙 재사용 연결, 향후 자동연동)
- [ ] `ppwr_evidence_documents` (증빙: document_type, **linked_entity_type/id(다형: Component/Material/Product)**, issue_date, expiry_date, status, verified_by, file_url)
- [ ] `ppwr_assessment_results` (진단결과: readiness_score, missing_evidence_count, risk_component_count, minimization_status, recyclability_status, doc_td_status, next_action)
- [ ] `ppwr_reports` (준비도·요건진단·TD·DoC·바이어 리포트)
- [ ] `ppwr_payments` / `ppwr_subscriptions`
- [ ] 🆕 `ppwr_notifications` (알림 이벤트 저장)
- [ ] 🆕 `ppwr_improvement_requests` (포장 개선 요청 → RESTUDIO 프로젝트 연결)
- [ ] Storage 버킷 + RLS (본인/어드민만 접근, 재다운로드 가능)
- [ ] 서비스 레이어(`ppwr-product`, `ppwr-component`, `ppwr-evidence`, `ppwr-assessment`, `ppwr-report` …)
- [ ] `database.types.ts` 타입 자동생성 연동

## Phase 3 — 내 제품 관리 & 제품 중심 입력 흐름
> ⚠️ **제품 중심 흐름**: 소재 일괄 선입력 X. 제품먼저 → 포장구조 → 부품 → 증빙 → 제품질문 → 진단. (PackCheck 문서 A~E 화면)
> 🧩 로그인 후 앱을 **기능별 섹션(사이드바 탭)**으로 분리 — `/app` 셸 구축 완료(대시보드·제품·부품·진단·리포트·결제·프로필). 나머지는 "준비중" placeholder.
- [x] 제품 목록 (리베이션공급 / 고객자체 분류, 필터·검색) — *UI (`/app/products`)*
- [x] **A. 제품 등록 화면 (`/app/products/new`)** — 5섹션 폼(식별·EU시장·중량치수·규제여부·동의), 제품구분 토글, "확인 필요(모름)" 허용, 임시저장/저장 동작 — *UI 완료*
- [x] 반복 부자재 라이브러리 UI (마케팅 페이지 측)
- [ ] B. 포장 구조 설정 화면 (1·2·3차 단계 정의)
- [x] C. 부품 등록 화면 (`/app/components/new`) — 포장재 유형 선택 모달(16종) → 유형별 조건부 폼 — *Figma 시안 반영, end-to-end 저장*
- [ ] C-1. 제품 화면에서 기존 부품 불러오기 (재사용 선택 UI) — *ComponentManager 쪽 미개편*
- [x] D. 부품 상세 화면 (`/app/components/[id]`) — 기본정보·재질구조·유형전용·연결제품·첨부문서·등록정보 — *유효기간(발행일/만료일)은 미노출*
- [x] D-1. 부품 수정 화면 (`/app/components/[id]/edit`) — 진단 확정 제품 사용 시 경고 게이트 포함
- [x] D-2. 부품 목록 (`/app/components`) — 상태 탭·검색·4종 다중필터·선택 삭제(연결제품/문서 가드)
- [ ] E. 증빙 업로드 화면 (드래그앤드롭 → **연결 대상 선택**: 제품/부품/소재/공급사/"잘 모르겠음")
- [ ] 제품 단위 질문 **별도 섹션** (포장최소화·재활용성·리필구조·온라인포장)
- [ ] **"모름/확인필요/자료없음" 상태값 허용** (필수 강제 X → 누락자료=유료전환 근거)
- [ ] 제품 상세 페이지 (`/my-products/[id]`) — *다이어그램 노드, 미구현*
- [ ] 제품등록 대행 신청 페이지 — *현재 상담 버튼만*
- [ ] 리베이션 공급 제품 라이브러리 불러오기(실데이터)

## Phase 4 — 증빙자료 (Evidence Document)
- [x] 부품 단위 첨부문서 업로드 (Storage `ppwr-evidence` + `EvidenceDocument`) — 유형별 체크리스트·상태 배지 — *⚠️ 버킷 생성은 restudio-mono 마이그레이션 필요*
- [ ] 소재 단위 시험성적서 업로드
- [ ] 제품/포장시스템 단위 자료 (포장최소화·재활용성 종합·라벨링·EPR)
- [ ] **다형 연결**(linked_entity: 제품/부품/소재/공급사) + 매칭 현황 표시
- [ ] 유효기간(발행일·만료일·갱신필요) · verified_by(고객/관리자/공급사) 관리
- [ ] 업로드 파일 재다운로드 구조
- [ ] 부품 5~20+개 대량 입력 UX
- [ ] (향후) 공급사 자료요청 → 회신 자동 연결 — *"자동 연결 어려움" 검토 이슈*

## Phase 5 — 진단 워크스페이스 대시보드
- [x] 멀티 제품 진행현황 대시보드 (KPI·완료율) — *UI*
- [x] 제품별 진단 카드 (진행률·누락자료·산출물) — *UI*
- [x] 오늘 우선 액션 / 최근 진행 로그 — *UI*
- [ ] 실데이터 연동 · 필터/검색 동작

## Phase 6 — 사전 진단 (Quick Check, 비로그인 유입)
- [ ] 제품·포장 기본정보 최소 입력 폼 (6개+)
- [ ] PPWR Quick Check (대응 필요성·주요 검토항목 간이 진단)
- [ ] 간이 준비도 리포트 (화면, PDF 없어도 됨)
- [ ] 고객 역할 진단 (manufacturer / importer / supplier / distributor)

## Phase 7 — AI 진단 엔진 ⚠️ 방식 미정
- [ ] Readiness Score Engine (포장구조+증빙+공급사+제품항목 종합)
- [ ] Evidence Gap Finder (부족 증빙 자동 도출)
- [ ] Supplier Request Mapper (누락자료 → 공급사별·부품별 요청리스트)
- [ ] Buyer Response Check / DoC·TD Pre-check
- [ ] 요건별 진단 (물질제한·재활용성·재생원료·과대포장·라벨링)
- [ ] 리스크 등급 산정 (적합 / 보완필요 / 추가확인 / 고위험)
- [ ] 개선 제안 (소재변경·단일소재화·중량절감·라벨개선)
- [ ] Edge Function으로 Claude API 호출 (룰 + LLM)
- [ ] 진단 프로젝트 상세 페이지 (`/diagnostic-workspace/[id]` : AI 진단 · 액션플랜)
- [ ] ❓ 미정: OCR 방식 (OCR+Rulebase / OCR+LLM / LLM / Rulebase)
- [ ] ❓ 미정: 필수/선택 자료 정의

## Phase 8 — 리포트 발행
- [ ] PPWR 준비도 리포트
- [ ] 요건별 진단 리포트
- [ ] DoC / TD 문서 발행 (제품특징 기반 일부 자동기입)
- [ ] 바이어 제출용 요약 리포트
- [ ] PDF 출력 (@react-pdf/renderer · jspdf 재사용)
- [ ] ❓ 미정: 리포트 종류별 템플릿 (리베이션 예시 제공 대기)

## Phase 9 — 리소스 센터
- [x] 블로그형 콘텐츠 목록 (카테고리 필터) — *UI*
- [ ] 콘텐츠 상세 페이지 (`/resources/[id]`)
- [ ] 어드민 콘텐츠 작성/관리

## Phase 10 — 결제 ⚠️ PG 미정
- [x] 요금제 화면 (DIY 30만원/제품, 매니지드 180만원~) — *UI*
- [ ] 설정 · 결제 플랜/정보 화면 (결제내역 · 결제수단)
- [ ] ❓ 미정: PG사 선정
- [ ] PG 웹훅 처리 (Edge Function)

## Phase 11 — 어드민 확장 (기존 admin 앱)
- [ ] PPWR 관리 메뉴 (제품개발+PPWR 통합 핸들링)
- [ ] 리베이션 공급 제품·부자재 등록 (고객 라이브러리)
- [ ] 고객 대신 정보 기입 (유료 대행)
- [ ] 진단·리포트 검수/발행 관리
- [ ] 상담·문의 리드 관리

## Phase 12 — i18n (글로벌 타깃)
- [ ] 영/한 전환 (front 전체)
- [ ] ⚠️ 기존 admin 미번역 → 어드민 번역 범위 논의

## Phase 13 — 온보딩
- [ ] 제품 입력 가이드/툴팁
- [ ] ❓ 온보딩 챗봇 (항목별 기입 안내)

## Phase 14 — 랜딩 / 마케팅
- [x] PPWR 진단 서비스 홈 (규제 타임라인·리스크·CTA) — *UI*
- [x] 전문가 상담 예약 폼 — *UI*
- [x] EU 수출대행 서비스 소개 섹션 — *UI*

## Phase 15 — 기존 RESTUDIO 개선 (PRD 포함 별건)
- [ ] 견적 문의 3단계 → 간소화
- [ ] 회원가입 폼 간소화
- [ ] 어드민 상세 견적 발행 + 대기 프로젝트 연계 발송

---

## 🆕 Phase 16 — 포장 개선 요청 (사이트맵 누락 → 추가)
> PRD "Packaging Improvement Trigger". 진단에서 리스크로 판정된 부품/제품을 RESTUDIO 포장 개선 프로젝트로 연결.
- [x] 진단 프로젝트/제품에서 "포장 개선 요청" 진입점 (워크스페이스 accent CTA + 헤더 nav) — *UI*
- [x] 포장 개선 요청 페이지 (`/packaging-improvement`) — 리스크 부품 선택·개선 목표 입력 — *UI*
- [x] frontend **accent(보라) 컬러 + "신규 반영" 배지**로 구분 — *완료*
- [ ] RESTUDIO 포장 개선 브리프 생성 → 기존 견적/프로젝트 관리로 전달 *(backend)*
- [ ] 요청 상태 추적 (요청 → 접수 → 진행) *(backend)*

## 🆕 Phase 17 — 알림 (사이트맵 누락 → 추가)
> 보완 요청·리포트 발행·자료 미제출 등 이벤트 알림. (다이어그램 점선 = 향후/부가 가능성)
- [x] 알림 센터 페이지 (`/notifications`) — *UI*
- [x] 알림 유형: 보완 요청 / 리포트 발행 / 자료 미제출 / 진단 상태 변경 / 포장 개선 요청 — *UI*
- [x] 헤더 벨 아이콘 + 미확인 뱃지 — *UI*
- [x] frontend **accent(보라) 컬러 + "신규 반영" 배지**로 구분 — *완료*
- [ ] 읽음/안읽음 처리 (동작) *(backend/state)*
- [ ] (향후) 이메일/Slack 알림 — *SPEC상 1차 out of scope*

## Phase 18 — Managed PPWR Desk (구독형 운영) *(PackCheck 문서 반영)*
> 진단 완료 후 반복 관리 상품. 데이터룸을 운영형으로 유지.
- [ ] 신규 SKU·자료 변경·담당자 변경 대응 (데이터룸 단위)
- [ ] 부품·증빙 라이브러리 지속 관리(재사용)
- [ ] 증빙 유효기간 만료 알림 (→ Phase 17 알림 연계)
- [ ] (향후) 공급사 DB · 시험기관 연계 · DPP 확장

---

## 착수 전 리베이션과 확정 필요
1. AI 진단 작동 방식 (룰베이스 vs LLM vs OCR 조합)
2. 문서 인식 기술 (OCR 사용 여부)
3. 필수/선택 자료 정의
4. 리포트 종류·템플릿 (예시 제공 대기)
5. PG사 선정
6. 어드민 영문 번역 범위
