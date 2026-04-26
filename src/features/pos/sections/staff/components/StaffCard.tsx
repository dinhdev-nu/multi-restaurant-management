import { memo } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import { cn } from '@/lib/utils';
import type { StaffSummary, StaffPosition, StaffStatus } from '@/types/staff-type';
import Button from '../../../components/Button';

export type StaffListItem = StaffSummary;

const ROLE_LABEL: Record<StaffPosition, string> = {
  manager: 'Quản lý',
  cashier: 'Thu ngân',
  waiter: 'Phục vụ',
  kitchen: 'Nhân viên bếp',
  delivery: 'Giao hàng',
};

const STATUS_LABEL: Record<StaffStatus, string> = {
  active: 'Đang làm việc',
  inactive: 'Không hoạt động',
  on_leave: 'Đang nghỉ',
  terminated: 'Đã nghỉ việc',
};

interface StaffCardProps {
  staff: StaffListItem;
  onEdit: (staff: StaffListItem) => void;
  onToggleStatus: (staff: StaffListItem) => void;
  onViewDetails: (staff: StaffListItem) => void;
  onDelete: (staff: StaffListItem) => void;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StaffStatus, string> = {
  'active': 'text-success',
  'inactive': 'text-muted-foreground',
  'on_leave': 'text-warning',
  'terminated': 'text-error',
};

const STATUS_BG: Record<StaffStatus, string> = {
  'active': 'bg-success/10',
  'inactive': 'bg-muted',
  'on_leave': 'bg-warning/10',
  'terminated': 'bg-error/10',
};

const STATUS_DOT: Record<StaffStatus, string> = {
  'active': 'bg-success',
  'inactive': 'bg-muted-foreground',
  'on_leave': 'bg-warning',
  'terminated': 'bg-error',
};

const ROLE_COLOR: Record<string, string> = {
  manager: 'bg-accent text-accent-foreground',
  cashier: 'bg-secondary text-secondary-foreground',
  kitchen: 'bg-success text-success-foreground',
  delivery: 'bg-primary text-primary-foreground',
};

const getRoleColor = (role: string): string =>
  ROLE_COLOR[role] ?? 'bg-muted text-muted-foreground';

// ── Component ─────────────────────────────────────────────────────────────────

const StaffCard = memo<StaffCardProps>(({
  staff,
  onEdit,
  onToggleStatus,
  onViewDetails,
  onDelete,
}) => (
  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-interactive transition-shadow duration-200">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="size-16 rounded-full overflow-hidden bg-muted">
            <Image src={staff.avatar_url ?? ''} alt={staff.full_name} className="w-full h-full object-cover" />
          </div>
          <div className={cn('absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-card', STATUS_DOT[staff.status])} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-lg">{staff.full_name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-1 text-xs font-medium', getRoleColor(staff.position))}>
              {ROLE_LABEL[staff.position] ?? staff.position}
            </span>
            <span className={cn('rounded-full px-2 py-1 text-xs font-medium', STATUS_BG[staff.status], STATUS_COLOR[staff.status])}>
              {STATUS_LABEL[staff.status] ?? staff.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(staff)} className="hover-scale">
          <Icon name="Edit" size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onViewDetails(staff)} className="hover-scale">
          <Icon name="Eye" size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(staff)}
          className="hover-scale text-error hover:text-error"
        >
          <Icon name="Trash2" size={16} />
        </Button>
      </div>
    </div>

    {/* Contact Info */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="Phone" size={14} />
        <span>{staff.phone ?? '---'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="Mail" size={14} />
        <span>{staff.email ?? '---'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="Calendar" size={14} />
        <span>Ngày vào làm: {staff.hire_date ? new Date(staff.hire_date).toLocaleDateString('vi-VN') : '---'}</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(staff)}
        className="flex-1 hover-scale"
        iconName={staff.status === 'active' ? 'Pause' : 'Play'}
        iconPosition="left"
      >
        {staff.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => onEdit(staff)}
        className="flex-1 hover-scale"
        iconName="Settings"
        iconPosition="left"
      >
        Chỉnh sửa
      </Button>
    </div>
  </div>
));

StaffCard.displayName = 'StaffCard';

export default StaffCard;
