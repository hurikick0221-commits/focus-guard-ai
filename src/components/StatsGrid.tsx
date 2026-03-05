import React from 'react';
import { usePoseStore } from '../store/usePoseStore';

interface StatCardProps {
    readonly icon: string;
    readonly iconBg: string;
    readonly iconColor: string;
    readonly label: string;
    readonly value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, iconColor, label, value }) => (
    <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-xs opacity-60">{label}</p>
                <p className="font-bold">{value}</p>
            </div>
        </div>
    </div>
);

export const StatsGrid: React.FC = () => {
    const { totalFocusSeconds, awayCount, totalAwaySeconds, turtleWarnCount } = usePoseStore();

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        if (h > 0) return `${h}시간 ${m}분`;
        return `${m}분`;
    };

    return (
        <section className="px-4 mb-8">
            <h3 className="text-sm font-bold opacity-50 mb-4 px-1 uppercase tracking-wider">오늘의 통계</h3>
            <div className="space-y-3">
                <StatCard
                    icon="timer" iconBg="bg-blue-500/10" iconColor="text-[#0d59f2]"
                    label="총 집중 시간" value={formatTime(totalFocusSeconds)}
                />
                <StatCard
                    icon="person_off" iconBg="bg-orange-500/10" iconColor="text-orange-500"
                    label="이석 횟수" value={`${awayCount}회 ${totalAwaySeconds > 0 ? `(총 ${formatTime(totalAwaySeconds)})` : ''}`}
                />
                <StatCard
                    icon="accessibility_new" iconBg="bg-red-500/10" iconColor="text-red-500"
                    label="자세 경고" value={`${turtleWarnCount}회`}
                />
            </div>
        </section>
    );
};

export default StatsGrid;

