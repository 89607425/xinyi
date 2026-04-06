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
      <div className="text-center mb-12 relative">
        <div className="leaf-decoration leaf-top-left" />
        <div className="leaf-decoration leaf-top-right" />
        
        <p className="text-xs tracking-[0.3em] text-[#171817]/50 uppercase tracking-wider">每日一卦</p>
        <h2 className="ink-title text-6xl md:text-7xl font-black text-[#171817] mt-4">{hexagram.name}</h2>
        <p className="mt-4 text-[#171817]/60 font-medium">第 {hexagram.number} 卦</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#D8F3DC]/30 to-white/60 border-2 border-[#52B788]/20 p-8 rounded-xl relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 text-6xl opacity-15">🍃</div>
        <div className="mb-8 max-w-[280px] mx-auto">
          <div className="text-xs text-[#171817]/50 mb-3 text-center font-bold">卦 画</div>
          <div className="flex flex-col-reverse gap-3 p-6 bg-white/50 rounded-lg border border-[#52B788]/15">
            {hexagram.lines.map((line, idx) => renderLine(line, `line-${idx}`))}
          </div>
        </div>
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-[#171817]">
          <BookOpen size={20} className="text-[#52B788]" /> 《易》意摘要
        </h3>
        <p className="leading-relaxed text-[#171817]/85 mb-4 italic">{hexagram.judgment}</p>
        <p className="leading-relaxed text-[#171817]/80 text-sm">{hexagram.summary}</p>
      </motion.div>

      <p className="mt-8 text-sm text-[#171817]/45 text-center">内容仅供民俗文化研究与心理自我觉察参考</p>

      <div className="mt-10 text-center">
        <button
          onClick={onBack}
          className="px-10 py-3 bg-[#52B788] text-white hover:bg-[#40916C] hover:shadow-lg transition-all font-medium tracking-wide rounded-lg"
        >
          返回首页
        </button>
      </div>
    </motion.div>
  );
}
