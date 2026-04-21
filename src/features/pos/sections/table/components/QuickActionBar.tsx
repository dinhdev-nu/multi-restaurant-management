import React from 'react';
import Icon from '@/components/AppIcon';
import Button, { type ButtonProps } from '../../../components/Button';
import type { Table } from './TableCard';

type TableStatus = Table['status'];

interface QuickAction {
  label: string;
  icon: string;
  variant: ButtonProps['variant'];
  action: () => void;
  disabled?: boolean;
}

interface QuickActionBarProps {
  selectedTable?: Table | null;
  disabled?: boolean;
  onQuickStatusChange: (id: string, status: TableStatus) => void;
  onCreateOrder: (id: string) => void;
  onViewOrder: (orderId?: string) => void;
  onPrintBill: (id: string) => void;
  onCallWaiter: (id: string) => void;
}

// ── Status label map ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Trống',
  occupied: 'Có khách',
  reserved: 'Đã đặt',
  cleaning: 'Dọn dẹp',
};

const STATUS_CLASS: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-warning/10 text-warning',
  reserved: 'bg-error/10 text-error',
  cleaning: 'bg-primary/10 text-primary',
};

// ── Component ─────────────────────────────────────────────────────────────────

const QuickActionBar: React.FC<QuickActionBarProps> = ({
  selectedTable,
  disabled = false,
  onQuickStatusChange,
  onCreateOrder,
  onViewOrder,
  onPrintBill,
  onCallWaiter,
}) => {
  const barClassName = 'h-14 sm:h-16 bg-surface border-t border-border flex items-center px-3 sm:px-4 shrink-0';

  // Editing mode — locked bar
  if (disabled) {
    return (
      <div className={`${barClassName} justify-center`}>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="Lock" size={16} />
          <p className="text-sm">Đang chỉnh sửa vị trí bàn</p>
        </div>
      </div>
    );
  }

  // No table selected
  if (!selectedTable) {
    return (
      <div className={`${barClassName} justify-center`}>
        <p className="text-sm text-muted-foreground text-center">Chọn một bàn để hiển thị thao tác nhanh</p>
      </div>
    );
  }

  // Build action list based on status
  const getActions = (): QuickAction[] => {
    const id = selectedTable._id;
    switch (selectedTable.status) {
      case 'available':
        return [
          { label: 'Đặt khách', icon: 'UserPlus', variant: 'default', action: () => onQuickStatusChange(id, 'occupied') },
          { label: 'Đặt trước', icon: 'Clock', variant: 'outline', action: () => onQuickStatusChange(id, 'reserved') },
        ];
      case 'occupied':
        return [
          { label: 'Tạo đơn', icon: 'Plus', variant: 'default', action: () => onCreateOrder(id) },
          { label: 'Xem đơn', icon: 'Eye', variant: 'outline', action: () => onViewOrder(selectedTable.orderId), disabled: !selectedTable.orderId },
          { label: 'In hóa đơn', icon: 'Printer', variant: 'outline', action: () => onPrintBill(id), disabled: !selectedTable.orderId },
          { label: 'Gọi phục vụ', icon: 'Bell', variant: 'outline', action: () => onCallWaiter(id) },
        ];
      case 'reserved':
        return [
          { label: 'Nhận khách', icon: 'Check', variant: 'default', action: () => onQuickStatusChange(id, 'occupied') },
          { label: 'Hủy đặt', icon: 'X', variant: 'outline', action: () => onQuickStatusChange(id, 'available') },
        ];
      case 'cleaning':
        return [
          { label: 'Hoàn thành', icon: 'CheckCircle', variant: 'success', action: () => onQuickStatusChange(id, 'available') },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className={barClassName}>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
        {/* Selected Table Info */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <div className="w-9 h-9 bg-primary text-primary-foreground rounded-md flex items-center justify-center">
            <span className="font-bold text-xs sm:text-sm">{selectedTable.number}</span>
          </div>

          <div className="hidden md:block min-w-0">
            <p className="text-sm font-medium text-foreground">Bàn {selectedTable.number}</p>
            <p className="text-xs text-muted-foreground truncate max-w-56">
              {selectedTable.currentOccupancy}/{selectedTable.capacity} khách
              {selectedTable.assignedServer && ` • ${selectedTable.assignedServer}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_CLASS[selectedTable.status] ?? ''}`}>
          {STATUS_LABEL[selectedTable.status]}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ml-auto min-w-0 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            size="sm"
            iconName={action.icon}
            iconPosition="left"
            onClick={action.action}
            disabled={action.disabled}
            className="hover-scale whitespace-nowrap"
          >
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="hover-scale" aria-label="Thêm thao tác">
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default QuickActionBar;
