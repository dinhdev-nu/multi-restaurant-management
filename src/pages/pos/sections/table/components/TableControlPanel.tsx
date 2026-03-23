import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import type { Table } from './TableCard';

type TableStatus = Table['status'];

export interface NewTableForm {
  number: string;
  capacity: number;
  shape: 'rectangular' | 'circular';
  x: number;
  y: number;
}

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
}

interface Server {
  value: string;
  label: string;
}

interface TableControlPanelProps {
  selectedTable?: Table | null;
  stats: TableStats;
  disabled?: boolean;
  availableServers?: Server[];
  onTableStatusChange: (id: string, status: TableStatus) => void;
  onServerAssign: (id: string, serverLabel: string | null) => void;
  onAddTable: (form: NewTableForm & { status: 'available' }) => void;
  onDeleteTable: (id: string) => void;
}

// ── Static options ────────────────────────────────────────────────────────────

const SHAPE_OPTIONS = [
  { value: 'rectangular', label: 'Hình chữ nhật' },
  { value: 'circular',    label: 'Hình tròn'     },
];

const DEFAULT_SERVERS: Server[] = [
  { value: 'nguyen_van_a', label: 'Nguyễn Văn A' },
  { value: 'tran_thi_b',   label: 'Trần Thị B'   },
  { value: 'le_van_c',     label: 'Lê Văn C'      },
  { value: 'pham_thi_d',   label: 'Phạm Thị D'   },
];

const DEFAULT_FORM: NewTableForm = {
  number: '', capacity: 4, shape: 'rectangular', x: 100, y: 100,
};

// ── Component ─────────────────────────────────────────────────────────────────

const TableControlPanel: React.FC<TableControlPanelProps> = ({
  selectedTable,
  stats,
  disabled  = false,
  availableServers = DEFAULT_SERVERS,
  onTableStatusChange,
  onServerAssign,
  onAddTable,
  onDeleteTable,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm]         = useState<NewTableForm>(DEFAULT_FORM);

  const handleAddTable = () => {
    if (!newForm.number) return;
    onAddTable({ ...newForm, status: 'available' });
    setNewForm(DEFAULT_FORM);
    setShowAddForm(false);
  };

  const selectedServerId = availableServers.find(
    (s) => s.label === selectedTable?.assignedServer
  )?.value ?? '';

  return (
    <div className="w-80 bg-surface border-l border-border h-full flex flex-col relative">
      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-muted rounded-lg p-4 text-center">
            <Icon name="Lock" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang chỉnh sửa vị trí bàn</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quản lý bàn</h2>
        </div>
        <Button
          variant="default"
          size="sm"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowAddForm(true)}
          className="mb-3"
        >
          Thêm bàn mới
        </Button>
      </div>

      {/* Statistics */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Thống kê</h3>
          <span className="text-xs text-muted-foreground">{stats.total} bàn</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {[
            { color: 'bg-success',  textColor: 'text-success',  value: stats.available },
            { color: 'bg-warning',  textColor: 'text-warning',  value: stats.occupied  },
            { color: 'bg-error',    textColor: 'text-error',    value: stats.reserved  },
            { color: 'bg-primary',  textColor: 'text-primary',  value: stats.cleaning  },
          ].map((s, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className={`text-sm font-semibold ${s.textColor}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTable ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Bàn {selectedTable.number}</h3>

            {/* Status Control */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Trạng thái</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { status: 'available' as const, label: 'Trống',    variant: 'success'     },
                    { status: 'occupied'  as const, label: 'Có khách', variant: 'warning'     },
                    { status: 'reserved'  as const, label: 'Đã đặt',   variant: 'destructive' },
                    { status: 'cleaning'  as const, label: 'Dọn dẹp',  variant: 'default'     },
                  ] as const
                ).map(({ status, label, variant }) => (
                  <Button
                    key={status}
                    variant={selectedTable.status === status ? variant : 'outline'}
                    size="sm"
                    onClick={() => onTableStatusChange(selectedTable._id, status)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Server Assignment */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Phân công nhân viên</label>
              <Select
                options={[{ value: '', label: 'Chưa phân công' }, ...availableServers]}
                value={selectedServerId}
                onChange={(val) => {
                  const server = availableServers.find((s) => s.value === val);
                  onServerAssign(selectedTable._id, server ? server.label : null);
                }}
                placeholder="Chọn nhân viên"
              />
            </div>

            {/* Delete */}
            <div className="space-y-2">
              <Button
                variant="destructive"
                size="sm"
                fullWidth
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDeleteTable(selectedTable._id)}
                disabled={selectedTable.status === 'occupied'}
              >
                Xóa bàn
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <Icon name="MousePointer" size={32} className="mx-auto mb-2" />
            <p className="text-sm">Chọn một bàn để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* Add New Table Panel */}
      {showAddForm && (
        <div className="absolute inset-0 bg-surface z-50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground">Thêm bàn mới</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Số bàn</label>
              <Input
                type="text"
                placeholder="Ví dụ: 09"
                value={newForm.number}
                onChange={(e) => setNewForm((p) => ({ ...p, number: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sức chứa (người)</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newForm.capacity}
                onChange={(e) => setNewForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Hình dạng</label>
              <Select
                options={SHAPE_OPTIONS}
                value={newForm.shape}
                onChange={(val) => setNewForm((p) => ({ ...p, shape: val as NewTableForm['shape'] }))}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Bàn mới sẽ được đặt ở vị trí mặc định. Bạn có thể kéo thả để điều chỉnh sau.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-border flex space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowAddForm(false)}>
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              fullWidth
              onClick={handleAddTable}
              disabled={!newForm.number}
              iconName="Plus"
              iconPosition="left"
            >
              Thêm bàn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableControlPanel;
