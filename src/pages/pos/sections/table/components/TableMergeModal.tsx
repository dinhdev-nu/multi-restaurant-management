import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../components/Button';
import Select from '../../components/Select';
import type { Table } from './TableCard';

type MergeType = 'combine' | 'transfer';

export interface MergePayload {
  sourceTableId: string;
  targetTableIds: string[];
  type: MergeType;
}

interface TableMergeModalProps {
  isOpen: boolean;
  sourceTable?: Table | null;
  availableTables?: Table[];
  onClose: () => void;
  onConfirmMerge: (payload: MergePayload) => void;
}

const MERGE_TYPE_OPTIONS = [
  { value: 'combine',  label: 'Ghép bàn',     description: 'Kết hợp khách từ nhiều bàn' },
  { value: 'transfer', label: 'Chuyển bàn',   description: 'Di chuyển khách sang bàn khác' },
];

const TableMergeModal: React.FC<TableMergeModalProps> = ({
  isOpen,
  sourceTable,
  availableTables = [],
  onClose,
  onConfirmMerge,
}) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [mergeType, setMergeType]           = useState<MergeType>('combine');

  if (!isOpen || !sourceTable) return null;

  const tableOptions = availableTables
    .filter((t) => t._id !== sourceTable._id && t.status === 'available')
    .map((t) => ({
      value: t._id,
      label: `Bàn ${t.number} (${t.capacity} chỗ)`,
    }));

  const handleConfirm = () => {
    if (selectedTables.length === 0) return;
    onConfirmMerge({ sourceTableId: sourceTable._id, targetTableIds: selectedTables, type: mergeType });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectedTables([]);
    setMergeType('combine');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200]">
      <div className="bg-surface rounded-lg border border-border w-full max-w-md mx-4 shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {mergeType === 'combine' ? 'Ghép bàn' : 'Chuyển bàn'}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Source Table Info */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Bàn nguồn</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning text-warning-foreground rounded-lg flex items-center justify-center">
                <span className="font-bold">{sourceTable.number}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Bàn {sourceTable.number}</p>
                <p className="text-xs text-muted-foreground">
                  {sourceTable.currentOccupancy}/{sourceTable.capacity} khách
                </p>
                {sourceTable.orderId && (
                  <p className="text-xs text-primary">Đơn hàng: #{sourceTable.orderId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Merge Type */}
          <Select
            label="Loại thao tác"
            options={MERGE_TYPE_OPTIONS}
            value={mergeType}
            onChange={(val) => setMergeType(val as MergeType)}
            description={mergeType === 'combine'
              ? 'Khách từ các bàn sẽ được gộp lại'
              : 'Khách sẽ được chuyển sang bàn mới'}
          />

          {/* Target Table Selection */}
          <Select
            label={mergeType === 'combine' ? 'Chọn bàn để ghép' : 'Chọn bàn đích'}
            options={tableOptions}
            value={selectedTables}
            onChange={setSelectedTables}
            multiple={mergeType === 'combine'}
            searchable
            placeholder={tableOptions.length > 0 ? 'Chọn bàn...' : 'Không có bàn trống'}
            description={`${tableOptions.length} bàn trống có thể sử dụng`}
          />

          {/* Preview */}
          {selectedTables.length > 0 && (
            <div className="bg-success/10 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Xem trước</h4>
              <p className="text-sm text-muted-foreground">
                {mergeType === 'combine'
                  ? `Ghép bàn ${sourceTable.number} với ${selectedTables.length} bàn khác. Tổng sức chứa sẽ được tính lại.`
                  : `Chuyển khách từ bàn ${sourceTable.number} sang bàn đã chọn. Bàn ${sourceTable.number} sẽ trở thành trống.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={selectedTables.length === 0}
            iconName={mergeType === 'combine' ? 'Merge' : 'ArrowRightLeft'}
            iconPosition="left"
          >
            {mergeType === 'combine' ? 'Ghép bàn' : 'Chuyển bàn'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableMergeModal;
