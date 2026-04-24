import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import type { Table } from './TableCard';

type TableStatus = Table['status'];

export interface UpdateTableForm {
  number: string;
  name: string;
  notes: string;
  capacity: number;
}

interface Server {
  value: string;
  label: string;
}

interface TableControlPanelProps {
  selectedTable?: Table | null;
  disabled?: boolean;
  isSubmittingUpdate?: boolean;
  isTogglingActive?: boolean;
  isRegeneratingQr?: boolean;
  availableServers?: Server[];
  onTableStatusChange: (id: string, status: TableStatus) => void;
  onServerAssign: (id: string, serverLabel: string | null) => void;
  onUpdateTable: (id: string, form: UpdateTableForm) => void;
  onToggleTableActive: (id: string) => void;
  onRegenerateTableQr: (id: string) => void;
  onDeleteTable: (id: string) => void;
}

const DEFAULT_SERVERS: Server[] = [
  { value: 'nguyen_van_a', label: 'Nguyễn Văn A' },
  { value: 'tran_thi_b', label: 'Trần Thị B' },
  { value: 'le_van_c', label: 'Lê Văn C' },
  { value: 'pham_thi_d', label: 'Phạm Thị D' },
];

const TableControlPanel: React.FC<TableControlPanelProps> = ({
  selectedTable,
  disabled = false,
  isSubmittingUpdate = false,
  isTogglingActive = false,
  isRegeneratingQr = false,
  availableServers = DEFAULT_SERVERS,
  onTableStatusChange,
  onServerAssign,
  onUpdateTable,
  onToggleTableActive,
  onRegenerateTableQr,
  onDeleteTable,
}) => {
  const [editForm, setEditForm] = useState<UpdateTableForm>({
    number: selectedTable ? String(selectedTable.number) : '',
    name: selectedTable?.name ?? '',
    notes: selectedTable?.notes ?? '',
    capacity: selectedTable?.capacity ?? 1,
  });

  const handleUpdateTable = () => {
    if (!selectedTable || !editForm.number.trim()) return;
    onUpdateTable(selectedTable._id, editForm);
  };

  const selectedServerId = availableServers.find(
    (s) => s.label === selectedTable?.assignedServer
  )?.value ?? '';

  return (
    <div className="w-72 2xl:w-80 bg-surface border-l border-border h-full flex flex-col relative">
      {disabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-muted rounded-lg p-4 text-center">
            <Icon name="Lock" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang chỉnh sửa vị trí bàn</p>
          </div>
        </div>
      )}

      {selectedTable ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-medium text-foreground">Bàn {selectedTable.number}</h3>
            </div>

            {/* Status Control */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Trạng thái hiện tại</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { status: 'available' as const, label: 'Trống', variant: 'success' },
                    { status: 'occupied' as const, label: 'Có khách', variant: 'warning' },
                    { status: 'reserved' as const, label: 'Đã đặt', variant: 'error' },
                    { status: 'cleaning' as const, label: 'Dọn dẹp', variant: 'default' },
                  ] as const
                ).map(({ status, label, variant }) => (
                  <Button
                    key={status}
                    variant={selectedTable.status === status ? variant : 'outline'}
                    size="sm"
                    onClick={() => onTableStatusChange(selectedTable._id, status)}
                    disabled={selectedTable.isActive === false}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              <label className="text-xs text-muted-foreground block">Thông số chi tiết</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                    type="text"
                    placeholder="Số bàn"
                    value={editForm.number}
                    onChange={(e) => setEditForm((p) => ({ ...p, number: e.target.value }))}
                />
                <Input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Sức chứa"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((p) => ({ ...p, capacity: parseInt(e.target.value, 10) || 1 }))}
                />
              </div>
              <Input
                type="text"
                placeholder="Tên bàn (không bắt buộc)"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Ghi chú (không bắt buộc)"
                value={editForm.notes}
                onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
              />

              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName="Save"
                iconPosition="left"
                onClick={handleUpdateTable}
                disabled={isSubmittingUpdate || !editForm.number.trim()}
              >
                Cập nhật thông tin
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleTableActive(selectedTable._id)}
                disabled={isTogglingActive}
                iconName={selectedTable.isActive === false ? 'Power' : 'PowerOff'}
                iconPosition="left"
              >
                {selectedTable.isActive === false ? 'Kích hoạt' : 'Ngưng bàn'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateTableQr(selectedTable._id)}
                disabled={isRegeneratingQr}
                iconName="QrCode"
                iconPosition="left"
              >
                Tạo lại QR
              </Button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-2 block">Phân công cá nhân</label>
              <Select
                options={[{ value: '', label: 'Chưa phân công' }, ...availableServers]}
                value={selectedServerId}
                onChange={(event) => {
                  const server = availableServers.find((s) => s.value === event.target.value);
                  onServerAssign(selectedTable._id, server ? server.label : null);
                }}
              />
            </div>

            <div className="mt-auto pt-4">
              <Button
                variant="error"
                size="sm"
                fullWidth
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDeleteTable(selectedTable._id)}
                disabled={selectedTable.status === 'occupied' || isSubmittingUpdate || isTogglingActive}
              >
                Xóa bỏ bàn này
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <Icon name="MousePointer" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">Bảng điều khiển</p>
            <p className="text-xs mt-1">Chọn một bàn để cấu hình chi tiết</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableControlPanel;
