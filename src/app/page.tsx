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

  const { status, isRunning, incrementFocusTime, tickAwayTime, currentTab } = usePoseStore();
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
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
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
            {currentTab === 'settings' && <SettingsTab />}
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
