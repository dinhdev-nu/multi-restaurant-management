import React, { useRef } from 'react';
import Image from '@/components/AppImage';
import Icon from '@/components/AppIcon';
import Button from '../../components/Button';

type ItemStatus = 'available' | 'low_stock' | 'unavailable';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  status: ItemStatus;
  stock_quantity?: number | null;
  unit?: string;
  updatedAt: string;
}

interface MenuTableProps {
  items: MenuItem[];
  selectedItems: string[];
  onSelectItem: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, status: ItemStatus) => void;
}

const STATUS_BADGE: Record<ItemStatus, { color: string; icon: string; text: string }> = {
  available:   { color: 'bg-success/10 text-success border-success/20',   icon: 'CheckCircle',   text: 'Có sẵn'  },
  low_stock:   { color: 'bg-warning/10 text-warning border-warning/20',   icon: 'AlertTriangle', text: 'Sắp hết' },
  unavailable: { color: 'bg-error/10 text-error border-error/20',         icon: 'XCircle',       text: 'Hết hàng'},
};

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const config = STATUS_BADGE[status] ?? STATUS_BADGE.unavailable;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon name={config.icon} size={12} />
      <span>{config.text}</span>
    </span>
  );
};

const MenuTable: React.FC<MenuTableProps> = ({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  const checkboxRef = useRef<HTMLInputElement>(null);
  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = isIndeterminate;
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 p-4">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Món ăn</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Danh mục</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Giá</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Trạng thái</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Tồn kho</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Cập nhật</th>
              <th className="text-center p-4 text-sm font-medium text-foreground w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className={`border-b border-border hover:bg-muted/30 transition-smooth ${
                  selectedItems.includes(item._id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={(e) => onSelectItem(item._id, e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className="text-sm text-foreground">{item.category}</span>
                </td>

                <td className="p-4">
                  <span className="font-semibold text-primary text-sm">{formatPrice(item.price)}</span>
                </td>

                <td className="p-4">
                  <StatusBadge status={item.status} />
                </td>

                <td className="p-4">
                  <span className="text-sm text-foreground">
                    {item.stock_quantity != null
                      ? `${item.stock_quantity} ${item.unit ?? 'phần'}`
                      : <span className="text-muted-foreground">Không giới hạn</span>
                    }
                  </span>
                </td>

                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleAvailability(item._id, item.status)}
                      className="w-8 h-8"
                      title={item.status === 'available' ? 'Tạm ngưng' : 'Kích hoạt'}
                    >
                      <Icon name={item.status === 'available' ? 'EyeOff' : 'Eye'} size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="w-8 h-8"
                      title="Chỉnh sửa"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item._id)}
                      className="w-8 h-8 text-error hover:text-error"
                      title="Xóa"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="UtensilsCrossed" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Chưa có món ăn nào</h3>
          <p className="text-muted-foreground">Thêm món ăn đầu tiên để bắt đầu quản lý thực đơn</p>
        </div>
      )}
    </div>
  );
};

export default MenuTable;
