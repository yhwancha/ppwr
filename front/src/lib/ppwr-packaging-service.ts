import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

type PackagingSetRow = Database['ppwr']['Tables']['PackagingSet']['Row'];
type PackagingSetUpdate = Database['ppwr']['Tables']['PackagingSet']['Update'];

/** 포장 구조 저장 시 클라이언트가 다루는 필드 (product_id/타임스탬프는 서비스가 관리) */
export type PackagingSetPatch = Pick<
  PackagingSetUpdate,
  | 'has_primary'
  | 'has_secondary'
  | 'has_tertiary'
  | 'total_packaging_weight'
  | 'packaging_to_product_ratio'
  | 'minimization_status'
  | 'recyclability_status'
>;

export class PpwrPackagingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrPackagingError';
  }
}

/**
 * 제품별 포장 구성(PpwrPackagingSet) 서비스.
 * 제품 1개 = 포장 구성 1개 (product_id UNIQUE). RLS가 제품 소유자만 허용한다.
 */
export class PpwrPackagingService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** 제품의 포장 구성 조회 (없으면 null) */
  async getByProduct(productId: number): Promise<PackagingSetRow | null> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('PackagingSet')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw new PpwrPackagingError(error.message);
    return data;
  }

  /** 포장 구성 생성 또는 갱신 (product_id UNIQUE 기준 upsert) */
  async save(productId: number, patch: PackagingSetPatch): Promise<PackagingSetRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('PackagingSet')
      .upsert({ product_id: productId, ...patch }, { onConflict: 'product_id' })
      .select()
      .single();
    if (error || !data) {
      throw new PpwrPackagingError(error?.message ?? '포장 구조 저장에 실패했습니다.');
    }
    return data;
  }
}

export default PpwrPackagingService;
export type { PackagingSetRow };
