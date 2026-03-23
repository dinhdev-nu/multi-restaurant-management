import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Receipt, CheckCircle2, Clock,
  Hash, UtensilsCrossed, User, History,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Order } from '../types';
import { formatPrice } from '../utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (timestamp?: string): string => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

interface StatusBadge { label: string; className: string }

const getStatusBadge = (status: Order['status']): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    pending:    { label: 'Chờ xử lý',  className: 'bg-warning/20 text-warning border-warning/30' },
    processing: { label: 'Đang làm',   className: 'bg-primary/20 text-primary border-primary/30' },
    completed:  { label: 'Hoàn thành', className: 'bg-success/20 text-success border-success/30' },
    cancelled:  { label: 'Đã hủy',     className: 'bg-destructive/20 text-destructive border-destructive/30' },
  };
  return map[status] ?? { label: status, className: 'bg-muted text-muted-foreground border-border' };
};

const getPaymentBadge = (paymentStatus?: string): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    unpaid:   { label: 'Chưa thanh toán', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    paid:     { label: 'Đã thanh toán',   className: 'bg-success/20 text-success border-success/30' },
    refunded: { label: 'Đã hoàn tiền',    className: 'bg-muted text-muted-foreground border-border' },
  };
  return map[paymentStatus ?? ''] ?? { label: paymentStatus ?? '', className: 'bg-muted text-muted-foreground border-border' };
};

interface ExpiredInfo { text: string; expired: boolean; urgent?: boolean }

const formatTimeUntilExpired = (iso: string): ExpiredInfo => {
  const s = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (s < 0)     return { text: 'Hết hạn',                          expired: true  };
  if (s < 60)    return { text: `Còn ${s}s`,                        expired: false, urgent: true  };
  if (s < 3600)  return { text: `Còn ${Math.floor(s / 60)} phút`,   expired: false, urgent: s < 300 };
  if (s < 86400) return { text: `Còn ${Math.floor(s / 3600)} giờ`,  expired: false, urgent: false };
  return           { text: `Còn ${Math.floor(s / 86400)} ngày`,   expired: false, urgent: false };
};

const isExpired = (order: Order): boolean =>
  !!order.expiredAt && new Date(order.expiredAt).getTime() < Date.now();

// ─── Order card ───────────────────────────────────────────────────────────────

interface OrderCardProps { order: Order }

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusBadge  = getStatusBadge(order.status);
  const paymentBadge = getPaymentBadge(order.paymentStatus);
  const expiredInfo  = order.expiredAt ? formatTimeUntilExpired(order.expiredAt) : null;

  return (
    <div className="p-4 border-b border-border last:border-b-0 hover:bg-secondary transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-1.5 mb-1">
            <Hash size={11} className="text-muted-foreground" />
            <span className="text-xs font-mono font-medium text-foreground">
              {order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 mb-1">
            <UtensilsCrossed size={13} className="text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{order.table}</span>
          </div>
          <p className="text-xs text-muted-foreground">{formatTime(order.timestamp ?? order.createdAt)}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
          <Badge className={paymentBadge.className}>{paymentBadge.label}</Badge>
          {expiredInfo && (
            <Badge className={`inline-flex items-center gap-1 ${
              expiredInfo.expired
                ? 'bg-destructive/20 text-destructive border-destructive/30'
                : expiredInfo.urgent
                  ? 'bg-warning/20 text-warning border-warning/30 animate-pulse'
                  : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              <Clock size={10} />
              {expiredInfo.text}
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map((item, idx) => (
          <div key={`${item.name}-${idx}`} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-muted-foreground">{item.quantity}x</span>
              <span className="text-foreground truncate">{item.name}</span>
            </div>
            <span className="text-foreground font-medium ml-2">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-1 pt-2 border-t border-border">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Tạm tính:</span>
          <span className="text-foreground">{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Giảm giá:</span>
            <span className="text-success">-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">VAT:</span>
          <span className="text-foreground">{formatPrice(order.tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
          <span className="text-foreground">Tổng cộng:</span>
          <span className="text-foreground">{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.staff && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
          <User size={11} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Nhân viên: {order.staff}</span>
        </div>
      )}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
  bgClass: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, count, colorClass, bgClass }) => (
  <div className={`px-4 py-2 border-b border-border sticky top-0 z-10 ${bgClass}`}>
    <div className="flex items-center space-x-2">
      <span className={colorClass}>{icon}</span>
      <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
        {label} ({count})
      </span>
    </div>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrdersDropdownProps {
  draftOrders?: Order[];
  confirmedOrders?: Order[];
}

// ─── Main component ───────────────────────────────────────────────────────────

const OrdersDropdown: React.FC<OrdersDropdownProps> = ({
  draftOrders = [],
  confirmedOrders = [],
}) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const validDraft     = draftOrders.filter((o) => !isExpired(o));
  const validConfirmed = confirmedOrders.filter((o) => !isExpired(o));
  const total          = validDraft.length + validConfirmed.length;

  const panelClass =
    'fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-[480px] bg-card border border-border rounded-lg shadow-lg z-[1150]';

  if (total === 0) {
    return (
      <div className={panelClass}>
        <div className="p-8 text-center">
          <ShoppingCart size={48} className="text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">Chưa có đơn hàng</h3>
          <p className="text-xs text-muted-foreground">Bạn chưa đặt đơn hàng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Đơn hàng của tôi</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {validConfirmed.length} đã xác nhận, {validDraft.length} chờ xác nhận
          </p>
        </div>
        <Receipt size={18} className="text-muted-foreground" />
      </div>

      {/* List */}
      <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
        {validConfirmed.length > 0 && (
          <div>
            <SectionHeader
              icon={<CheckCircle2 size={14} />}
              label="Đơn đã xác nhận"
              count={validConfirmed.length}
              colorClass="text-success"
              bgClass="bg-success/10"
            />
            {validConfirmed.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}

        {validDraft.length > 0 && (
          <div>
            <SectionHeader
              icon={<Clock size={14} />}
              label="Đơn chờ xác nhận"
              count={validDraft.length}
              colorClass="text-warning"
              bgClass="bg-warning/10"
            />
            {validDraft.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button className="w-full inline-flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
          <History size={14} />
          Xem tất cả đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrdersDropdown;
