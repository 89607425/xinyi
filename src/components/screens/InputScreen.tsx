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
      <h2 className="text-4xl md:text-5xl font-bold tracking-[0.3em] mb-16 text-center">选择事项并描述问题</h2>

      <div className="grid grid-cols-5 gap-4 md:gap-8 w-full mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`group flex flex-col items-center gap-4 transition-all duration-500 ${
              category === cat.id ? 'transform -translate-y-2' : ''
            }`}
          >
            <div
              className={`w-16 h-24 flex items-center justify-center border-x border-[#171817]/10 transition-colors ${
                category === cat.id ? 'border-secondary/30' : ''
              }`}
            >
              <cat.icon
                size={30}
                className={`transition-colors ${category === cat.id ? 'text-secondary' : 'text-[#171817]/40'}`}
              />
            </div>
            <span className={`text-sm tracking-widest font-medium transition-colors ${category === cat.id ? 'text-secondary' : ''}`}>
              {cat.id}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl text-center">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className="w-full bg-transparent border-0 border-b border-[#171817]/10 focus:ring-0 focus:border-secondary text-center text-xl tracking-[0.1em] py-4 placeholder:text-[#171817]/20 resize-none transition-all duration-700"
          placeholder="例：下周二的面试是否顺利"
          rows={2}
        />

        {warning && <p className="mt-3 text-sm text-secondary">{warning}</p>}

        <div className="mt-12">
          <button
            onClick={onNext}
            className="px-16 py-4 bg-[#171817] text-white text-xl tracking-[0.5em] hover:bg-secondary transition-all duration-500"
          >
            前往起卦
          </button>
        </div>
      </div>
    </motion.div>
  );
}
