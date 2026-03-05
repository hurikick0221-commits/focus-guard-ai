'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePoseStore, SENSITIVITY_THRESHOLDS } from '../store/usePoseStore';

type PoseLandmark = { x: number; y: number; z: number; visibility?: number };
type Results = { poseLandmarks?: PoseLandmark[] };
type PoseInstance = {
    setOptions: (opts: Record<string, unknown>) => void;
    onResults: (callback: (results: Results) => void) => void;
    send: (data: { image: HTMLVideoElement }) => Promise<void>;
    close: () => void;
};

// 롤링 평균 계산기
class RollingAverage {
    private values: number[] = [];
    constructor(private readonly size: number) { }
    add(v: number) {
        this.values.push(v);
        if (this.values.length > this.size) this.values.shift();
    }
    get avg() {
        if (this.values.length === 0) return 0;
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }
    get isFull() { return this.values.length >= this.size; }
}

export const usePoseDetection = (videoElement: HTMLVideoElement | null) => {
    const poseRef = useRef<PoseInstance | null>(null);
    const requestRef = useRef<number | null>(null);
    const rollingRef = useRef(new RollingAverage(20)); // 20프레임 평균
    const { setStatus, setNeckRatio, setLandmarks, setPostureScore, calibrationNeckRatio, sensitivity, logActivity, resetCurrentAwayTime } = usePoseStore();
    const prevStatusRef = useRef<string>('미감지');

    const updateStatus = useCallback((newStatus: '정상' | '거북목 주의' | '미감지') => {
        if (prevStatusRef.current !== newStatus) {
            if (newStatus === '거북목 주의') logActivity('turtle');
            else if (newStatus === '미감지') logActivity('away');
            else if (prevStatusRef.current === '미감지' && (newStatus === '정상' || newStatus === '거북목 주의')) {
                logActivity('return');
                resetCurrentAwayTime();
            }

            prevStatusRef.current = newStatus;
            setStatus(newStatus);
        }
    }, [logActivity, resetCurrentAwayTime, setStatus]);

    const onResults = useCallback((results: Results) => {
        if (!results.poseLandmarks || results.poseLandmarks.length < 25) {
            updateStatus('미감지');
            setLandmarks([]);
            return;
        }

        const lm = results.poseLandmarks;
        setLandmarks(lm);

        const nose = lm[0];
        const leftEar = lm[7];
        const rightEar = lm[8];
        const leftShoulder = lm[11];
        const rightShoulder = lm[12];

        // ── 핵심 지표 1: 목 길이 비율 (정면 카메라 최적) ──
        // 어깨 중심 y좌표와 코/귀 y좌표의 차이를 어깨 너비로 나눔
        // 정상 자세에서 이 값이 크고, 거북목이면 줄어듦
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        const earMidY = (leftEar.y + rightEar.y) / 2;
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

        // 어깨폭이 너무 작으면(측면 또는 너무 멀리 있는 경우) 신뢰도 낮음
        if (shoulderWidth < 0.05) {
            updateStatus('미감지');
            return;
        }

        // neckRatio = (어깨Y - 귀Y) / 어깨폭 → 클수록 좋은 자세
        const neckYDist = shoulderMidY - earMidY;
        const neckRatioRaw = neckYDist / shoulderWidth;

        // ── 핵심 지표 2: Z축 보조 지표 ──
        const shoulderZ = (leftShoulder.z + rightShoulder.z) / 2;
        const noseZ = nose.z;
        const zDelta = (shoulderZ - noseZ) / shoulderWidth; // 어깨폭으로 정규화

        // ── 복합 지표: 60% 목 길이 + 40% Z축 ──
        const compositeRaw = neckRatioRaw * 0.6 + zDelta * 0.4;

        // 롤링 평균 적용
        rollingRef.current.add(compositeRaw);
        const smoothed = rollingRef.current.avg;
        setNeckRatio(smoothed);

        // ── 자세 점수 계산 (캘리브레이션 기준) ──
        if (calibrationNeckRatio !== null) {
            const thresholds = SENSITIVITY_THRESHOLDS[sensitivity];
            const dropRatio = (calibrationNeckRatio - smoothed) / (calibrationNeckRatio || 1);

            // 점수: 0~100 (100이 최적)
            const score = Math.max(0, Math.min(100, 100 - (dropRatio / thresholds.warn) * 100));
            setPostureScore(Math.round(score));

            // 이력현상(Hysteresis): warn임계 초과 시 경고, clear임계 이내일 때 해제
            const currentStatus = prevStatusRef.current;
            if (currentStatus === '거북목 주의') {
                // 경고 해제 조건: 기준값 대비 낙차가 clear 임계 이하
                if (dropRatio < thresholds.clear) {
                    updateStatus('정상');
                }
            } else {
                // 경고 진입 조건: 기준값 대비 낙차가 warn 임계 초과
                if (dropRatio > thresholds.warn && rollingRef.current.isFull) {
                    updateStatus('거북목 주의');
                } else {
                    updateStatus('정상');
                }
            }
        } else {
            // 캘리브레이션 전: 절대값 기준 간단 판별 (대략적 기준)
            updateStatus(neckRatioRaw < 0.4 ? '거북목 주의' : '정상');
            setPostureScore(Math.max(0, Math.min(100, Math.round(neckRatioRaw * 100))));
        }
    }, [calibrationNeckRatio, sensitivity, setLandmarks, setNeckRatio, setPostureScore, updateStatus]);

    useEffect(() => {
        let cancelled = false;
        const initPose = async () => {
            const { Pose } = await import('@mediapipe/pose');
            if (cancelled) return;
            const pose = new Pose({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });
            pose.setOptions({
                modelComplexity: 2,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
            pose.onResults(onResults);
            poseRef.current = pose as unknown as PoseInstance;
        };
        initPose();
        return () => { cancelled = true; poseRef.current?.close(); };
    }, [onResults]);

    const detect = useCallback(async () => {
        if (videoElement && poseRef.current && videoElement.readyState >= 2) {
            await poseRef.current.send({ image: videoElement });
        }
        requestRef.current = requestAnimationFrame(detect);
    }, [videoElement]);

    useEffect(() => {
        if (!videoElement) return;
        requestRef.current = requestAnimationFrame(detect);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [videoElement, detect]);

    return { isReady: !!poseRef.current };
};
