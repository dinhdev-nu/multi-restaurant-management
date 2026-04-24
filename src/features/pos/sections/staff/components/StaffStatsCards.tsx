import React from 'react';
import Icon from '../../../components/AppIcon';

interface StaffStats {
    total: number;
    active: number;
    onLeave: number;
    terminated: number;
}

interface StaffStatsCardsProps {
    stats: StaffStats;
}

const StaffStatsCards: React.FC<StaffStatsCardsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon name="Users" size={20} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-card-foreground">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <Icon name="UserCheck" size={20} className="text-success" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-card-foreground">{stats.active}</p>
                        <p className="text-sm text-muted-foreground">Đang làm việc (trang này)</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                        <Icon name="UserX" size={20} className="text-warning" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-card-foreground">{stats.onLeave}</p>
                        <p className="text-sm text-muted-foreground">Đang nghỉ (trang này)</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-error/10">
                        <Icon name="UserMinus" size={20} className="text-error" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-card-foreground">{stats.terminated}</p>
                        <p className="text-sm text-muted-foreground">Đã nghỉ việc (trang này)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffStatsCards;
