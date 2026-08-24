"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPpwrEvidenceService } from "@/src/shared/api";
import type { EvidenceEntity } from "@/src/lib/ppwr-evidence-service";
import {
  docCompletion,
  docStateFrom,
  type DocState,
} from "@/src/lib/ppwr-component-attrs";
import type { SpecDoc } from "@/src/lib/ppwr-component-spec";
import type { DocEntry, DocFile } from "@/components/common/DocChecklist";

/**
 * 대상(부품/제품)의 첨부 문서·사진 상태.
 *
 * 등록 화면에서는 대상 row 가 아직 없어서 곧바로 업로드할 수 없다. 그래서 두 가지 모드를 갖는다:
 *   entityId 있음 → 고르는 즉시 Storage 업로드
 *   entityId 없음 → 메모리에 들고 있다가, 저장 성공 후 flushPending(newId) 에서 한 번에 업로드
 */
export function useEntityDocs(entity: EvidenceEntity, entityId: number | null, docs: SpecDoc[]) {
  const qc = useQueryClient();
  const svc = getPpwrEvidenceService();
  const [pending, setPending] = useState<{ key: string; docName: string; file: File }[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const { data: uploaded = [] } = useQuery({
    queryKey: ["ppwr", "entity-docs", entity, entityId],
    queryFn: () => svc.listFor(entity, entityId as number),
    enabled: entityId != null,
  });

  const entries = useMemo<DocEntry[]>(() => {
    return docs.map((doc) => {
      const rows = uploaded.filter((r) => r.document_type === doc.name);
      const waiting = pending.filter((p) => p.docName === doc.name);
      const files: DocFile[] = [
        ...rows.map((r) => ({
          key: `row-${r.id}`,
          name: r.file_name ?? "파일",
          size: 0,
          storagePath: r.file_url,
        })),
        ...waiting.map((p) => ({ key: p.key, name: p.file.name, size: p.file.size })),
      ];
      // 아직 안 올라간 파일도 "검토 대기"로 보이게 상태 계산에 넣는다
      const statuses = [...rows.map((r) => r.status), ...waiting.map(() => "in_review")];
      return { doc, state: docStateFrom(statuses) as DocState, files };
    });
  }, [docs, uploaded, pending]);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["ppwr", "entity-docs", entity, entityId] });
    qc.invalidateQueries({ queryKey: ["ppwr", "component-library"] });
  }, [qc, entity, entityId]);

  const pick = useCallback(
    async (docName: string, files: File[]) => {
      setError(null);
      if (entityId == null) {
        setPending((prev) => [
          ...prev,
          ...files.map((file) => ({ key: `pending-${seq.current++}`, docName, file })),
        ]);
        return;
      }
      setBusyKey(docName);
      try {
        for (const file of files) await svc.upload(entity, entityId, docName, file);
        invalidate();
      } catch (e) {
        setError(e instanceof Error ? e.message : "파일 업로드에 실패했습니다.");
      } finally {
        setBusyKey(null);
      }
    },
    [entity, entityId, svc, invalidate],
  );

  const remove = useCallback(
    async (docName: string, file: DocFile) => {
      setError(null);
      if (file.key.startsWith("pending-")) {
        setPending((prev) => prev.filter((p) => p.key !== file.key));
        return;
      }
      const id = Number(file.key.replace("row-", ""));
      setBusyKey(docName);
      try {
        await svc.remove({ id, file_url: file.storagePath ?? null });
        invalidate();
      } catch (e) {
        setError(e instanceof Error ? e.message : "파일 삭제에 실패했습니다.");
      } finally {
        setBusyKey(null);
      }
    },
    [svc, invalidate],
  );

  const download = useCallback(
    async (file: DocFile) => {
      if (!file.storagePath) return;
      try {
        const url = await svc.signedUrl(file.storagePath);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        setError(e instanceof Error ? e.message : "다운로드에 실패했습니다.");
      }
    },
    [svc],
  );

  /** 등록 직후 호출 — 대기 중이던 파일을 새로 만들어진 대상에 붙인다 */
  const flushPending = useCallback(
    async (newEntityId: number) => {
      if (pending.length === 0) return;
      for (const p of pending) await svc.upload(entity, newEntityId, p.docName, p.file);
      setPending([]);
    },
    [entity, pending, svc],
  );

  const states = useMemo(
    () => entries.map((e) => ({ required: e.doc.required, state: e.state })),
    [entries],
  );

  return {
    entries,
    states,
    completion: docCompletion(states),
    pick,
    remove,
    download,
    flushPending,
    hasPending: pending.length > 0,
    busyKey,
    error,
    clearError: () => setError(null),
  };
}

/**
 * 대상 사진. 증빙과 달리 EvidenceDocument row 없이 Storage 경로만 속성(__photos)에 담는다.
 * paths 는 폼이 소유하고(저장 대상), 여기서는 업로드/삭제만 담당한다.
 */
export function useEntityPhotos(
  entity: EvidenceEntity,
  entityId: number | null,
  paths: string[],
  onPathsChange: (next: string[]) => void,
) {
  const svc = getPpwrEvidenceService();
  const [pending, setPending] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (files: File[]) => {
      setError(null);
      if (entityId == null) {
        setPending((prev) => [...prev, ...files]);
        return;
      }
      setBusy(true);
      try {
        const added: string[] = [];
        for (const f of files) added.push(await svc.uploadPhoto(entity, entityId, f));
        onPathsChange([...paths, ...added]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "사진 업로드에 실패했습니다.");
      } finally {
        setBusy(false);
      }
    },
    [entity, entityId, svc, paths, onPathsChange],
  );

  const removePath = useCallback(
    (path: string) => onPathsChange(paths.filter((p) => p !== path)),
    [paths, onPathsChange],
  );

  const removePending = useCallback(
    (index: number) => setPending((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  /** 등록 직후 대기 사진 업로드 → 저장할 경로 목록을 돌려준다 */
  const flushPending = useCallback(
    async (newEntityId: number): Promise<string[]> => {
      if (pending.length === 0) return paths;
      const added: string[] = [];
      for (const f of pending) added.push(await svc.uploadPhoto(entity, newEntityId, f));
      setPending([]);
      return [...paths, ...added];
    },
    [entity, pending, paths, svc],
  );

  return { pending, add, removePath, removePending, flushPending, busy, error };
}
