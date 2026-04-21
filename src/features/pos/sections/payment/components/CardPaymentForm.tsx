import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface CardPaymentFormProps {
  totalAmount?: number;
  isProcessing?: boolean;
  errors?: Partial<Record<'cardNumber' | 'expiryDate' | 'cvv' | 'cardholderName', string>>;
  onPaymentSubmit: (cardData: CardFormData) => void;
  onCancel: () => void;
}

export interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const CARD_TYPES = [
  { name: 'Visa',       icon: 'CreditCard', color: 'text-blue-600'  },
  { name: 'Mastercard', icon: 'CreditCard', color: 'text-red-600'   },
  { name: 'JCB',        icon: 'CreditCard', color: 'text-green-600' },
];

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

/** Format card number to groups of 4: "1234 5678 9012 3456" */
const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const match = v.match(/\d{4,16}/g);
  const digits = (match && match[0]) || '';
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : v;
};

/** Format expiry to "MM/YY" */
const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\D/g, '');
  return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v;
};

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  totalAmount = 0,
  isProcessing = false,
  errors = {},
  onPaymentSubmit,
  onCancel,
}) => {
  const [cardNumber, setCardNumber]         = useState('');
  const [expiryDate, setExpiryDate]         = useState('');
  const [cvv, setCvv]                       = useState('');
  const [cardholderName, setCardholderName] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Thanh toán thẻ tín dụng/ghi nợ
        </h3>
        <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Supported Cards */}
      <div className="flex justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <span className="text-sm text-muted-foreground mr-2">Hỗ trợ:</span>
        {CARD_TYPES.map((card, index) => (
          <div key={index} className="flex items-center space-x-1">
            <Icon name={card.icon} size={20} className={card.color} />
            <span className="text-sm font-medium text-foreground">{card.name}</span>
          </div>
        ))}
      </div>

      {/* Card Form */}
      <div className="space-y-4">
        <Input
          label="Số thẻ"
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          error={errors.cardNumber}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ngày hết hạn"
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            error={errors.expiryDate}
          />
          <Input
            label="Mã CVV"
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
            placeholder="123"
            maxLength={4}
            error={errors.cvv}
          />
        </div>

        <Input
          label="Tên chủ thẻ"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          placeholder="NGUYEN VAN A"
          error={errors.cardholderName}
        />
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} className="text-blue-600" />
          <span className="text-sm text-blue-800">
            Thông tin thẻ được mã hóa và bảo mật tuyệt đối
          </span>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin">
              <Icon name="Loader2" size={20} className="text-primary" />
            </div>
            <span className="text-primary font-medium">Đang xử lý thanh toán...</span>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Vui lòng không tắt trình duyệt hoặc rời khỏi trang
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          variant="default"
          onClick={() => onPaymentSubmit({ cardNumber, expiryDate, cvv, cardholderName })}
          disabled={isProcessing}
          loading={isProcessing}
          className="flex-1"
          iconName="CreditCard"
          iconPosition="left"
        >
          {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
        </Button>
      </div>
    </div>
  );
};

export default CardPaymentForm;
