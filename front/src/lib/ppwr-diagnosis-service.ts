import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';
import { PK, decodeProductAttrs, productAttrList } from '@/src/lib/ppwr-product-attrs';

type ProductRow = Database['ppwr']['Tables']['Product']['Row'];
type AssessmentRow = Database['ppwr']['Tables']['AssessmentResult']['Row'];
type ImprovementRow = Database['ppwr']['Tables']['ImprovementRequest']['Row'];
type ReportRow = Database['ppwr']['Tables']['Report']['Row'];
type EvidenceRow = Database['ppwr']['Tables']['EvidenceDocument']['Row'];
type ComponentInstanceRow = Database['ppwr']['Tables']['ComponentInstance']['Row'];
type PpwrTable = keyof Database['ppwr']['Tables'];

/**
 * 진단 상태. DB에 `Diagnosis` 테이블이 따로 없어서
 * Product / AssessmentResult / ImprovementRequest / Report 조합으로 파생시킨다.
 *
 *   draft            임시 저장  — 진단을 아직 돌리지 않음 (AssessmentResult 없음)
 *   in_progress      진행 중    — 진단은 시작됐지만 결과 확정 전
 *   needs_supplement 보완 필요  — 미해결 ImprovementRequest 존재
 *   confirmed        진단 확정  — 발행된 Report 존재
 */
export type DiagnosisStatus = 'draft' | 'in_progress' | 'needs_supplement' | 'confirmed';

/** 피드 한 줄의 심각도 — 칩 색상을 가른다 */
export type FeedSeverity = 'evidence_missing' | 'info_missing' | 'required' | 'recommended';

export type FeedEntry = {
  id: string;
  /** 좌측 라벨 (예: '필수 서류명', '부품 명', '필수 보완') */
  label: string;
  severity: FeedSeverity;
  message: string;
  /** 우측 보조 태그 (예: '2차 포장재', '재진단 필요') */
  tag?: string;
  at?: string | null;
  /** 해당 항목을 고치러 갈 링크 — 있으면 화살표 버튼이 뜬다 */
  href?: string;
};

export type ReportFeedEntry = {
  id: string;
  label: string;
  message: string;
  at: string | null;
  /** 사용자가 지울 수 있는 항목 (진단 결과 알림 등) */
  removable?: boolean;
};

export type DiagnosisItem = {
  productId: number;
  name: string;
  sku: string | null;
  category: string | null;
  /** 카드 썸네일용 첫 제품 사진의 스토리지 경로. 서명 URL 발급은 화면에서 한다. */
  photoKey: string | null;
  status: DiagnosisStatus;
  updatedAt: string;

  componentCount: number;
  documentCount: number;
  missingCount: number;

  /** 0–100. draft 는 작성률, in_progress 는 진단 진행률 */
  progress: number;
  /** in_progress 에서만 — 예상 완료일시 */
  estimatedCompletionAt: string | null;
  /** confirmed 에서만 — 확정일 */
  confirmedAt: string | null;
  /** confirmed 인데 이후 변경이 생겨 다시 돌려야 하는 경우 */
  needsRediagnosis: boolean;

  requiredSupplementCount: number;
  recommendedSupplementCount: number;

  productFeed: FeedEntry[];
  componentFeed: FeedEntry[];
  reportFeed: ReportFeedEntry[];

  /** 발행된 리포트 (확정 상태에서 '리포트 보기' 링크에 사용) */
  reportId: number | null;
};

export type DiagnosisSummary = {
  /** 총 진단 제품 */
  total: number;
  /** 종합 진행률 (0–100) */
  overallProgress: number;
};

export class PpwrDiagnosisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrDiagnosisError';
  }
}

/** 진단 시작 전 작성률 계산에 쓰는 Product 필수 필드 */
const DRAFT_REQUIRED_FIELDS: (keyof ProductRow)[] = [
  'name',
  'sku',
  'category',
  'customer_role',
  'manufacturing_country',
  'eu_launch_countries',
  'eu_annual_volume',
  'hs_code',
  'net_weight',
  'gross_weight',
];

const OPEN_IMPROVEMENT_STATUSES = new Set(['open', 'requested', 'in_progress', 'pending']);
const ISSUED_REPORT_STATUSES = new Set(['issued', 'published', 'completed', 'done']);
const MISSING_EVIDENCE_STATUSES = new Set(['missing', 'rejected', 'expired', 'pending']);

function isFilled(v: unknown): boolean {
  return v !== null && v !== undefined && v !== '';
}

/**
 * 진단 관리 화면 전용 조회 서비스.
 * RLS(owner 기준)가 걸려 있어 별도 필터 없이도 본인 데이터만 돌아온다.
 */
export class PpwrDiagnosisService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** 진단 관리 목록 — 제품 1건 = 카드 1장 */
  async list(): Promise<DiagnosisItem[]> {
    const products = await this.fetch<ProductRow>('Product');
    if (products.length === 0) return [];

    const ids = products.map((p) => p.id);
    const [assessments, improvements, reports, evidence, instances] = await Promise.all([
      this.fetch<AssessmentRow>('AssessmentResult', 'product_id', ids),
      this.fetch<ImprovementRow>('ImprovementRequest', 'product_id', ids),
      this.fetch<ReportRow>('Report', 'product_id', ids),
      this.fetch<EvidenceRow>('EvidenceDocument'),
      this.fetch<ComponentInstanceRow>('ComponentInstance', 'product_id', ids),
    ]);

    return products
      .map((p) =>
        this.buildItem(
          p,
          latestBy(assessments.filter((a) => a.product_id === p.id), 'assessed_at'),
          improvements.filter((i) => i.product_id === p.id),
          reports.filter((r) => r.product_id === p.id),
          evidence.filter(
            (e) => e.linked_entity_type === 'Product' && e.linked_entity_id === p.id,
          ),
          instances.filter((c) => c.product_id === p.id),
        ),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /**
   * 진단 시작 — AssessmentResult 를 만든다.
   * 이 row 가 생기는 순간 목록에서 해당 제품이 '진행 중' 으로 넘어간다.
   */
  async start(productId: number, customerRole?: string | null): Promise<number> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('AssessmentResult')
      .insert({ product_id: productId, customer_role: customerRole ?? null })
      .select('id')
      .single();
    if (error || !data) {
      throw new PpwrDiagnosisError(error?.message ?? '진단을 시작하지 못했습니다.');
    }
    return data.id;
  }

  /** 헤더 통계 — 총 진단 제품 / 종합 진행률 */
  summarize(items: DiagnosisItem[]): DiagnosisSummary {
    if (items.length === 0) return { total: 0, overallProgress: 0 };
    const sum = items.reduce((acc, i) => acc + i.progress, 0);
    return { total: items.length, overallProgress: Math.round(sum / items.length) };
  }

  /**
   * 진단 삭제.
   *
   * `Diagnosis` 테이블이 따로 없고 상태가 AssessmentResult / ImprovementRequest / Report
   * 조합으로 파생되므로, "진단을 지운다" = 그 세 종류의 행을 지운다는 뜻이다.
   * 시안 안내 문구대로 Product · ComponentInstance · EvidenceDocument 는 건드리지 않는다.
   *
   * ⚠️ ImprovementRequest 는 시안 문구에 명시돼 있지 않지만 진단 결과에서 파생된 것이라
   *    같이 지운다. 남겨두면 진단이 없는데 카드가 '보완 필요'로 남는다.
   */
  async remove(productId: number): Promise<void> {
    // Report → ImprovementRequest → AssessmentResult 순. 참조가 있다면 자식부터 지운다.
    for (const table of ['Report', 'ImprovementRequest', 'AssessmentResult'] as const) {
      await this.deleteByProduct(table, productId);
    }
  }

  private async deleteByProduct(table: PpwrTable, productId: number): Promise<void> {
    const q = this.supabase.schema('ppwr').from(table).delete() as unknown as {
      eq(c: string, v: number): PromiseLike<{ error: { message: string } | null }>;
    };
    const { error } = await q.eq('product_id', productId);
    if (error) throw new PpwrDiagnosisError(error.message);
  }

  private async fetch<T>(table: PpwrTable, column?: string, ids?: number[]): Promise<T[]> {
    // 스키마별 제네릭이 테이블마다 갈라져서 빌더 단계에서는 느슨하게 다루고,
    // 반환 타입만 호출부의 Row 타입으로 고정한다.
    let q = this.supabase.schema('ppwr').from(table).select('*') as unknown as {
      in(c: string, v: number[]): typeof q;
      then: PromiseLike<{ data: unknown; error: { message: string } | null }>['then'];
    };
    if (column && ids) q = q.in(column, ids);
    const { data, error } = await (q as unknown as Promise<{
      data: unknown;
      error: { message: string } | null;
    }>);
    if (error) throw new PpwrDiagnosisError(error.message);
    return (data ?? []) as T[];
  }

  private buildItem(
    product: ProductRow,
    assessment: AssessmentRow | null,
    improvements: ImprovementRow[],
    reports: ReportRow[],
    evidence: EvidenceRow[],
    instances: ComponentInstanceRow[],
  ): DiagnosisItem {
    const openImprovements = improvements.filter((i) =>
      OPEN_IMPROVEMENT_STATUSES.has(i.status),
    );
    const issuedReport = latestBy(
      reports.filter((r) => ISSUED_REPORT_STATUSES.has(r.status)),
      'issued_at',
    );

    const status: DiagnosisStatus = issuedReport
      ? 'confirmed'
      : openImprovements.length > 0
        ? 'needs_supplement'
        : assessment
          ? 'in_progress'
          : 'draft';

    // 확정 이후에 제품이 수정됐으면 재진단 대상
    const needsRediagnosis =
      status === 'confirmed' &&
      !!issuedReport?.issued_at &&
      product.updated_at > issuedReport.issued_at;

    const missingEvidence = evidence.filter((e) => MISSING_EVIDENCE_STATUSES.has(e.status));
    const missingCount = assessment?.missing_evidence_count ?? missingEvidence.length;

    // 보완 요청은 improvement_goal 로 필수/권장을 구분한다 (goal 미지정 = 필수)
    const required = openImprovements.filter((i) => i.improvement_goal !== 'recommended');
    const recommended = openImprovements.filter((i) => i.improvement_goal === 'recommended');

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku ?? product.identifier_no,
      category: product.category,
      photoKey:
        productAttrList(decodeProductAttrs(product.memo), PK.photos)[0] ?? null,
      status,
      updatedAt: product.updated_at,

      componentCount: instances.length,
      documentCount: evidence.length,
      missingCount,

      progress: computeProgress(status, product, assessment, openImprovements.length),
      estimatedCompletionAt: status === 'in_progress' ? assessment?.assessed_at ?? null : null,
      confirmedAt: status === 'confirmed' ? issuedReport?.issued_at ?? null : null,
      needsRediagnosis,

      requiredSupplementCount: required.length,
      recommendedSupplementCount: recommended.length,

      productFeed: buildProductFeed(status, product, missingEvidence, required, needsRediagnosis),
      componentFeed: buildComponentFeed(status, instances, required, needsRediagnosis),
      reportFeed: buildReportFeed(assessment, reports, required.length, recommended.length),

      reportId: issuedReport?.id ?? null,
    };
  }
}

/* ------------------------------------------------------------------ 파생 로직 */

function latestBy<T extends Record<string, unknown>>(rows: T[], key: keyof T): T | null {
  if (rows.length === 0) return null;
  return [...rows].sort((a, b) =>
    String(b[key] ?? '').localeCompare(String(a[key] ?? '')),
  )[0];
}

function computeProgress(
  status: DiagnosisStatus,
  product: ProductRow,
  assessment: AssessmentRow | null,
  openCount: number,
): number {
  if (status === 'confirmed') return 100;
  if (status === 'draft') {
    const filled = DRAFT_REQUIRED_FIELDS.filter((f) => isFilled(product[f])).length;
    return Math.round((filled / DRAFT_REQUIRED_FIELDS.length) * 100);
  }
  // readiness_score 가 있으면 그걸 쓰고, 없으면 미해결 보완 건수로 역산
  if (assessment?.readiness_score != null) {
    return Math.max(0, Math.min(100, Math.round(assessment.readiness_score)));
  }
  return Math.max(10, 100 - openCount * 15);
}

function buildProductFeed(
  status: DiagnosisStatus,
  product: ProductRow,
  missingEvidence: EvidenceRow[],
  required: ImprovementRow[],
  needsRediagnosis: boolean,
): FeedEntry[] {
  if (status === 'draft') {
    const entries: FeedEntry[] = [];
    for (const doc of missingEvidence) {
      entries.push({
        id: `evidence-${doc.id}`,
        label: doc.document_type ?? '필수 서류',
        severity: 'evidence_missing',
        message: `'${doc.document_type ?? '필수 서류'}'에 문서를 업로드해야 합니다.`,
        href: `/app/products/${product.id}`,
      });
    }
    for (const field of DRAFT_REQUIRED_FIELDS) {
      if (isFilled(product[field])) continue;
      entries.push({
        id: `field-${field}`,
        label: FIELD_LABELS[field] ?? String(field),
        severity: 'info_missing',
        message: `'${FIELD_LABELS[field] ?? String(field)}'에 정보를 입력해야 합니다.`,
        href: `/app/products/${product.id}`,
      });
    }
    return entries;
  }

  if (status === 'needs_supplement') {
    return required
      .filter((r) => r.component_instance_id == null)
      .map((r) => ({
        id: `improve-${r.id}`,
        label: '필수 보완',
        severity: 'required' as const,
        message: r.target_description ?? '제품 정보가 수정되어 재진단이 필요합니다.',
        tag: '재진단 필요',
        at: r.updated_at,
      }));
  }

  if (status === 'confirmed' && needsRediagnosis) {
    return [
      {
        id: 'rediagnosis-product',
        label: '필수 보완',
        severity: 'required',
        message: '제품 정보가 수정되어 재진단이 필요합니다.',
        tag: '재진단 필요',
        at: product.updated_at,
      },
    ];
  }

  return [];
}

function buildComponentFeed(
  status: DiagnosisStatus,
  instances: ComponentInstanceRow[],
  required: ImprovementRow[],
  needsRediagnosis: boolean,
): FeedEntry[] {
  if (status === 'draft') {
    return instances
      .filter((c) => c.total_weight == null || c.weight_per_unit == null)
      .map((c) => ({
        id: `instance-${c.id}`,
        label: c.role ?? '부품 명',
        severity: 'info_missing' as const,
        message: `'${c.role ?? '부품 명'}'에 정보를 입력해야 합니다.`,
        tag: packagingLevelLabel(c.packaging_level),
        href: `/app/components/${c.component_id}`,
      }));
  }

  if (status === 'needs_supplement') {
    return required
      .filter((r) => r.component_instance_id != null)
      .map((r) => ({
        id: `improve-c-${r.id}`,
        label: '필수 보완',
        severity: 'required' as const,
        message: r.target_description ?? '부품 정보가 수정되어 재진단이 필요합니다.',
        tag: '재진단 필요',
        at: r.updated_at,
      }));
  }

  if (status === 'confirmed' && needsRediagnosis) {
    return [
      {
        id: 'rediagnosis-component',
        label: '필수 보완',
        severity: 'required',
        message: '부품 정보가 수정되어 재진단이 필요합니다.',
        tag: '재진단 필요',
      },
    ];
  }

  return [];
}

function buildReportFeed(
  assessment: AssessmentRow | null,
  reports: ReportRow[],
  requiredCount: number,
  recommendedCount: number,
): ReportFeedEntry[] {
  const entries: ReportFeedEntry[] = [];

  for (const r of reports) {
    if (!ISSUED_REPORT_STATUSES.has(r.status)) continue;
    entries.push({
      id: `report-${r.id}`,
      label: '리포트 발행',
      message:
        r.report_type === 'summary'
          ? '간단 리포트 발행이 완료되었습니다. 이제 TD / DoC 리포트를 발행할 수 있습니다.'
          : `${r.report_type.toUpperCase()} 리포트 발행이 완료되었습니다.`,
      at: r.issued_at,
    });
  }

  if (assessment) {
    if (requiredCount > 0 || recommendedCount > 0) {
      entries.push({
        id: `assessment-result-${assessment.id}`,
        label: '진단 결과',
        message: `진단 결과, ${requiredCount}건의 필수 보완, ${recommendedCount}건의 권장 보완 사항이 발견되었습니다.`,
        at: assessment.assessed_at,
        removable: true,
      });
    }
    entries.push({
      id: `assessment-start-${assessment.id}`,
      label: '진단 시작',
      message: '진단이 시작되었습니다.',
      at: assessment.created_at,
    });
  }

  return entries.sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? '')));
}

function packagingLevelLabel(level: number | null): string | undefined {
  if (level == null) return undefined;
  return `${level}차 포장재`;
}

const FIELD_LABELS: Partial<Record<keyof ProductRow, string>> = {
  name: '제품명',
  sku: 'SKU',
  category: '제품 카테고리',
  customer_role: '고객 역할',
  manufacturing_country: '제조 국가',
  eu_launch_countries: 'EU 판매 국가',
  eu_annual_volume: 'EU 연간 물량',
  hs_code: 'HS 코드',
  net_weight: '내용물 중량',
  gross_weight: '총 중량',
};
