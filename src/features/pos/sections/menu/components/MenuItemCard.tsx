import React from 'react';
import Image from '@/components/AppImage';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';

type ItemStatus = 'available' | 'low_stock' | 'unavailable';

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  status: ItemStatus;
  stock_quantity?: number;
  unit?: string;
  updatedAt: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, status: ItemStatus) => void;
}

const STATUS_CONFIG: Record<ItemStatus, { color: string; icon: string; text: string }> = {
  available:   { color: 'text-success',           icon: 'CheckCircle',   text: 'Có sẵn'  },
  low_stock:   { color: 'text-warning',            icon: 'AlertTriangle', text: 'Sắp hết' },
  unavailable: { color: 'text-error',              icon: 'XCircle',       text: 'Hết hàng'},
};

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.unavailable;

  return (
    <div className={`
      bg-card border border-border rounded-lg p-4 hover:shadow-interactive transition-smooth
      ${isSelected ? 'ring-2 ring-primary' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(item._id, e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
            <Image src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="w-8 h-8">
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item._id)}
            className="w-8 h-8 text-error hover:text-error"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div>
          <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary text-sm">{formatPrice(item.price)}</span>
          <div className={`flex items-center space-x-1 ${statusConfig.color}`}>
            <Icon name={statusConfig.icon} size={12} />
            <span className="text-xs">{statusConfig.text}</span>
          </div>
        </div>

        {item.stock_quantity !== undefined && (
          <div className="text-xs text-muted-foreground">
            Tồn kho: {item.stock_quantity} {item.unit ?? 'phần'}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
        </div>

        <div className="pt-2 border-t border-border">
          <Button
            variant={item.status === 'available' ? 'outline' : 'default'}
            size="sm"
            fullWidth
            onClick={() => onToggleAvailability(item._id, item.status)}
            iconName={item.status === 'available' ? 'EyeOff' : 'Eye'}
            iconPosition="left"
          >
            {item.status === 'available' ? 'Tạm ngưng' : 'Kích hoạt'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
