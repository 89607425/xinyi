import { useState } from 'react';
import { motion } from 'motion/react';
import type { AdminDivinationRecord, AdminUserSummary } from '../../services/api';

type AdminTab = 'users' | 'records';

export function AdminScreen({
  adminToken,
  users,
  records,
  loading,
  error,
  onLogin,
  onRefresh,
  onToggleBan,
  onDeleteUser,
  onLogout,
  onBack,
}: {
  adminToken: string | null;
  users: AdminUserSummary[];
  records: AdminDivinationRecord[];
  loading: boolean;
  error: string;
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  onRefresh: () => Promise<void>;
  onToggleBan: (userId: string, banned: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [tab, setTab] = useState<AdminTab>('users');
  const [busyUserId, setBusyUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setLocalError('');
    try {
      await onLogin({ username, password });
      setPassword('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '管理员登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!adminToken) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-32 pb-40 px-6 max-w-md mx-auto w-full">
        <div className="mb-10 text-center">
          <h2 className="ink-title text-5xl font-black text-[#171817] mb-2">管理员</h2>
          <p className="text-[#171817]/50 text-sm tracking-[0.2em]">内置账号密码登录</p>
        </div>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="管理员用户名"
            className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理员密码"
            type="password"
            className="w-full border-2 border-[#171817]/15 bg-white/70 rounded-lg px-4 py-3 focus:border-[#52B788] focus:outline-none transition-colors focus:bg-white"
          />
        </div>

        {(localError || error) && <p className="mt-4 text-sm text-[#52B788] font-medium text-center">{localError || error}</p>}

        <button
          onClick={() => void submit()}
          disabled={submitting || !username || !password}
          className="mt-8 w-full bg-[#52B788] text-white py-3.5 font-bold tracking-wider rounded-lg disabled:opacity-50 hover:bg-[#40916C] transition-all"
        >
          {submitting ? '登录中...' : '管理员登录'}
        </button>
        <button
          onClick={onBack}
          className="mt-3 w-full py-3 border-2 border-[#171817]/20 hover:border-[#52B788] text-[#171817]/70 hover:text-[#52B788] rounded-lg transition-colors"
        >
          返回
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full pt-28 pb-40 px-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="ink-title text-4xl font-black text-[#171817]">管理员后台</h2>
        <div className="flex gap-2">
          <button onClick={() => void onRefresh()} className="px-4 py-2 border border-[#171817]/20 rounded-lg hover:border-[#52B788]">刷新</button>
          <button onClick={onLogout} className="px-4 py-2 border border-[#171817]/20 rounded-lg hover:border-[#52B788]">退出管理员</button>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg border ${tab === 'users' ? 'bg-[#52B788] text-white border-[#52B788]' : 'border-[#171817]/20'}`}
        >
          用户管理
        </button>
        <button
          onClick={() => setTab('records')}
          className={`px-4 py-2 rounded-lg border ${tab === 'records' ? 'bg-[#52B788] text-white border-[#52B788]' : 'border-[#171817]/20'}`}
        >
          算卦记录
        </button>
      </div>

      {loading && <p className="text-sm text-[#171817]/60">加载中...</p>}
      {error && <p className="text-sm text-[#52B788] mb-4">{error}</p>}

      {tab === 'users' && (
        <div className="overflow-x-auto border border-[#171817]/10 rounded-xl bg-white/70">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#D8F3DC]/40 text-[#171817]/75">
              <tr>
                <th className="text-left p-3">用户名</th>
                <th className="text-left p-3">昵称</th>
                <th className="text-left p-3">手机号</th>
                <th className="text-right p-3">记录数</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">注册时间</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#171817]/10">
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.displayName}</td>
                  <td className="p-3">{u.phoneMasked || '-'}</td>
                  <td className="p-3 text-right">{u.recordCount}</td>
                  <td className="p-3">{u.isBanned ? '已封禁' : '正常'}</td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleString('zh-CN', { hour12: false })}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        disabled={busyUserId === u.id}
                        onClick={async () => {
                          setBusyUserId(u.id);
                          try {
                            await onToggleBan(u.id, !u.isBanned);
                          } finally {
                            setBusyUserId('');
                          }
                        }}
                        className="px-3 py-1.5 border border-[#171817]/20 rounded hover:border-[#52B788] disabled:opacity-50"
                      >
                        {u.isBanned ? '解封' : '封号'}
                      </button>
                      <button
                        disabled={busyUserId === u.id}
                        onClick={async () => {
                          if (!window.confirm(`确认移除用户 ${u.username} 吗？此操作不可恢复。`)) return;
                          setBusyUserId(u.id);
                          try {
                            await onDeleteUser(u.id);
                          } finally {
                            setBusyUserId('');
                          }
                        }}
                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          {records.map((item) => (
            <article key={item.id} className="border border-[#171817]/10 rounded-xl p-4 bg-white/70">
              <div className="flex items-center justify-between text-sm text-[#171817]/60 mb-2">
                <span>{item.displayName} (@{item.username})</span>
                <span>{new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false })}</span>
              </div>
              <p className="text-sm text-[#171817]/85 mb-1">事项：{item.payload.category}</p>
              <p className="text-sm text-[#171817]/85 mb-1">问题：{item.payload.question}</p>
              <p className="text-sm text-[#171817]/85">卦象：{item.payload.primaryHexagram} → {item.payload.changedHexagram}</p>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
