import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Brush, 
  ChevronRight, 
  History as HistoryIcon, 
  User, 
  Home, 
  Sparkles,
  BookOpen,
  Heart,
  Coins,
  LayoutGrid,
  ArrowRight,
  Share2,
  BookMarked,
  Brain
} from 'lucide-react';

import { GoogleGenAI } from "@google/genai";

// --- AI Service ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function getAiInterpretation(question: string, hexagram: string, judgment: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一位精通周易的智者。用户问了这样一个问题：“${question}”。
      起得卦象为：“${hexagram}”，卦辞为：“${judgment}”。
      请结合卦象和问题，给出一段富有禅意、深刻且具有指导意义的解读。
      字数控制在150字以内，保持文雅、平和的口吻。`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Interpretation error:", error);
    return "天机不可泄露，请静心感悟卦象之理。";
  }
}

// --- Types ---
type Screen = 'start' | 'input' | 'casting' | 'result' | 'history' | 'profile';

interface DivinationRecord {
  id: string;
  category: string;
  question: string;
  hexagram: string;
  judgment: string;
  date: string;
  lunarDate: string;
}

// --- Components ---

const TopAppBar = ({ onMenuClick, onBrushClick }: { onMenuClick?: () => void, onBrushClick?: () => void }) => (
  <header className="fixed top-0 left-0 w-full z-50 bg-[#fcf9f2]/80 backdrop-blur-md flex justify-between items-center px-8 py-6">
    <button onClick={onMenuClick} className="p-2 hover:text-secondary transition-colors">
      <Menu size={24} strokeWidth={1.5} />
    </button>
    <h1 className="text-3xl font-bold tracking-widest leading-relaxed">心易</h1>
    <button onClick={onBrushClick} className="p-2 hover:text-secondary transition-colors">
      <Brush size={24} strokeWidth={1.5} />
    </button>
  </header>
);

const BottomNavBar = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const tabs: { id: Screen; label: string; icon: any }[] = [
    { id: 'start', label: '起卦', icon: Home },
    { id: 'history', label: '历程', icon: HistoryIcon },
    { id: 'profile', label: '个人', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-12 py-8 bg-[#fcf9f2]/85 backdrop-blur-md border-t border-[#171817]/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id)}
          className={`flex flex-col items-center justify-center transition-all group ${
            currentScreen === tab.id || (currentScreen === 'input' && tab.id === 'start') || (currentScreen === 'casting' && tab.id === 'start') || (currentScreen === 'result' && tab.id === 'start')
              ? 'text-secondary' 
              : 'text-[#171817]/40'
          }`}
        >
          <tab.icon 
            size={24} 
            strokeWidth={currentScreen === tab.id ? 2 : 1.5}
            className={`mb-1 group-hover:scale-110 transition-transform ${currentScreen === tab.id ? 'fill-secondary/10' : ''}`} 
          />
          <span className="text-sm tracking-widest font-medium">{tab.label}</span>
          {(currentScreen === tab.id || (currentScreen === 'input' && tab.id === 'start') || (currentScreen === 'casting' && tab.id === 'start') || (currentScreen === 'result' && tab.id === 'start')) && (
            <motion.div 
              layoutId="nav-underline"
              className="absolute -bottom-1 w-8 h-0.5 bg-secondary"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('事业');
  const [history, setHistory] = useState<DivinationRecord[]>([
    {
      id: '1',
      category: '事业',
      question: '今年事业发展如何？',
      hexagram: '乾为天',
      judgment: '九五：飞龙在天，利见大人。',
      date: '2026-04-05',
      lunarDate: '乙巳年腊月初三'
    },
    {
      id: '2',
      category: '姻缘',
      question: '缘分何时到？',
      hexagram: '地泽临',
      judgment: '初九：咸临，贞吉。',
      date: '2026-03-20',
      lunarDate: '乙巳年冬月十九'
    }
  ]);

  const handleStartDivination = () => setScreen('input');
  const handleGoToCasting = () => setScreen('casting');
  
  const finishCasting = () => {
    const newRecord: DivinationRecord = {
      id: Date.now().toString(),
      category,
      question,
      hexagram: '离为火',
      judgment: '利贞，亨。畜牝牛，吉。',
      date: new Date().toISOString().split('T')[0],
      lunarDate: '乙巳年三月十八'
    };
    setHistory([newRecord, ...history]);
    setScreen('result');
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <TopAppBar />
      
      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
          {screen === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6"
            >
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZjVQ7ckQnV996cZGBZAkR-wt0RJ4mci_HgRsaC4bbApvolwY_6wE0xdWiwNOnzAKzw_x1X_tnS1DOO0eV9tZ5l4YZRbSzhE_JCYSAgeaBqx9IEP_YwK45BlfEf6m3DtdwqKBIcIoFnFVOqTZ2_R7Lnb0OTVb9SllZAJ9JEM5aAQcPQWiQSRisS2v58igusQu3eprkhfl-juyrIM-QzE7H-KC03LW-wRfIWilHTGtGwoKuDYs2bbRHH5h4uZo9Q2e2Xmx8a6m1O4oY" 
                  alt="Background" 
                  className="w-full h-full object-cover grayscale ink-fade"
                />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <button 
                  onClick={handleStartDivination}
                  className="group relative flex items-center justify-center p-12 transition-all duration-700 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full scale-110 opacity-30 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 border border-[#171817]/10 rounded-full scale-125" />
                  <span className="text-7xl md:text-9xl font-black tracking-[1.5rem] text-[#171817] group-hover:text-secondary transition-colors">
                    起卦
                  </span>
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-secondary w-6 h-6 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">印</span>
                  </div>
                </button>

                <div className="mt-20 flex flex-col items-center gap-4">
                  <div className="h-12 w-[1px] bg-[#171817]/20" />
                  <p className="tracking-[0.5rem] text-[#171817]/60 text-sm flex items-center gap-2">
                    <Sparkles size={14} className="text-secondary" />
                    每日一卦
                  </p>
                  <p className="text-xs text-[#171817]/40 tracking-widest">庚子年 戊寅月 癸亥日</p>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6 max-w-4xl mx-auto w-full"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-[0.5em] mb-16 text-center">心中所疑为何？</h2>
              
              <div className="grid grid-cols-5 gap-4 md:gap-8 w-full mb-20">
                {[
                  { id: '学业', icon: BookOpen },
                  { id: '事业', icon: LayoutGrid },
                  { id: '情缘', icon: Heart },
                  { id: '财运', icon: Coins },
                  { id: '杂项', icon: Sparkles },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`group flex flex-col items-center gap-6 transition-all duration-500 ${category === cat.id ? 'transform -translate-y-2' : ''}`}
                  >
                    <div className={`w-16 h-24 flex items-center justify-center border-x border-[#171817]/10 transition-colors ${category === cat.id ? 'border-secondary/30' : ''}`}>
                      <cat.icon size={32} className={`transition-colors ${category === cat.id ? 'text-secondary' : 'text-[#171817]/40'}`} />
                    </div>
                    <span className={`text-lg tracking-widest font-medium transition-colors ${category === cat.id ? 'text-secondary' : ''}`}>{cat.id}</span>
                  </button>
                ))}
              </div>

              <div className="w-full max-w-2xl text-center">
                <div className="relative group">
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#171817]/10 focus:ring-0 focus:border-secondary text-center text-2xl tracking-[0.2em] py-4 placeholder:text-[#171817]/20 resize-none transition-all duration-700" 
                    placeholder="请静心落笔..." 
                    rows={1}
                  />
                </div>
                <div className="mt-16">
                  <button 
                    onClick={handleGoToCasting}
                    disabled={!question}
                    className="px-16 py-4 bg-[#171817] text-white text-xl tracking-[1em] hover:bg-secondary transition-all duration-500 disabled:opacity-50 disabled:hover:bg-[#171817]"
                  >
                    前往起卦
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'casting' && (
            <CastingScreen onFinish={finishCasting} />
          )}

          {screen === 'result' && (
            <ResultScreen record={history[0]} onBack={() => setScreen('start')} />
          )}

          {screen === 'history' && (
            <HistoryScreen history={history} />
          )}

          {screen === 'profile' && (
            <ProfileScreen />
          )}
        </AnimatePresence>
      </main>

      <BottomNavBar currentScreen={screen} setScreen={setScreen} />

      {/* Grain Overlay */}
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

// --- Sub-Screens ---

const CastingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 6) {
          clearInterval(timer);
          setTimeout(onFinish, 1000);
          return 6;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6"
    >
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-16">
        <div className="absolute inset-0 rounded-full bg-stone-200/40 blur-3xl scale-110" />
        <motion.img 
          animate={{ rotate: [0, -5, 5, -5, 0], x: [0, -2, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxXfCFcMXb6tse8HkH2mXMvvkzBJaDVNK-sV-OuXQsknZjKoNrCiOvvSx8ayMpgmZmDdlxLqiL1pWqf3nD0hRY4dXjI_ImaBBrnWSMRxGnlwp-CDC7hGxklsdZ5TIMBtnGNipTxMjM-mLVoLtIjpkRztsVi9wrOMDTTTw5i2oHWdieRVkqotUaHNiQQxyfkNMybvzDLgfwDoD9s7lXqThU3PJubmKex8bxkpkOydt7Ol1O1dFfO432FdQuw-T7NcCQZVdXhhMBTenK" 
          alt="Plate" 
          className="w-full h-full object-contain relative z-10 brightness-95 contrast-110 drop-shadow-2xl"
        />
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -20, 0], 
                rotate: [0, 360],
                x: i === 1 ? [-20, 20, -20] : i === 2 ? [20, -20, 20] : [0, 0, 0]
              }}
              transition={{ repeat: Infinity, duration: 1.5 + i * 0.2 }}
              className="absolute bg-stone-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-bold border border-stone-600"
            >
              通
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <p className="text-[#171817]/40 tracking-[0.5em] text-sm mb-2">沉浸其中</p>
          <h2 className="text-3xl font-bold tracking-widest">摇动心念...</h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-[#171817]/40 mb-2">卦象進度</div>
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-8 h-1 transition-colors duration-500 ${i < progress ? 'bg-secondary' : 'bg-[#171817]/10'}`} />
            ))}
          </div>
          <div className="mt-4 text-xl font-bold text-secondary">
            {progress === 0 ? '准备中' : progress === 6 ? '卦象已成' : `第${['一', '二', '三', '四', '五', '六'][progress - 1]}爻`}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ResultScreen = ({ record, onBack }: { record: DivinationRecord, onBack: () => void }) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsultAi = async () => {
    setLoading(true);
    const text = await getAiInterpretation(record.question, record.hexagram, record.judgment);
    setAiText(text);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-12">
        <span className="text-sm uppercase tracking-[0.2em] text-[#171817]/60 mb-3 block">Heaven over Fire</span>
        <h2 className="text-5xl md:text-6xl font-bold text-secondary mb-4 italic">{record.hexagram}</h2>
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm tracking-wide">
          <Sparkles size={16} className="mr-2" />
          大吉 (Great Success)
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center mx-auto mb-16">
        <div className="absolute inset-0 rounded-full border border-[#171817]/5 scale-110" />
        <div className="flex flex-col-reverse gap-4 w-full px-8">
          {[1, 0, 1, 1, 0, 1].map((type, i) => (
            <div key={i} className="relative">
              {type === 1 ? (
                <div className={`h-3 w-full rounded-sm ${i === 3 ? 'bg-secondary shadow-[0_0_15px_rgba(181,38,25,0.4)]' : 'bg-[#171817]'}`} />
              ) : (
                <div className="flex gap-4 w-full">
                  <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
                  <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
                </div>
              )}
              {i === 3 && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-secondary font-bold text-xs uppercase tracking-tighter">Moving</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 mb-12">
        <div className="p-8 rounded-xl bg-white/50 border border-[#171817]/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BookMarked size={64} />
          </div>
          <h3 className="text-2xl font-bold mb-4">卦辞 (The Judgment)</h3>
          <p className="text-[#171817]/80 leading-relaxed indent-8">
            {record.judgment} 离卦象征光明，也象征依附。就像火一样，必须依附于可燃物才能燃烧。它代表天空中的太阳，带来温暖和光明。持之以恒，坚守正道，必获大吉。
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm font-medium text-secondary/60">
            <span className="w-12 h-[1px] bg-secondary/20" />
            <span>古籍第 30 卷</span>
          </div>
        </div>

        {aiText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-xl bg-secondary/5 border border-secondary/10 relative"
          >
            <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
              <Brain size={20} />
              AI 导师解读
            </h3>
            <p className="text-[#171817]/80 leading-relaxed italic">
              {aiText}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl bg-white/30 border border-[#171817]/5">
            <h4 className="text-xs uppercase tracking-widest text-[#171817]/40 mb-2">变爻启示</h4>
            <p className="text-sm font-semibold">火转为土，暗示在高强度波动后将迎来平稳期。</p>
          </div>
          <div className="p-6 rounded-xl bg-white/30 border border-[#171817]/5">
            <h4 className="text-xs uppercase tracking-widest text-[#171817]/40 mb-2">今日指引</h4>
            <p className="text-sm font-semibold">今日宜保持思绪清晰，多关怀身边之人。</p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center pb-8">
        <button 
          onClick={handleConsultAi}
          disabled={loading || !!aiText}
          className="group relative px-10 py-5 rounded-full bg-[#171817] text-white font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Sparkles size={20} />
            </motion.div>
          ) : (
            <Brain size={20} />
          )}
          {loading ? '感悟中...' : aiText ? '已获真传' : '咨询 AI 导师'}
          {!loading && !aiText && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </motion.div>
  );
};

const HistoryScreen = ({ history }: { history: DivinationRecord[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <section className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-2">历程</h2>
          <p className="text-[#171817]/60 text-sm tracking-[0.2em]">往昔卦象 · 墨迹寻踪</p>
        </div>
        <div className="border-2 border-secondary text-secondary text-xs font-bold px-2 py-1 transform rotate-6">
          庚子存卷
        </div>
      </section>

      <div className="relative space-y-0">
        <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#171817]/10" />
        {history.map((record, idx) => (
          <div key={record.id} className="relative pl-14 pb-12 group">
            <div className={`absolute left-[21px] top-2 w-2 h-2 transform rotate-45 ${idx === 0 ? 'bg-secondary' : 'bg-[#171817]/20'}`} />
            <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0 hover:bg-white/40 transition-colors duration-500 p-4 -ml-4 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-secondary font-bold tracking-widest">{record.category}</span>
                  <div className="h-[1px] flex-1 bg-[#171817]/5 md:hidden" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{record.hexagram}</h3>
                <p className="text-[#171817]/60 text-sm">{record.judgment}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="vertical-text text-xs text-[#171817]/40 tracking-widest leading-none h-24 border-r border-[#171817]/5 pr-4">
                  {record.lunarDate}
                </div>
                <ChevronRight size={20} className="text-[#171817]/20 group-hover:text-secondary transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center opacity-40">
        <p className="text-xs tracking-[0.4em] uppercase">已展卷至末端</p>
        <div className="flex justify-center gap-8 mt-6">
          <span className="w-12 h-[1px] bg-[#171817]/20 self-center" />
          <BookOpen size={16} className="text-secondary" />
          <span className="w-12 h-[1px] bg-[#171817]/20 self-center" />
        </div>
      </div>
    </motion.div>
  );
};

const ProfileScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <section className="flex flex-col items-center mb-20">
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-secondary flex items-center justify-center relative bg-white/50">
            <div className="absolute inset-1 border border-secondary/30" />
            <span className="text-4xl font-bold text-secondary vertical-text tracking-[0.5em] mt-1">山水旅人</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-secondary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-widest mb-2">山水旅人</h2>
          <p className="text-[#171817]/60 text-sm tracking-[0.2em] italic">一沙一世界，一葉一如來</p>
        </div>
      </section>

      <nav className="space-y-12">
        {[
          { label: '吾之收藏', sub: 'COLLECTIONS' },
          { label: '卦金管理', sub: 'RITUALS' },
          { label: '关于心易', sub: 'WISDOM' },
          { label: '分享传承', sub: 'HERITAGE' },
        ].map((item) => (
          <div key={item.label} className="group cursor-pointer flex justify-between items-end pb-4 border-b border-[#171817]/5 hover:border-secondary/30 transition-all duration-700">
            <div className="flex flex-col">
              <span className="text-xs text-[#171817]/40 tracking-[0.3em] mb-1">{item.sub}</span>
              <span className="text-xl tracking-widest group-hover:text-secondary transition-colors">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-[#171817]/20 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </nav>

      <div className="mt-32 flex justify-center opacity-30">
        <div className="w-12 h-16 flex flex-col items-center justify-center border-t border-l border-[#171817]/20 p-2">
          <div className="w-4 h-4 bg-secondary" />
          <span className="text-[10px] vertical-text mt-2 tracking-tighter">墨韻留白</span>
        </div>
      </div>
    </motion.div>
  );
};
