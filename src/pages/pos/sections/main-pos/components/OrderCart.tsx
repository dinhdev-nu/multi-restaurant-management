import type { ChangeEvent } from 'react';
import Button from '../../../components/Button.tsx';
import Icon from '@/components/AppIcon';
import Input from '../../../components/Input.tsx';
import Select from '../../../components/Select.tsx';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface TableOption {
  value: string;
  label: string;
}

interface StaffOption {
  value: string;
  label: string;
}

interface OrderCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onClearCart: () => void;
  orderNumber?: string | null;
  draftOrderId?: string | null;
  draftCustomerInfo?: { name: string } | null;
  selectedTable?: string | null;
  onTableChange?: (value: string) => void;
  onSummaryChange?: (summary: { subtotal: number; discount: number; tax: number; total: number }) => void;
  selectedStaff?: string | null;
  onStaffChange?: (value: string) => void;
  tableOptions?: TableOption[];
  staffOptions?: StaffOption[];
  discountType?: 'percent' | 'amount';
  discountValue?: number;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const OrderCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
  orderNumber = null,
  draftOrderId = null,
  draftCustomerInfo = null,
  selectedTable = null,
  onTableChange,
  selectedStaff = null,
  onStaffChange,
  tableOptions = [],
  staffOptions = [],
  discountType = 'percent',
  discountValue = 0,
}: OrderCartProps) => {
  const subtotal = cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0;

  const discount = discountType === 'percent'
    ? subtotal * (discountValue / 100)
    : Math.min(discountValue, subtotal);

  const tax = (subtotal - discount) * 0.1;
  const finalTotal = subtotal - discount + tax;

  if (cartItems?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Icon name="ShoppingCart" size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Giỏ hàng trống</h3>
        <p className="text-sm text-muted-foreground">Thêm món ăn từ thực đơn để bắt đầu đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Header with Order Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Đơn hàng ({cartItems?.length} món)
            </h2>
            {draftOrderId ? (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Draft ID: <span className="font-mono font-medium text-primary">{draftOrderId.slice(-8)}</span>
                </p>
                {draftCustomerInfo && (
                  <p className="text-xs text-muted-foreground">
                    Khách: <span className="font-medium text-foreground">{draftCustomerInfo.name}</span>
                  </p>
                )}
              </div>
            ) : orderNumber ? (
              <p className="text-xs text-muted-foreground">
                Mã: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={onClearCart}
            className="text-error hover:text-error"
          >
            Xóa tất cả
          </Button>
        </div>

        {/* Table Selection */}
        {onTableChange && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Chọn bàn</p>
            <Select
              value={selectedTable ?? ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onTableChange(e.target.value)}
              options={[
                { value: 'takeaway', label: '🥡 Mang đi' },
                { value: 'delivery', label: '🚚 Giao hàng' },
                ...tableOptions,
              ]}
            />
          </div>
        )}

        {/* Staff Selection */}
        {onStaffChange && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Nhân viên phục vụ</p>
            <Select
              value={selectedStaff ?? ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onStaffChange(e.target.value)}
              options={staffOptions}
            />
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems?.map((item) => (
          <div key={item?._id} className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm">{item?.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item?.price)} x {item?.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item?._id, item?.quantity - 1)}
                  disabled={item?.quantity <= 1}
                  className="w-9 h-9 sm:w-8 sm:h-8 touch-target"
                >
                  <Icon name="Minus" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
                <span className="w-10 sm:w-8 text-center text-sm font-medium">{item?.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item?._id, item?.quantity + 1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 touch-target"
                >
                  <Icon name="Plus" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item?._id)}
                  className="w-9 h-9 sm:w-8 sm:h-8 text-error hover:text-error ml-1 touch-target"
                >
                  <Icon name="X" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Ghi chú cho món này..."
                value={item?.note ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateNote(item?._id, e.target.value)}
                className="text-xs"
              />
              <span className="font-semibold text-primary ml-2">
                {formatPrice(item?.price * item?.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border pt-4 space-y-3">
        {/* Discount Section */}
        <div className="bg-muted/20 rounded-lg p-3 space-y-2">
          <label className="text-sm font-medium text-foreground">Giảm giá</label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Nhập giảm giá"
                value={discountValue || ''}
                min="0"
                max={discountType === 'percent' ? 100 : subtotal}
                readOnly
              />
            </div>
            <Select
              value={discountType}
              onChange={() => {}}
              options={[
                { value: 'percent', label: '%' },
                { value: 'amount', label: 'VNĐ' },
              ]}
              className="w-24"
            />
          </div>
          {discountValue > 0 && (
            <p className="text-xs text-success flex items-center">
              <Icon name="Tag" size={12} className="mr-1" />
              Tiết kiệm: {formatPrice(discount)}
            </p>
          )}
        </div>

        {/* Summary Breakdown */}
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
            <span className="text-primary">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCart;
