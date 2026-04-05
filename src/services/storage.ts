import type { DivinationRecord } from '../types';

const HISTORY_KEY = 'xinyi_guest_history_v1';
const TOKEN_KEY = 'xinyi_auth_token_v1';

export function getGuestHistory(): DivinationRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as DivinationRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestHistory(records: DivinationRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

export function clearGuestHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
