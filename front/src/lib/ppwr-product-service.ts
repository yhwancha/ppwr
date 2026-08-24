import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

// PPWR 테이블은 전용 ppwr 스키마에 있음 (supabase.schema('ppwr').from('Product'))
type PpwrProductRow = Database['ppwr']['Tables']['Product']['Row'];
type PpwrProductInsert = Database['ppwr']['Tables']['Product']['Insert'];
type PpwrProductUpdate = Database['ppwr']['Tables']['Product']['Update'];

/** create 시 owner_user_id 는 서비스가 주입하므로 입력에서 제외 */
export type PpwrProductCreateInput = Omit<PpwrProductInsert, 'owner_user_id' | 'id' | 'created_at' | 'updated_at'>;
export type PpwrProductPatch = Omit<PpwrProductUpdate, 'owner_user_id' | 'id' | 'created_at' | 'updated_at'>;

/** 목록 카드에 필요한 집계까지 붙인 제품 */
export type PpwrProductWithAggregates = PpwrProductRow & {
  componentCount: number;
  docCount: number;
  reportIssued: boolean;
};

export class PpwrProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrProductError';
  }
}

/**
 * PPWR 제품(PpwrProduct) CRUD 서비스.
 * RLS(product_all)가 본인 소유만 허용하므로, 조회/수정/삭제는 자동으로 본인 것만 대상이 된다.
 * 생성 시에는 NOT NULL 인 owner_user_id 를 현재 로그인 유저의 public."User".id 로 주입한다.
 */
export class PpwrProductService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** auth.uid() → public."User".id 매핑 (RLS 헬퍼와 동일 규칙) */
  private async resolveOwnerUserId(): Promise<number> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new PpwrProductError('로그인이 필요합니다.');

    const { data, error } = await this.supabase
      .from('User')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (error || !data) {
      throw new PpwrProductError('연결된 RESTUDIO 유저 정보를 찾을 수 없습니다.');
    }
    return data.id;
  }

  /** 내 제품 목록 (RLS가 본인 것만 반환) */
  async list(): Promise<PpwrProductRow[]> {
    const { data, error } = await this.supabase
      .schema('ppwr').from('Product')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new PpwrProductError(error.message);
    return data ?? [];
  }

  /** 단일 제품 조회 */
  async get(id: number): Promise<PpwrProductRow> {
    const { data, error } = await this.supabase
      .schema('ppwr').from('Product')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new PpwrProductError(error?.message ?? '제품을 찾을 수 없습니다.');
    return data;
  }

  /** 제품 등록 (owner_user_id 자동 주입) */
  async create(input: PpwrProductCreateInput): Promise<PpwrProductRow> {
    const owner_user_id = await this.resolveOwnerUserId();
    const { data, error } = await this.supabase
      .schema('ppwr').from('Product')
      .insert({ ...input, owner_user_id })
      .select()
      .single();
    if (error || !data) throw new PpwrProductError(error?.message ?? '제품 등록에 실패했습니다.');
    return data;
  }

  /** 제품 수정 (본인 것만, RLS로 강제) */
  async update(id: number, patch: PpwrProductPatch): Promise<PpwrProductRow> {
    const { data, error } = await this.supabase
      .schema('ppwr').from('Product')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new PpwrProductError(error?.message ?? '제품 수정에 실패했습니다.');
    return data;
  }

  /** 제품 삭제 */
  async remove(id: number): Promise<void> {
    const { error } = await this.supabase.schema('ppwr').from('Product').delete().eq('id', id);
    if (error) throw new PpwrProductError(error.message);
  }

  /**
   * 목록 화면용 집계. 제품마다 쿼리를 날리지 않도록
   * 부품 사용(ComponentInstance)·증빙(EvidenceDocument)·리포트(Report)를 한 번에 모아 붙인다.
   */
  async listWithAggregates(): Promise<PpwrProductWithAggregates[]> {
    const products = await this.list();
    if (products.length === 0) return [];
    const ids = products.map((p) => p.id);

    const [instances, docs, reports] = await Promise.all([
      this.supabase.schema('ppwr').from('ComponentInstance').select('product_id').in('product_id', ids),
      this.supabase
        .schema('ppwr')
        .from('EvidenceDocument')
        .select('linked_entity_id')
        .eq('linked_entity_type', 'product')
        .in('linked_entity_id', ids),
      this.supabase.schema('ppwr').from('Report').select('product_id, status').in('product_id', ids),
    ]);

    const count = (rows: { [k: string]: unknown }[] | null, key: string) => {
      const m = new Map<number, number>();
      for (const r of rows ?? []) {
        const id = r[key] as number | null;
        if (id == null) continue;
        m.set(id, (m.get(id) ?? 0) + 1);
      }
      return m;
    };
    const componentCount = count(instances.data, 'product_id');
    const docCount = count(docs.data, 'linked_entity_id');
    const issued = new Set(
      (reports.data ?? []).filter((r) => r.status === 'issued').map((r) => r.product_id),
    );

    return products.map((p) => ({
      ...p,
      componentCount: componentCount.get(p.id) ?? 0,
      docCount: docCount.get(p.id) ?? 0,
      reportIssued: issued.has(p.id),
    }));
  }

  /**
   * 삭제 가능 여부.
   * 리포트가 이미 발행된 제품은 근거 자료가 남아야 하므로 지우지 못하게 막는다.
   */
  async checkRemovable(id: number): Promise<{ ok: boolean; reason?: string }> {
    const { count, error } = await this.supabase
      .schema('ppwr')
      .from('Report')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id)
      .eq('status', 'issued');
    if (error) throw new PpwrProductError(error.message);
    if ((count ?? 0) > 0) {
      return { ok: false, reason: '리포트가 발행된 제품은 삭제할 수 없습니다.' };
    }
    return { ok: true };
  }

  /** CSV 일괄 등록 — 한 건이라도 실패하면 그 시점까지 만들어진 것을 되돌린다 */
  async createMany(inputs: PpwrProductCreateInput[]): Promise<PpwrProductRow[]> {
    const owner_user_id = await this.resolveOwnerUserId();
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('Product')
      .insert(inputs.map((i) => ({ ...i, owner_user_id })))
      .select();
    if (error || !data) {
      throw new PpwrProductError(error?.message ?? '제품 일괄 등록에 실패했습니다.');
    }
    return data;
  }
}


export default PpwrProductService;
export type { PpwrProductRow };
