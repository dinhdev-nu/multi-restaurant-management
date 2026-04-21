import React, { useState } from 'react';
import Button from '../../../components/Button';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

type OrderStatus   = 'completed' | 'processing' | 'pending' | 'cancelled' | 'refunded';
type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  _id: string;
  orderId?: string;
  timestamp: string;
  table?: string;
  staff?: string;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
}

interface OrderTableProps {
  orders: Order[];
  highlightedOrderId?: string;
  onViewDetails: (order: Order) => void;
  onReprintReceipt: (order: Order) => void;
  /** Called when user confirms payment for an unpaid order */
  onPayOrder: (order: Order) => void;
}

// ── Display helpers ────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (timestamp: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(timestamp));

// ── Badge components ───────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; label: string }> = {
  completed:  { color: 'bg-success text-success-foreground',     label: 'Hoàn thành'   },
  processing: { color: 'bg-warning text-warning-foreground',     label: 'Đang xử lý'  },
  pending:    { color: 'bg-blue-500 text-white',                 label: 'Chờ xử lý'   },
  cancelled:  { color: 'bg-error text-error-foreground',         label: 'Đã hủy'      },
  refunded:   { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền'},
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { color: string; label: string; icon: string }> = {
  paid:     { color: 'bg-success text-success-foreground',     label: 'Đã thanh toán',   icon: 'CheckCircle' },
  unpaid:   { color: 'bg-orange-500 text-white',               label: 'Chưa thanh toán', icon: 'AlertCircle' },
  refunded: { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền',   icon: 'RotateCcw'   },
};

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.completed;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.color}`}>
      {config.label}
    </span>
  );
};

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.unpaid;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.color}`}>
      <Icon name={config.icon} size={12} />
      {config.label}
    </span>
  );
};

// ── Sort icon ──────────────────────────────────────────────────────────────────

type SortKey = 'timestamp' | 'total';
interface SortConfig { key: SortKey; direction: 'asc' | 'desc' }

const SortIcon: React.FC<{ column: SortKey; sortConfig: SortConfig }> = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) {
    return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
  }
  return (
    <Icon
      name={sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'}
      size={16}
      className="text-primary"
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  highlightedOrderId,
  onViewDetails,
  onReprintReceipt,
  onPayOrder,
}) => {
  const [expandedRows, setExpandedRows]   = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig]       = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleRowExpansion = (orderId: string) => {
    const next = new Set(expandedRows);
    next.has(orderId) ? next.delete(orderId) : next.add(orderId);
    setExpandedRows(next);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOrderClick = (order: Order) => {
    if (order.paymentStatus === 'unpaid') {
      setSelectedOrder(order);
      setShowPaymentDialog(true);
    } else {
      onViewDetails(order);
    }
  };

  const handleConfirmPayment = () => {
    if (selectedOrder) onPayOrder(selectedOrder);
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
  };

  // ── Sorted data ────────────────────────────────────────────────────────────

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key === 'timestamp') {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortConfig.direction === 'asc' ? diff : -diff;
    }
    if (sortConfig.key === 'total') {
      return sortConfig.direction === 'asc' ? a.total - b.total : b.total - a.total;
    }
    return 0;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>Mã đơn</span>
                </div>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center space-x-2 hover:bg-transparent p-0"
                >
                  <span>Thời gian</span>
                  <SortIcon column="timestamp" sortConfig={sortConfig} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Bàn</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Nhân viên</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Món ăn</th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('total')}
                  className="flex items-center space-x-2 hover:bg-transparent p-0"
                >
                  <span>Tổng tiền</span>
                  <SortIcon column="total" sortConfig={sortConfig} />
                </Button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-left p-4 font-medium text-muted-foreground">TT Thanh toán</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className={`border-b border-border hover:bg-muted/30 transition-smooth ${
                  highlightedOrderId === order._id ? 'bg-primary/10 animate-pulse' : ''
                }`}>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order._id)}
                        className="w-6 h-6"
                      >
                        <Icon
                          name={expandedRows.has(order._id) ? 'ChevronDown' : 'ChevronRight'}
                          size={16}
                        />
                      </Button>
                      <span className="font-mono text-sm font-medium">
                        #{order.orderId ?? order._id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">
                      {formatDateTime(order.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">{order.table}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">{order.staff}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length} món
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <PaymentStatusBadge status={order.paymentStatus ?? 'unpaid'} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOrderClick(order)}
                        className="hover-scale"
                        title={order.paymentStatus === 'unpaid' ? 'Thanh toán' : 'Xem chi tiết'}
                      >
                        <Icon
                          name={order.paymentStatus === 'unpaid' ? 'CreditCard' : 'Eye'}
                          size={16}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReprintReceipt(order)}
                        className="hover-scale"
                      >
                        <Icon name="Printer" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(order._id) && (
                  <tr className="bg-gradient-to-b from-muted/30 to-muted/10">
                    <td colSpan={7} className="p-0">
                      <div className="px-4 py-4 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Icon name="FileText" size={16} className="text-primary" />
                            Chi tiết đơn hàng
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(order.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Items List */}
                          <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="ShoppingBag" size={12} />
                                  Món ăn ({order.items?.length})
                                </h5>
                              </div>
                              <div className="divide-y divide-border max-h-[200px] overflow-y-auto">
                                {order.items?.map((item, index) => (
                                  <div key={index} className="px-3 py-2 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                                            {item.quantity}
                                          </span>
                                          <span className="text-sm font-medium text-foreground truncate">
                                            {item.name}
                                          </span>
                                        </div>
                                        {item.note && (
                                          <p className="text-xs text-muted-foreground mt-0.5 ml-7 italic">
                                            {item.note}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                        {formatCurrency(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Summary & Info */}
                          <div className="space-y-3">
                            {/* Payment Summary */}
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="Calculator" size={12} />
                                  Tổng kết
                                </h5>
                              </div>
                              <div className="p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tạm tính:</span>
                                  <span className="font-medium text-foreground">{formatCurrency(order.subtotal ?? 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Thuế:</span>
                                  <span className="font-medium text-foreground">{formatCurrency(order.tax ?? 0)}</span>
                                </div>
                                {(order.discount ?? 0) > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giảm giá:</span>
                                    <span className="font-medium text-error">-{formatCurrency(order.discount!)}</span>
                                  </div>
                                )}
                                <div className="border-t border-border pt-1.5 mt-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-foreground">Tổng:</span>
                                    <span className="text-base font-bold text-primary">{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="Info" size={12} />
                                  Thông tin
                                </h5>
                              </div>
                              <div className="p-3 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bàn:</span>
                                  <span className="font-medium text-foreground">{order.table}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">NV:</span>
                                  <span className="font-medium text-foreground truncate ml-2">{order.staff}</span>
                                </div>
                                {order.specialInstructions && (
                                  <div className="pt-1.5 border-t border-border">
                                    <span className="text-muted-foreground block mb-1">Ghi chú:</span>
                                    <p className="text-foreground bg-muted/30 p-1.5 rounded text-xs italic">
                                      {order.specialInstructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="h-2 bg-muted/20" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedOrders.map((order) => (
          <div
            key={order._id}
            className={`border border-border rounded-lg p-4 space-y-3 ${
              highlightedOrderId === order._id ? 'bg-primary/10 border-primary animate-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="font-mono text-sm font-medium">#{order.orderId ?? order._id}</span>
                <StatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus ?? 'unpaid'} />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOrderClick(order)}
                  className="w-8 h-8"
                  title={order.paymentStatus === 'unpaid' ? 'Thanh toán' : 'Xem chi tiết'}
                >
                  <Icon name={order.paymentStatus === 'unpaid' ? 'CreditCard' : 'Eye'} size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReprintReceipt(order)}
                  className="w-8 h-8"
                >
                  <Icon name="Printer" size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Thời gian:</span>
                <p className="font-medium text-foreground">{formatDateTime(order.timestamp)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tổng tiền:</span>
                <p className="font-semibold text-foreground">{formatCurrency(order.total)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bàn:</span>
                <p className="font-medium text-foreground">{order.table}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nhân viên:</span>
                <p className="font-medium text-foreground">{order.staff}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">{order.items?.length} món</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPaymentDialog}
        onClose={handleCancelPayment}
        onConfirm={handleConfirmPayment}
        title="Thanh toán đơn hàng"
        message={`Bạn có muốn thanh toán đơn hàng ${selectedOrder?.orderId ?? selectedOrder?._id}? Tổng tiền: ${selectedOrder ? formatCurrency(selectedOrder.total) : ''}`}
        confirmText="Thanh toán ngay"
        cancelText="Hủy"
        variant="success"
        icon="CreditCard"
      />
    </div>
  );
};

export default OrderTable;
