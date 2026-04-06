import { HEXAGRAMS_BY_BINARY } from '../data/hexagrams';
import type { CastResult, Category, DivinationRecord } from '../types';

function createRecordId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const lineToYinYang = (line: number): 0 | 1 => (line === 1 || line === 3 ? 1 : 0);
const lineToChanged = (line: number): 0 | 1 => {
  if (line === 2) return 1;
  if (line === 3) return 0;
  return lineToYinYang(line);
};

const toIndex = (lines: number[]): number => lines.reduce((acc, bit, idx) => acc | (bit << idx), 0);

function buildResult(lines: number[]): CastResult {
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

export function castLineByThreeCoins() {
  const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 2 : 3));
  const sum = coins.reduce((acc, n) => acc + n, 0);
  // 6=老阴(动阴), 7=少阳, 8=少阴, 9=老阳(动阳)
  const line = sum === 6 ? 2 : sum === 7 ? 1 : sum === 8 ? 0 : 3;
  return { coins, sum, line };
}

export function castHexagram(): CastResult {
  const lines = Array.from({ length: 6 }, () => castLineByThreeCoins().line);
  return buildResult(lines);
}

export function buildRecord(input: {
  category: Category;
  question: string;
  userId?: string;
  aiText?: string;
  lines?: number[];
}): DivinationRecord {
  const result = input.lines && input.lines.length === 6 ? buildResult(input.lines) : castHexagram();
  return {
    id: createRecordId(),
    userId: input.userId,
    category: input.category,
    question: input.question,
    primaryHexagram: result.primary.name,
    changedHexagram: result.changed.name,
    hexagramNumber: result.primary.number,
    changedHexagramNumber: result.changed.number,
    judgment: result.primary.judgment,
    summary: result.primary.summary,
    fortune: result.primary.fortune,
    changedJudgment: result.changed.judgment,
    changedSummary: result.changed.summary,
    changedFortune: result.changed.fortune,
    lines: result.lines,
    movingLines: result.movingLines,
    date: new Date().toISOString(),
    lunarDate: '待接入农历库',
    aiText: input.aiText,
  };
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
