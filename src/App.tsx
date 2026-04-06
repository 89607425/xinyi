import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { TopAppBar } from './components/layout/TopAppBar';
import { CastingScreen } from './components/screens/CastingScreen';
import { DailyHexagramScreen } from './components/screens/DailyHexagramScreen';
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
  validateQuestion,
} from './services/api';
import {
  buildRecord,
  canCastForCategory,
  markCategoryCast,
} from './services/divination';
import { getTodayDailyHexagram } from './services/daily';
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
  const [aiError, setAiError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dailyHexagram, setDailyHexagram] = useState(() => getTodayDailyHexagram());

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

  useEffect(() => {
    if (!localStorage.getItem('xinyi_disclaimer_accepted_v1')) {
      setShowDisclaimer(true);
    }
  }, []);

  const latestRecord = useMemo(() => currentRecord ?? history[0] ?? null, [currentRecord, history]);

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

  const handleGoToCasting = async () => {
    const limit = canCastForCategory(category);
    if (!limit.allowed && limit.nextAt) {
      setWarning(`心诚则灵，建议先静心感悟今日这一卦。可在 ${new Date(limit.nextAt).toLocaleString('zh-CN')} 后再来。`);
      return;
    }

    try {
      const result = await validateQuestion({ question });
      if (result.blocked) {
        setWarning(`此事项超出了民俗研究范围（命中词：${result.hitWord || '敏感词'}）`);
        return;
      }
    } catch {
      setWarning('敏感词校验暂不可用，请稍后重试。');
      return;
    }

    setWarning('');
    setScreen('casting');
  };

  const finishCasting = async (lines: number[]) => {
    markCategoryCast(category);

    const record = buildRecord({
      category,
      question,
      userId: user?.id,
      lines,
    });

    setCurrentRecord(record);
    setQuestion('');
    setAiError('');

    if (token) {
      const { record: saved } = await saveUserRecord(token, record);
      setHistory((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      setCurrentRecord(saved);
    } else {
      setHistory((prev) => {
        const next = [record, ...prev.filter((item) => item.id !== record.id)];
        saveGuestHistory(next);
        return next;
      });
    }

    setScreen('result');
  };

  const handleConsultAi = async () => {
    if (!latestRecord || aiLoading) return;
    setAiError('');
    setAiLoading(true);

    try {
      const { text } = await getAiInterpretation({
        question: latestRecord.question,
        category: latestRecord.category,
        primaryHexagram: latestRecord.primaryHexagram,
        changedHexagram: latestRecord.changedHexagram,
        judgment: latestRecord.judgment,
        summary: latestRecord.summary,
        fortune: latestRecord.fortune,
        changedJudgment: latestRecord.changedJudgment,
        changedSummary: latestRecord.changedSummary,
        changedFortune: latestRecord.changedFortune,
        movingLines: latestRecord.movingLines,
      });

      const updated: DivinationRecord = { ...latestRecord, aiText: text };
      setCurrentRecord(updated);
      setHistory((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

      if (token) {
        await saveUserRecord(token, updated);
      } else {
        setHistory((prev) => {
          const next = prev.map((item) => (item.id === updated.id ? updated : item));
          saveGuestHistory(next);
          return next;
        });
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI 解读失败，请稍后再试。');
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

  const handleBackToStartAndClearResult = () => {
    setCurrentRecord(null);
    setAiError('');
    setScreen('start');
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <TopAppBar />

      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          {screen === 'start' && (
            <StartScreen
              onStart={() => setScreen('input')}
              onResumeResult={currentRecord ? () => setScreen('result') : undefined}
              onOpenDaily={() => {
                setDailyHexagram(getTodayDailyHexagram());
                setScreen('daily');
              }}
            />
          )}

          {screen === 'input' && (
            <InputScreen
              category={category}
              question={question}
              onCategoryChange={setCategory}
              onQuestionChange={setQuestion}
              warning={warning}
              onNext={() => void handleGoToCasting()}
            />
          )}

          {screen === 'casting' && <CastingScreen onFinish={(lines) => void finishCasting(lines)} />}

          {screen === 'result' && latestRecord && (
            <ResultScreen
              record={latestRecord}
              loading={aiLoading}
              error={aiError}
              onConsultAi={() => void handleConsultAi()}
              onBackToStart={handleBackToStartAndClearResult}
            />
          )}

          {screen === 'history' && (
            <HistoryScreen
              history={history}
              onSelect={(record) => {
                setCurrentRecord(record);
                setAiError('');
                setScreen('result');
              }}
            />
          )}

          {screen === 'profile' && (
            <ProfileScreen
              user={user}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
            />
          )}

          {screen === 'daily' && (
            <DailyHexagramScreen
              hexagram={dailyHexagram}
              onBack={() => setScreen('start')}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNavBar currentScreen={screen} setScreen={setScreen} />

      {showDisclaimer && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#fcf9f2] border border-[#171817]/15 p-6">
            <h3 className="text-xl font-bold mb-3">使用说明</h3>
            <p className="text-[#171817]/75 leading-relaxed text-sm">
              本工具仅供民俗文化研究与心理自我觉察参考，不构成任何现实决策建议，也不提供确定性预测结论。
            </p>
            <div className="mt-6 text-right">
              <button
                className="px-5 py-2 bg-[#171817] text-white hover:bg-secondary transition-colors"
                onClick={() => {
                  localStorage.setItem('xinyi_disclaimer_accepted_v1', '1');
                  setShowDisclaimer(false);
                }}
              >
                我已知晓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
