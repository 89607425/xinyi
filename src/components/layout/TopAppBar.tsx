export function TopAppBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-[#fcf9f2]/95 to-[#fcf9f2]/80 backdrop-blur-md flex justify-center items-center px-8 py-6 border-b border-[#52B788]/10">
      <div className="relative flex items-center gap-2">
        <span className="text-3xl opacity-60">🍃</span>
        <h1 className="ink-title text-4xl font-black tracking-widest text-[#171817]">春风</h1>
        <span className="text-3xl opacity-60">🍃</span>
      </div>
    </header>
  );
}
