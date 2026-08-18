import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

type EvidenceRow = Database['ppwr']['Tables']['EvidenceDocument']['Row'];

/**
 * 증빙 파일이 올라가는 Storage 버킷.
 *
 * ⚠️ 이 repo 에는 마이그레이션이 없다(restudio-mono 소유). 버킷과 정책은 mono 쪽에서 만들어야 한다:
 *   insert into storage.buckets (id, name, public) values ('ppwr-evidence','ppwr-evidence', false);
 *   -- 본인 소유 부품 경로만 read/write 하도록 storage.objects RLS 정책 추가
 * 버킷이 없으면 업로드 시 Supabase 가 "Bucket not found" 를 돌려주고,
 * 아래에서 사람이 읽을 수 있는 메시지로 바꿔서 던진다.
 */
export const EVIDENCE_BUCKET = 'ppwr-evidence';

/** 파일 1개당 제한 (시안: 최대 10개 / 개당 최대 100MB) */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_FILES_PER_DOC = 10;
export const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'doc', 'docx'];

export class PpwrEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PpwrEvidenceError';
  }
}

/** 업로드 경로에 쓸 수 있게 파일명을 정리 (한글/공백/특수문자 → 안전한 형태) */
function safeName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
  return ext ? `${base || 'file'}.${ext}` : base || 'file';
}

/**
 * 부품·제품에 붙는 증빙 문서(EvidenceDocument) + 실제 파일(Storage) 서비스.
 *
 * 문서 1건 = row 1개 = 파일 1개. 같은 document_type 으로 여러 개를 올릴 수 있고,
 * 체크리스트의 배지 상태는 그 종류의 row 들을 합쳐서 파생한다(ppwr-component-attrs 의 docStateFrom).
 * status 는 관리자 검수 결과라서 업로드 시엔 항상 'in_review' 로 들어간다.
 */
export class PpwrEvidenceService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async resolveOwnerUserId(): Promise<number> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new PpwrEvidenceError('로그인이 필요합니다.');
    const { data, error } = await this.supabase
      .from('User')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    if (error || !data) throw new PpwrEvidenceError('연결된 RESTUDIO 유저 정보를 찾을 수 없습니다.');
    return data.id;
  }

  /** 특정 부품에 붙은 증빙 문서 전부 */
  async listForComponent(componentId: number): Promise<EvidenceRow[]> {
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .select('*')
      .eq('linked_entity_type', 'component')
      .eq('linked_entity_id', componentId)
      .order('created_at', { ascending: true });
    if (error) throw new PpwrEvidenceError(error.message);
    return data ?? [];
  }

  /** 여러 부품의 증빙을 한 번에 (목록 화면에서 문서 수·누락 계산용) */
  async listForComponents(componentIds: number[]): Promise<Map<number, EvidenceRow[]>> {
    const out = new Map<number, EvidenceRow[]>();
    if (componentIds.length === 0) return out;
    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .select('*')
      .eq('linked_entity_type', 'component')
      .in('linked_entity_id', componentIds);
    if (error) throw new PpwrEvidenceError(error.message);
    for (const row of data ?? []) {
      const key = row.linked_entity_id;
      if (key == null) continue;
      const list = out.get(key);
      if (list) list.push(row);
      else out.set(key, [row]);
    }
    return out;
  }

  /** 파일 업로드 → Storage 저장 + EvidenceDocument row 생성 */
  async upload(componentId: number, documentType: string, file: File): Promise<EvidenceRow> {
    if (file.size > MAX_FILE_BYTES) {
      throw new PpwrEvidenceError('파일 1개당 최대 100MB까지 첨부할 수 있습니다.');
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_EXT.includes(ext)) {
      throw new PpwrEvidenceError(`지원하지 않는 형식입니다. (${ACCEPTED_EXT.join(', ')})`);
    }

    const owner_user_id = await this.resolveOwnerUserId();
    // 같은 이름을 여러 번 올려도 덮어쓰지 않도록 경로에 시각을 넣는다.
    const path = `component/${componentId}/${Date.now()}-${safeName(file.name)}`;

    const { error: upErr } = await this.supabase.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (upErr) {
      if (/bucket not found/i.test(upErr.message)) {
        throw new PpwrEvidenceError(
          `증빙 저장소(${EVIDENCE_BUCKET} 버킷)가 아직 없습니다. Supabase 에 버킷을 생성해야 첨부가 동작합니다.`,
        );
      }
      throw new PpwrEvidenceError(`파일 업로드에 실패했습니다. (${upErr.message})`);
    }

    const { data, error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .insert({
        owner_user_id,
        linked_entity_type: 'component',
        linked_entity_id: componentId,
        document_type: documentType,
        file_name: file.name,
        file_url: path,
        status: 'in_review',
        verified_by: 'customer',
      })
      .select()
      .single();

    if (error || !data) {
      // row 생성이 실패하면 방금 올린 파일이 고아로 남으므로 되돌린다.
      await this.supabase.storage.from(EVIDENCE_BUCKET).remove([path]);
      throw new PpwrEvidenceError(error?.message ?? '문서 정보 저장에 실패했습니다.');
    }
    return data;
  }

  /** 증빙 삭제 (Storage 파일 + row) */
  async remove(doc: Pick<EvidenceRow, 'id' | 'file_url'>): Promise<void> {
    if (doc.file_url) {
      await this.supabase.storage.from(EVIDENCE_BUCKET).remove([doc.file_url]);
    }
    const { error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .delete()
      .eq('id', doc.id);
    if (error) throw new PpwrEvidenceError(error.message);
  }

  /** 다운로드용 서명 URL (비공개 버킷이라 매번 발급) */
  async signedUrl(path: string, expiresInSec = 60): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(path, expiresInSec);
    if (error || !data) throw new PpwrEvidenceError('다운로드 링크를 만들지 못했습니다.');
    return data.signedUrl;
  }

  /** 여러 경로의 서명 URL 을 한 번에 (목록 썸네일용) */
  async signedUrls(paths: string[], expiresInSec = 600): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    if (paths.length === 0) return out;
    const { data, error } = await this.supabase.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrls(paths, expiresInSec);
    if (error || !data) return out; // 썸네일은 없어도 화면이 돌아가야 하므로 조용히 포기
    for (const item of data) {
      if (item.signedUrl && item.path) out.set(item.path, item.signedUrl);
    }
    return out;
  }

  /**
   * 부품 사진 업로드. 증빙과 달리 EvidenceDocument row 를 만들지 않고
   * 경로만 ComponentMaster 속성(__photos)에 배열로 보관한다.
   */
  async uploadPhoto(componentId: number, file: File): Promise<string> {
    if (file.size > MAX_FILE_BYTES) {
      throw new PpwrEvidenceError('파일 1개당 최대 100MB까지 첨부할 수 있습니다.');
    }
    const path = `component/${componentId}/photos/${Date.now()}-${safeName(file.name)}`;
    const { error } = await this.supabase.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      if (/bucket not found/i.test(error.message)) {
        throw new PpwrEvidenceError(
          `증빙 저장소(${EVIDENCE_BUCKET} 버킷)가 아직 없습니다. Supabase 에 버킷을 생성해야 첨부가 동작합니다.`,
        );
      }
      throw new PpwrEvidenceError(`사진 업로드에 실패했습니다. (${error.message})`);
    }
    return path;
  }

  /** 부품에 붙은 모든 증빙 파일 삭제 (부품 삭제 시 정리용) */
  async removeAllForComponent(componentId: number): Promise<void> {
    const docs = await this.listForComponent(componentId);
    const paths = docs.map((d) => d.file_url).filter((p): p is string => !!p);
    if (paths.length) await this.supabase.storage.from(EVIDENCE_BUCKET).remove(paths);
    const { error } = await this.supabase
      .schema('ppwr')
      .from('EvidenceDocument')
      .delete()
      .eq('linked_entity_type', 'component')
      .eq('linked_entity_id', componentId);
    if (error) throw new PpwrEvidenceError(error.message);
  }
}

export default PpwrEvidenceService;
export type { EvidenceRow };
