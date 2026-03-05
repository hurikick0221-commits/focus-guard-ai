import React from 'react';
import { usePoseStore, ActivityLog } from '../store/usePoseStore';

interface ActivityRowProps {
    readonly item: ActivityLog;
    readonly isLast: boolean;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ item, isLast }) => (
    <div className={`p-4 flex gap-4 items-start ${!isLast ? 'border-b border-slate-800' : 'bg-slate-900/20'}`}>
        <span className="text-[10px] font-mono opacity-40 mt-1 shrink-0">{item.time}</span>
        <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs opacity-50">{item.description}</p>
        </div>
        <span className={`material-symbols-outlined text-sm ${item.iconColor}`}>{item.icon}</span>
    </div>
);

export const ActivityTimeline: React.FC = () => {
    const { activities } = usePoseStore();
    const displayActivities = activities.slice(0, 3); // 최근 3개만 표시

    return (
        <section className="px-4 pb-4">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider">활동 타임라인</h3>
                <button className="text-xs text-[#0d59f2] font-bold">전체보기 ({activities.length})</button>
            </div>
            <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
                {displayActivities.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                        최근 감지된 활동이 없습니다.
                    </div>
                ) : (
                    displayActivities.map((item, i) => (
                        <ActivityRow key={item.id} item={item} isLast={i === displayActivities.length - 1} />
                    ))
                )}
            </div>
        </section>
    );
};

export default ActivityTimeline;

