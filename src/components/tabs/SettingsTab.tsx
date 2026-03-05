'use client';

import React from 'react';
import { usePoseStore, Sensitivity } from '../../store/usePoseStore';

export const SettingsTab: React.FC = () => {
    const {
        sensitivity, setSensitivity,
        showVideo, toggleVideo,
        resetStats, resetHistory,
        triggerInstall, installPrompt
    } = usePoseStore();

    return (
        <div className="flex-1 overflow-y-auto pb-20 fade-in duration-300">
            <div className="px-4 pt-6 pb-4">
                <h2 className="text-2xl font-bold mb-6">설정</h2>

                {/* 앱 설치 유도 섹션 */}
                {installPrompt ? (
                    <div className="mb-6 bg-[#0d59f2]/10 border border-[#0d59f2]/20 rounded-2xl p-5 fade-in">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#0d59f2] p-3 rounded-xl shadow-lg shadow-[#0d59f2]/30">
                                <span className="material-symbols-outlined text-white text-2xl">install_mobile</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">앱으로 설치하기</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                    홈 화면에 추가하면 브라우저 없이 더 빠르고 쾌적하게 FocusGuard를 이용할 수 있습니다.
                                </p>
                                <button
                                    onClick={triggerInstall}
                                    className="w-full bg-[#0d59f2] hover:bg-[#0d59f2]/90 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>지금 바로 설치</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 프롬프트가 없는 경우 (iOS 또는 이미 설치됨) 안내 메시지 표시 */
                    <div className="mb-6 bg-slate-800/20 border border-slate-800 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="bg-slate-700 p-3 rounded-xl">
                                <span className="material-symbols-outlined text-slate-300 text-2xl">info</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1 text-slate-200">간편하게 설치하는 법</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    브라우저 메뉴에서 <span className="text-[#0d59f2] font-semibold">"홈 화면에 추가"</span>를 눌러보세요! 바탕화면에 진짜 앱처럼 아이콘이 생깁니다.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">

                    {/* 민감도 설정 */}
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-semibold">거북목 감지 민감도</h3>
                                <p className="text-xs text-slate-500 mt-1">알림이 울리는 기준을 선택하세요.</p>
                            </div>
                            <span className="material-symbols-outlined text-[#0d59f2]">tune</span>
                        </div>
                        <div className="flex bg-slate-900/50 rounded-lg p-1">
                            {(['low', 'medium', 'high'] as Sensitivity[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSensitivity(level)}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${sensitivity === level
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    {level === 'low' ? '둔감' : level === 'medium' ? '보통' : '민감'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 스켈레톤 전용 모드 */}
                    <div className="p-5 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-semibold">스켈레톤 전용 모드</h3>
                            <p className="text-xs text-slate-500 mt-1">실제 카메라 화상을 숨깁니다.</p>
                        </div>
                        <button
                            onClick={toggleVideo}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!showVideo ? 'bg-[#0d59f2]' : 'bg-slate-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!showVideo ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* 알림 설정 Placeholder */}
                    <div className="p-5 flex justify-between items-center opacity-50 pointer-events-none border-b border-slate-800/50">
                        <div>
                            <h3 className="text-sm font-semibold">사운드 알림</h3>
                            <p className="text-xs text-slate-500 mt-1">거북목 경고 시 소리 재생 (준비 중)</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-slate-400 translate-x-1" />
                        </button>
                    </div>

                    {/* 데이터 관리 */}
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">delete_forever</span>데이터 관리</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    if (window.confirm('모든 통계 기록(집중 시간, 이석 횟수 등)을 초기화하시겠습니까?')) {
                                        resetStats();
                                    }
                                }}
                                className="w-full text-left text-xs font-semibold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20 flex justify-between items-center"
                            >
                                <span>기록 통계 초기화</span>
                                <span className="text-[10px] opacity-60 font-normal">누적된 집중 및 이석 시간 등을 리셋합니다.</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('활동 타임라인의 모든 기록을 삭제하시겠습니까?')) {
                                        resetHistory();
                                    }
                                }}
                                className="w-full text-left text-xs font-semibold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20 flex justify-between items-center"
                            >
                                <span>활동 타임라인 초기화</span>
                                <span className="text-[10px] opacity-60 font-normal">저장된 상태 변경 기록을 모두 삭제합니다.</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
