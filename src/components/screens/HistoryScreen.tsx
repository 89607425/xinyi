import { motion } from 'motion/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { DivinationRecord } from '../../types';

export function HistoryScreen({
  history,
  onSelect,
}: {
  history: DivinationRecord[];
  onSelect?: (record: DivinationRecord) => void;
}) {
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
      </section>

      <div className="relative space-y-0">
        <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#171817]/10" />
        {history.map((record, idx) => (
          <div key={record.id} className="relative pl-14 pb-12 group">
            <div className={`absolute left-[21px] top-2 w-2 h-2 transform rotate-45 ${idx === 0 ? 'bg-secondary' : 'bg-[#171817]/20'}`} />
            <button
              type="button"
              onClick={() => onSelect?.(record)}
              className="w-full text-left flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0 hover:bg-white/40 transition-colors duration-500 p-4 -ml-4 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-secondary font-bold tracking-widest">{record.category}</span>
                  <span className="text-xs text-[#171817]/40">{new Date(record.date).toLocaleDateString('zh-CN')}</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{record.primaryHexagram}</h3>
                <p className="text-[#171817]/60 text-sm line-clamp-2">{record.question || '未填写问题'}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-[#171817]/40 tracking-widest leading-none h-24 border-r border-[#171817]/5 pr-4 vertical-text">
                  动爻：{record.movingLines.length ? record.movingLines.join('、') : '无'}
                </div>
                <ChevronRight size={20} className="text-[#171817]/20 group-hover:text-secondary transition-colors" />
              </div>
            </button>
          </div>
        ))}
      </div>

      {!history.length && (
        <div className="mt-20 text-center text-[#171817]/40">
          <p>暂无历史记录</p>
        </div>
      )}

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
}
