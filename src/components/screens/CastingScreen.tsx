import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { castLineByThreeCoins } from '../../services/divination';

function renderYao(line: number, moving: boolean, key: string) {
  const isYang = line === 1 || line === 3;
  return (
    <div key={key} className="relative">
      {isYang ? (
        <div className={`h-3 w-full rounded-sm ${moving ? 'bg-secondary animate-pulse' : 'bg-[#171817]'}`} />
      ) : (
        <div className={`flex gap-4 w-full ${moving ? 'animate-pulse' : ''}`}>
          <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
          <div className="h-3 flex-1 bg-[#171817] rounded-sm" />
        </div>
      )}
    </div>
  );
}

export function CastingScreen({ onFinish }: { onFinish: (lines: number[]) => void }) {
  const [lines, setLines] = useState<number[]>([]);
  const [lastCoins, setLastCoins] = useState<number[] | null>(null);
  const [casting, setCasting] = useState(false);

  const progress = lines.length;
  const previewLines = useMemo(() => [...lines].reverse(), [lines]);

  const onCast = () => {
    if (casting || lines.length >= 6) return;
    setCasting(true);

    const result = castLineByThreeCoins();
    setLastCoins(result.coins);

    setTimeout(() => {
      setLines((prev) => [...prev, result.line]);
      setCasting(false);
    }, 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center pt-24 pb-40 px-6"
    >
      <div className="mb-6 text-center">
        <p className="text-sm tracking-[0.3em] text-[#171817]/50 font-medium">点击龟壳投掷铜钱</p>
        <p className="text-xs text-[#171817]/40 tracking-widest mt-2">已投掷 <span className="text-[#52B788] font-bold">{progress}</span> / 6</p>
      </div>

      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-stone-200/40 blur-3xl scale-110" />
        {/* 春风绿叶装饰 */}
        <div className="absolute -top-6 -left-4 text-3xl opacity-25">🍃</div>
        <div className="absolute -bottom-4 -right-6 text-4xl opacity-20">🍃</div>
        
        <button
          onClick={onCast}
          disabled={casting || lines.length >= 6}
          className="relative z-10"
          aria-label="点击龟壳投掷三枚铜钱"
        >
          <motion.div
            animate={{ rotate: casting ? [0, -8, 8, -5, 0] : [0, -3, 3, -3, 0], x: casting ? [0, -6, 6, -4, 0] : [0, -1, 1, -1, 0] }}
            transition={{ duration: casting ? 0.4 : 2, repeat: casting ? 0 : Infinity }}
            className="w-72 h-72 md:w-96 md:h-96 rounded-[42%] border-2 border-[#171817]/25 shadow-2xl relative overflow-hidden cursor-pointer hover:border-[#52B788]/30 transition-colors"
            style={{
              background:
                'radial-gradient(circle at 30% 24%, rgba(244,214,156,0.35), transparent 36%), radial-gradient(circle at 70% 76%, rgba(0,0,0,0.35), transparent 40%), linear-gradient(145deg, #5b3f2a 0%, #3a281c 42%, #1f150f 100%)',
            }}
          >
            <div className="absolute inset-5 rounded-[39%] border border-[#f2e8cf]/20" />
            <div className="absolute inset-10 rounded-[35%] border border-[#f2e8cf]/15" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  'repeating-linear-gradient(28deg, transparent 0 18px, rgba(255,255,255,0.22) 18px 20px, transparent 20px 36px)',
              }}
            />
            <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0 38%, rgba(24,14,10,0.55) 76%, rgba(12,8,6,0.85) 100%)' }} />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.35em] text-[#f2e8cf]/70 font-bold">
              龟壳
            </div>
          </motion.div>
        </button>

        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {lastCoins?.map((coin, i) => (
            <motion.div
              key={`${coin}-${i}-${progress}`}
              initial={{ y: -50, opacity: 0, rotate: 0, scale: 0.92 }}
              animate={{ y: i === 0 ? 24 : i === 1 ? -8 : 10, x: i === 0 ? -30 : i === 1 ? 0 : 30, opacity: 1, rotate: 380, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute w-12 h-12 rounded-full border border-[#4c2f17] shadow-md flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 32% 28%, #f5d993 0%, #d8a24d 45%, #9a6525 100%)',
              }}
            >
              <div className="w-8 h-8 rounded-full border border-[#6c421a] bg-[#d3a55a] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5e3a19]" />
              </div>
              {coin === 3 ? (
                <>
                  <span className="absolute top-[6px] text-[8px] font-bold text-[#4a2f16]">乾</span>
                  <span className="absolute right-[7px] text-[8px] font-bold text-[#4a2f16]">隆</span>
                  <span className="absolute bottom-[6px] text-[8px] font-bold text-[#4a2f16]">通</span>
                  <span className="absolute left-[7px] text-[8px] font-bold text-[#4a2f16]">寶</span>
                  <span className="absolute -bottom-4 text-[9px] text-[#4a2f16] font-semibold">字面</span>
                </>
              ) : (
                <>
                  <div
                    className="absolute w-8 h-8 rounded-full opacity-80"
                    style={{
                      background:
                        'radial-gradient(circle, transparent 30%, rgba(92,58,24,0.75) 32% 36%, transparent 38%), conic-gradient(from 0deg, rgba(96,60,25,0.9) 0 20deg, transparent 20deg 45deg, rgba(96,60,25,0.9) 45deg 65deg, transparent 65deg 90deg, rgba(96,60,25,0.9) 90deg 110deg, transparent 110deg 135deg, rgba(96,60,25,0.9) 135deg 155deg, transparent 155deg 180deg, rgba(96,60,25,0.9) 180deg 200deg, transparent 200deg 225deg, rgba(96,60,25,0.9) 225deg 245deg, transparent 245deg 270deg, rgba(96,60,25,0.9) 270deg 290deg, transparent 290deg 315deg, rgba(96,60,25,0.9) 315deg 335deg, transparent 335deg 360deg)',
                    }}
                  />
                  <span className="absolute -bottom-4 text-[9px] text-[#4a2f16] font-semibold">花面</span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="text-center">
          <p className="text-[#171817]/40 tracking-[0.4em] text-xs mb-2 uppercase font-medium">请点击龟壳投掷铜钱</p>
          <h2 className="text-3xl font-bold tracking-widest text-[#171817]">
            {progress === 6 ? '卦象已成' : `第 ${progress + 1} 次`}
          </h2>
        </div>

        <div className="w-full">
          <div className="text-xs text-[#171817]/40 mb-3 text-center font-medium">进度 <span className="text-[#52B788]">{progress}</span> / 6</div>
          <div className="flex gap-2 justify-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 transition-all duration-300 rounded-full ${i < progress ? 'bg-[#52B788] shadow-md' : 'bg-[#171817]/10'}`} />
            ))}
          </div>
        </div>

        <div className="w-full bg-gradient-to-br from-[#D8F3DC]/20 to-white/40 border-2 border-[#52B788]/20 rounded-xl p-5">
          <div className="text-xs text-[#171817]/50 mb-3 text-center font-bold">实时卦画（自下而上）</div>
          <div className="flex flex-col-reverse gap-2.5">
            {previewLines.map((line, idx) => renderYao(line, line === 2 || line === 3, `done-${idx}`))}
            {[...Array(6 - previewLines.length)].map((_, idx) => (
              <div key={`empty-${idx}`} className="h-3 bg-[#171817]/8 rounded-sm" />
            ))}
          </div>
        </div>

        {progress === 6 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onFinish(lines)}
            className="px-10 py-3.5 bg-[#52B788] text-white rounded-full font-bold tracking-widest hover:bg-[#40916C] hover:scale-105 transition-all shadow-lg"
          >
            查看解读
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
