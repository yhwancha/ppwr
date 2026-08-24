import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

type SupplierRow = Database['ppwr']['Tables']['Supplier']['Row'];

export class PpwrSupplierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrSupplierError';
  }
}

/**
 * 공급사(ppwr.Supplier) 조회·생성.
 *
 * 부품 등록 폼은 원래 공급사를 자유 텍스트로 attributes 에 넣었다. 20260908002000 이
 * 그 값을 Supplier 행으로 승격하고 ComponentMaster.supplier_id 를 백필했으므로,
 * 이제 폼은 "기존 공급사 선택 + 없으면 생성" 으로 동작한다.
 *
 * 소유자별로 분리된다 — 마이그레이션의 유니크 인덱스도 (owner_user_id, name) 기준이다.
 */
export class PpwrSupplierService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async resolveOwnerUserId(): Promise<number> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new PpwrSupplierError('로그인이 필요합니다.');
    const { data, error } = await this.supabase
      .from('User')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    if (error || !data) {
      throw new PpwrSupplierError('연결된 RESTUDIO 유저 정보를 찾을 수 없습니다.');
    }
    return data.id;
  }

  /** 내 공급사 목록 (RLS 가 본인 것만 반환) */
  async list(): Promise<SupplierRow[]> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('Supplier')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw new PpwrSupplierError(error.message);
    return data ?? [];
  }

  /**
   * 이름으로 찾고 없으면 만든다. 부품 저장 시 선택된 공급사명을 id 로 바꾸는 용도.
   * 빈 이름이면 null — 공급사 미입력을 뜻한다.
   */
  async ensureByName(name: string | null | undefined): Promise<number | null> {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return null;

    const ownerUserId = await this.resolveOwnerUserId();

    const { data: found, error: findErr } = await this.supabase
      .schema('ppwr')
      .from('Supplier')
      .select('id')
      .eq('name', trimmed)
      .eq('owner_user_id', ownerUserId)
      .maybeSingle();
    if (findErr) throw new PpwrSupplierError(findErr.message);
    if (found) return found.id;

    const { data: created, error: createErr } = await this.supabase
      .schema('ppwr')
      .from('Supplier')
      .insert({ name: trimmed, owner_user_id: ownerUserId })
      .select('id')
      .single();
    if (createErr) throw new PpwrSupplierError(createErr.message);
    return created.id;
  }
}

export default PpwrSupplierService;
export type { SupplierRow };
