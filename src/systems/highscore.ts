import { STORAGE_KEYS } from "../config";

const KEY = STORAGE_KEYS.highscore;

export function getHighscore(): number {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function setHighscoreIfHigher(score: number): boolean {
  if (!Number.isFinite(score) || score < 0) return false;
  try {
    const current = getHighscore();
    if (score > current) {
      window.localStorage.setItem(KEY, String(score));
      return true;
    }
  } catch {
    // localStorage 無効環境（プライベートブラウジング等）は黙って失敗
  }
  return false;
}
