import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, X, Tag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CartItem, User as UserType, OrderSummary } from '../types';
import { TABLE_OPTIONS } from '../mockData';
import { formatPrice } from '../utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onClearCart: () => void;
  orderNumber?: string | null;
  selectedTable?: string | null;
  onTableChange?: (value: string) => void;
  onSummaryChange?: (summary: OrderSummary) => void;
  user?: UserType | null;
  customerName?: string;
  onCustomerNameChange?: (value: string) => void;
  customerContact?: string;
  onCustomerContactChange?: (value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrderCart: React.FC<OrderCartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
  orderNumber = null,
  selectedTable = null,
  onTableChange,
  onSummaryChange,
  user = null,
  customerName = '',
  onCustomerNameChange,
  customerContact = '',
  onCustomerContactChange,
}) => {
  const [discountType,  setDiscountType]  = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // ── Memoised calculations ────────────────────────────────────────────────

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const discount = useMemo(() => {
    if (discountType === 'percent') return subtotal * (discountValue / 100);
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountType, discountValue]);

  const tax = useMemo(() => (subtotal - discount) * 0.1, [subtotal, discount]);

  const finalTotal = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax]);

  useEffect(() => {
    onSummaryChange?.({ subtotal, discount, tax, total: finalTotal });
  }, [subtotal, discount, tax, finalTotal, onSummaryChange]);

  // ── Empty state ──────────────────────────────────────────────────────────

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShoppingCart size={48} className="text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Giỏ hàng trống</h3>
        <p className="text-sm text-muted-foreground">Thêm món ăn từ thực đơn để bắt đầu đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {cartItems.length} món
            </p>
            {orderNumber && (
              <p className="text-xs text-muted-foreground">
                Mã: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 size={14} />
            Xóa tất cả
          </Button>
        </div>

        {/* Table selector */}
        {onTableChange && (
          <div className="space-y-1.5">
            <Label htmlFor="table-select">Chọn bàn</Label>
            <Select
              value={selectedTable ?? ''}
              onValueChange={onTableChange}
            >
              <SelectTrigger id="table-select">
                <SelectValue placeholder="Chọn bàn..." />
              </SelectTrigger>
              <SelectContent>
                {TABLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item._id} className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => onRemoveItem(item._id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 ml-1 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Input
                type="text"
                placeholder="Ghi chú cho món này..."
                value={item.note ?? ''}
                onChange={(e) => onUpdateNote(item._id, e.target.value)}
                className="h-7 text-xs px-2"
              />
              <span className="font-semibold text-foreground text-sm whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer info */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Thông tin khách hàng</p>
        {user ? (
          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.user_name} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {user.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user.user_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <CheckCircle size={16} className="text-success" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="customer-name"
              type="text"
              placeholder="Nhập tên khách hàng..."
              value={customerName}
              onChange={(e) => onCustomerNameChange?.(e.target.value)}
            />
            <Input
              id="customer-contact"
              type="text"
              inputMode="email"
              placeholder="Nhập email hoặc số điện thoại..."
              value={customerContact}
              onChange={(e) => onCustomerContactChange?.(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="border-t border-border pt-4 space-y-3">
        {/* Discount */}
        <div className="bg-secondary/30 rounded-lg p-3 border border-border space-y-2">
          <Label htmlFor="discount-value">Giảm giá</Label>
          <div className="flex space-x-2">
            <Input
              id="discount-value"
              type="number"
              placeholder="Nhập giảm giá"
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              min="0"
              max={discountType === 'percent' ? 100 : subtotal}
              className="flex-1"
            />
            <Select
              value={discountType}
              onValueChange={(v) => {
                setDiscountType(v as 'percent' | 'amount');
                setDiscountValue(0);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="amount">VNĐ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {discountValue > 0 && (
            <p className="text-xs text-success flex items-center gap-1">
              <Tag size={12} />
              Tiết kiệm: {formatPrice(discount)}
            </p>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá:</span>
              <span className="text-success">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (10%):</span>
            <span className="text-foreground">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
            <span className="text-foreground">Tổng cộng:</span>
            <span className="text-foreground">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCart;
