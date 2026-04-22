import React, { memo } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import Select from '../../../components/Select';

export type BulkAction = 'export' | 'message' | 'delete';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: BulkAction) => void;
  onBulkRoleChange: (role: string) => void;
  onBulkStatusChange: (status: string) => void;
}

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Chủ cửa hàng' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'kitchen', label: 'Nhân viên bếp' },
  { value: 'waiter', label: 'Phục vụ' },
  { value: 'cleaner', label: 'Vệ sinh' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Kích hoạt' },
  { value: 'inactive', label: 'Vô hiệu hóa' },
  { value: 'on-break', label: 'Tạm nghỉ' },
];

const BulkActionsBar = memo<BulkActionsBarProps>(({
  selectedCount,
  onClearSelection,
  onBulkAction,
  onBulkRoleChange,
  onBulkStatusChange,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary">
              <Icon name="Check" size={14} color="white" />
            </div>
            <span className="font-medium text-primary">
              Đã chọn {selectedCount} nhân viên
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconPosition="left"
            className="text-primary hover:text-primary"
          >
            Bỏ chọn
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">Đổi vai trò:</span>
            <Select
              placeholder="Chọn vai trò"
              options={ROLE_OPTIONS}
              value=""
              onChange={(event) => onBulkRoleChange(event.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">Đổi trạng thái:</span>
            <Select
              placeholder="Chọn trạng thái"
              options={STATUS_OPTIONS}
              value=""
              onChange={(event) => onBulkStatusChange(event.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-primary/20 pl-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('export')}
              iconName="Download"
              iconPosition="left"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Xuất Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('message')}
              iconName="MessageSquare"
              iconPosition="left"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Gửi tin nhắn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('delete')}
              iconName="Trash2"
              iconPosition="left"
              className="border-error/20 text-error hover:bg-error/10"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

BulkActionsBar.displayName = 'BulkActionsBar';

export default BulkActionsBar;
