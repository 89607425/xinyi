import { motion } from 'motion/react';
import { History as HistoryIcon, Home, User } from 'lucide-react';
import type { Screen } from '../../types';

export function BottomNavBar({
  currentScreen,
  setScreen,
}: {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const tabs: { id: Screen; label: string; icon: typeof Home }[] = [
    { id: 'start', label: '起卦', icon: Home },
    { id: 'history', label: '历程', icon: HistoryIcon },
    { id: 'profile', label: '个人', icon: User },
  ];

  const isStartFlow = ['input', 'casting', 'result', 'daily'].includes(currentScreen);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-12 py-8 bg-gradient-to-t from-[#fcf9f2]/95 to-[#fcf9f2]/85 backdrop-blur-md border-t-2 border-[#52B788]/15">
      {tabs.map((tab) => {
        const active = currentScreen === tab.id || (tab.id === 'start' && isStartFlow);
        return (
          <motion.button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            whileHover={{ scale: 1.1 }}
            className={`relative flex flex-col items-center justify-center transition-all group ${
              active ? 'text-[#52B788]' : 'text-[#171817]/40 hover:text-[#171817]/60'
            }`}
          >
            <tab.icon
              size={26}
              strokeWidth={active ? 2 : 1.5}
              className={`mb-2 group-hover:scale-110 transition-all ${active ? 'fill-[#52B788]/10' : ''}`}
            />
            <span className="text-xs tracking-widest font-bold">{tab.label}</span>
            {active && (
              <motion.div 
                layoutId="nav-underline" 
                className="absolute -bottom-2 w-8 h-1 bg-gradient-to-r from-[#52B788]/50 to-[#52B788] rounded-full"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
