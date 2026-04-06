import { useEffect, useMemo, useState } from 'react';
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
  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(history.map((item) => item.category)))],
    [history],
  );
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory('全部');
    }
  }, [categories, activeCategory]);

  const filteredHistory = useMemo(() => (
    activeCategory === '全部'
      ? history
      : history.filter((item) => item.category === activeCategory)
  ), [history, activeCategory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <section className="mb-12 flex items-end justify-between relative">
        <div>
          <div className="leaf-decoration leaf-top-left" />
          <h2 className="ink-title text-5xl md:text-6xl font-black text-[#171817] mb-2 tracking-tight">历程</h2>
          <p className="text-[#171817]/60 text-sm tracking-[0.2em]">往昔卦象 · 墨迹寻踪</p>
        </div>
        <div className="text-4xl opacity-20">🍃</div>
      </section>

      <section className="mb-10">
        <p className="text-xs text-[#171817]/50 tracking-[0.2em] mb-4 font-bold uppercase">按卦类筛选</p>
        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveCategory(item)}
              className={`px-4 py-2 text-sm font-medium border-2 transition-all rounded-lg ${
                activeCategory === item
                  ? 'border-[#52B788] text-[#52B788] bg-[#D8F3DC]/50 shadow-md'
                  : 'border-[#171817]/15 text-[#171817]/65 hover:border-[#52B788]/50 hover:bg-[#D8F3DC]/20'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </section>

      <div className="relative space-y-0">
        <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#52B788]/30 to-[#171817]/10" />
        {filteredHistory.map((record, idx) => (
          <motion.div 
            key={record.id} 
            className="relative pl-14 pb-12 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className={`absolute left-[21px] top-2 w-2.5 h-2.5 transform rotate-45 transition-all ${idx === 0 ? 'bg-[#52B788] shadow-md' : 'bg-[#171817]/20 group-hover:bg-[#52B788]'}`} />
            <button
              type="button"
              onClick={() => onSelect?.(record)}
              className="w-full text-left flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0 hover:bg-[#D8F3DC]/30 transition-all duration-300 p-4 -ml-4 rounded-lg border border-transparent group-hover:border-[#52B788]/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="px-3 py-1 bg-[#52B788]/10 text-[#52B788] font-bold tracking-wider text-sm rounded-md">{record.category}</span>
                  <span className="text-xs text-[#171817]/40">{new Date(record.date).toLocaleDateString('zh-CN')}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[#171817]">{record.primaryHexagram}</h3>
                <p className="text-[#171817]/65 text-sm line-clamp-2">{record.question || '未填写问题'}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-[#171817]/50 tracking-wider leading-none h-24 border-r-2 border-[#52B788]/20 pr-4 vertical-text font-medium">
                  动爻：{record.movingLines.length ? record.movingLines.join('、') : '无'}
                </div>
                <ChevronRight size={20} className="text-[#171817]/30 group-hover:text-[#52B788] transition-colors group-hover:translate-x-1" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {!filteredHistory.length && (
        <div className="mt-20 text-center">
          <div className="text-6xl mb-4 opacity-20">🍃</div>
          <p className="text-[#171817]/40 font-medium">{activeCategory === '全部' ? '暂无历史记录' : `暂无「${activeCategory}」相关记录`}</p>
        </div>
      )}

      <div className="mt-12 text-center opacity-50">
        <p className="text-xs tracking-[0.4em] uppercase mb-6 font-medium">已展卷至末端</p>
        <div className="flex justify-center gap-8 items-center">
          <span className="w-12 h-[1px] bg-gradient-to-r from-[#171817]/20 to-transparent" />
          <BookOpen size={18} className="text-[#52B788]" />
          <span className="w-12 h-[1px] bg-gradient-to-l from-[#171817]/20 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
