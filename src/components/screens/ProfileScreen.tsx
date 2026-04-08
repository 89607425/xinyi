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
  onSendRegisterSmsCode,
  onOpenAdmin,
}: {
  user: User | null;
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  onRegister: (payload: { username: string; password: string; displayName: string; phone: string; smsCode: string }) => Promise<void>;
  onLogout: () => void;
  onSendRegisterSmsCode: (phone: string) => Promise<{ sent: boolean; expiresInSec: number; phoneMasked: string; debugCode?: string }>;
  onOpenAdmin: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsCooldown, setSmsCooldown] = useState(0);
  const [smsHint, setSmsHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTopupComingSoon, setShowTopupComingSoon] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await onLogin({ username, password });
      } else {
        await onRegister({ username, password, displayName: displayName || username, phone, smsCode });
      }
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendSms = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入 11 位手机号');
      return;
    }
    setSmsLoading(true);
    setError('');
    setSmsHint('');
    try {
      const result = await onSendRegisterSmsCode(phone);
      setSmsHint(result.debugCode ? `验证码已发送（开发模式验证码：${result.debugCode}）` : '验证码已发送，请注意查收');
      setSmsCooldown(60);
      const timer = window.setInterval(() => {
        setSmsCooldown((prev) => {
          if (prev <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      setSmsLoading(false);
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
            <>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="昵称（可选）"
                className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="手机号（11位）"
                className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
              />
              <div className="flex gap-2">
                <input
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  placeholder="验证码"
                  className="flex-1 border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
                />
                <button
                  onClick={() => void handleSendSms()}
                  disabled={smsLoading || smsCooldown > 0}
                  className="px-4 rounded-lg border-2 border-[#52B788] text-[#52B788] disabled:opacity-50"
                >
                  {smsCooldown > 0 ? `${smsCooldown}s` : smsLoading ? '发送中' : '发送验证码'}
                </button>
              </div>
            </>
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
        {smsHint && <p className="mt-2 text-sm text-[#171817]/70 text-center">{smsHint}</p>}

        <motion.button
          onClick={submit}
          disabled={submitting || !username || !password || (mode === 'register' && (!phone || !smsCode))}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full bg-[#52B788] text-white py-3.5 font-bold tracking-wider rounded-lg disabled:opacity-50 hover:bg-[#40916C] transition-all shadow-md hover:shadow-lg"
        >
          {submitting ? '提交中...' : mode === 'login' ? '登录' : '注册'}
        </motion.button>

        <button
          onClick={onOpenAdmin}
          className="mt-4 w-full py-3 border-2 border-[#171817]/20 hover:border-[#52B788] text-[#171817]/70 hover:text-[#52B788] rounded-lg transition-colors"
        >
          管理员入口
        </button>

      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-6xl mx-auto w-full">
      <section className="flex items-start justify-between mb-12 relative gap-6">
        <div className="leaf-decoration leaf-top-right" />
        <div>
          <h2 className="ink-title text-4xl font-black text-[#171817] mb-2 tracking-tighter">{user.displayName}</h2>
          <p className="text-[#171817]/60 text-sm tracking-[0.3em]">@{user.username}</p>
        </div>
        <div className="text-right">
          <p className="text-[#171817]/45 text-xs tracking-[0.2em] mb-1">余额</p>
          <p className="text-2xl font-black text-[#52B788]">¥ {(user.balanceCents / 100).toFixed(2)}</p>
        </div>
      </section>

      <div className="text-center mb-10 space-y-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowTopupComingSoon(true)}
          className="px-8 py-3 bg-[#52B788] text-white hover:bg-[#40916C] transition-all rounded-lg font-medium shadow-md"
        >
          余额充值
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={onLogout} 
          className="px-8 py-3 border-2 border-[#171817]/20 hover:border-[#52B788] text-[#171817]/70 hover:text-[#52B788] hover:bg-[#D8F3DC]/30 transition-all rounded-lg font-medium"
        >
          退出登录
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onOpenAdmin}
          className="px-8 py-3 border-2 border-[#171817]/20 hover:border-[#52B788] text-[#171817]/70 hover:text-[#52B788] hover:bg-[#D8F3DC]/30 transition-all rounded-lg font-medium"
        >
          管理员入口
        </motion.button>
      </div>

      <section>
        <h3 className="text-lg font-bold mb-6 text-center text-[#171817] tracking-widest">六十四卦矩阵</h3>
        <HexagramGrid />
      </section>

      {showTopupComingSoon && (
        <div className="fixed inset-0 z-[220] bg-black/40 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#fcf9f2] border-2 border-[#52B788]/20 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-black text-[#171817] mb-3">余额充值</h3>
            <p className="text-[#171817]/70 mb-6">该功能正在开发中，暂未开放使用。</p>
            <button
              onClick={() => setShowTopupComingSoon(false)}
              className="px-5 py-2 rounded-lg bg-[#52B788] text-white"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
