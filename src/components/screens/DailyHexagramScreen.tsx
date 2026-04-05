import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import type { HexagramData } from '../../types';

function renderLine(line: number, key: string) {
  if (line === 1) {
    return <div key={key} className="h-3 w-full bg-[#171817] rounded-sm" />;
  }
  return (
    <div key={key} className="flex gap-4 w-full">
      <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
      <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
    </div>
  );
}

export function DailyHexagramScreen({
  hexagram,
  onBack,
}: {
  hexagram: HexagramData;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-[#171817]/50">每日一卦</p>
        <h2 className="text-5xl md:text-6xl font-bold text-secondary mt-3">{hexagram.name}</h2>
        <p className="mt-3 text-[#171817]/60">第 {hexagram.number} 卦</p>
      </div>

      <div className="bg-white/60 border border-[#171817]/10 p-8 rounded-xl">
        <div className="mb-6 max-w-[280px] mx-auto">
          <div className="text-xs text-[#171817]/40 mb-2 text-center">卦画</div>
          <div className="flex flex-col-reverse gap-2">
            {hexagram.lines.map((line, idx) => renderLine(line, `line-${idx}`))}
          </div>
        </div>
        <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
          <BookOpen size={18} /> 《易》意摘要
        </h3>
        <p className="leading-relaxed text-[#171817]/85 mb-4">{hexagram.judgment}</p>
        <p className="leading-relaxed text-[#171817]/75">{hexagram.summary}</p>
      </div>

      <p className="mt-8 text-sm text-[#171817]/50 text-center">内容仅供民俗文化研究与心理自我觉察参考</p>

      <div className="mt-10 text-center">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-[#171817] text-white hover:bg-secondary transition-colors"
        >
          返回首页
        </button>
      </div>
    </motion.div>
  );
}
