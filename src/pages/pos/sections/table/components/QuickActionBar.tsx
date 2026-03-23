import React from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../components/Button';
import type { Table } from './TableCard';

type TableStatus = Table['status'];

interface QuickAction {
  label: string;
  icon: string;
  variant: string;
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
  occupied:  'Có khách',
  reserved:  'Đã đặt',
  cleaning:  'Dọn dẹp',
};

const STATUS_CLASS: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success',
  occupied:  'bg-warning/10 text-warning',
  reserved:  'bg-error/10 text-error',
  cleaning:  'bg-primary/10 text-primary',
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
  // Editing mode — locked bar
  if (disabled) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-center z-50">
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
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-center z-50">
        <p className="text-sm text-muted-foreground">Chọn một bàn để hiển thị thao tác nhanh</p>
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
          { label: 'Đặt trước', icon: 'Clock',    variant: 'outline', action: () => onQuickStatusChange(id, 'reserved') },
        ];
      case 'occupied':
        return [
          { label: 'Tạo đơn',    icon: 'Plus',    variant: 'default',  action: () => onCreateOrder(id) },
          { label: 'Xem đơn',    icon: 'Eye',     variant: 'outline',  action: () => onViewOrder(selectedTable.orderId),  disabled: !selectedTable.orderId },
          { label: 'In hóa đơn', icon: 'Printer', variant: 'outline',  action: () => onPrintBill(id),                    disabled: !selectedTable.orderId },
          { label: 'Gọi phục vụ',icon: 'Bell',    variant: 'outline',  action: () => onCallWaiter(id) },
        ];
      case 'reserved':
        return [
          { label: 'Nhận khách', icon: 'Check', variant: 'default', action: () => onQuickStatusChange(id, 'occupied') },
          { label: 'Hủy đặt',   icon: 'X',     variant: 'outline', action: () => onQuickStatusChange(id, 'available') },
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
    <div className="fixed bottom-0 left-0 right-0 min-h-16 bg-surface border-t border-border flex items-center px-4 py-2 z-50">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Selected Table Info */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">{selectedTable.number}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Bàn {selectedTable.number}</p>
            <p className="text-xs text-muted-foreground">
              {selectedTable.currentOccupancy}/{selectedTable.capacity} khách
              {selectedTable.assignedServer && ` • ${selectedTable.assignedServer}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[selectedTable.status] ?? ''}`}>
          {STATUS_LABEL[selectedTable.status]}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            size="sm"
            iconName={action.icon}
            iconPosition="left"
            onClick={action.action}
            disabled={action.disabled}
            className="hover-scale"
          >
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="hover-scale">
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default QuickActionBar;
