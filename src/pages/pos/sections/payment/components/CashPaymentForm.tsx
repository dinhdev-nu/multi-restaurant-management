import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface CashPaymentFormProps {
  totalAmount?: number;
  /** Pre-computed change amount from parent */
  change?: number;
  /** Error message (e.g. "Số tiền nhận không đủ") */
  amountError?: string;
  /** Quick-select preset amounts */
  quickAmounts?: number[];
  onAmountChange: (rawDigits: string) => void;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const CashPaymentForm: React.FC<CashPaymentFormProps> = ({
  totalAmount = 0,
  change = 0,
  amountError = '',
  quickAmounts = [],
  onAmountChange,
  onPaymentComplete,
  onCancel,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setDisplayValue(digits ? formatCurrency(Number(digits)) : '');
    onAmountChange(digits);
  };

  const handleQuickAmount = (amount: number) => {
    setDisplayValue(formatCurrency(amount));
    onAmountChange(amount.toString());
  };

  const isInsufficient = !!amountError;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">Thanh toán tiền mặt</h3>
        <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <Input
          label="Số tiền khách đưa"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="Nhập số tiền..."
          error={amountError}
          className="text-lg text-center"
        />

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickAmounts.slice(0, 6).map((amount, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(amount)}
              className="hover-scale"
            >
              {formatCurrency(amount)}
            </Button>
          ))}
        </div>
      </div>

      {/* Change Display */}
      {change > 0 && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="ArrowLeftRight" size={20} className="text-success" />
              <span className="font-medium text-success">Tiền thối:</span>
            </div>
            <span className="text-xl font-bold text-success">{formatCurrency(change)}</span>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tổng tiền:</span>
          <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tiền nhận:</span>
          <span className="font-medium text-foreground">{displayValue || '0 ₫'}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-border">
          <span className="text-muted-foreground">Tiền thối:</span>
          <span className="font-medium text-success">{formatCurrency(change)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button
          variant="success"
          onClick={onPaymentComplete}
          disabled={isInsufficient || !displayValue}
          className="flex-1"
          iconName="Check"
          iconPosition="left"
        >
          Hoàn tất thanh toán
        </Button>
      </div>
    </div>
  );
};

export default CashPaymentForm;
