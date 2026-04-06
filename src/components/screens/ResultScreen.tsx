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

const fortuneScore: Record<DivinationRecord['fortune'], number> = {
  大吉: 5,
  小吉: 4,
  平: 3,
  忧: 2,
  大忧: 1,
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

const lineToChanged = (line: number): 0 | 1 => {
  if (line === 2) return 1;
  if (line === 3) return 0;
  return line === 1 ? 1 : 0;
};

function changedHexagramLines(lines: number[]) {
  return lines.map(lineToChanged);
}

function getEffectiveFortune(record: DivinationRecord): DivinationRecord['fortune'] {
  if (record.movingLines.length && record.changedFortune) {
    return record.changedFortune;
  }
  return record.fortune;
}

function fortuneTrendText(record: DivinationRecord): string {
  if (!record.movingLines.length || !record.changedFortune) {
    return `吉凶参考：本卦 ${record.fortune}`;
  }
  const from = fortuneScore[record.fortune];
  const to = fortuneScore[record.changedFortune];
  if (to > from) {
    return `吉凶参考：本卦 ${record.fortune} → 变卦 ${record.changedFortune}，走势偏向转稳或转好。`;
  }
  if (to < from) {
    return `吉凶参考：本卦 ${record.fortune} → 变卦 ${record.changedFortune}，后续需更重视风险控制。`;
  }
  return `吉凶参考：本卦 ${record.fortune} 与变卦 ${record.changedFortune} 同级，重点在执行节奏。`;
}

function offlineInterpretation(record: DivinationRecord): string[] {
  if (!record.movingLines.length) {
    return [
      '本卦无动爻，短期结构相对稳定，先按既定方向执行，避免频繁换轨。',
      '执行重点：控制节奏、按阶段复盘，不做情绪化加码。',
      fortuneTrendText(record),
    ];
  }

  const moveText = `动爻在第 ${record.movingLines.join('、')} 爻，局势仍在变化，执行策略需要动态调整。`;
  return [
    moveText,
    '执行重点：先定主线再分配资源，优先处理最关键的一步。',
    fortuneTrendText(record)
      .replace('，走势偏向转稳或转好。', '。')
      .replace('，后续需更重视风险控制。', '。')
      .replace(' 同级，重点在执行节奏。', ' 同级。'),
  ];
}

function movingHint(record: DivinationRecord): string {
  if (!record.movingLines.length) {
    return '本卦无动爻，说明当前局势相对稳定，可先按既定节奏推进。';
  }
  const positions = record.movingLines.join('、');
  return `动爻在第 ${positions} 爻。当前适合边推进边校准，不宜一次性押注。`;
}

export function ResultScreen({
  record,
  loading,
  error,
  onConsultAi,
  onBackToStart,
}: {
  record: DivinationRecord;
  loading: boolean;
  error?: string;
  onConsultAi: () => void;
  onBackToStart: () => void;
}) {
  const effectiveFortune = getEffectiveFortune(record);
  const interpretation = offlineInterpretation(record);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full pt-32 pb-40 px-6 max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10 relative">
        {/* 春风绿叶装饰 */}
        <div className="leaf-decoration leaf-top-left" />
        <div className="leaf-decoration leaf-top-right" />
        
        <span className="text-sm tracking-[0.2em] text-[#171817]/60 mb-3 block">第 {record.hexagramNumber} 卦</span>
        <h2 className="ink-title text-6xl md:text-7xl font-black text-[#171817] mb-3">{record.primaryHexagram}</h2>
        <p className="text-sm text-[#171817]/60">
          变卦：{record.changedHexagram}（第 {record.changedHexagramNumber} 卦）
          {record.movingLines.length ? ' · 终局参考' : ' · 与本卦一致'}
        </p>
        <div className={`mt-4 inline-flex items-center px-6 py-2.5 rounded-full font-medium text-sm tracking-wide ${fortuneClass[effectiveFortune]} shadow-md`}>
          <Sparkles size={16} className="mr-2" />
          {record.movingLines.length && record.changedFortune
            ? `吉凶：${record.fortune} → ${record.changedFortune}`
            : `吉凶：${record.fortune}`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-full aspect-square max-w-[320px] flex items-center justify-center mx-auto"
        >
          <div className="absolute inset-0 rounded-full border-2 border-[#171817]/10 scale-110" />
          <div className="absolute inset-0 rounded-full border border-[#171817]/5 scale-125" />
          <div className="absolute top-4 text-xs tracking-[0.2em] text-[#171817]/50 font-bold">本卦</div>
          <div className="absolute -top-2 -right-2 text-xl opacity-30">🍃</div>
          <div className="flex flex-col-reverse gap-4 w-full px-8">
            {record.lines.map((line, i) => renderLine(line, record.movingLines.includes(i + 1), i))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full aspect-square max-w-[320px] flex items-center justify-center mx-auto"
        >
          <div className="absolute inset-0 rounded-full border-2 border-[#52B788]/20 scale-110" />
          <div className="absolute inset-0 rounded-full border border-[#52B788]/10 scale-125" />
          <div className="absolute top-4 text-xs tracking-[0.2em] text-[#52B788]/70 font-bold">变卦</div>
          <div className="absolute -bottom-2 -left-2 text-2xl opacity-25">🍃</div>
          <div className="flex flex-col-reverse gap-4 w-full px-8">
            {changedHexagramLines(record.lines).map((line, i) => renderLine(line, false, i))}
          </div>
        </motion.div>
      </div>

      <div className="space-y-5 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#D8F3DC]/30 to-white/50 border border-[#52B788]/15 relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 text-5xl opacity-10">🍃</div>
          <h3 className="text-xl font-bold mb-4 text-[#171817]">卦辞</h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#171817]/10 bg-white/60 p-4">
              <p className="text-sm text-[#171817]/55 mb-1">本卦 · {record.primaryHexagram}</p>
              <p className="text-[#171817]/85 leading-relaxed mb-2 text-sm">原文：{record.judgment}</p>
              <p className="text-[#171817]/75 leading-relaxed text-sm">白话：{record.summary || '本卦白话解释待补充。'}</p>
            </div>
            <div className="rounded-lg border border-[#52B788]/20 bg-[#D8F3DC]/25 p-4">
              <p className="text-sm text-[#171817]/55 mb-1">变卦 · {record.changedHexagram}</p>
              <p className="text-[#171817]/85 leading-relaxed mb-2 text-sm">原文：{record.changedJudgment || '与本卦同义'}</p>
              <p className="text-[#171817]/75 leading-relaxed text-sm">白话：{record.changedSummary || record.summary || '变卦白话解释待补充。'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-[#171817]/[0.03] border border-[#171817]/10 relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 text-5xl opacity-10 group-hover:opacity-20 transition-opacity">🍃</div>
          <h3 className="text-xl font-bold mb-3 text-[#171817]">解析</h3>
          {interpretation.map((text, idx) => (
            <p key={idx} className="text-[#171817]/85 leading-relaxed mb-2 last:mb-0 text-sm">
              {text}
            </p>
          ))}
          <p className="text-sm text-[#171817]/65 leading-relaxed mt-4 pt-3 border-t border-[#171817]/10">{movingHint(record)}</p>
        </motion.div>

        {record.aiText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#52B788]/10 to-white/50 border-2 border-[#52B788]/20 relative overflow-hidden"
          >
            <div className="absolute -right-8 top-2 text-6xl opacity-15">🍃</div>
            <h3 className="text-lg font-bold mb-3 text-[#52B788] flex items-center gap-2">
              <Brain size={18} /> 深度解读
            </h3>
            <p className="text-[#171817]/80 whitespace-pre-wrap leading-relaxed text-sm">{record.aiText}</p>
          </motion.div>
        )}
      </div>

      <div className="w-full flex justify-center pb-8">
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={onConsultAi}
            disabled={loading || !!record.aiText}
            className="group relative px-12 py-4 rounded-full bg-[#52B788] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#40916C] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:bg-[#52B788] disabled:hover:shadow-lg"
          >
            <Brain size={20} />
            <span className="tracking-wide">
              {loading ? '生成中...' : record.aiText ? '已完成解读' : '深度解读'}
            </span>
            {!loading && !record.aiText && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
          <button
            onClick={onBackToStart}
            className="px-8 py-2.5 border-2 border-[#171817]/20 text-[#171817]/70 hover:border-[#52B788] hover:text-[#52B788] hover:bg-[#D8F3DC]/30 transition-all rounded-lg font-medium tracking-wide"
          >
            返回起卦
          </button>
          {error && <p className="text-sm text-[#52B788] text-center font-medium">{error}</p>}
        </div>
      </div>
    </motion.div>
  );
}
