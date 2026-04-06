import { HEXAGRAMS_BY_NUMBER } from '../data/hexagrams';
import type { HexagramData } from '../types';

const KEY = 'xinyi_daily_hexagram_v1';

interface DailyState {
  date: string;
  number: number;
  queue: number[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function shuffledNumbers() {
  const arr = Array.from({ length: 64 }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTodayDailyHexagram(): HexagramData {
  const date = today();
  const raw = localStorage.getItem(KEY);
  let state: DailyState | null = raw ? (JSON.parse(raw) as DailyState) : null;

  if (!state || !Array.isArray(state.queue) || !state.queue.length) {
    const queue = shuffledNumbers();
    const number = queue.shift() || 1;
    state = { date, number, queue };
    localStorage.setItem(KEY, JSON.stringify(state));
    return HEXAGRAMS_BY_NUMBER[number - 1];
  }

  if (state.date !== date) {
    if (!state.queue.length) {
      state.queue = shuffledNumbers().filter((n) => n !== state.number);
    }
    state.number = state.queue.shift() || 1;
    state.date = date;
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  return HEXAGRAMS_BY_NUMBER[state.number - 1];
}
