import type { AuthResponse, DivinationRecord, User } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('后端服务不可达，请确认 3001 端口服务已启动。');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export function register(payload: { username: string; password: string; displayName: string }) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: { username: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me(token: string) {
  return request<{ user: User }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchUserHistory(token: string) {
  return request<{ records: DivinationRecord[] }>('/divinations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function saveUserRecord(token: string, record: DivinationRecord) {
  return request<{ record: DivinationRecord }>('/divinations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ record }),
  });
}

export function getAiInterpretation(payload: {
  question: string;
  category: string;
  primaryHexagram: string;
  changedHexagram: string;
  judgment?: string;
  summary?: string;
  fortune?: string;
  changedJudgment?: string;
  changedSummary?: string;
  changedFortune?: string;
  movingLines: number[];
}) {
  return request<{ text: string }>('/ai/interpret', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function validateQuestion(payload: { question: string }) {
  return request<{ blocked: boolean; hitWord: string | null }>('/validate/question', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
