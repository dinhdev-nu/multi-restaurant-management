import React from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';

interface ReceiptItem {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentData {
  _id?: string;
  createdAt?: string;
  method?: string;
  paidAmount?: number;
  orderAmount?: number;
  changeAmount?: number;
}

export interface OrderData {
  _id?: string;
  tableNumber?: string;
  table?: string;
  items?: ReceiptItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
}

interface PaymentSuccessProps {
  paymentData?: PaymentData;
  orderData?: OrderData;
  isPrinting?: boolean;
  isSending?: boolean;
  onPrintReceipt: () => void;
  onSendDigitalReceipt: () => void;
  onNewOrder: () => void;
  onBackToDashboard: () => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt', CASH: 'Tiền mặt',
  card: 'Thẻ tín dụng',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  banking: 'Chuyển khoản',
  qr: 'QR Code', QR_CODE: 'QR Code',
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  paymentData = {},
  orderData = {},
  isPrinting = false,
  isSending = false,
  onPrintReceipt,
  onSendDigitalReceipt,
  onNewOrder,
  onBackToDashboard,
}) => {
  const items = orderData.items ?? [];
  const hasChange = (paymentData.changeAmount ?? 0) > 0;
  const tableDisplay = orderData.tableNumber ?? orderData.table;

  return (
    <div className="space-y-4">
      {/* Receipt Container */}
      <div className="bg-white dark:bg-surface border border-border rounded-lg overflow-hidden font-mono text-sm">
        {/* Receipt Header */}
        <div className="text-center py-4 border-b border-dashed border-border">
          <div className="flex items-center justify-center gap-2 text-success mb-1">
            <Icon name="CheckCircle" size={20} />
            <span className="font-bold text-base">THANH TOÁN THÀNH CÔNG</span>
          </div>
          <p className="text-muted-foreground text-xs">
            {formatDate(paymentData.createdAt ?? new Date().toISOString())}
          </p>
        </div>

        {/* Order Info */}
        <div className="px-4 py-3 border-b border-dashed border-border text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mã GD:</span>
            <span>{paymentData._id ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Đơn hàng:</span>
            <span>{orderData._id ?? 'N/A'}</span>
          </div>
          {tableDisplay && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vị trí:</span>
              <span>{tableDisplay === 'takeaway' ? 'Mang đi' : `Bàn ${tableDisplay}`}</span>
            </div>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="px-4 py-3 border-b border-dashed border-border">
            <div className="text-xs text-muted-foreground mb-2">CHI TIẾT ĐƠN HÀNG</div>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={item.itemId ?? index} className="flex justify-between text-xs">
                  <span className="flex-1">{item.quantity}x {item.name}</span>
                  <span className="ml-2">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="px-4 py-3 border-b border-dashed border-border text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>{formatCurrency(orderData.subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Giảm giá</span>
            <span>-{formatCurrency(orderData.discount ?? 0)}</span>
          </div>
          {(orderData.tax ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thuế (10%)</span>
              <span>{formatCurrency(orderData.tax!)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-border">
            <span>TỔNG CỘNG</span>
            <span>{formatCurrency(paymentData.orderAmount ?? orderData.total ?? 0)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="px-4 py-3 border-b border-dashed border-border text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thanh toán</span>
            <span>{paymentData.method ? (PAYMENT_METHOD_LABELS[paymentData.method] ?? 'Tiền mặt') : 'Tiền mặt'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiền nhận</span>
            <span>
              {formatCurrency(paymentData.paidAmount ?? paymentData.orderAmount ?? orderData.total ?? 0)}
            </span>
          </div>
          {hasChange && (
            <div className="flex justify-between font-bold">
              <span>Tiền thối</span>
              <span className="text-success">{formatCurrency(paymentData.changeAmount!)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-3 text-xs text-muted-foreground">
          <p>Cảm ơn quý khách!</p>
          <p>Hẹn gặp lại</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrintReceipt}
          loading={isPrinting}
          disabled={isPrinting}
          iconName="Printer"
          iconPosition="left"
        >
          In hóa đơn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSendDigitalReceipt}
          loading={isSending}
          disabled={isSending}
          iconName="Mail"
          iconPosition="left"
        >
          Gửi email
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="default" onClick={onNewOrder} iconName="Plus" iconPosition="left">
          Đơn mới
        </Button>
        <Button variant="outline" onClick={onBackToDashboard} iconName="ArrowLeft" iconPosition="left">
          Trang chính
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
