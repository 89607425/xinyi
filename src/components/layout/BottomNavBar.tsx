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
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-12 py-8 bg-[#fcf9f2]/85 backdrop-blur-md border-t border-[#171817]/5">
      {tabs.map((tab) => {
        const active = currentScreen === tab.id || (tab.id === 'start' && isStartFlow);
        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`relative flex flex-col items-center justify-center transition-all group ${
              active ? 'text-secondary' : 'text-[#171817]/40'
            }`}
          >
            <tab.icon
              size={24}
              strokeWidth={active ? 2 : 1.5}
              className={`mb-1 group-hover:scale-110 transition-transform ${active ? 'fill-secondary/10' : ''}`}
            />
            <span className="text-sm tracking-widest font-medium">{tab.label}</span>
            {active && (
              <motion.div layoutId="nav-underline" className="absolute -bottom-1 w-8 h-0.5 bg-secondary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
