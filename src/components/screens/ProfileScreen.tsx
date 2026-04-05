import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { User } from '../../types';

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full">
      <section className="flex flex-col items-center mb-16">
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-secondary flex items-center justify-center relative bg-white/50">
            <div className="absolute inset-1 border border-secondary/30" />
            <span className="text-3xl font-bold text-secondary">{user.displayName.slice(0, 2)}</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-widest mb-1">{user.displayName}</h2>
        <p className="text-[#171817]/60 text-sm tracking-[0.2em]">@{user.username}</p>
      </section>

      <nav className="space-y-8">
        {[
          { label: '历史记录与账号绑定', sub: 'HISTORY' },
          { label: '离线数据库 64 卦', sub: 'OFFLINE' },
          { label: '心理疏导模式', sub: 'MODE' },
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

      <button onClick={onLogout} className="mt-12 px-5 py-2 border border-[#171817]/20 hover:border-secondary hover:text-secondary transition-colors">
        退出登录
      </button>
    </motion.div>
  );
}
