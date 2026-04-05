import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { TopAppBar } from './components/layout/TopAppBar';
import { CastingScreen } from './components/screens/CastingScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { InputScreen } from './components/screens/InputScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { StartScreen } from './components/screens/StartScreen';
import {
  fetchUserHistory,
  getAiInterpretation,
  login,
  me,
  register,
  saveUserRecord,
} from './services/api';
import {
  buildRecord,
  canCastForCategory,
  hitSensitiveWord,
  markCategoryCast,
} from './services/divination';
import {
  clearGuestHistory,
  clearToken,
  getGuestHistory,
  getToken,
  saveGuestHistory,
  setToken,
} from './services/storage';
import type { Category, DivinationRecord, Screen, User } from './types';

const DEFAULT_CATEGORY: Category = '事业前程';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [warning, setWarning] = useState('');
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<DivinationRecord | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setHistory(getGuestHistory());
        return;
      }

      try {
        const [{ user: meUser }, { records }] = await Promise.all([me(storedToken), fetchUserHistory(storedToken)]);
        setUser(meUser);
        setTokenState(storedToken);
        setHistory(records);
      } catch {
        clearToken();
        setHistory(getGuestHistory());
      }
    };

    void boot();
  }, []);

  const latestRecord = useMemo(() => currentRecord ?? history[0] ?? null, [currentRecord, history]);

  const persistGuest = (records: DivinationRecord[]) => {
    setHistory(records);
    saveGuestHistory(records);
  };

  const syncGuestToUser = async (nextToken: string, userId: string) => {
    const guestRecords = getGuestHistory();
    for (const item of guestRecords) {
      await saveUserRecord(nextToken, { ...item, userId });
    }
    clearGuestHistory();
  };

  const loadUserHistory = async (nextToken: string) => {
    const { records } = await fetchUserHistory(nextToken);
    setHistory(records);
  };

  const handleGoToCasting = () => {
    const hitWord = hitSensitiveWord(question);
    if (hitWord) {
      setWarning(`此事项超出了民俗研究范围（命中词：${hitWord}）`);
      return;
    }

    const limit = canCastForCategory(category);
    if (!limit.allowed && limit.nextAt) {
      setWarning(`心诚则灵，建议先静心感悟今日这一卦。可在 ${new Date(limit.nextAt).toLocaleString('zh-CN')} 后再来。`);
      return;
    }

    setWarning('');
    setScreen('casting');
  };

  const finishCasting = async () => {
    markCategoryCast(category);

    const record = buildRecord({
      category,
      question,
      userId: user?.id,
    });

    setCurrentRecord(record);
    setQuestion('');

    if (token) {
      const { record: saved } = await saveUserRecord(token, record);
      setHistory((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      setCurrentRecord(saved);
    } else {
      const next = [record, ...history];
      persistGuest(next);
    }

    setScreen('result');
  };

  const handleConsultAi = async () => {
    if (!latestRecord || aiLoading) return;
    setAiLoading(true);

    try {
      const { text } = await getAiInterpretation({
        question: latestRecord.question,
        category: latestRecord.category,
        hexagram: latestRecord.primaryHexagram,
        movingLines: latestRecord.movingLines,
      });

      const updated: DivinationRecord = { ...latestRecord, aiText: text };
      setCurrentRecord(updated);
      setHistory((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

      if (token) {
        await saveUserRecord(token, updated);
      } else {
        const next = history.map((item) => (item.id === updated.id ? updated : item));
        persistGuest(next);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogin = async (payload: { username: string; password: string }) => {
    const response = await login(payload);
    setToken(response.token);
    setTokenState(response.token);
    setUser(response.user);
    await syncGuestToUser(response.token, response.user.id);
    await loadUserHistory(response.token);
  };

  const handleRegister = async (payload: { username: string; password: string; displayName: string }) => {
    const response = await register(payload);
    setToken(response.token);
    setTokenState(response.token);
    setUser(response.user);
    await syncGuestToUser(response.token, response.user.id);
    await loadUserHistory(response.token);
  };

  const handleLogout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setHistory(getGuestHistory());
    setCurrentRecord(null);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <TopAppBar />

      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          {screen === 'start' && <StartScreen onStart={() => setScreen('input')} />}

          {screen === 'input' && (
            <InputScreen
              category={category}
              question={question}
              onCategoryChange={setCategory}
              onQuestionChange={setQuestion}
              warning={warning}
              onNext={handleGoToCasting}
            />
          )}

          {screen === 'casting' && <CastingScreen onFinish={() => void finishCasting()} />}

          {screen === 'result' && latestRecord && (
            <ResultScreen
              record={latestRecord}
              loading={aiLoading}
              onConsultAi={() => void handleConsultAi()}
            />
          )}

          {screen === 'history' && <HistoryScreen history={history} />}

          {screen === 'profile' && (
            <ProfileScreen
              user={user}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNavBar currentScreen={screen} setScreen={setScreen} />

      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" type="fractalNoise" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
}
