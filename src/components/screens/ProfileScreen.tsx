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
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
        {HEXAGRAMS_BY_BINARY.map((hex) => (
          <button
            key={hex.number}
            className="group bg-white/70 border border-[#171817]/10 rounded-lg p-2 hover:border-secondary transition-colors"
            onMouseEnter={(e) => setHovered({ hex, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHovered({ hex, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHovered(null)}
            onFocus={(e) => setHovered({ hex, x: e.currentTarget.getBoundingClientRect().left + 20, y: e.currentTarget.getBoundingClientRect().top + 20 })}
            onBlur={() => setHovered(null)}
            aria-label={`第${hex.number}卦 ${hex.name}`}
          >
            <div className="text-[10px] text-[#171817]/50 mb-1">{hex.number}</div>
            <HexagramImage lines={hex.lines} />
          </button>
        ))}
      </div>

      {hovered && (
        <div
          className="fixed z-[210] w-[300px] pointer-events-none rounded-xl border border-[#171817]/20 bg-[#fcf9f2]/95 backdrop-blur-sm p-4 shadow-2xl"
          style={{ left: hovered.x + 14, top: hovered.y + 14 }}
        >
          <h3 className="text-lg font-bold text-secondary mb-1">
            第 {hovered.hex.number} 卦 · {hovered.hex.name}
          </h3>
          <p className="text-xs text-[#171817]/60 mb-2">吉凶等级：{hovered.hex.fortune}</p>
          <p className="text-sm text-[#171817]/80 leading-relaxed mb-2">{hovered.hex.judgment}</p>
          <p className="text-xs text-[#171817]/65 leading-relaxed">{hovered.hex.summary}</p>
        </div>
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
        <h2 className="text-3xl font-bold mb-8">账号系统</h2>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 border ${mode === 'login' ? 'border-secondary text-secondary' : 'border-[#171817]/20 text-[#171817]/50'}`}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`px-4 py-2 border ${mode === 'register' ? 'border-secondary text-secondary' : 'border-[#171817]/20 text-[#171817]/50'}`}
          >
            注册
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            className="w-full border border-[#171817]/10 bg-white/60 px-4 py-3"
          />
          {mode === 'register' && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="昵称（可选）"
              className="w-full border border-[#171817]/10 bg-white/60 px-4 py-3"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            type="password"
            className="w-full border border-[#171817]/10 bg-white/60 px-4 py-3"
          />
        </div>

        {error && <p className="mt-3 text-sm text-secondary">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting || !username || !password}
          className="mt-8 w-full bg-[#171817] text-white py-3 disabled:opacity-50"
        >
          {submitting ? '提交中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-6xl mx-auto w-full">
      <section className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold tracking-widest mb-1">{user.displayName}</h2>
        <p className="text-[#171817]/60 text-sm tracking-[0.2em]">@{user.username}</p>
      </section>

      <div className="text-center mb-8">
        <button onClick={onLogout} className="px-5 py-2 border border-[#171817]/20 hover:border-secondary hover:text-secondary transition-colors">
          退出登录
        </button>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-center">六十四卦矩阵</h3>
        <HexagramGrid />
      </section>
    </motion.div>
  );
}
