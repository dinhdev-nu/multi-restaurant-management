import React from 'react';
import Image from '@/components/AppImage';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import type { MenuItem } from '@/types/menu-type';
import { Spinner } from '@/components/ui/spinner';

type ItemAction = 'toggle-availability' | 'toggle-featured' | 'reorder-up' | 'reorder-down' | 'delete';

interface MenuTableProps {
  items: MenuItem[];
  categoryMap: Record<string, string>;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  isItemActionPending: (itemId: string, action: ItemAction) => boolean;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const StatusBadge: React.FC<{ isAvailable: boolean }> = ({ isAvailable }) => {
  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium bg-success/10 text-success border-success/20">
        <Icon name="CheckCircle" size={12} />
        <span>Kích hoạt</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium bg-warning/10 text-warning border-warning/20">
      <Icon name="EyeOff" size={12} />
      <span>Tạm ngưng</span>
    </span>
  );
};

const MenuTable: React.FC<MenuTableProps> = ({
  items,
  categoryMap,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  onMoveItem,
  isItemActionPending,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-foreground">Món ăn</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Danh mục</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Giá</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Trạng thái</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Nổi bật</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Cập nhật</th>
              <th className="text-center p-4 text-sm font-medium text-foreground w-44">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isMoveUpPending = isItemActionPending(item._id, 'reorder-up');
              const isMoveDownPending = isItemActionPending(item._id, 'reorder-down');
              const isToggleFeaturedPending = isItemActionPending(item._id, 'toggle-featured');
              const isToggleAvailabilityPending = isItemActionPending(item._id, 'toggle-availability');
              const isDeletePending = isItemActionPending(item._id, 'delete');
              const isAnyPending = isMoveUpPending || isMoveDownPending || isToggleFeaturedPending || isToggleAvailabilityPending || isDeletePending;

              return (
                <tr
                  key={item._id}
                  className="border-b border-border transition-smooth hover:bg-muted/30"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={item.images?.[0]?.url ?? ''} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate w-[200px]" title={item.description}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-sm text-foreground">{categoryMap[item.category_id] ?? 'Không rõ'}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-primary text-sm">{formatPrice(item.base_price)}</span>
                  </td>

                  <td className="p-4">
                    <StatusBadge isAvailable={item.is_available} />
                  </td>

                  <td className="p-4">
                    {item.is_featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-xs text-warning">
                        <Icon name="Star" size={12} />
                        Nổi bật
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Bình thường</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.updated_at || item.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveItem(item._id, 'up')}
                        className="size-8"
                        disabled={isAnyPending}
                        title="Đưa lên"
                      >
                        {isMoveUpPending ? <Spinner className="size-4" /> : <Icon name="ChevronUp" size={14} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveItem(item._id, 'down')}
                        className="size-8"
                        disabled={isAnyPending}
                        title="Đưa xuống"
                      >
                        {isMoveDownPending ? <Spinner className="size-4" /> : <Icon name="ChevronDown" size={14} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFeatured(item._id, item.is_featured)}
                        className="size-8"
                        disabled={isAnyPending}
                        title={item.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      >
                        {isToggleFeaturedPending ? <Spinner className="size-4" /> : <Icon name={item.is_featured ? 'StarOff' : 'Star'} size={14} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleAvailability(item._id, item.is_available)}
                        className="size-8"
                        disabled={isAnyPending}
                        title={item.is_available ? 'Tạm ngưng' : 'Kích hoạt'}
                      >
                        {isToggleAvailabilityPending ? <Spinner className="size-4" /> : <Icon name={item.is_available ? 'EyeOff' : 'Eye'} size={14} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="size-8"
                        disabled={isAnyPending}
                        title="Chỉnh sửa"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item._id)}
                        className="size-8 text-error hover:text-error"
                        disabled={isAnyPending}
                        title="Xóa"
                      >
                        {isDeletePending ? <Spinner className="size-4" /> : <Icon name="Trash2" size={14} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
