import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function StartScreen({ onStart, onOpenDaily }: { onStart: () => void; onOpenDaily: () => void }) {
  return (
    <motion.div
      key="start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6"
    >
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZjVQ7ckQnV996cZGBZAkR-wt0RJ4mci_HgRsaC4bbApvolwY_6wE0xdWiwNOnzAKzw_x1X_tnS1DOO0eV9tZ5l4YZRbSzhE_JCYSAgeaBqx9IEP_YwK45BlfEf6m3DtdwqKBIcIoFnFVOqTZ2_R7Lnb0OTVb9SllZAJ9JEM5aAQcPQWiQSRisS2v58igusQu3eprkhfl-juyrIM-QzE7H-KC03LW-wRfIWilHTGtGwoKuDYs2bbRHH5h4uZo9Q2e2Xmx8a6m1O4oY"
          alt="Background"
          className="w-full h-full object-cover grayscale ink-fade"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <button
          onClick={onStart}
          className="group relative flex items-center justify-center p-12 transition-all duration-700 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/30 rounded-full scale-110 opacity-30 group-hover:opacity-60 transition-opacity" />
          <div className="absolute inset-0 border border-[#171817]/10 rounded-full scale-125" />
          <span className="text-7xl md:text-9xl font-black tracking-[1.5rem] text-[#171817] group-hover:text-secondary transition-colors">
            起卦
          </span>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-secondary w-6 h-6 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">印</span>
          </div>
        </button>

        <div className="mt-20 flex flex-col items-center gap-4">
          <div className="h-12 w-[1px] bg-[#171817]/20" />
          <p className="tracking-[0.5rem] text-[#171817]/60 text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-secondary" />
            每日一卦
          </p>
          <p className="text-xs text-[#171817]/40 tracking-widest">民俗文化研究 · 心理健康辅助</p>
          <button
            onClick={onOpenDaily}
            className="mt-4 px-6 py-2 border border-[#171817]/20 hover:border-secondary hover:text-secondary transition-colors text-sm tracking-widest"
          >
            进入每日一卦
          </button>
        </div>
      </div>
    </motion.div>
  );
}
