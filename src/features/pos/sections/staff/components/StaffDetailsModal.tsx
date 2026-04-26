import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import { cn } from '@/lib/utils';
import Button from '../../../components/Button';
import type { StaffDetail, StaffSummary, StaffPosition, StaffStatus } from '@/types/staff-type';

interface StaffDetailsModalProps {
  isOpen: boolean;
  staff: StaffSummary | null;
  detail?: StaffDetail | null;
  onClose: () => void;
  onEdit: (staff: StaffSummary, detail?: StaffDetail | null) => void;
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
  waiter: 'bg-warning text-warning-foreground',
  kitchen: 'bg-success text-success-foreground',
  delivery: 'bg-primary text-primary-foreground',
};

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

const getRoleColor = (role: string): string =>
  ROLE_COLOR[role] ?? 'bg-muted text-muted-foreground';

// ── Component ─────────────────────────────────────────────────────────────────

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  isOpen,
  staff,
  detail,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !staff) return null;

  const infoRows = [
    { icon: 'Badge', label: 'Mã nhân viên', value: detail?.employee_code ?? staff.employee_code ?? '---' },
    { icon: 'User', label: 'User ID', value: detail?.user_id ?? staff.user_id ?? '---' },
    { icon: 'Phone', label: 'Số điện thoại', value: detail?.phone ?? staff.phone ?? '---' },
    { icon: 'Mail', label: 'Email', value: detail?.email ?? staff.email ?? '---' },
    {
      icon: 'Calendar',
      label: 'Ngày vào làm',
      value: detail?.hire_date
        ? new Date(detail.hire_date).toLocaleDateString('vi-VN')
        : (staff.hire_date ? new Date(staff.hire_date).toLocaleDateString('vi-VN') : '---'),
    },
    {
      icon: 'Clock',
      label: 'Cập nhật lần cuối',
      value: detail?.updated_at ? new Date(detail.updated_at).toLocaleString('vi-VN') : '---',
    },
  ];

  const permissionRows = detail?.permissions
    ? [
      { key: 'can_discount', label: 'Giảm giá', value: detail.permissions.can_discount },
      { key: 'can_cancel_order', label: 'Hủy đơn', value: detail.permissions.can_cancel_order },
      { key: 'can_process_payment', label: 'Thanh toán', value: detail.permissions.can_process_payment },
      { key: 'can_refund', label: 'Hoàn tiền', value: detail.permissions.can_refund },
      { key: 'can_view_reports', label: 'Xem báo cáo', value: detail.permissions.can_view_reports },
      { key: 'can_manage_tables', label: 'Quản lý bàn', value: detail.permissions.can_manage_tables },
      { key: 'can_manage_menu', label: 'Quản lý menu', value: detail.permissions.can_manage_menu },
    ]
    : [];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-16 rounded-full overflow-hidden bg-muted">
                <Image src={staff.avatar_url ?? ''} alt={staff.full_name} className="w-full h-full object-cover" />
              </div>
              <div className={cn('absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-card', STATUS_DOT[staff.status] ?? 'bg-error')} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{staff.full_name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-1 text-xs font-medium', getRoleColor(staff.position))}>
                  {ROLE_LABEL[staff.position] ?? staff.position}
                </span>
                <span className={cn('rounded-full px-2 py-1 text-xs font-medium', STATUS_BG[staff.status] ?? '', STATUS_COLOR[staff.status] ?? '')}>
                  {STATUS_LABEL[staff.status] ?? staff.status}
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
              <Icon name="User" size={18} />
              <span>Thông tin nhân viên</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 rounded-lg p-4">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{row.label}</p>
                    <p className="font-medium text-card-foreground break-all">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
              <Icon name="Shield" size={18} />
              <span>Quyền truy cập</span>
            </h3>
            {permissionRows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/20 rounded-lg p-4">
                {permissionRows.map((item) => (
                  <div key={item.key} className={cn('flex items-center gap-2 text-sm', item.value ? 'text-success' : 'text-error')}>
                    <Icon name={item.value ? 'Check' : 'X'} size={14} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg p-4 text-sm text-muted-foreground">
                Permissions bị ẩn theo quyền truy cập hiện tại hoặc chưa có dữ liệu.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            iconName="Edit"
            iconPosition="left"
            onClick={() => { onEdit(staff, detail ?? null); onClose(); }}
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
