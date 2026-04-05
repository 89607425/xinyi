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
      setLines((prev) => {
        const next = [...prev, result.line];
        if (next.length === 6) {
          setTimeout(() => onFinish(next), 350);
        }
        return next;
      });
      setCasting(false);
    }, 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center pt-24 pb-40 px-6"
    >
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-stone-200/40 blur-3xl scale-110" />
        <button
          onClick={onCast}
          disabled={casting || lines.length >= 6}
          className="relative z-10"
          aria-label="点击龟壳投掷三枚铜钱"
        >
          <motion.img
            animate={{ rotate: casting ? [0, -8, 8, -5, 0] : [0, -3, 3, -3, 0], x: casting ? [0, -6, 6, -4, 0] : [0, -1, 1, -1, 0] }}
            transition={{ duration: casting ? 0.4 : 2, repeat: casting ? 0 : Infinity }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxXfCFcMXb6tse8HkH2mXMvvkzBJaDVNK-sV-OuXQsknZjKoNrCiOvvSx8ayMpgmZmDdlxLqiL1pWqf3nD0hRY4dXjI_ImaBBrnWSMRxGnlwp-CDC7hGxklsdZ5TIMBtnGNipTxMjM-mLVoLtIjpkRztsVi9wrOMDTTTw5i2oHWdieRVkqotUaHNiQQxyfkNMybvzDLgfwDoD9s7lXqThU3PJubmKex8bxkpkOydt7Ol1O1dFfO432FdQuw-T7NcCQZVdXhhMBTenK"
            alt="Plate"
            className="w-full h-full object-contain brightness-95 contrast-110 drop-shadow-2xl"
          />
        </button>

        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {(lastCoins || [2, 2, 2]).map((coin, i) => (
            <motion.div
              key={`${coin}-${i}-${progress}`}
              initial={{ y: -40, opacity: 0, rotate: 0 }}
              animate={{ y: i === 0 ? 24 : i === 1 ? -8 : 10, x: i === 0 ? -26 : i === 1 ? 0 : 26, opacity: 1, rotate: 360 }}
              transition={{ duration: 0.45 }}
              className="absolute w-11 h-11 rounded-full border border-[#171817]/20 bg-amber-100 text-[#171817] flex items-center justify-center font-bold"
            >
              {coin === 3 ? '阳' : '阴'}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="text-center">
          <p className="text-[#171817]/40 tracking-[0.4em] text-xs mb-2">请点击龟壳投掷铜钱</p>
          <h2 className="text-2xl font-bold tracking-widest">
            {progress === 6 ? '卦象已成' : `第 ${progress + 1} 次投掷`}
          </h2>
        </div>

        <div className="w-full">
          <div className="text-xs text-[#171817]/40 mb-2 text-center">进度 {progress}/6</div>
          <div className="flex gap-2 justify-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-8 h-1 transition-colors duration-300 ${i < progress ? 'bg-secondary' : 'bg-[#171817]/10'}`} />
            ))}
          </div>
        </div>

        <div className="w-full bg-white/40 border border-[#171817]/8 rounded-xl p-4">
          <div className="text-xs text-[#171817]/40 mb-3 text-center">实时卦画（自下而上）</div>
          <div className="flex flex-col-reverse gap-2">
            {previewLines.map((line, idx) => renderYao(line, line === 2 || line === 3, `done-${idx}`))}
            {[...Array(6 - previewLines.length)].map((_, idx) => (
              <div key={`empty-${idx}`} className="h-3 bg-[#171817]/6 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
