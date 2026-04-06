import { motion } from 'motion/react';
import { BookOpen, Coins, Heart, LayoutGrid, Sparkles } from 'lucide-react';
import type { Category } from '../../types';

const CATEGORIES: { id: Category; icon: typeof BookOpen }[] = [
  { id: '学业功名', icon: BookOpen },
  { id: '事业前程', icon: LayoutGrid },
  { id: '情缘发展', icon: Heart },
  { id: '财运经营', icon: Coins },
  { id: '寻物杂项', icon: Sparkles },
];

export function InputScreen({
  category,
  question,
  onCategoryChange,
  onQuestionChange,
  onNext,
  warning,
}: {
  category: Category;
  question: string;
  onCategoryChange: (value: Category) => void;
  onQuestionChange: (value: string) => void;
  onNext: () => void;
  warning?: string;
}) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col items-center justify-center pt-32 pb-40 px-6 max-w-4xl mx-auto w-full"
    >
      <h2 className="ink-title text-5xl md:text-6xl font-black tracking-[0.3em] mb-20 text-center text-[#171817]">选择事项 描述问题</h2>

      <div className="grid grid-cols-5 gap-4 md:gap-8 w-full mb-14">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: CATEGORIES.indexOf(cat) * 0.05 }}
            onClick={() => onCategoryChange(cat.id)}
            className={`group flex flex-col items-center gap-4 transition-all duration-500 ${
              category === cat.id ? 'transform -translate-y-3' : ''
            }`}
          >
            <div
              className={`w-16 h-24 flex items-center justify-center border-x-2 transition-all duration-300 ${
                category === cat.id ? 'border-[#52B788]/40 bg-[#D8F3DC]/30 shadow-md' : 'border-[#171817]/10 hover:border-[#52B788]/20'
              }`}
            >
              <cat.icon
                size={32}
                className={`transition-colors ${category === cat.id ? 'text-[#52B788]' : 'text-[#171817]/40 group-hover:text-[#171817]/60'}`}
              />
            </div>
            <span className={`text-xs tracking-widest font-bold transition-colors duration-300 ${category === cat.id ? 'text-[#52B788]' : 'text-[#171817]/60'}`}>
              {cat.id}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="w-full max-w-2xl text-center">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-[#171817]/15 focus:ring-0 focus:border-[#52B788] text-center text-xl tracking-[0.1em] py-4 placeholder:text-[#171817]/25 resize-none transition-all duration-500 font-serif"
          placeholder="例：下周二的面试是否顺利"
          rows={2}
        />

        {warning && <p className="mt-4 text-sm text-[#52B788] font-medium">{warning}</p>}

        <div className="mt-14">
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-16 py-4 bg-[#52B788] text-white text-lg tracking-[0.5em] hover:bg-[#40916C] hover:shadow-lg transition-all duration-300 font-bold rounded-lg"
          >
            前往起卦
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
