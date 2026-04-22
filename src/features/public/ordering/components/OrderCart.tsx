import { type ChangeEvent, useEffect, useMemo, useState } from "react"

import Icon from "@/components/AppIcon"
import Button from "@/features/pos/components/Button"
import Input from "@/features/pos/components/Input"
import Select from "@/features/pos/components/Select"

import type { CartItem, OrderSummary, OrderingUser, TableOption } from "../types"

interface OrderCartProps {
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onUpdateNote: (itemId: string, note: string) => void
  onClearCart: () => void
  orderNumber?: string | null
  selectedTable?: string | null
  onTableChange?: (value: string) => void
  tableOptions?: TableOption[]
  onSummaryChange?: (summary: OrderSummary) => void
  user?: OrderingUser | null
  customerName?: string
  onCustomerNameChange?: (value: string) => void
  customerContact?: string
  onCustomerContactChange?: (value: string) => void
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)

const OrderCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
  orderNumber = null,
  selectedTable = null,
  onTableChange,
  tableOptions = [],
  onSummaryChange,
  user = null,
  customerName = "",
  onCustomerNameChange,
  customerContact = "",
  onCustomerContactChange,
}: OrderCartProps) => {
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent")
  const [discountValue, setDiscountValue] = useState(0)

  const summary = useMemo<OrderSummary>(() => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const discount = discountType === "percent"
      ? subtotal * (discountValue / 100)
      : Math.min(discountValue, subtotal)
    const tax = (subtotal - discount) * 0.1

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
    }
  }, [cartItems, discountType, discountValue])

  useEffect(() => {
    onSummaryChange?.(summary)
  }, [onSummaryChange, summary])

  if (cartItems.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Icon name="ShoppingCart" size={48} className="mb-4 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium text-muted-foreground">Giỏ hàng trống</h3>
        <p className="text-sm text-muted-foreground">Thêm món ăn từ thực đơn để bắt đầu đơn hàng</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Đơn hàng ({cartItems.length} món)</h2>
            {orderNumber && (
              <p className="text-xs text-muted-foreground">
                Mã: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
              </p>
            )}
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

        {onTableChange && (
          <Select
            label="Chọn bàn"
            value={selectedTable ?? ""}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onTableChange(event.target.value)}
            options={[
              { value: "takeaway", label: "🥡 Mang đi" },
              { value: "delivery", label: "🚚 Giao hàng" },
              ...tableOptions,
            ]}
            placeholder="Chọn bàn..."
          />
        )}
      </div>

      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item._id} className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="touch-target h-9 w-9 sm:h-8 sm:w-8"
                >
                  <Icon name="Minus" size={16} className="sm:h-3.5 sm:w-3.5" />
                </Button>
                <span className="w-10 text-center text-sm font-medium sm:w-8">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                  className="touch-target h-9 w-9 sm:h-8 sm:w-8"
                >
                  <Icon name="Plus" size={16} className="sm:h-3.5 sm:w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item._id)}
                  className="touch-target ml-1 h-9 w-9 text-error hover:text-error sm:h-8 sm:w-8"
                >
                  <Icon name="X" size={16} className="sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Ghi chú cho món này..."
                value={item.note ?? ""}
                onChange={(event) => onUpdateNote(item._id, event.target.value)}
                className="text-xs"
              />
              <span className="ml-2 font-semibold text-primary">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Thông tin khách hàng</label>
        {user ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center space-x-3">
              {user.avatar_url || user.avatar ? (
                <img
                  src={user.avatar_url ?? user.avatar ?? undefined}
                  alt={user.full_name ?? user.user_name ?? "User"}
                  className="h-10 w-10 rounded-full border-2 border-border object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = "/assets/images/user_avatar.jpg"
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Icon name="User" size={20} color="white" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user.full_name ?? user.user_name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email ?? "Không có email"}</p>
              </div>
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nhập tên khách hàng..."
              value={customerName}
              onChange={(event) => onCustomerNameChange?.(event.target.value)}
            />
            <Input
              type="text"
              placeholder="Nhập email hoặc số điện thoại..."
              value={customerContact}
              onChange={(event) => onCustomerContactChange?.(event.target.value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="space-y-2 rounded-lg bg-muted/20 p-3">
          <label className="text-sm font-medium text-foreground">Giảm giá</label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Nhập giảm giá"
                value={discountValue || ""}
                onChange={(event) => setDiscountValue(Number.parseFloat(event.target.value) || 0)}
                min="0"
                max={discountType === "percent" ? 100 : summary.subtotal}
              />
            </div>
            <Select
              value={discountType}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const nextType = event.target.value as "percent" | "amount"
                setDiscountType(nextType)
                setDiscountValue(0)
              }}
              options={[
                { value: "percent", label: "%" },
                { value: "amount", label: "VNĐ" },
              ]}
              className="w-24"
            />
          </div>
          {discountValue > 0 && (
            <p className="flex items-center text-xs text-success">
              <Icon name="Tag" size={12} className="mr-1" />
              Tiết kiệm: {formatPrice(summary.discount)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span className="text-foreground">{formatPrice(summary.subtotal)}</span>
          </div>

          {discountValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá:</span>
              <span className="text-success">-{formatPrice(summary.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (10%):</span>
            <span className="text-foreground">{formatPrice(summary.tax)}</span>
          </div>

          <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
            <span className="text-foreground">Tổng cộng:</span>
            <span className="text-primary">{formatPrice(summary.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderCart