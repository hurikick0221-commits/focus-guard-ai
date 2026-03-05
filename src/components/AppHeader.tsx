import React from 'react';

interface AppHeaderProps {
    readonly notificationCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ notificationCount = 0 }) => (
    <header className="flex items-center justify-between p-4 bg-[#101622] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#0d59f2]">
            <span className="material-symbols-outlined text-3xl">visibility</span>
            <h1 className="text-xl font-bold tracking-tight font-display">FocusGuard AI</h1>
        </div>
        <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-slate-100">notifications</span>
                {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
                )}
            </button>
            <div className="size-8 rounded-full bg-[#0d59f2]/20 flex items-center justify-center border border-[#0d59f2]/40">
                <span className="material-symbols-outlined text-[#0d59f2] text-xl">person</span>
            </div>
        </div>
    </header>
);

export default AppHeader;
