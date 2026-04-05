import { Brush, Menu } from 'lucide-react';

export function TopAppBar({
  onMenuClick,
  onBrushClick,
}: {
  onMenuClick?: () => void;
  onBrushClick?: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fcf9f2]/80 backdrop-blur-md flex justify-between items-center px-8 py-6">
      <button onClick={onMenuClick} className="p-2 hover:text-secondary transition-colors">
        <Menu size={24} strokeWidth={1.5} />
      </button>
      <h1 className="text-3xl font-bold tracking-widest leading-relaxed">心易</h1>
      <button onClick={onBrushClick} className="p-2 hover:text-secondary transition-colors">
        <Brush size={24} strokeWidth={1.5} />
      </button>
    </header>
  );
}
