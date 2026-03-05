'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CameraFeed } from '@/components/CameraFeed';
import { PostureGauge } from '@/components/PostureGauge';
import { BottomNav } from '@/components/BottomNav';
import { AwayPopup } from '@/components/AwayPopup';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { HistoryTab } from '@/components/tabs/HistoryTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { usePoseStore } from '@/store/usePoseStore';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { status, isRunning, incrementFocusTime, tickAwayTime, currentTab, setInstallPrompt } = usePoseStore();
  usePoseDetection(videoRef.current);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      })
      .catch(() => setHasPermission(false));
  }, []);

  const tick = useCallback(() => {
    // 미감지(이석) 상태에서는 집중 시간이 오르지 않고 이석 시간이 오름
    const currentStatus = usePoseStore.getState().status;
    if (currentStatus === '미감지') {
      tickAwayTime();
    } else {
      incrementFocusTime();
    }
  }, [incrementFocusTime, tickAwayTime]);

  useEffect(() => {
    // PWA 설치 프롬프트 구독
    const handlePwaReady = () => {
      const prompt = (window as any).deferredPrompt;
      setInstallPrompt(prompt);
    };

    // 이미 이벤트가 발생했을 수 있으므로 체크
    if ((window as any).deferredPrompt) {
      handlePwaReady();
    }

    window.addEventListener('pwa-install-ready', handlePwaReady);

    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('pwa-install-ready', handlePwaReady);
    };
  }, [isRunning, tick]);
  const formatTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    /* 
      모바일 컨테이너 안에서 스크롤되도록 flex-col + overflow-hidden 사용.
      fixed 대신 sticky/absolute를 사용하여 컨테이너를 벗어나지 않도록 함.
    */
    <div className="flex flex-col h-screen overflow-hidden bg-[#101622] text-slate-100">

      {/* 헤더 (상단 고정) */}
      <AppHeader notificationCount={status === '거북목 주의' ? 1 : 0} />

      {/* 스크롤 가능한 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto pb-4">
        {hasPermission === false ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
              videocam_off
            </span>
            <h2 className="text-lg font-semibold mb-2">카메라 권한이 필요합니다</h2>
            <p className="text-slate-400 text-sm">브라우저 설정에서 카메라 접근을 허용해 주세요.</p>
          </div>
        ) : (
          <>
            {/* 카메라 피드는 탭 상관없이 돔에 유지시켜 백그라운드 AI 추적 원활하게 */}
            <div className={currentTab === 'dashboard' ? 'block' : 'hidden'}>
              <div className="flex flex-col">
                <CameraFeed videoRef={videoRef} />
                <PostureGauge />
              </div>
            </div>

            {currentTab === 'dashboard' && <DashboardTab />}
            {currentTab === 'stats' && <StatsTab />}
            {currentTab === 'history' && <HistoryTab />}
            {currentTab === 'settings' && (
              <SettingsTab>
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
                  /* 프롬프트가 없는 경우 (iOS 등) 안내 메시지 표시 */
                  <div className="mb-6 bg-slate-800/20 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-700 p-3 rounded-xl">
                        <span className="material-symbols-outlined text-slate-300 text-2xl">info</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 text-slate-200">간편하게 설치하는 법</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          브라우저 메뉴에서 <span className="text-[#0d59f2] font-bold">"홈 화면에 추가"</span>를 누르시면 진짜 앱처럼 바탕화면에 아이콘이 생깁니다!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SettingsTab>
            )}
          </>
        )}
      </main>

      {/* 거북목 알림 토스트 */}
      {status === '거북목 주의' && (
        <div className="mx-3 mb-2 bg-red-600 text-white px-4 py-3 rounded-2xl flex items-center gap-3 border border-red-400/50 shrink-0"
          style={{ animation: 'shake 0.4s ease-in-out' }}>
          <span className="material-symbols-outlined text-2xl shrink-0 animate-bounce">warning</span>
          <div className="flex-1">
            <p className="font-bold text-sm">⚠ 거북목 자세 감지!</p>
            <p className="text-xs opacity-90">가슴을 펴고 턱을 당겨주세요.</p>
          </div>
          <span className="text-xs opacity-70 font-mono">{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      {/* 이석 감지 팝업 */}
      <AwayPopup />

      {/* 하단 네비게이션 (컨테이너 안에, fixed 미사용) */}
      <BottomNav />
    </div>
  );
}
