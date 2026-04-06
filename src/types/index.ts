export type Screen = 'start' | 'input' | 'casting' | 'result' | 'history' | 'profile' | 'daily';

export type Category = '学业功名' | '事业前程' | '情缘发展' | '财运经营' | '寻物杂项';

export interface User {
  id: string;
  username: string;
  displayName: string;
}

export interface HexagramData {
  number: number;
  name: string;
  judgment: string;
  fortune: '大吉' | '小吉' | '平' | '忧' | '大忧';
  summary: string;
  lines: number[];
}

export interface CastResult {
  lines: number[]; // 0=少阴, 1=少阳, 2=老阴, 3=老阳
  movingLines: number[]; // 1-6
  primary: HexagramData;
  changed: HexagramData;
}

export interface DivinationRecord {
  id: string;
  userId?: string;
  category: Category;
  question: string;
  primaryHexagram: string;
  changedHexagram: string;
  hexagramNumber: number;
  changedHexagramNumber: number;
  judgment: string;
  summary?: string;
  fortune: HexagramData['fortune'];
  changedJudgment?: string;
  changedSummary?: string;
  changedFortune?: HexagramData['fortune'];
  lines: number[];
  movingLines: number[];
  date: string;
  lunarDate: string;
  aiText?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
