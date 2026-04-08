import type { AuthResponse, Category, DivinationRecord, User } from '../types';

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

export function register(payload: {
  username: string;
  password: string;
  displayName: string;
  phone: string;
  smsCode: string;
}) {
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

export function fetchUserCategoryLimit(token: string, category: Category) {
  const params = new URLSearchParams({ category });
  return request<{ allowed: boolean; nextAt: number }>(`/divinations/limit?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export function topupBalance(
  token: string,
  payload: { amountYuan: number; channel: 'wechat' | 'alipay' },
) {
  return request<{ user: User; transactionId: string; paid: boolean }>('/wallet/topup', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function sendRegisterSmsCode(payload: { phone: string }) {
  return request<{ sent: boolean; expiresInSec: number; phoneMasked: string; debugCode?: string }>('/auth/sms/send', {
    method: 'POST',
    body: JSON.stringify({ ...payload, purpose: 'register' }),
  });
}

export interface AdminUserSummary {
  id: string;
  username: string;
  displayName: string;
  phoneMasked: string | null;
  balanceCents: number;
  isBanned: boolean;
  createdAt: string;
  recordCount: number;
}

export interface AdminDivinationRecord {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: string;
  payload: DivinationRecord;
}

export function adminLogin(payload: { username: string; password: string }) {
  return request<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminGetUsers(token: string) {
  return request<{ users: AdminUserSummary[] }>('/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function adminSetUserBan(token: string, userId: string, banned: boolean) {
  return request<{ ok: true }>('/admin/users/ban', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, banned }),
  });
}

export function adminDeleteUser(token: string, userId: string) {
  return request<{ ok: true }>('/admin/users/delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
}

export function adminGetDivinations(token: string) {
  return request<{ records: AdminDivinationRecord[] }>('/admin/divinations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// WeChat QR login/register is temporarily disabled.
// export function startWechatQr(payload: { mode: 'login' | 'register' }) {
//   return request<{ mode: 'login' | 'register'; mock: boolean; url?: string; sessionId: string; qrText?: string; expiresAt: string }>(
//     '/auth/wechat/qr/start',
//     {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     },
//   );
// }
//
// export function confirmWechatQrMock(payload: { sessionId: string }) {
//   return request<AuthResponse>('/auth/wechat/qr/mock-confirm', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   });
// }
