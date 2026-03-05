'use client';

import React from 'react';
import { usePoseStore } from '../../store/usePoseStore';
import { StatsGrid } from '../StatsGrid';
import { ActivityTimeline } from '../ActivityTimeline';

export const DashboardTab: React.FC = () => {
    const { totalFocusSeconds, isRunning, toggleRunning } = usePoseStore();

    const formatTime = (s: number) => {
        const h = String(Math.floor(s / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return h === '00' ? `${m}:${sec}` : `${h}:${m}:${sec}`;
    };

    return (
        <div className="flex-1 flex flex-col space-y-6 pt-2 pb-20 fade-in duration-300">
            <div className="px-4">
                {/* 집중 시간 타이머 블록 */}
                <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
                    {/* 장식용 빛 반사 효과 */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0d59f2]/20 rounded-full blur-[50px] pointer-events-none" />
                    <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />

                    <div className="relative z-10 text-center">
                        <p className="text-sm font-semibold text-[#0d59f2] mb-1 uppercase tracking-widest bg-[#0d59f2]/10 inline-block px-3 py-1 rounded-full">
                            현재 집중 세션
                        </p>
                        <h2 className="text-5xl font-bold tracking-tight mb-5 font-mono">
                            {formatTime(totalFocusSeconds)}
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={toggleRunning}
                                disabled={isRunning}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#0d59f2] hover:bg-[#0d59f2]/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#0d59f2]/20 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl">play_arrow</span>
                                <span>시작</span>
                            </button>
                            <button
                                onClick={toggleRunning}
                                disabled={!isRunning}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-bold py-4 rounded-xl transition-all border border-slate-700 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl">pause</span>
                                <span>일시정지</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 대시보드 요약 뷰 */}
            <StatsGrid />
            <ActivityTimeline />
        </div>
    );
};
