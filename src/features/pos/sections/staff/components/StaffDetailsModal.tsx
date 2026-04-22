import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import { cn } from '@/lib/utils';
import Button from '../../../components/Button';
import type { Staff } from './StaffCard';

type ActivityType = 'order' | 'payment' | 'checkin' | 'update';

interface RecentActivity {
  time: string;
  action: string;
  type: ActivityType;
}

interface StaffDetailsModalProps {
  isOpen: boolean;
  staff: Staff | null;
  workedDisplay?: string;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  'active': 'text-success',
  'on-break': 'text-warning',
  'inactive': 'text-error',
};

const STATUS_BG: Record<string, string> = {
  'active': 'bg-success/10',
  'on-break': 'bg-warning/10',
  'inactive': 'bg-error/10',
};

const STATUS_DOT: Record<string, string> = {
  'active': 'bg-success',
  'on-break': 'bg-warning',
  'inactive': 'bg-error',
};

const ROLE_COLOR: Record<string, string> = {
  owner: 'bg-primary text-primary-foreground',
  manager: 'bg-accent text-accent-foreground',
  cashier: 'bg-secondary text-secondary-foreground',
  kitchen: 'bg-success text-success-foreground',
};

const ACTIVITY_ICON: Record<ActivityType, string> = {
  order: 'Receipt',
  payment: 'CreditCard',
  checkin: 'LogIn',
  update: 'Edit',
};

const getRoleColor = (role: string): string =>
  ROLE_COLOR[role] ?? 'bg-muted text-muted-foreground';

// ── Static sample data ────────────────────────────────────────────────────────

const RECENT_ACTIVITIES: RecentActivity[] = [
  { time: '14:30', action: 'Xử lý đơn hàng #1234', type: 'order' },
  { time: '14:15', action: 'Thanh toán bàn số 5', type: 'payment' },
  { time: '14:00', action: 'Bắt đầu ca làm việc', type: 'checkin' },
  { time: '13:45', action: 'Cập nhật thực đơn', type: 'update' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  isOpen,
  staff,
  workedDisplay = '0h 0p',
  onClose,
  onEdit,
}) => {
  if (!isOpen || !staff) return null;

  const performanceData = [
    { label: 'Đơn hàng hôm nay', value: staff.ordersToday ?? '—', icon: 'Receipt' },
    { label: 'Giờ làm việc', value: workedDisplay, icon: 'Clock' },
    { label: 'Đánh giá trung bình', value: '4.8/5', icon: 'Star' },
    { label: 'Khách hàng phục vụ', value: '156', icon: 'Users' },
  ];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-16 rounded-full overflow-hidden bg-muted">
                <Image src={staff.avatar ?? ''} alt={staff.name} className="w-full h-full object-cover" />
              </div>
              <div className={cn('absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-card', STATUS_DOT[staff.status] ?? 'bg-error')} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{staff.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-1 text-xs font-medium', getRoleColor(staff.role))}>
                  {staff.roleDisplay}
                </span>
                <span className={cn('rounded-full px-2 py-1 text-xs font-medium', STATUS_BG[staff.status] ?? '', STATUS_COLOR[staff.status] ?? '')}>
                  {staff.statusDisplay}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Personal Info + Work Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                  <Icon name="User" size={18} />
                  <span>Thông tin cá nhân</span>
                </h3>
                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  {[
                    { icon: 'Badge', label: 'Mã nhân viên', value: staff.employeeId },
                    { icon: 'Phone', label: 'Số điện thoại', value: staff.phone },
                    { icon: 'Mail', label: 'Email', value: staff.email },
                    { icon: 'Calendar', label: 'Ngày vào làm', value: '15/08/2024' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <Icon name={row.icon} size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{row.label}</p>
                        <p className="font-medium text-card-foreground">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                  <Icon name="Briefcase" size={18} />
                  <span>Thông tin công việc</span>
                </h3>
                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  {[
                    { icon: 'Clock', label: 'Ca làm việc', value: staff.shift },
                    { icon: 'Timer', label: 'Giờ làm việc', value: staff.workingHours },
                    { icon: 'DollarSign', label: 'Mức lương', value: '8.500.000 VND' },
                    { icon: 'LogIn', label: 'Lần đăng nhập cuối', value: 'Hôm nay, 14:30' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <Icon name={row.icon} size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{row.label}</p>
                        <p className="font-medium text-card-foreground">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="TrendingUp" size={18} />
                <span>Hiệu suất làm việc</span>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon name={item.icon} size={20} className="text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-card-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Activity" size={18} />
                <span>Hoạt động gần đây</span>
              </h3>
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="space-y-3">
                  {RECENT_ACTIVITIES.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-muted/30">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon name={ACTIVITY_ICON[activity.type]} size={14} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Shield" size={18} />
                <span>Quyền truy cập</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-medium text-card-foreground mb-3">Được phép</h4>
                  <div className="space-y-2">
                    {['Xử lý đơn hàng', 'Thanh toán', 'Quản lý bàn', 'Xem báo cáo'].map((perm) => (
                      <div key={perm} className="flex items-center gap-2 text-sm text-success">
                        <Icon name="Check" size={14} />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-medium text-card-foreground mb-3">Bị hạn chế</h4>
                  <div className="space-y-2">
                    {['Quản lý nhân viên', 'Cài đặt hệ thống', 'Xóa dữ liệu', 'Báo cáo tài chính'].map((perm) => (
                      <div key={perm} className="flex items-center gap-2 text-sm text-error">
                        <Icon name="X" size={14} />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            iconName="Edit"
            iconPosition="left"
            onClick={() => { onEdit(staff); onClose(); }}
          >
            Chỉnh sửa
          </Button>
          <Button variant="default" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
