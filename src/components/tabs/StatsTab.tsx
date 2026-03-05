'use client';

import React from 'react';
import { StatsGrid } from '../StatsGrid';
import { usePoseStore } from '../../store/usePoseStore';

export const StatsTab: React.FC = () => {
    const { postureScore } = usePoseStore();

    return (
        <div className="flex-1 overflow-y-auto pb-20 fade-in duration-300">
            <div className="px-4 pt-6 pb-4">
                <h2 className="text-2xl font-bold mb-6">통계 리포트</h2>

                {/* 주간 점수 요약 (Mock UI) */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">현재 자세 점수</h3>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-5xl font-bold text-[#0d59f2]">{postureScore}</span>
                        <span className="text-lg opacity-60 mb-1">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mt-4">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-[#0d59f2] rounded-full transition-all duration-500"
                            style={{ width: `${postureScore}%` }}
                        />
                    </div>
                </div>
            </div>

            <StatsGrid />
        </div>
    );
};
