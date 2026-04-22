import { useEffect, useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/features/pos/components/Button';
import { Badge } from '@/components/ui/badge';

import type { CustomerOrder, PaymentStatus, OrderStatus } from '../types';

type BadgeTone = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusBadgeConfig = {
    label: string;
    variant: BadgeTone;
    className?: string;
};

interface OrdersDropdownProps {
    draftOrders?: CustomerOrder[];
    confirmedOrders?: CustomerOrder[];
}

const OrdersDropdown = ({ draftOrders = [], confirmedOrders = [] }: OrdersDropdownProps) => {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update timestamp every second for real-time countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatTime = (timestamp?: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: OrderStatus): StatusBadgeConfig => {
        const statusMap: Record<OrderStatus, StatusBadgeConfig> = {
            pending: { label: 'Chờ xử lý', variant: 'outline', className: 'bg-warning/10 text-warning border-warning/20' },
            processing: { label: 'Đang làm', variant: 'outline', className: 'bg-info/10 text-info border-info/20' },
            completed: { label: 'Hoàn thành', variant: 'outline', className: 'bg-success/10 text-success border-success/20' },
            cancelled: { label: 'Đã hủy', variant: 'destructive' }
        };
        return statusMap[status] || { label: status, variant: 'default' };
    };

    const getPaymentStatusBadge = (paymentStatus: PaymentStatus): StatusBadgeConfig => {
        const statusMap: Record<PaymentStatus, StatusBadgeConfig> = {
            unpaid: { label: 'Chưa thanh toán', variant: 'destructive' },
            paid: { label: 'Đã thanh toán', variant: 'outline', className: 'bg-success/10 text-success border-success/20' },
            refunded: { label: 'Đã hoàn tiền', variant: 'secondary' }
        };
        return statusMap[paymentStatus] || { label: paymentStatus, variant: 'default' };
    };

    const formatTimeUntilExpired = (iso?: string) => {
        if (!iso) return null;
        const s = Math.floor((new Date(iso).getTime() - currentTime) / 1000);
        if (s < 0) return { text: 'Hết hạn', expired: true };
        if (s < 60) return { text: `Còn ${s}s`, expired: false, urgent: true };
        if (s < 300) return { text: `Còn ${Math.floor(s / 60)} phút`, expired: false, urgent: true };
        if (s < 3600) return { text: `Còn ${Math.floor(s / 60)} phút`, expired: false, urgent: false };
        if (s < 86400) return { text: `Còn ${Math.floor(s / 3600)} giờ`, expired: false, urgent: false };
        return { text: `Còn ${Math.floor(s / 86400)} ngày`, expired: false, urgent: false };
    };

    const isOrderExpired = (order: CustomerOrder) => {
        if (!order.expiredAt) return false;
        return new Date(order.expiredAt).getTime() < currentTime;
    };

    // Filter out expired orders
    const validDraftOrders = draftOrders.filter((o) => !isOrderExpired(o));
    const validConfirmedOrders = confirmedOrders.filter((o) => !isOrderExpired(o));

    const totalOrders = validDraftOrders.length + validConfirmedOrders.length;

    if (totalOrders === 0) {
        return (
            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-96 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-8 text-center">
                    <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-popover-foreground mb-1">
                        Chưa có đơn hàng
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Bạn chưa đặt đơn hàng nào
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-[480px] bg-popover border border-border rounded-lg shadow-modal z-1150">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-popover-foreground">Đơn hàng của tôi</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {validConfirmedOrders.length} đã xác nhận, {validDraftOrders.length} chờ xác nhận
                    </p>
                </div>
                <Icon name="Receipt" size={20} className="text-muted-foreground" />
            </div>

            {/* Orders List */}
            <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
                {/* Confirmed Orders Section - Hiển thị trước */}
                {validConfirmedOrders.length > 0 && (
                    <div>
                        <div className="px-4 py-2 bg-success/10 border-b border-border sticky top-0 z-10">
                            <div className="flex items-center space-x-2">
                                <Icon name="CheckCircle2" size={14} className="text-success" />
                                <span className="text-xs font-semibold text-success uppercase tracking-wider">
                                    Đơn đã xác nhận ({validConfirmedOrders.length})
                                </span>
                            </div>
                        </div>
                        {validConfirmedOrders.map((order) => {
                            const statusBadge = getStatusBadge(order.status);
                            const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
                            const expiredInfo = order.expiredAt ? formatTimeUntilExpired(order.expiredAt) : null;

                            return (
                                <div
                                    key={order._id}
                                    className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-smooth"
                                >
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            {/* Order ID */}
                                            <div className="flex items-center space-x-2 mb-1.5">
                                                <Icon name="Hash" size={12} className="text-muted-foreground" />
                                                <span className="text-xs font-mono font-medium text-primary">
                                                    {order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                                                </span>
                                            </div>
                                            {/* Table */}
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Icon name="UtensilsCrossed" size={14} className="text-muted-foreground" />
                                                <span className="text-xs font-medium text-foreground">
                                                    {order.table}
                                                </span>
                                            </div>
                                            {/* Timestamp */}
                                            <p className="text-xs text-muted-foreground">
                                                {formatTime(order.timestamp || order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex flex-row flex-wrap items-center justify-end gap-1.5">
                                            <Badge variant={statusBadge.variant} className={`text-xs ${statusBadge.className || ''}`}>
                                                {statusBadge.label}
                                            </Badge>
                                            <Badge variant={paymentBadge.variant} className={`text-xs ${paymentBadge.className || ''}`}>
                                                {paymentBadge.label}
                                            </Badge>
                                            {/* Expired timer for draft orders */}
                                            {expiredInfo && (
                                                <div className={`text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${expiredInfo.expired
                                                    ? 'bg-error/10 text-error border-error/20'
                                                    : expiredInfo.urgent
                                                        ? 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                                                        : 'bg-info/10 text-info border-info/20'
                                                    }`}>
                                                    <Icon name="Clock" size={10} className="inline mr-1" />
                                                    {expiredInfo.text}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-1.5 mb-3">
                                        {order.items?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <div className="flex items-center space-x-2 flex-1">
                                                    <span className="text-muted-foreground">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-foreground truncate">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-foreground font-medium ml-2">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="space-y-1 pt-2 border-t border-border/50">
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
                                        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/50">
                                            <span className="text-foreground">Tổng cộng:</span>
                                            <span className="text-primary">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    {/* Staff Info */}
                                    {order.staff && (
                                        <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border/50">
                                            <Icon name="User" size={12} className="text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                Nhân viên: {order.staff}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Draft Orders Section - Hiển thị sau */}
                {validDraftOrders.length > 0 && (
                    <div>
                        <div className="px-4 py-2 bg-warning/10 border-b border-border sticky top-0 z-10">
                            <div className="flex items-center space-x-2">
                                <Icon name="Clock" size={14} className="text-warning" />
                                <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                                    Đơn chờ xác nhận ({validDraftOrders.length})
                                </span>
                            </div>
                        </div>
                        {validDraftOrders.map((order) => {
                            const statusBadge = getStatusBadge(order.status);
                            const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
                            const expiredInfo = order.expiredAt ? formatTimeUntilExpired(order.expiredAt) : null;

                            return (
                                <div
                                    key={order._id}
                                    className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-smooth"
                                >
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            {/* Order ID */}
                                            <div className="flex items-center space-x-2 mb-1.5">
                                                <Icon name="Hash" size={12} className="text-muted-foreground" />
                                                <span className="text-xs font-mono font-medium text-primary">
                                                    {order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                                                </span>
                                            </div>
                                            {/* Table */}
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Icon name="UtensilsCrossed" size={14} className="text-muted-foreground" />
                                                <span className="text-xs font-medium text-foreground">
                                                    {order.table}
                                                </span>
                                            </div>
                                            {/* Timestamp */}
                                            <p className="text-xs text-muted-foreground">
                                                {formatTime(order.timestamp || order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex flex-row flex-wrap items-center justify-end gap-1.5">
                                            <Badge variant={statusBadge.variant} className={`text-xs ${statusBadge.className || ''}`}>
                                                {statusBadge.label}
                                            </Badge>
                                            <Badge variant={paymentBadge.variant} className={`text-xs ${paymentBadge.className || ''}`}>
                                                {paymentBadge.label}
                                            </Badge>
                                            {/* Expired timer for draft orders */}
                                            {expiredInfo && (
                                                <div className={`text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${expiredInfo.expired
                                                    ? 'bg-error/10 text-error border-error/20'
                                                    : expiredInfo.urgent
                                                        ? 'bg-warning/10 text-warning border-warning/20 animate-pulse'
                                                        : 'bg-info/10 text-info border-info/20'
                                                    }`}>
                                                    <Icon name="Clock" size={10} className="inline mr-1" />
                                                    {expiredInfo.text}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-1.5 mb-3">
                                        {order.items?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <div className="flex items-center space-x-2 flex-1">
                                                    <span className="text-muted-foreground">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-foreground truncate">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-foreground font-medium ml-2">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="space-y-1 pt-2 border-t border-border/50">
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
                                        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/50">
                                            <span className="text-foreground">Tổng cộng:</span>
                                            <span className="text-primary">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    {/* Staff Info */}
                                    {order.staff && (
                                        <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border/50">
                                            <Icon name="User" size={12} className="text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                Nhân viên: {order.staff}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" fullWidth iconName="History" iconPosition="left">
                    Xem tất cả đơn hàng
                </Button>
            </div>
        </div>
    );
};

export default OrdersDropdown;
