import { HEXAGRAMS_BY_BINARY } from '../data/hexagrams';
import type { CastResult, Category, DivinationRecord } from '../types';

const LINE_POOL = [0, 1, 2, 3] as const;

const lineToYinYang = (line: number): 0 | 1 => (line === 1 || line === 3 ? 1 : 0);
const lineToChanged = (line: number): 0 | 1 => {
  if (line === 2) return 1;
  if (line === 3) return 0;
  return lineToYinYang(line);
};

const toIndex = (lines: number[]): number => lines.reduce((acc, bit, idx) => acc | (bit << idx), 0);

export function castHexagram(): CastResult {
  const lines = Array.from({ length: 6 }, () => LINE_POOL[Math.floor(Math.random() * LINE_POOL.length)]);
  const baseLines = lines.map(lineToYinYang);
  const changedLines = lines.map(lineToChanged);
  const movingLines = lines.flatMap((line, idx) => (line === 2 || line === 3 ? idx + 1 : []));

  const primary = HEXAGRAMS_BY_BINARY[toIndex(baseLines)];
  const changed = HEXAGRAMS_BY_BINARY[toIndex(changedLines)];

  return {
    lines,
    movingLines,
    primary,
    changed,
  };
}

export function buildRecord(input: {
  category: Category;
  question: string;
  userId?: string;
  aiText?: string;
}): DivinationRecord {
  const result = castHexagram();
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    category: input.category,
    question: input.question,
    primaryHexagram: result.primary.name,
    changedHexagram: result.changed.name,
    hexagramNumber: result.primary.number,
    changedHexagramNumber: result.changed.number,
    judgment: result.primary.judgment,
    fortune: result.primary.fortune,
    lines: result.lines,
    movingLines: result.movingLines,
    date: new Date().toISOString(),
    lunarDate: '待接入农历库',
    aiText: input.aiText,
  };
}

const SENSITIVE_WORDS = ['彩票', '开奖号码', '违法', '政治', '寿命'];

export function hitSensitiveWord(question: string): string | null {
  const word = SENSITIVE_WORDS.find((item) => question.includes(item));
  return word ?? null;
}

const LIMIT_KEY = 'xinyi_cast_limit_v1';
const DAY = 24 * 60 * 60 * 1000;

interface LimitState {
  [category: string]: number;
}

export function canCastForCategory(category: Category): { allowed: boolean; nextAt?: number } {
  const raw = localStorage.getItem(LIMIT_KEY);
  const state: LimitState = raw ? JSON.parse(raw) : {};
  const timestamp = state[category];
  if (!timestamp) {
    return { allowed: true };
  }
  const nextAt = timestamp + DAY;
  return {
    allowed: Date.now() >= nextAt,
    nextAt,
  };
}

export function markCategoryCast(category: Category) {
  const raw = localStorage.getItem(LIMIT_KEY);
  const state: LimitState = raw ? JSON.parse(raw) : {};
  state[category] = Date.now();
  localStorage.setItem(LIMIT_KEY, JSON.stringify(state));
}
