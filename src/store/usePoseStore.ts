import { create } from 'zustand';

export type PoseStatus = '정상' | '거북목 주의' | '미감지';
export type Sensitivity = 'low' | 'medium' | 'high';

export interface PoseLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export interface ActivityLog {
    id: string;
    time: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
}

export const SENSITIVITY_THRESHOLDS: Record<Sensitivity, { warn: number; clear: number }> = {
    low: { warn: 0.18, clear: 0.10 },
    medium: { warn: 0.12, clear: 0.07 },
    high: { warn: 0.07, clear: 0.04 },
};

interface PoseState {
    // 핵심 상태
    status: PoseStatus;
    sensitivity: Sensitivity;
    neckRatio: number;
    calibrationNeckRatio: number | null;
    postureScore: number;
    landmarks: PoseLandmark[];
    showVideo: boolean;

    // 통계 필드
    totalFocusSeconds: number;
    totalAwaySeconds: number;
    currentAwaySeconds: number; // 현재 세션 중 비운 시간
    awayCount: number;
    turtleWarnCount: number;

    // 네비게이션 탭
    currentTab: 'dashboard' | 'stats' | 'history' | 'settings';

    // 타임라인
    activities: ActivityLog[];

    // 타이머 상태
    isRunning: boolean;

    // 기본 액션
    setStatus: (status: PoseStatus) => void;
    setSensitivity: (s: Sensitivity) => void;
    setNeckRatio: (ratio: number) => void;
    setLandmarks: (landmarks: PoseLandmark[]) => void;
    setPostureScore: (score: number) => void;
    toggleVideo: () => void;
    calibrate: () => void;
    reset: () => void;
    setCurrentTab: (tab: 'dashboard' | 'stats' | 'history' | 'settings') => void;

    // 연동(통계/타이머) 액션
    toggleRunning: () => void;
    incrementFocusTime: () => void;
    tickAwayTime: () => void;
    resetCurrentAwayTime: () => void;
    logActivity: (type: 'turtle' | 'away' | 'return') => void;

    // PWA 관련 액션
    installPrompt: any;
    setInstallPrompt: (prompt: any) => void;
    triggerInstall: () => void;

    // 데이터 초기화 액션
    resetStats: () => void;
    resetHistory: () => void;
}

const createActivity = (type: 'turtle' | 'away' | 'return'): ActivityLog => {
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);

    if (type === 'turtle') {
        return { id, time, title: '거북목 자세 감지됨', description: '가슴을 펴고 턱을 당겨주세요.', icon: 'warning', iconColor: 'text-red-500' };
    }
    if (type === 'away') {
        return { id, time, title: '이석 감지', description: '자리를 비운 것으로 파악됩니다.', icon: 'logout', iconColor: 'text-orange-500' };
    }
    return { id, time, title: '자리에 돌아옴', description: '집중 세션을 다시 이어갑니다.', icon: 'check_circle', iconColor: 'text-green-500' };
};

export const usePoseStore = create<PoseState>((set, get) => ({
    status: '미감지',
    sensitivity: 'medium',
    neckRatio: 0,
    calibrationNeckRatio: null,
    postureScore: 100,
    landmarks: [],
    showVideo: true,

    totalFocusSeconds: 0,
    totalAwaySeconds: 0,
    currentAwaySeconds: 0,
    awayCount: 0,
    turtleWarnCount: 0,
    activities: [],
    isRunning: false,
    currentTab: 'dashboard',
    installPrompt: null,

    setStatus: (status) => set({ status }),
    setSensitivity: (sensitivity) => set({ sensitivity }),
    setNeckRatio: (neckRatio) => set({ neckRatio }),
    setLandmarks: (landmarks) => set({ landmarks }),
    setPostureScore: (postureScore) => set({ postureScore }),
    toggleVideo: () => set((state) => ({ showVideo: !state.showVideo })),
    setCurrentTab: (tab) => set({ currentTab: tab }),

    setInstallPrompt: (prompt) => set({ installPrompt: prompt }),
    triggerInstall: async () => {
        const prompt = get().installPrompt;
        if (prompt) {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === 'accepted') {
                set({ installPrompt: null });
            }
        }
    },

    calibrate: () => set((state) => ({ calibrationNeckRatio: state.neckRatio })),
    reset: () => set({
        status: '미감지', neckRatio: 0, calibrationNeckRatio: null, postureScore: 100, landmarks: [],
        totalFocusSeconds: 0, totalAwaySeconds: 0, currentAwaySeconds: 0, awayCount: 0, turtleWarnCount: 0, activities: [], isRunning: false
    }),

    toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
    incrementFocusTime: () => set((state) => ({ totalFocusSeconds: state.totalFocusSeconds + 1 })),
    tickAwayTime: () => set((state) => ({
        totalAwaySeconds: state.totalAwaySeconds + 1,
        currentAwaySeconds: state.currentAwaySeconds + 1
    })),
    resetCurrentAwayTime: () => set({ currentAwaySeconds: 0 }),

    logActivity: (type) => set((state) => {
        // 50개까지만 타임라인 유지 (최신순)
        const newActivity = createActivity(type);
        const updatedActivities = [newActivity, ...state.activities].slice(0, 50);

        return {
            activities: updatedActivities,
            awayCount: type === 'away' ? state.awayCount + 1 : state.awayCount,
            turtleWarnCount: type === 'turtle' ? state.turtleWarnCount + 1 : state.turtleWarnCount,
        };
    }),

    resetStats: () => set({
        totalFocusSeconds: 0,
        totalAwaySeconds: 0,
        currentAwaySeconds: 0,
        awayCount: 0,
        turtleWarnCount: 0,
        postureScore: 100
    }),

    resetHistory: () => set({ activities: [] }),
}));
