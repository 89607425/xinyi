import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function StartScreen({
  onStart,
  onOpenDaily,
  onResumeResult,
}: {
  onStart: () => void;
  onOpenDaily: () => void;
  onResumeResult?: () => void;
}) {
  return (
    <motion.div
      key="start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-full flex flex-col items-center justify-center pt-32 pb-40 px-6"
    >
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506738773649-19e076dd3f13?w=2000&q=80"
          alt="Background"
          className="w-full h-full object-cover grayscale ink-fade"
        />
      </div>

      <div className="absolute top-28 right-5 z-20">
        <button
          onClick={onOpenDaily}
          className="group relative w-12 h-40 bg-[#f3ecd9] border border-[#171817]/20 hover:border-[#171817]/35 transition-colors shadow-sm flex items-center justify-center"
          aria-label="进入每日一卦"
        >
          <div className="vertical-text text-[11px] tracking-[0.2em] text-[#171817]/60">每日一卦</div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#f3ecd9] border-r border-b border-[#171817]/20 rotate-45" />
          <Sparkles size={11} className="absolute top-2 text-[#171817]/40 group-hover:text-secondary transition-colors" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <button
          onClick={onStart}
          className="group relative flex items-center justify-center p-12 transition-all duration-700 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/30 rounded-full scale-110 opacity-30 group-hover:opacity-60 transition-opacity" />
          <div className="absolute inset-0 border border-[#171817]/10 rounded-full scale-125" />
          {/* 春风绿叶装饰 */}
          <div className="absolute -top-8 -left-6 text-4xl opacity-30 group-hover:opacity-50 transition-opacity animate-bounce">🍃</div>
          <div className="absolute -bottom-6 -right-8 text-3xl opacity-25 group-hover:opacity-40 transition-opacity" style={{animation: 'sway 4s ease-in-out infinite'}}>🍃</div>
          <span className="ink-title text-7xl md:text-9xl font-black tracking-[1.5rem] text-[#171817] group-hover:text-[#52B788] transition-colors">
            起卦
          </span>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-[#52B788] w-6 h-6 flex items-center justify-center shadow-md">
            <span className="text-white text-[10px] font-bold">印</span>
          </div>
        </button>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-[#171817]/55 tracking-[0.4em] font-medium">遇事不决可问春风</p>
          <p className="text-xs text-[#171817]/45 tracking-widest">从这里进入，进行占卜</p>
          <p className="text-[11px] text-[#171817]/35 tracking-widest">民俗文化研究 · 心理健康辅助</p>
          {onResumeResult && (
            <button
              onClick={onResumeResult}
              className="mt-6 px-8 py-2.5 border-2 border-[#52B788] text-[#52B788] hover:bg-[#D8F3DC]/50 transition-all text-sm tracking-widest font-medium rounded-lg"
            >
              继续查看上次卦象
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
