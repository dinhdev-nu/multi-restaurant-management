import React, { useState } from 'react';
import { Search, QrCode, UserPlus, Clock, Star, Droplets, Package, ShoppingBag, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MenuItem } from '../types';
import { QUICK_ADD_ITEMS } from '../mockData';
import { formatPrice } from '../utils';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  Package,
  ShoppingBag,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuickActionsProps {
  onBarcodeSearch: (barcode: string) => void;
  onCustomerSearch: (query: string) => void;
  onQuickAdd: (item: MenuItem) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuickActions: React.FC<QuickActionsProps> = ({
  onBarcodeSearch,
  onCustomerSearch,
  onQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) onBarcodeSearch(q);
    else onCustomerSearch(q);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Tìm món ăn hoặc mã vạch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search size={18} />
        </Button>
      </form>

      {/* Quick action buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { icon: QrCode,    label: 'Quét mã',     onClick: () => setShowBarcodeScanner(!showBarcodeScanner) },
          { icon: UserPlus,  label: 'Khách hàng',  onClick: () => {} },
          { icon: Clock,     label: 'Đơn gần đây', onClick: () => {} },
          { icon: Star,      label: 'Yêu thích',   onClick: () => {} },
        ].map(({ icon: Icon, label, onClick }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            className="whitespace-nowrap flex-shrink-0"
          >
            <Icon size={14} className="mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Barcode scanner panel */}
      {showBarcodeScanner && (
        <div className="bg-secondary/50 rounded-lg p-4 border border-border animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground text-sm">Quét mã vạch</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowBarcodeScanner(false)}
            >
              <X size={14} />
            </Button>
          </div>
          <div className="rounded-lg p-6 text-center border-2 border-dashed border-border bg-card">
            <QrCode size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Đưa mã vạch vào khung hình</p>
            <p className="text-xs text-muted-foreground">Hoặc nhập mã vạch vào ô tìm kiếm</p>
          </div>
        </div>
      )}

      {/* Quick add items */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Thêm nhanh</h4>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ADD_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => onQuickAdd(item)}
                className="flex flex-col items-center p-2 rounded-lg border border-border bg-card
                  hover:bg-secondary transition-all text-center"
              >
                {IconComponent && <IconComponent size={16} className="mb-1 text-muted-foreground" />}
                <span className="text-xs text-foreground">{item.name}</span>
                <span className="text-xs font-medium text-foreground">{formatPrice(item.price)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
