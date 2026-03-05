// Stitch 대시보드 디자인 기반 Mock 데이터
// Source: FocusGuard AI 모바일 대시보드 (Stitch Project)

export interface ActivityItem {
    time: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
}

export interface StatItem {
    icon: string;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string;
    change: string;
    changeColor: string;
}

export interface NavItem {
    icon: string;
    label: string;
    active?: boolean;
}

export const stats: StatItem[] = [
    {
        icon: 'timer',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        label: '총 집중 시간',
        value: '5시간 24분',
        change: '+12%',
        changeColor: 'text-green-500',
    },
    {
        icon: 'person_off',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        label: '이석 횟수',
        value: '3회',
        change: '-1회',
        changeColor: 'text-slate-400',
    },
    {
        icon: 'accessibility_new',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
        label: '자세 경고',
        value: '12회',
        change: '+4회',
        changeColor: 'text-red-500',
    },
];

export const activities: ActivityItem[] = [
    {
        time: '14:32',
        title: '거북목 자세 감지됨',
        description: '스트레칭이 필요합니다.',
        icon: 'warning',
        iconColor: 'text-red-500',
    },
    {
        time: '14:10',
        title: '자리에 돌아옴',
        description: '집중 세션을 다시 시작합니다.',
        icon: 'check_circle',
        iconColor: 'text-green-500',
    },
    {
        time: '14:02',
        title: '이석 감지',
        description: '자리를 비운 것으로 파악됩니다.',
        icon: 'logout',
        iconColor: 'text-orange-500',
    },
];

export const navItems: NavItem[] = [
    { icon: 'dashboard', label: '대시보드', active: true },
    { icon: 'bar_chart', label: '통계' },
    { icon: 'history', label: '기록' },
    { icon: 'settings', label: '설정' },
];
