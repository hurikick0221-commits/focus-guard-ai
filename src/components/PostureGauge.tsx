'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePoseStore } from '../store/usePoseStore';

export const PostureGauge: React.FC = () => {
    const { status, postureScore, neckRatio, calibrationNeckRatio, calibrate } = usePoseStore();
    const [countdown, setCountdown] = useState<number | null>(null);
    const [justCalibrated, setJustCalibrated] = useState(false);

    const isCalibrating = countdown !== null;

    const startCalibration = useCallback(() => {
        if (status === '미감지') return;
        setCountdown(3);
    }, [status]);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            calibrate();
            setCountdown(null);
            setJustCalibrated(true);
            setTimeout(() => setJustCalibrated(false), 3000);
            return;
        }
        const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
        return () => clearTimeout(t);
    }, [countdown, calibrate]);

    const isTurtle = status === '거북목 주의';
    const gaugeColor = isTurtle ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-[#0d59f2] to-blue-400';

    // 캘리브레이션 대비 현재 변화율 (%)
    const dropPercent = calibrationNeckRatio !== null
        ? Math.max(0, Math.round(((calibrationNeckRatio - neckRatio) / (calibrationNeckRatio || 1)) * 100))
        : null;

    return (
        <section className="px-4 mb-5 space-y-3">

            {/* 캘리브레이션 전 안내 */}
            {calibrationNeckRatio === null && status !== '미감지' && !isCalibrating && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-base shrink-0">info</span>
                    <p className="text-xs text-amber-300">
                        <span className="font-bold">정자세 기준 설정 필요!</span> 아래 버튼을 눌러 기준을 잡아주세요.
                    </p>
                </div>
            )}

            {/* 점수 카드 */}
            <div className={`p-4 rounded-xl border transition-all duration-500 ${isTurtle ? 'border-red-500/50 bg-red-900/10' : 'border-slate-800 bg-slate-800/50'
                }`}>
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-slate-400">실시간 자세 점수</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isTurtle ? 'text-red-400 bg-red-500/15 animate-pulse' :
                        status === '정상' ? 'text-green-400 bg-green-500/10' :
                            'text-slate-400 bg-slate-700'
                        }`}>
                        {isTurtle ? '⚠ 거북목 감지' : status === '정상' ? '✓ 정상' : '감지 중...'}
                    </span>
                </div>

                {/* 큰 점수 숫자 */}
                <div className="flex items-end gap-2 mb-3">
                    <span className={`text-4xl font-bold tabular-nums ${isTurtle ? 'text-red-400' : 'text-white'}`}>
                        {postureScore}
                    </span>
                    <span className="text-slate-500 text-sm mb-1">/ 100</span>
                    {dropPercent !== null && dropPercent > 0 && (
                        <span className={`ml-auto text-sm font-bold ${isTurtle ? 'text-red-400' : 'text-slate-400'}`}>
                            -{dropPercent}%
                        </span>
                    )}
                </div>

                {/* 게이지 바 */}
                <div className="relative h-3 w-full bg-slate-700 rounded-full overflow-hidden mb-1">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${gaugeColor}`}
                        style={{ width: `${postureScore}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 uppercase tracking-wider">
                    <span>나쁨 (0)</span>
                    <span>보통 (50)</span>
                    <span>최적 (100)</span>
                </div>

                {/* 측정값 상세 (작게) */}
                <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-slate-500">목 비율 (현재)</span>
                        <p className="font-mono text-slate-300">{(neckRatio || 0).toFixed(3)}</p>
                    </div>
                    <div>
                        <span className="text-slate-500">기준값</span>
                        <p className="font-mono text-slate-300">{calibrationNeckRatio !== null ? calibrationNeckRatio.toFixed(3) : '—'}</p>
                    </div>
                </div>
            </div>

            {/* 캘리브레이션 버튼 */}
            <div>
                {isCalibrating ? (
                    <div className="text-center py-4 bg-slate-800/50 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 mb-2">바른 자세를 유지하세요...</p>
                        <span className="text-5xl font-bold text-[#0d59f2] animate-ping inline-block">{countdown}</span>
                    </div>
                ) : (
                    <button
                        onClick={startCalibration}
                        disabled={status === '미감지'}
                        className={`w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${calibrationNeckRatio === null
                            ? 'bg-[#0d59f2] hover:bg-blue-500 text-white shadow-lg shadow-[#0d59f2]/20'
                            : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        <span className="material-symbols-outlined text-base">self_improvement</span>
                        {calibrationNeckRatio === null ? '정자세 기준점 설정 (시작)' : '기준점 재설정'}
                    </button>
                )}
                {justCalibrated && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                        <p className="text-xs text-green-400 font-medium">정자세 기준점이 설정되었습니다!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PostureGauge;
