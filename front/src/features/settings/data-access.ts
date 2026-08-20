"use client";

/**
 * 관리자 데이터 접근 권한(대행 서비스 동의) 스토어.
 *
 * 목업 단계라 localStorage 에 보관한다. (결제 store.ts 와 동일한 방침)
 * 실서비스에서는 회사 단위 설정이므로 Supabase `ppwr` 스키마의 회사 설정 컬럼으로 옮기고,
 * 리스튜디오 관리자 콘솔의 접근 제어와 함께 서버에서 판정해야 한다.
 */

const KEY = "ppwr.settings.adminDataAccess.v1";

export const DATA_ACCESS_EVENT = "ppwr:data-access-updated";

export function readAdminDataAccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function writeAdminDataAccess(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, String(enabled));
  } catch {
    // 프라이빗 모드 등 저장 실패 — UI 상태는 유지한다.
  }
  window.dispatchEvent(new Event(DATA_ACCESS_EVENT));
}
