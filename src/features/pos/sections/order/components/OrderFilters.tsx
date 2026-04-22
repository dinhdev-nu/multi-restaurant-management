import React from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

export interface OrderFiltersValues {
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  table: string;
  searchQuery: string;
  minAmount: string;
  maxAmount: string;
}

interface OrderFiltersProps {
  filters: OrderFiltersValues;
  onFilterChange: (field: keyof OrderFiltersValues, value: string) => void;
  onExport: () => void;
  onClearFilters: () => void;
}

// ── Static options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả TT thanh toán' },
  { value: 'unpaid', label: 'Chưa thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const TABLE_OPTIONS = [
  { value: 'all', label: 'Tất cả bàn' },
  { value: 'takeaway', label: 'Mang về' },
  { value: 'delivery', label: 'Giao hàng' },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: `table-${i + 1}`,
    label: `Bàn ${i + 1}`,
  })),
];

// ── Component ──────────────────────────────────────────────────────────────────

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onClearFilters,
}) => (
  <div className="mb-3 rounded-lg border border-border bg-card p-3">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-foreground">Bộ lọc tìm kiếm</h3>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
          className="hover-scale"
        >
          Xuất Excel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onClearFilters}
          className="hover-scale"
        >
          Xóa bộ lọc
        </Button>
      </div>
    </div>

    <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
      <Input
        type="date"
        label="Từ ngày"
        value={filters.startDate}
        onChange={(e) => onFilterChange('startDate', e.target.value)}
        className="w-full"
      />
      <Input
        type="date"
        label="Đến ngày"
        value={filters.endDate}
        onChange={(e) => onFilterChange('endDate', e.target.value)}
        className="w-full"
      />
      <Select
        label="Trạng thái đơn"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value)}
        className="w-full"
      />
      <Select
        label="TT Thanh toán"
        options={PAYMENT_STATUS_OPTIONS}
        value={filters.paymentStatus}
        onChange={(event) => onFilterChange('paymentStatus', event.target.value)}
        className="w-full"
      />
      <Select
        label="Bàn/Khu vực"
        options={TABLE_OPTIONS}
        value={filters.table}
        onChange={(event) => onFilterChange('table', event.target.value)}
        searchable
        className="w-full"
      />
    </div>

    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Input
        type="search"
        label="Tìm kiếm"
        placeholder="Mã đơn hàng..."
        value={filters.searchQuery}
        onChange={(e) => onFilterChange('searchQuery', e.target.value)}
        className="w-full"
      />
      <div className="flex items-end gap-2">
        <Input
          type="text"
          label="Giá trị từ (VND)"
          placeholder="0"
          value={filters.minAmount}
          onChange={(e) => onFilterChange('minAmount', e.target.value)}
          className="flex-1"
        />
        <Input
          type="text"
          label="Đến (VND)"
          placeholder="999.999.999"
          value={filters.maxAmount}
          onChange={(e) => onFilterChange('maxAmount', e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  </div>
);

export default OrderFilters;
