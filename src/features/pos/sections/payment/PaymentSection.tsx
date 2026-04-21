import React, { useMemo, useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/Button';

import PaymentMethodSelector, { type PaymentMethodId } from './components/PaymentMethodSelector';
import OrderSummary from './components/OrderSummary';
import CashPaymentForm from './components/CashPaymentForm';
import CardPaymentForm, { type CardFormData } from './components/CardPaymentForm';
import DigitalWalletForm from './components/DigitalWalletForm';
import CustomerInfoForm, { type CustomerInfo } from './components/CustomerInfoForm';
import PaymentSuccess, { type PaymentData } from './components/PaymentSuccess';

type Step = 'method' | 'payment' | 'customer' | 'success';
type PaymentMethod = PaymentMethodId | '';
type WalletMethod = Extract<PaymentMethodId, 'momo' | 'zalopay' | 'banking' | 'qr'>;

const WALLET_METHODS: WalletMethod[] = ['momo', 'zalopay', 'banking', 'qr'];

const ORDER_DATA = {
    _id: 'HD1234567890',
    orderId: 'HD-001',
    tableNumber: 'Bàn 5',
    items: [
        { itemId: '1', name: 'Cà phê sữa đá', quantity: 2, price: 35000, total: 70000, notes: '' },
        { itemId: '2', name: 'Bánh mì thịt', quantity: 1, price: 25000, total: 25000, notes: 'Ít cay' },
    ],
    subtotal: 95000,
    tax: 9500,
    discount: 0,
    total: 104500,
};

const steps = [
    { id: 'method', name: 'Phương thức', icon: 'CreditCard' },
    { id: 'payment', name: 'Thanh toán', icon: 'DollarSign' },
    { id: 'success', name: 'Hoàn tất', icon: 'CheckCircle' },
] as const;

const isWalletMethod = (method: PaymentMethod): method is WalletMethod =>
    WALLET_METHODS.includes(method as WalletMethod);

const PaymentProcessing: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>('method');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('');
    const [customerInfo, setCustomerInfo] = useState<Partial<CustomerInfo>>({ name: '', phone: '' });
    const [paymentResult, setPaymentResult] = useState<PaymentData>({});
    const [cashAmountDigits, setCashAmountDigits] = useState('');

    const isLoadingOrderDetails = false;
    const isLoadingQR = false;
    const selectedLoadingMethod = '';

    const qrCodeUrl = useMemo(() => {
        if (!isWalletMethod(selectedMethod)) {
            return '';
        }

        const payload = `PAY|${ORDER_DATA.orderId}|${selectedMethod}|${ORDER_DATA.total}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;
    }, [selectedMethod]);

    const quickAmounts = useMemo(() => {
        const total = ORDER_DATA.total;
        return [total, total + 50000, total + 100000];
    }, []);

    const cashPaidAmount = cashAmountDigits ? Number(cashAmountDigits) : 0;
    const cashChange = Math.max(cashPaidAmount - ORDER_DATA.total, 0);
    const cashAmountError = cashAmountDigits && cashPaidAmount < ORDER_DATA.total
        ? 'Số tiền nhận không đủ.'
        : '';

    const getStepTitle = (): string => {
        switch (currentStep) {
            case 'method':
                return 'Chọn phương thức thanh toán';
            case 'payment':
                return 'Xử lý thanh toán';
            case 'customer':
                return 'Thông tin khách hàng';
            case 'success':
                return 'Thanh toán thành công';
            default:
                return 'Thanh toán';
        }
    };

    const handleBackToMethod = () => {
        setCurrentStep('method');
        setSelectedMethod('');
        setCashAmountDigits('');
    };

    const handleMethodSelect = (method: PaymentMethodId) => {
        setSelectedMethod(method);
        setCurrentStep('payment');
    };

    const completePayment = (method: PaymentMethodId, paidAmount: number, changeAmount: number) => {
        setPaymentResult({
            _id: `PAY-MOCK-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            method,
            paidAmount,
            orderAmount: ORDER_DATA.total,
            changeAmount,
        });
        setCurrentStep('success');
    };

    const handleCashComplete = () => {
        if (cashPaidAmount < ORDER_DATA.total) {
            return;
        }

        completePayment('cash', cashPaidAmount, cashChange);
    };

    const handleCardComplete = (_cardData: CardFormData) => {
        completePayment('card', ORDER_DATA.total, 0);
    };

    const handleWalletComplete = () => {
        if (!isWalletMethod(selectedMethod)) {
            return;
        }

        completePayment(selectedMethod, ORDER_DATA.total, 0);
    };

    const handleCustomerFieldChange = (field: keyof CustomerInfo, value: string | boolean) => {
        setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleCustomerInfoSave = (info: CustomerInfo) => {
        setCustomerInfo(info);
        setCurrentStep('method');
    };

    const handleCustomerInfoSkip = () => {
        setCurrentStep('method');
    };

    const handleShowCustomerForm = () => {
        setCurrentStep('customer');
    };

    const handleResetFlow = () => {
        setCurrentStep('method');
        setSelectedMethod('');
        setCashAmountDigits('');
        setPaymentResult({});
    };

    const renderPaymentForm = (): React.ReactNode => {
        switch (selectedMethod) {
            case 'cash':
                return (
                    <CashPaymentForm
                        totalAmount={ORDER_DATA.total}
                        change={cashChange}
                        amountError={cashAmountError}
                        quickAmounts={quickAmounts}
                        onAmountChange={setCashAmountDigits}
                        onPaymentComplete={handleCashComplete}
                        onCancel={handleBackToMethod}
                    />
                );
            case 'card':
                return (
                    <CardPaymentForm
                        totalAmount={ORDER_DATA.total}
                        onPaymentSubmit={handleCardComplete}
                        onCancel={handleBackToMethod}
                    />
                );
            case 'momo':
            case 'zalopay':
            case 'banking':
            case 'qr':
                return (
                    <DigitalWalletForm
                        totalAmount={ORDER_DATA.total}
                        walletType={selectedMethod}
                        qrCodeUrl={qrCodeUrl}
                        onPaymentComplete={handleWalletComplete}
                        onCancel={handleBackToMethod}
                    />
                );
            default:
                return null;
        }
    };

    const renderStepContent = (): React.ReactNode => {
        if (isLoadingOrderDetails) {
            return (
                <div className="text-center py-12">
                    <Icon name="Loader" size={48} className="text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Đang tải dữ liệu đơn hàng từ server...</p>
                </div>
            );
        }

        switch (currentStep) {
            case 'method':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <OrderSummary
                                orderItems={ORDER_DATA.items}
                                subtotal={ORDER_DATA.subtotal}
                                tax={ORDER_DATA.tax}
                                discount={ORDER_DATA.discount}
                                total={ORDER_DATA.total}
                                orderNumber={ORDER_DATA.orderId}
                                tableNumber={ORDER_DATA.tableNumber}
                            />
                        </div>
                        <div>
                            <PaymentMethodSelector
                                selectedMethod={selectedMethod}
                                onMethodSelect={handleMethodSelect}
                                availableMethods={['cash', 'card', 'momo', 'zalopay', 'banking', 'qr']}
                                isLoading={isLoadingQR}
                                loadingMethod={selectedLoadingMethod}
                            />

                            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-foreground">Thông tin khách hàng</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {customerInfo.name
                                                ? `${customerInfo.name} - ${customerInfo.phone ?? ''}`
                                                : 'Chưa có thông tin'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShowCustomerForm}
                                        iconName="User"
                                        iconPosition="left"
                                    >
                                        {customerInfo.name ? 'Sửa' : 'Thêm'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'payment':
                return (
                    <div className="max-w-md mx-auto">
                        {renderPaymentForm()}
                    </div>
                );

            case 'customer':
                return (
                    <div className="max-w-md mx-auto">
                        <CustomerInfoForm
                            onFieldChange={handleCustomerFieldChange}
                            onSave={handleCustomerInfoSave}
                            onSkip={handleCustomerInfoSkip}
                            initialData={customerInfo}
                        />
                    </div>
                );

            case 'success':
                return (
                    <div className="max-w-lg mx-auto">
                        <PaymentSuccess
                            paymentData={paymentResult}
                            orderData={ORDER_DATA}
                            onPrintReceipt={() => { }}
                            onSendDigitalReceipt={() => { }}
                            onNewOrder={handleResetFlow}
                            onBackToDashboard={handleResetFlow}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full min-h-0 overflow-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (currentStep === 'method') {
                                    return;
                                }

                                if (currentStep === 'payment') {
                                    handleBackToMethod();
                                    return;
                                }

                                if (currentStep === 'customer') {
                                    setCurrentStep('method');
                                    return;
                                }

                                handleResetFlow();
                            }}
                            className="hover-scale"
                        >
                            <Icon name="ArrowLeft" size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {getStepTitle()}
                            </h1>
                            <p className="text-muted-foreground">
                                Xử lý thanh toán an toàn và nhanh chóng
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Đơn hàng: {ORDER_DATA.orderId}</span>
                        <span className="text-xs font-mono">({ORDER_DATA._id})</span>
                        <span>•</span>
                        <span>Bàn: {ORDER_DATA.tableNumber}</span>
                        <span>•</span>
                        <span>{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {steps.map((step, index) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth
                  ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : isCompleted
                                                ? 'bg-success text-success-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }
                `}
                                >
                                    <Icon
                                        name={isCompleted ? 'Check' : step.icon}
                                        size={16}
                                    />
                                    <span className="text-sm font-medium hidden sm:block">
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <Icon
                                        name="ChevronRight"
                                        size={16}
                                        className="mx-2 text-muted-foreground"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
                {renderStepContent()}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                    <Icon name="Shield" size={20} className="text-blue-600" />
                    <div>
                        <h4 className="font-medium text-blue-800">Bảo mật thanh toán</h4>
                        <p className="text-sm text-blue-700">
                            Tất cả giao dịch được mã hóa và tuân thủ tiêu chuẩn bảo mật PCI DSS.
                            Thông tin thanh toán không được lưu trữ trên hệ thống.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentProcessing;