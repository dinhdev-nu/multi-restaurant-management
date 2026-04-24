import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

export interface NewTableForm {
  number: string;
  name: string;
  notes: string;
  capacity: number;
  shape: 'rectangular' | 'circular';
}

interface TableAddModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (form: NewTableForm) => void;
}

const SHAPE_OPTIONS = [
  { value: 'rectangular', label: 'Hình chữ nhật' },
  { value: 'circular', label: 'Hình tròn' },
];

const DEFAULT_FORM: NewTableForm = {
  number: '', name: '', notes: '', capacity: 4, shape: 'rectangular'
};

const TableAddModal: React.FC<TableAddModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [form, setForm] = useState<NewTableForm>(DEFAULT_FORM);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.number.trim()) return;
    onConfirm(form);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-md max-h-[90vh] overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Icon name="Plus" size={20} color="white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Thêm bàn mới</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} className="hover-scale">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Số bàn <span className="text-error">*</span></label>
            <Input
              type="text"
              placeholder="VD: 10"
              value={form.number}
              onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Tên bàn (tuỳ chọn)</label>
            <Input
              type="text"
              placeholder="VD: Bàn ban công"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Sức chứa</label>
              <Input
                type="number"
                min="1"
                max="99"
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Hình dạng</label>
              <Select
                options={SHAPE_OPTIONS}
                value={form.shape}
                onChange={(event) => setForm((p) => ({ ...p, shape: event.target.value as NewTableForm['shape'] }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Ghi chú (tuỳ chọn)</label>
            <Input
              type="text"
              placeholder=""
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!form.number.trim() || isSubmitting}
            iconName="Check"
            iconPosition="left"
          >
            {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableAddModal;
