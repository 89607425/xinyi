import { motion } from 'motion/react';
import { ArrowRight, Brain, Sparkles } from 'lucide-react';
import type { DivinationRecord } from '../../types';

const fortuneClass: Record<DivinationRecord['fortune'], string> = {
  大吉: 'bg-emerald-100 text-emerald-700',
  小吉: 'bg-lime-100 text-lime-700',
  平: 'bg-slate-100 text-slate-700',
  忧: 'bg-orange-100 text-orange-700',
  大忧: 'bg-rose-100 text-rose-700',
};

function renderLine(line: number, moving: boolean, index: number) {
  const isYang = line === 1 || line === 3;

  return (
    <div key={index} className="relative">
      {isYang ? (
        <div className={`h-3 w-full rounded-sm ${moving ? 'bg-secondary animate-pulse' : 'bg-[#171817]'}`} />
      ) : (
        <div className={`flex gap-4 w-full ${moving ? 'animate-pulse' : ''}`}>
          <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
          <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
        </div>
      )}
      {moving && <span className="absolute -right-10 top-1/2 -translate-y-1/2 text-secondary text-xs">动</span>}
    </div>
  );
}

export function ResultScreen({
  record,
  loading,
  onConsultAi,
}: {
  record: DivinationRecord;
  loading: boolean;
  onConsultAi: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <span className="text-sm tracking-[0.2em] text-[#171817]/60 mb-3 block">第 {record.hexagramNumber} 卦</span>
        <h2 className="text-5xl md:text-6xl font-bold text-secondary mb-3 italic">{record.primaryHexagram}</h2>
        <p className="text-sm text-[#171817]/60">变卦：{record.changedHexagram}（第 {record.changedHexagramNumber} 卦）</p>
        <div className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm tracking-wide ${fortuneClass[record.fortune]}`}>
          <Sparkles size={16} className="mr-2" />
          {record.fortune}
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center mx-auto mb-10">
        <div className="absolute inset-0 rounded-full border border-[#171817]/5 scale-110" />
        <div className="flex flex-col-reverse gap-4 w-full px-8">
          {record.lines.map((line, i) => renderLine(line, record.movingLines.includes(i + 1), i))}
        </div>
      </div>

      <div className="space-y-5 mb-10">
        <div className="p-6 rounded-xl bg-white/50 border border-[#171817]/5">
          <h3 className="text-xl font-bold mb-3">离线卦辞</h3>
          <p className="text-[#171817]/80 leading-relaxed">{record.judgment}</p>
        </div>

        {record.aiText && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-secondary/5 border border-secondary/10">
            <h3 className="text-lg font-bold mb-3 text-secondary flex items-center gap-2">
              <Brain size={18} /> AI 大师姐解读
            </h3>
            <p className="text-[#171817]/80 whitespace-pre-wrap leading-relaxed">{record.aiText}</p>
          </motion.div>
        )}
      </div>

      <div className="w-full flex justify-center pb-8">
        <button
          onClick={onConsultAi}
          disabled={loading || !!record.aiText}
          className="group relative px-10 py-5 rounded-full bg-[#171817] text-white font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Brain size={20} />
          {loading ? '生成中...' : record.aiText ? '已完成解读' : '咨询 AI 大师姐'}
          {!loading && !record.aiText && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </motion.div>
  );
}
