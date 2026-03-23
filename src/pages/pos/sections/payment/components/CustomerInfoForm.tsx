import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Input from '../../components/Input';
import { Checkbox } from '../../components/Checkbox';
import Button from '../../components/Button';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  sendDigitalReceipt: boolean;
  saveCustomer: boolean;
}

interface FrequentCustomer {
  name: string;
  phone: string;
  email: string;
}

interface CustomerInfoFormProps {
  initialData?: Partial<CustomerInfo>;
  errors?: Partial<Record<keyof CustomerInfo | 'contact', string>>;
  frequentCustomers?: FrequentCustomer[];
  onFieldChange: (field: keyof CustomerInfo, value: string | boolean) => void;
  onSave: (info: CustomerInfo) => void;
  onSkip: () => void;
}

const DEFAULT_FREQUENT_CUSTOMERS: FrequentCustomer[] = [
  { name: 'Nguyễn Văn An',  phone: '0901 234 567', email: 'an@email.com'    },
  { name: 'Trần Thị Bình',  phone: '0902 345 678', email: 'binh@email.com'  },
  { name: 'Lê Văn Cường',   phone: '0903 456 789', email: 'cuong@email.com' },
];

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  initialData = {},
  errors = {},
  frequentCustomers = DEFAULT_FREQUENT_CUSTOMERS,
  onFieldChange,
  onSave,
  onSkip,
}) => {
  const [info, setInfo] = useState<CustomerInfo>({
    name:               initialData.name               ?? '',
    phone:              initialData.phone              ?? '',
    email:              initialData.email              ?? '',
    address:            initialData.address            ?? '',
    sendDigitalReceipt: initialData.sendDigitalReceipt ?? false,
    saveCustomer:       initialData.saveCustomer       ?? false,
  });

  const update = (field: keyof CustomerInfo, value: string | boolean) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    onFieldChange(field, value);
  };

  const handleSelectFrequent = (customer: FrequentCustomer) => {
    const next = { ...info, name: customer.name, phone: customer.phone, email: customer.email };
    setInfo(next);
    onFieldChange('name',  customer.name);
    onFieldChange('phone', customer.phone);
    onFieldChange('email', customer.email);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">Thông tin khách hàng</h3>
        <p className="text-sm text-muted-foreground">
          Thông tin này sẽ được sử dụng cho hóa đơn và chương trình khách hàng thân thiết
        </p>
      </div>

      {/* Customer Form */}
      <div className="space-y-4">
        <Input
          label="Họ và tên"
          type="text"
          value={info.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Nhập họ và tên khách hàng"
        />
        <Input
          label="Số điện thoại"
          type="tel"
          value={info.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="0901 234 567"
          error={errors.phone}
        />
        <Input
          label="Email"
          type="email"
          value={info.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="khachhang@email.com"
          error={errors.email}
        />
        <Input
          label="Địa chỉ"
          type="text"
          value={info.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Nhập địa chỉ (tùy chọn)"
        />

        {errors.contact && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <span className="text-sm text-error">{errors.contact}</span>
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
        <Checkbox
          label="Gửi hóa đơn điện tử"
          description="Gửi hóa đơn qua email hoặc SMS"
          checked={info.sendDigitalReceipt}
          onChange={(e) => update('sendDigitalReceipt', e.target.checked)}
        />
        <Checkbox
          label="Lưu thông tin khách hàng"
          description="Lưu để sử dụng cho các lần mua hàng tiếp theo"
          checked={info.saveCustomer}
          onChange={(e) => update('saveCustomer', e.target.checked)}
        />
      </div>

      {/* Digital Receipt Info */}
      {info.sendDigitalReceipt && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Mail" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Hóa đơn điện tử</h4>
              <p className="text-sm text-blue-700">
                Hóa đơn sẽ được gửi qua email hoặc SMS ngay sau khi thanh toán thành công.
                Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Benefits */}
      {info.saveCustomer && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Gift" size={20} className="text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-1">Ưu đãi khách hàng thân thiết</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Tích điểm với mỗi lần mua hàng</li>
                <li>• Nhận thông báo khuyến mãi đặc biệt</li>
                <li>• Ưu tiên đặt bàn và giao hàng</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          Bỏ qua
        </Button>
        <Button
          variant="default"
          onClick={() => onSave(info)}
          className="flex-1"
          iconName="Save"
          iconPosition="left"
        >
          Lưu thông tin
        </Button>
      </div>

      {/* Frequent Customers */}
      <div className="border-t border-border pt-4">
        <h4 className="font-medium text-foreground mb-3">Khách hàng thường xuyên</h4>
        <div className="grid grid-cols-1 gap-2">
          {frequentCustomers.map((customer, index) => (
            <button
              key={index}
              onClick={() => handleSelectFrequent(customer)}
              className="p-3 text-left border border-border rounded-lg hover:bg-muted/50 transition-smooth"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
