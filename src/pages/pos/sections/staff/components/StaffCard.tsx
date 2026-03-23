import React, { memo } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '../../components/Button';

type StaffStatus = 'active' | 'on-break' | 'inactive';
type StaffRole   = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'waiter' | 'cleaner';

export interface Staff {
  _id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  shift: string;
  role: StaffRole;
  roleDisplay: string;
  status: StaffStatus;
  statusDisplay: string;
}

interface StaffCardProps {
  staff: Staff;
  ordersToday: number;
  workedDisplay: string;
  onEdit: (staff: Staff) => void;
  onToggleStatus: (staff: Staff) => void;
  onViewDetails: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StaffStatus, string> = {
  'active':   'text-success',
  'on-break': 'text-warning',
  'inactive': 'text-error',
};

const STATUS_BG: Record<StaffStatus, string> = {
  'active':   'bg-success/10',
  'on-break': 'bg-warning/10',
  'inactive': 'bg-error/10',
};

const STATUS_DOT: Record<StaffStatus, string> = {
  'active':   'bg-success',
  'on-break': 'bg-warning',
  'inactive': 'bg-error',
};

const ROLE_COLOR: Record<string, string> = {
  owner:   'bg-primary text-primary-foreground',
  manager: 'bg-accent text-accent-foreground',
  cashier: 'bg-secondary text-secondary-foreground',
  kitchen: 'bg-success text-success-foreground',
};

const getRoleColor = (role: string): string =>
  ROLE_COLOR[role] ?? 'bg-muted text-muted-foreground';

// ── Component ─────────────────────────────────────────────────────────────────

const StaffCard = memo<StaffCardProps>(({
  staff,
  ordersToday,
  workedDisplay,
  onEdit,
  onToggleStatus,
  onViewDetails,
  onDelete,
}) => (
  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-interactive transition-shadow duration-200">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
            <Image src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${STATUS_DOT[staff.status]}`} />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-lg">{staff.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
              {staff.roleDisplay}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BG[staff.status]} ${STATUS_COLOR[staff.status]}`}>
              {staff.statusDisplay}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
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
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="Phone" size={14} />
        <span>{staff.phone}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="Mail" size={14} />
        <span>{staff.email}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Icon name="Calendar" size={14} />
        <span>Ca: {staff.shift}</span>
      </div>
    </div>

    {/* Performance Stats */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-card-foreground">{ordersToday}</p>
        <p className="text-xs text-muted-foreground">Đơn hôm nay</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-card-foreground">{workedDisplay}</p>
        <p className="text-xs text-muted-foreground">Giờ làm việc</p>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(staff)}
        className="flex-1 hover-scale"
        iconName={staff.status === 'active' ? 'Pause' : 'Play'}
        iconPosition="left"
      >
        {staff.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'}
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
