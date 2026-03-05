'use client';

import React, { useEffect, useState } from 'react';
import { usePoseStore } from '../store/usePoseStore';

export const AwayPopup: React.FC = () => {
    const { status, isRunning, currentAwaySeconds } = usePoseStore();
    const [isVisible, setIsVisible] = useState(false);

    // 약간의 디바운스: 미감지가 2초 이상 유지될 때만 팝업 표시
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === '미감지' && isRunning) {
            timer = setTimeout(() => setIsVisible(true), 2000);
        } else {
            setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [status, isRunning]);

    if (!isVisible) return null;

    const formatAwayTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        if (m > 0) return `${m}분 ${sec}초`;
        return `${sec}초`;
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-orange-500/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl shadow-orange-900/20">
                <div className="size-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <span className="material-symbols-outlined text-4xl">logout</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">이석 감지</h3>
                <p className="text-sm text-slate-400 mb-6">
                    자리를 비우신 지<br />
                    <span className="text-2xl font-bold text-orange-400 font-mono tracking-widest block mt-2">
                        {formatAwayTime(currentAwaySeconds)}
                    </span>
                    <span className="opacity-60 text-xs mt-1 block">지났습니다.</span>
                </p>
                <div className="text-xs text-slate-500 bg-slate-800 rounded-lg p-3">
                    카메라 앞으로 돌아오시면<br />자동으로 집중 세션이 재개됩니다.
                </div>
            </div>
        </div>
    );
};

export default AwayPopup;
