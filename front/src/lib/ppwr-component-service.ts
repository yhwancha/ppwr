import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

type ComponentMasterRow = Database['ppwr']['Tables']['ComponentMaster']['Row'];
type ComponentMasterInsert = Database['ppwr']['Tables']['ComponentMaster']['Insert'];
type ComponentMasterUpdate = Database['ppwr']['Tables']['ComponentMaster']['Update'];
type ComponentInstanceRow = Database['ppwr']['Tables']['ComponentInstance']['Row'];
type ComponentInstanceInsert = Database['ppwr']['Tables']['ComponentInstance']['Insert'];
type ComponentInstanceUpdate = Database['ppwr']['Tables']['ComponentInstance']['Update'];
type MaterialRow = Database['ppwr']['Tables']['Material']['Row'];
type MaterialInsert = Database['ppwr']['Tables']['Material']['Insert'];

/** 부품이 어느 제품에 쓰이는지 보여줄 때 필요한 최소 제품 정보 */
export type ProductRef = {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  status: string;
};

/** 부품 마스터 + 이 부품을 쓰는 제품들 (부품 관리 목록·상세의 "연결 제품") */
export type ComponentMasterWithUsage = ComponentMasterRow & { products: ProductRef[] };

/** 제품 내 부품 사용정보 + 참조하는 부품 마스터를 함께 담은 뷰 */
export type ComponentInstanceWithMaster = ComponentInstanceRow & {
  master: ComponentMasterRow | null;
};

/** 신규 부품 마스터 생성 입력 (owner_user_id/id/타임스탬프 제외) */
export type ComponentMasterCreateInput = Omit<
  ComponentMasterInsert,
  'owner_user_id' | 'id' | 'created_at' | 'updated_at'
>;
export type ComponentMasterPatch = Omit<
  ComponentMasterUpdate,
  'owner_user_id' | 'id' | 'created_at' | 'updated_at'
>;

/** 제품에 부품을 붙일 때의 사용정보 (product_id/component_id 는 서비스가 채움) */
export type ComponentInstanceInput = Omit<
  ComponentInstanceInsert,
  'id' | 'product_id' | 'component_id' | 'total_weight' | 'created_at' | 'updated_at'
>;

export type MaterialCreateInput = Omit<
  MaterialInsert,
  'id' | 'component_id' | 'created_at' | 'updated_at'
>;

export class PpwrComponentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrComponentError';
  }
}

/**
 * 부품(ComponentMaster/Instance)·소재(Material) 서비스.
 *
 * ⚠️ 핵심 설계: Master(재사용 라이브러리) ↔ Instance(제품 내 사용) 분리.
 *   - Master  : "이 부품이 무엇인가" (소재·공급사·유해물질). 여러 제품이 재사용.
 *   - Instance: "이 제품에서 어떻게 쓰이나" (수량·중량·포장단계·역할).
 * RLS: 마스터는 본인 것 + 공용 라이브러리(owner NULL) 읽기, 인스턴스/소재는 부모 소유자.
 */
export class PpwrComponentService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** 현재 로그인 유저의 public."User".id (편집 권한 판별용). 미로그인 시 null */
  async currentUserId(): Promise<number | null> {
    try {
      return await this.resolveOwnerUserId();
    } catch {
      return null;
    }
  }

  private async resolveOwnerUserId(): Promise<number> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new PpwrComponentError('로그인이 필요합니다.');
    const { data, error } = await this.supabase
      .from('User')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    if (error || !data) throw new PpwrComponentError('연결된 RESTUDIO 유저 정보를 찾을 수 없습니다.');
    return data.id;
  }

  /* ---------- 유형별 필드 설정 (admin 관리) ---------- */

  /**
   * ppwr."ComponentTypeConfig" 조회. 원격에 테이블이 아직 없으면(마이그레이션 미적용)
   * 에러가 나므로 null 반환 → 호출부에서 하드코딩 spec 으로 폴백한다.
   * (database.types.ts 에 아직 없는 테이블이라 캐스팅으로 접근)
   */
  async listTypeConfigs(): Promise<
    | {
        type_key: string;
        emoji: string | null;
        label: string;
        fields: {
          key: string;
          label: string;
          input_type: "text" | "number" | "select" | "bool";
          options?: string[];
          unit?: string;
          hint?: string;
          axis?: "recy" | "pcr" | "soc" | "reu" | "min";
          required?: boolean;
        }[];
        sub_types: string[];
        materials: string[];
        docs: { name: string; requirement: "필수" | "조건부"; purpose?: string }[];
        sort_order: number;
        active: boolean;
      }[]
    | null
  > {
    try {
      const { data, error } = await (
        this.supabase as unknown as { schema: (s: string) => { from: (t: string) => any } }
      )
        .schema("ppwr")
        .from("ComponentTypeConfig")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) return null;
      // JSONB 컬럼 null 방어
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        fields: Array.isArray(r?.fields) ? r.fields : [],
        sub_types: Array.isArray(r?.sub_types) ? r.sub_types : [],
        materials: Array.isArray(r?.materials) ? r.materials : [],
        docs: Array.isArray(r?.docs) ? r.docs : [],
      })) as never;
    } catch {
      return null;
    }
  }

  /**
   * ppwr."MaterialGroup" 조회 (재질군 → 상세재질 전역 매핑). 테이블이 없으면 null.
   */
  async listMaterialGroups(): Promise<
    | { group_key: string; label: string; details: string[]; sort_order: number; active: boolean }[]
    | null
  > {
    try {
      const { data, error } = await (
        this.supabase as unknown as { schema: (s: string) => { from: (t: string) => any } }
      )
        .schema("ppwr")
        .from("MaterialGroup")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) return null;
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        details: Array.isArray(r?.details) ? r.details : [],
      })) as never;
    } catch {
      return null;
    }
  }

  /* ---------- 부품 마스터 (재사용 라이브러리) ---------- */

  /** 불러올 수 있는 부품 라이브러리 (본인 부품 + 리베이션 공용, RLS로 필터) */
  async listLibrary(): Promise<ComponentMasterRow[]> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new PpwrComponentError(error.message);
    return data ?? [];
  }

  /** 단일 부품 마스터 조회 */
  async getMaster(id: number): Promise<ComponentMasterRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '부품을 찾을 수 없습니다.');
    return data;
  }

  /** 신규 부품 마스터 생성 (owner_user_id 자동 주입 → 내 라이브러리에 재사용 가능) */
  async createMaster(input: ComponentMasterCreateInput): Promise<ComponentMasterRow> {
    const owner_user_id = await this.resolveOwnerUserId();
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .insert({ ...input, owner_user_id })
      .select()
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '부품 생성에 실패했습니다.');
    return data;
  }

  /** 부품 마스터 수정 (본인 것만, RLS로 강제. 공용 부품은 관리자만) */
  async updateMaster(id: number, patch: ComponentMasterPatch): Promise<ComponentMasterRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '부품 수정에 실패했습니다.');
    return data;
  }

  /** 부품 마스터 삭제 (사용 중이면 FK RESTRICT 로 차단됨) */
  async removeMaster(id: number): Promise<void> {
    const { error } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .delete()
      .eq('id', id);
    if (error) {
      if (/foreign key|violates/i.test(error.message)) {
        throw new PpwrComponentError('이 부품을 사용 중인 제품이 있어 삭제할 수 없습니다.');
      }
      throw new PpwrComponentError(error.message);
    }
  }

  /**
   * 부품 라이브러리 + 각 부품을 사용하는 제품 목록.
   * 목록 화면이 부품마다 쿼리를 날리지 않도록 인스턴스·제품을 한 번에 모아 붙인다.
   */
  async listLibraryWithUsage(): Promise<ComponentMasterWithUsage[]> {
    const masters = await this.listLibrary();
    if (masters.length === 0) return [];

    const { data: instances, error: iErr } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .select('component_id, product_id')
      .in(
        'component_id',
        masters.map((m) => m.id),
      );
    if (iErr) throw new PpwrComponentError(iErr.message);

    const productIds = [...new Set((instances ?? []).map((r) => r.product_id))];
    const productById = new Map<number, ProductRef>();
    if (productIds.length) {
      const { data: products, error: pErr } = await this.supabase
        .schema('ppwr')
        .from('Product')
        .select('id, name, sku, category, status')
        .in('id', productIds);
      if (pErr) throw new PpwrComponentError(pErr.message);
      for (const p of products ?? []) productById.set(p.id, p);
    }

    const byComponent = new Map<number, ProductRef[]>();
    for (const inst of instances ?? []) {
      const product = productById.get(inst.product_id);
      if (!product) continue; // RLS 로 안 보이는 제품은 건너뛴다
      const list = byComponent.get(inst.component_id);
      if (list) {
        if (!list.some((p) => p.id === product.id)) list.push(product);
      } else {
        byComponent.set(inst.component_id, [product]);
      }
    }
    return masters.map((m) => ({ ...m, products: byComponent.get(m.id) ?? [] }));
  }

  /** 이 부품을 사용하는 제품 (상세 화면의 "연결 제품") */
  async productsUsing(componentId: number): Promise<ProductRef[]> {
    const { data: instances, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .select('product_id')
      .eq('component_id', componentId);
    if (error) throw new PpwrComponentError(error.message);
    const ids = [...new Set((instances ?? []).map((r) => r.product_id))];
    if (ids.length === 0) return [];
    const { data, error: pErr } = await this.supabase
      .schema('ppwr')
      .from('Product')
      .select('id, name, sku, category, status')
      .in('id', ids);
    if (pErr) throw new PpwrComponentError(pErr.message);
    return data ?? [];
  }

  /**
   * 삭제 가능 여부. 시안 주석("연결된 제품이 없어야 / 부품과 관련된 첨부 문서가 없어야")대로
   * 둘 중 하나라도 남아 있으면 막고 이유를 돌려준다.
   */
  async checkRemovable(componentId: number): Promise<{ ok: boolean; reason?: string }> {
    const products = await this.productsUsing(componentId);
    if (products.length > 0) {
      return { ok: false, reason: `이 부품을 사용 중인 제품이 ${products.length}개 있어 삭제할 수 없습니다.` };
    }
    const { count, error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .select('id', { count: 'exact', head: true })
      .eq('linked_entity_type', 'component')
      .eq('linked_entity_id', componentId);
    if (error) throw new PpwrComponentError(error.message);
    if ((count ?? 0) > 0) {
      return { ok: false, reason: `이 부품에 첨부된 문서가 ${count}개 있어 삭제할 수 없습니다. 문서를 먼저 삭제하세요.` };
    }
    return { ok: true };
  }

  /* ---------- 제품 내 부품 사용 (인스턴스) ---------- */

  /** 제품의 부품 구성 목록 (참조 마스터 포함) */
  async listInstances(productId: number): Promise<ComponentInstanceWithMaster[]> {
    const { data: instances, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .select('*')
      .eq('product_id', productId)
      .order('packaging_level', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new PpwrComponentError(error.message);
    const rows = instances ?? [];
    if (rows.length === 0) return [];

    const masterIds = [...new Set(rows.map((r) => r.component_id))];
    const { data: masters, error: mErr } = await this.supabase
      .schema('ppwr')
      .from('ComponentMaster')
      .select('*')
      .in('id', masterIds);
    if (mErr) throw new PpwrComponentError(mErr.message);
    const byId = new Map((masters ?? []).map((m) => [m.id, m]));
    return rows.map((r) => ({ ...r, master: byId.get(r.component_id) ?? null }));
  }

  /** 기존 부품(마스터)을 제품에 사용 추가 */
  async addInstance(
    productId: number,
    componentId: number,
    usage: ComponentInstanceInput,
  ): Promise<ComponentInstanceRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .insert({ ...usage, product_id: productId, component_id: componentId })
      .select()
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '부품 추가에 실패했습니다.');
    return data;
  }

  /** 신규 부품 생성 + 제품에 바로 사용 추가 (한 번에) */
  async createAndAttach(
    productId: number,
    master: ComponentMasterCreateInput,
    usage: ComponentInstanceInput,
  ): Promise<ComponentInstanceRow> {
    const created = await this.createMaster(master);
    return this.addInstance(productId, created.id, usage);
  }

  /** 사용정보 수정 (수량·중량·포장단계·역할·분리여부) */
  async updateInstance(id: number, patch: ComponentInstanceUpdate): Promise<ComponentInstanceRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '부품 수정에 실패했습니다.');
    return data;
  }

  /** 제품에서 부품 사용 제거 (마스터는 라이브러리에 남음) */
  async removeInstance(id: number): Promise<void> {
    const { error } = await this.supabase
      .schema('ppwr')
      .from('ComponentInstance')
      .delete()
      .eq('id', id);
    if (error) throw new PpwrComponentError(error.message);
  }

  /* ---------- 소재/레이어 ---------- */

  async listMaterials(componentId: number): Promise<MaterialRow[]> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('Material')
      .select('*')
      .eq('component_id', componentId)
      .order('created_at', { ascending: true });
    if (error) throw new PpwrComponentError(error.message);
    return data ?? [];
  }

  async addMaterial(componentId: number, input: MaterialCreateInput): Promise<MaterialRow> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('Material')
      .insert({ ...input, component_id: componentId })
      .select()
      .single();
    if (error || !data) throw new PpwrComponentError(error?.message ?? '소재 추가에 실패했습니다.');
    return data;
  }

  async removeMaterial(id: number): Promise<void> {
    const { error } = await this.supabase.schema('ppwr').from('Material').delete().eq('id', id);
    if (error) throw new PpwrComponentError(error.message);
  }
}

export default PpwrComponentService;
export type { ComponentMasterRow, ComponentInstanceRow, MaterialRow };
