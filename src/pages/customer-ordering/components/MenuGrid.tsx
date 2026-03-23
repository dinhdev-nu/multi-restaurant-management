import React from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MenuItem } from '../types';
import { formatPrice } from '../utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStockBadge = (stock: number, status?: string): { label: string; className: string } => {
  if (status === 'unavailable' || stock === 0)
    return { label: 'Hết hàng', className: 'bg-destructive/20 text-destructive border-destructive/30' };
  if (stock <= 5)
    return { label: 'Sắp hết', className: 'bg-warning/20 text-warning border-warning/30' };
  return { label: 'Còn hàng', className: 'bg-success/20 text-success border-success/30' };
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuGridProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-6">
      <UtensilsCrossed size={64} className="text-muted-foreground/30" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">Không có món nào</h3>
    <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
      Danh mục này hiện chưa có món ăn. Vui lòng chọn danh mục khác hoặc thêm món mới.
    </p>
    <div className="flex space-x-3">
      <Button variant="outline">
        <Plus size={16} className="mr-1.5" />
        Thêm món mới
      </Button>
      <Button>Tải lại</Button>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const MenuGrid: React.FC<MenuGridProps> = ({ menuItems, onAddToCart }) => {
  if (!menuItems || menuItems.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menuItems.map((item) => {
        const stock = item.stock_quantity ?? 0;
        const isUnavailable = stock === 0 || item.status === 'unavailable';
        const badge = getStockBadge(stock, item.status);

        return (
          <div
            key={item._id}
            className={`
              bg-card border border-border rounded-lg overflow-hidden
              hover:shadow-md hover:border-accent/50 transition-all duration-200
              ${isUnavailable ? 'opacity-60' : ''}
            `}
          >
            {/* Image */}
            <div className="relative">
              <div className="w-full h-32 overflow-hidden bg-secondary">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed size={32} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Badge className={`absolute top-2 right-2 ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col">
              <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{item.name}</h3>
              <div className="h-5 mb-2">
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-semibold text-foreground text-sm">{formatPrice(item.price)}</span>
                <Button
                  size="xs"
                  onClick={() => onAddToCart(item)}
                  disabled={isUnavailable}
                >
                  <Plus size={14} />
                  <span className="hidden md:inline ml-1">Thêm</span>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuGrid;
