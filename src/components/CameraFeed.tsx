'use client';

import React from 'react';
import { usePoseStore } from '../store/usePoseStore';

interface CameraFeedProps {
    readonly videoRef: React.RefObject<HTMLVideoElement | null>;
}

const POSE_CONNECTIONS: [number, number][] = [
    [11, 12], // 어깨
    [11, 13], [13, 15], // 왼팔
    [12, 14], [14, 16], // 오른팔
    [11, 23], [12, 24], // 몸통
    [23, 24], // 허리
    [0, 11], [0, 12], // 코-어깨 (거북목 핵심)
];

const toSvg = (x: number, y: number) => ({ cx: x * 160, cy: y * 90 });

export const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef }) => {
    const { status, postureScore, landmarks, showVideo } = usePoseStore();

    const isTurtle = status === '거북목 주의';
    const hasLandmarks = landmarks.length > 24;

    const skeletonColor = isTurtle ? '#ef4444' : '#3b82f6';
    const neckLineColor = isTurtle ? '#ff2222' : '#60a5fa';

    return (
        <section className="px-4 pt-4">
            <div className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border-2 shadow-2xl transition-all duration-500 ${isTurtle
                ? 'border-red-500 shadow-red-900/50'
                : 'border-slate-800 shadow-black/50'
                }`}>
                {/* 웹캠 (showVideo가 false면 투명화하여 스켈레톤만 보이게 함) */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'
                        }`}
                />

                {/* AI 포즈 스켈레톤 (실시간) */}
                {hasLandmarks && (
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
                            {POSE_CONNECTIONS.map(([a, b]) => {
                                const la = landmarks[a];
                                const lb = landmarks[b];
                                if (!la || !lb) return null;
                                const pa = toSvg(la.x, la.y);
                                const pb = toSvg(lb.x, lb.y);
                                // 코-어깨 연결선은 더 굵게 강조
                                const isNeckLine = (a === 0 && (b === 11 || b === 12));
                                return (
                                    <line
                                        key={`${a}-${b}`}
                                        x1={pa.cx} y1={pa.cy} x2={pb.cx} y2={pb.cy}
                                        stroke={isNeckLine ? neckLineColor : skeletonColor}
                                        strokeWidth={isNeckLine ? (isTurtle ? 3 : 2) : 1.5}
                                        strokeOpacity={isNeckLine ? 1 : 0.8}
                                    />
                                );
                            })}
                            {/* 관절 포인트 */}
                            {[0, 11, 12, 13, 14, 15, 16, 23, 24].map((idx) => {
                                const lm = landmarks[idx];
                                if (!lm) return null;
                                const { cx, cy } = toSvg(lm.x, lm.y);
                                return (
                                    <circle
                                        key={idx}
                                        cx={cx} cy={cy}
                                        r={idx === 0 ? (isTurtle ? 4 : 3) : (isTurtle ? 2.5 : 2)}
                                        fill={idx === 0 ? (isTurtle ? '#ff4444' : '#ffffff') : skeletonColor}
                                        fillOpacity="0.95"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                )}

                {/* 거북목 경고 전체 오버레이 */}
                {isTurtle && (
                    <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
                )}

                {/* LIVE 인디케이터 */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                    <span className="size-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-white tracking-widest">LIVE</span>
                </div>

                {/* 거북목 경고 오버레이 레이블 */}
                {isTurtle && (
                    <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        거북목 감지
                    </div>
                )}

                {/* Focus Score */}
                {!isTurtle && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-white">
                        <span className="text-slate-400">집중도: </span>
                        <span className="text-[#3b82f6] font-bold">{postureScore}%</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CameraFeed;
