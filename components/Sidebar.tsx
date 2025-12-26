import React from 'react';

interface SidebarProps {
  activeTab: 'cards' | 'create' | 'call' | 'credits' | 'saves';
  onTabChange: (tab: 'cards' | 'create' | 'call' | 'credits' | 'saves') => void;
  onLogout: () => void;
  credits: number;
  hasNewRecording?: boolean;
}

const menuItems = [
  { id: 'cards' as const, label: 'Cards', icon: '◈' },
  { id: 'saves' as const, label: 'Saves', icon: '◉' },
  { id: 'create' as const, label: 'Config', icon: '⚡' },
  { id: 'call' as const, label: 'Call', icon: '◎' },
  { id: 'credits' as const, label: 'Créditos', icon: '◆' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, credits, hasNewRecording }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-52 h-full bg-gradient-to-b from-orange-50/80 via-rose-50/80 to-red-100/80 backdrop-blur-sm flex-col border-r border-orange-200/50">
        {/* Logo */}
        <div className="p-4 text-center">
          <h1 
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 tracking-tight" 
            style={{ fontFamily: 'cursive' }}
          >
            DR.ia
          </h1>
          <p className="text-rose-400 text-[8px] uppercase font-medium tracking-widest mt-0.5 opacity-80">
            Seu Simulado de Treta
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-md'
                  : 'text-rose-600 hover:bg-white/70'
              }`}
            >
              <span className="text-base opacity-80">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'credits' && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === item.id ? 'bg-white/30 text-white' : 'bg-orange-200 text-rose-600'
                }`}>
                  {credits}
                </span>
              )}
              {item.id === 'saves' && hasNewRecording && (
                <span className="ml-auto bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                  NEW
                </span>
              )}
            </button>
          ))}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-100/50 transition-all duration-200 mt-2"
          >
            <span className="text-base opacity-80">↪</span>
            <span>Sair</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-3 text-center opacity-50">
          <div className="flex justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-rose-300 text-[8px]">●</span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-orange-100 z-50">
        <nav className="flex justify-around items-center py-1.5 px-1">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'text-rose-500'
                  : 'text-rose-300'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-rose-300"
          >
            <span className="text-lg">↪</span>
            <span className="text-[9px] font-medium">Sair</span>
          </button>
        </nav>
      </div>
    </>
  );
};
