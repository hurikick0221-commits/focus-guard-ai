'use client';

import React from 'react';
import { usePoseStore } from '../../store/usePoseStore';

export const HistoryTab: React.FC = () => {
    const { activities } = usePoseStore();

    return (
        <div className="flex-1 overflow-y-auto pb-20 fade-in duration-300">
            <div className="px-4 pt-6 pb-4">
                <h2 className="text-2xl font-bold mb-6">활동 기록</h2>

                <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
                    {activities.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            저장된 활동 기록이 없습니다.
                        </div>
                    ) : (
                        activities.map((item, i) => {
                            const isLast = i === activities.length - 1;
                            return (
                                <div key={item.id} className={`p-4 flex gap-4 items-start ${!isLast ? 'border-b border-slate-800' : ''}`}>
                                    <span className="text-[10px] font-mono opacity-40 mt-1 shrink-0">{item.time}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs opacity-50">{item.description}</p>
                                    </div>
                                    <span className={`material-symbols-outlined text-sm ${item.iconColor}`}>{item.icon}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
