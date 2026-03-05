import React from 'react';
import { navItems } from '../data/mockData';
import { usePoseStore } from '../store/usePoseStore';

export const BottomNav: React.FC = () => {
    const { currentTab, setCurrentTab } = usePoseStore();

    // mockData의 label과 currentTab을 매핑
    const getTabName = (label: string): 'dashboard' | 'stats' | 'history' | 'settings' => {
        switch (label) {
            case '대시보드': return 'dashboard';
            case '통계': return 'stats';
            case '기록': return 'history';
            case '설정': return 'settings';
            default: return 'dashboard';
        }
    };

    return (
        <nav className="bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="flex justify-around p-3">
                {navItems.map((item) => {
                    const tabName = getTabName(item.label);
                    const isActive = currentTab === tabName;
                    return (
                        <button
                            key={item.label}
                            onClick={() => setCurrentTab(tabName)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-[#0d59f2]' : 'text-slate-500 hover:bg-slate-800/50'}`}
                        >
                            <span className={`material-symbols-outlined text-xl ${isActive ? 'filled' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
