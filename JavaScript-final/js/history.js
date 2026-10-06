// ============================================================
//  history.js — 계산 기록 관리 (localStorage)
//  📝 과제: 💡 표시된 빈칸을 채워 기능을 완성하세요.
// ============================================================

const STORAGE_KEY = "calc_history";
const MAX_COUNT = 20;

// ── 과제 5: 기록 불러오기 ────────────────────────────────────
export const loadHistory = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (e) {
    // 저장된 값이 손상된 JSON이면 안전하게 빈 배열로 복구합니다.
    return [];
  }
};

// ── 과제 6: 기록 저장 ────────────────────────────────────────
export const saveHistory = (history) => {
  const trimmed = history.slice(0, MAX_COUNT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

// ── 과제 7: 기록 항목 추가 ───────────────────────────────────
export const addHistory = (expression, result) => {
  const history = loadHistory();
  const newItem = {
    expression,
    result,
    date: new Date().toLocaleString("ko-KR"),
  };

  // saveHistory 내부에서도 MAX_COUNT로 자르지만, 반환값(화면 렌더링용)도
  // 실제 저장된 개수와 같아야 배지 숫자(badge.textContent)가 어긋나지 않습니다.
  const updated = [newItem, ...history].slice(0, MAX_COUNT);
  saveHistory(updated);
  return updated;
};

// ── 도전 2: 기록 개별 삭제 (선택 과제) ──────────────────────
export const deleteHistoryItem = (index) => {
  const history = loadHistory();
  const updated = history.filter((_, i) => i !== index);
  saveHistory(updated);
  return updated;
};

// ── 기록 전체 삭제 (완성 코드 — 수정 금지) ──────────────────
export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
