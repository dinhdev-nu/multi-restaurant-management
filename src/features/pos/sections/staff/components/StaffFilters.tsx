import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/Select';
import Button from '../../../components/Button';
import type { StaffPosition, StaffStatus } from '@/types/staff-type';

interface StaffFiltersProps {
    filterRole: StaffPosition | '';
    filterStatus: StaffStatus | '';
    viewMode: 'cards' | 'table';
    onRoleChange: (role: StaffPosition | '') => void;
    onStatusChange: (status: StaffStatus | '') => void;
    onViewModeChange: (mode: 'cards' | 'table') => void;
}

const roleOptions = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'delivery', label: 'Giao hàng' },
];

const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang làm việc' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'on_leave', label: 'Đang nghỉ' },
    { value: 'terminated', label: 'Đã nghỉ việc' },
];

const StaffFilters: React.FC<StaffFiltersProps> = ({
    filterRole,
    filterStatus,
    viewMode,
    onRoleChange,
    onStatusChange,
    onViewModeChange,
}) => {
    return (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <Select
                        placeholder="Vai trò"
                        options={roleOptions}
                        value={filterRole}
                        onChange={(e) => onRoleChange(e.target.value as StaffPosition | '')}
                        className="w-full sm:w-40"
                    />

                    <Select
                        placeholder="Trạng thái"
                        options={statusOptions}
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value as StaffStatus | '')}
                        className="w-full sm:w-40"
                    />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => onViewModeChange('cards')}
                        className="hover-scale"
                    >
                        <Icon name="Grid3X3" size={18} />
                    </Button>
                    <Button
                        variant={viewMode === 'cards' ? 'outline' : 'default'}
                        size="icon"
                        onClick={() => onViewModeChange('table')}
                        className="hover-scale"
                    >
                        <Icon name="List" size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StaffFilters;
