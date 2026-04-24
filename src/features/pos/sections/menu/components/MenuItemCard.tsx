import React from 'react';
import Image from '@/components/AppImage';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import type { MenuItem } from '@/types/menu-type';
import { Spinner } from '@/components/ui/spinner';

type ItemAction = 'toggle-availability' | 'toggle-featured' | 'reorder-up' | 'reorder-down' | 'delete';

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  isItemActionPending: (itemId: string, action: ItemAction) => boolean;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  onMoveItem,
  isItemActionPending,
}) => {
  const isMoveUpPending = isItemActionPending(item._id, 'reorder-up');
  const isMoveDownPending = isItemActionPending(item._id, 'reorder-down');
  const isToggleFeaturedPending = isItemActionPending(item._id, 'toggle-featured');
  const isToggleAvailabilityPending = isItemActionPending(item._id, 'toggle-availability');
  const isDeletePending = isItemActionPending(item._id, 'delete');
  const isAnyPending = isMoveUpPending || isMoveDownPending || isToggleFeaturedPending || isToggleAvailabilityPending || isDeletePending;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-smooth hover:shadow-interactive">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="size-16 overflow-hidden rounded-lg bg-muted">
            <Image src={item.images?.[0]?.url ?? ''} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveItem(item._id, 'up')}
            className="size-8"
            disabled={isAnyPending}
            title="Đưa lên"
          >
            {isMoveUpPending ? <Spinner className="size-4" /> : <Icon name="ChevronUp" size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveItem(item._id, 'down')}
            className="size-8"
            disabled={isAnyPending}
            title="Đưa xuống"
          >
            {isMoveDownPending ? <Spinner className="size-4" /> : <Icon name="ChevronDown" size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFeatured(item._id, item.is_featured)}
            className="size-8"
            disabled={isAnyPending}
            title={item.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
          >
            {isToggleFeaturedPending ? <Spinner className="size-4" /> : <Icon name={item.is_featured ? 'StarOff' : 'Star'} size={16} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="size-8" disabled={isAnyPending}>
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item._id)}
            className="size-8 text-error hover:text-error"
            disabled={isAnyPending}
          >
            {isDeletePending ? <Spinner className="size-4" /> : <Icon name="Trash2" size={16} />}
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div>
          <h3 className="font-medium text-foreground text-sm truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{categoryName}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary text-sm">{formatPrice(item.base_price)}</span>
          <div className="flex items-center gap-2">
            {item.is_featured && (
              <div className="flex items-center gap-1 text-warning">
                <Icon name="Star" size={12} />
                <span className="text-xs">Nổi bật</span>
              </div>
            )}
            {item.is_available ? (
              <div className="flex items-center gap-1 text-success">
                <Icon name="CheckCircle" size={12} />
                <span className="text-xs">Kích hoạt</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-warning">
                <Icon name="EyeOff" size={12} />
                <span className="text-xs">Tạm ngưng</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Cập nhật: {new Date(item.updated_at || item.created_at).toLocaleDateString('vi-VN')}
        </div>

        <div className="pt-2 border-t border-border">
          <Button
            variant={item.is_available ? 'outline' : 'default'}
            size="sm"
            fullWidth
            onClick={() => onToggleAvailability(item._id, item.is_available)}
            iconName={item.is_available ? 'EyeOff' : 'Eye'}
            iconPosition="left"
            disabled={isAnyPending}
          >
            {isToggleAvailabilityPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Đang cập nhật...
              </span>
            ) : item.is_available ? 'Tạm ngưng' : 'Kích hoạt'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
