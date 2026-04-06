import { useState } from 'react';
import { motion } from 'motion/react';
import { HEXAGRAMS_BY_BINARY } from '../../data/hexagrams';
import type { HexagramData, User } from '../../types';

function HexagramImage({ lines }: { lines: number[] }) {
  return (
    <div className="w-full flex flex-col-reverse gap-1">
      {lines.map((line, idx) => (
        <div key={idx}>
          {line === 1 ? (
            <div className="h-1.5 w-full bg-[#171817] rounded-sm" />
          ) : (
            <div className="flex gap-1 w-full">
              <div className="h-1.5 flex-1 bg-[#171817] rounded-sm" />
              <div className="h-1.5 flex-1 bg-[#171817] rounded-sm" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HexagramGrid() {
  const [hovered, setHovered] = useState<{ hex: HexagramData; x: number; y: number } | null>(null);

  return (
    <div className="relative">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        {HEXAGRAMS_BY_BINARY.map((hex) => (
          <motion.button
            key={hex.number}
            whileHover={{ scale: 1.08 }}
            className="group bg-white/70 border-2 border-[#171817]/15 rounded-lg p-3 hover:border-[#52B788] hover:bg-[#D8F3DC]/30 transition-all shadow-sm hover:shadow-md"
            onMouseEnter={(e) => setHovered({ hex, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHovered({ hex, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHovered(null)}
            onFocus={(e) => setHovered({ hex, x: e.currentTarget.getBoundingClientRect().left + 20, y: e.currentTarget.getBoundingClientRect().top + 20 })}
            onBlur={() => setHovered(null)}
            aria-label={`第${hex.number}卦 ${hex.name}`}
          >
            <div className="text-[10px] text-[#171817]/50 mb-2 font-bold tracking-wider">{hex.number}</div>
            <HexagramImage lines={hex.lines} />
          </motion.button>
        ))}
      </div>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[210] w-[320px] pointer-events-none rounded-xl border-2 border-[#52B788]/30 bg-[#fcf9f2]/98 backdrop-blur-sm p-5 shadow-2xl"
          style={{ left: hovered.x + 14, top: hovered.y + 14 }}
        >
          <h3 className="text-lg font-bold text-[#171817] mb-2">
            第 {hovered.hex.number} 卦 · {hovered.hex.name}
          </h3>
          <p className="text-xs text-[#52B788] mb-3 font-medium tracking-wider">吉凶等级：{hovered.hex.fortune}</p>
          <p className="text-sm text-[#171817]/80 leading-relaxed mb-2 italic">{hovered.hex.judgment}</p>
          <p className="text-xs text-[#171817]/65 leading-relaxed">{hovered.hex.summary}</p>
        </motion.div>
      )}
    </div>
  );
}

export function ProfileScreen({
  user,
  onLogin,
  onRegister,
  onLogout,
}: {
  user: User | null;
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  onRegister: (payload: { username: string; password: string; displayName: string }) => Promise<void>;
  onLogout: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await onLogin({ username, password });
      } else {
        await onRegister({ username, password, displayName: displayName || username });
      }
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-md mx-auto w-full">
        <div className="mb-10 text-center">
          <h2 className="ink-title text-5xl font-black text-[#171817] mb-2">账号系统</h2>
          <p className="text-[#171817]/50 text-sm tracking-[0.2em]">登录或注册以保存占卜记录</p>
        </div>

        <div className="flex gap-1 mb-8 bg-[#D8F3DC]/30 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${mode === 'login' ? 'bg-[#52B788] text-white shadow-md' : 'text-[#171817]/60 hover:text-[#171817]'}`}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${mode === 'register' ? 'bg-[#52B788] text-white shadow-md' : 'text-[#171817]/60 hover:text-[#171817]'}`}
          >
            注册
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
          />
          {mode === 'register' && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="昵称（可选）"
              className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            type="password"
            className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
          />
        </div>

        {error && <p className="mt-4 text-sm text-[#52B788] font-medium text-center">{error}</p>}

        <motion.button
          onClick={submit}
          disabled={submitting || !username || !password}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full bg-[#52B788] text-white py-3.5 font-bold tracking-wider rounded-lg disabled:opacity-50 hover:bg-[#40916C] transition-all shadow-md hover:shadow-lg"
        >
          {submitting ? '提交中...' : mode === 'login' ? '登录' : '注册'}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-6xl mx-auto w-full">
      <section className="flex flex-col items-center mb-12 relative">
        <div className="leaf-decoration leaf-top-right" />
        <h2 className="ink-title text-4xl font-black text-[#171817] mb-2 tracking-tighter">{user.displayName}</h2>
        <p className="text-[#171817]/60 text-sm tracking-[0.3em]">@{user.username}</p>
      </section>

      <div className="text-center mb-10">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={onLogout} 
          className="px-8 py-3 border-2 border-[#171817]/20 hover:border-[#52B788] text-[#171817]/70 hover:text-[#52B788] hover:bg-[#D8F3DC]/30 transition-all rounded-lg font-medium"
        >
          退出登录
        </motion.button>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-6 text-center text-[#171817] tracking-widest">六十四卦矩阵</h3>
        <HexagramGrid />
      </section>
    </motion.div>
  );
}
