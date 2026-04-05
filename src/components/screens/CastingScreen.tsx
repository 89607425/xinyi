import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function CastingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 6) {
          clearInterval(timer);
          setTimeout(onFinish, 800);
          return 6;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6"
    >
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-16">
        <div className="absolute inset-0 rounded-full bg-stone-200/40 blur-3xl scale-110" />
        <motion.img
          animate={{ rotate: [0, -5, 5, -5, 0], x: [0, -2, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxXfCFcMXb6tse8HkH2mXMvvkzBJaDVNK-sV-OuXQsknZjKoNrCiOvvSx8ayMpgmZmDdlxLqiL1pWqf3nD0hRY4dXjI_ImaBBrnWSMRxGnlwp-CDC7hGxklsdZ5TIMBtnGNipTxMjM-mLVoLtIjpkRztsVi9wrOMDTTTw5i2oHWdieRVkqotUaHNiQQxyfkNMybvzDLgfwDoD9s7lXqThU3PJubmKex8bxkpkOydt7Ol1O1dFfO432FdQuw-T7NcCQZVdXhhMBTenK"
          alt="Plate"
          className="w-full h-full object-contain relative z-10 brightness-95 contrast-110 drop-shadow-2xl"
        />
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <p className="text-[#171817]/40 tracking-[0.5em] text-sm mb-2">沉浸其中</p>
          <h2 className="text-3xl font-bold tracking-widest">摇动心念...</h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-[#171817]/40 mb-2">卦象进度</div>
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-8 h-1 transition-colors duration-500 ${i < progress ? 'bg-secondary' : 'bg-[#171817]/10'}`} />
            ))}
          </div>
          <div className="mt-4 text-xl font-bold text-secondary">
            {progress === 0 ? '准备中' : progress === 6 ? '卦象已成' : `第${['一', '二', '三', '四', '五', '六'][progress - 1]}爻`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
