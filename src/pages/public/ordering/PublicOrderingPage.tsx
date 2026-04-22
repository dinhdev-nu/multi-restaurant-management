import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import {
    DEFAULT_CATEGORIES,
    DEFAULT_MENU_ITEMS,
    DEFAULT_RESTAURANT,
    DEFAULT_TABLE_OPTIONS,
    Header,
    MenuCategory,
    MenuGrid,
    OrderCart,
    QuickActions,
} from '@/features/public/ordering';
import Button from '@/features/pos/components/Button';
import { PublicOrderingLayout } from '@/layouts/public/PublicOrderingLayout';
import '@/layouts/pos/pos.css';
import { useUserStore } from '@/stores/user-store';
import type { CartItem, CustomerOrder, OrderingMenuItem, OrderingNotification, OrderingUser, OrderSummary } from '@/features/public/ordering';

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const PublicOrdering = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const profile = useUserStore((state) => state.profile);
    const user = profile as OrderingUser | null;

    const [isOperational] = useState<boolean>(DEFAULT_RESTAURANT.isOpen);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showMobileCart, setShowMobileCart] = useState<boolean>(false);
    const [showClearCartDialog, setShowClearCartDialog] = useState<boolean>(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>('');
    const [customerContact, setCustomerContact] = useState<string>('');
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [orderSummary, setOrderSummary] = useState<OrderSummary>({
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
    });
    const [notifications, setNotifications] = useState<OrderingNotification[]>([]);
    const [draftOrders, setDraftOrders] = useState<CustomerOrder[]>([]);
    const [confirmedOrders] = useState<CustomerOrder[]>([]);

    const categories = DEFAULT_CATEGORIES;
    const menuItems = DEFAULT_MENU_ITEMS;
    const tableOptions = DEFAULT_TABLE_OPTIONS;

    const addNotification = useCallback((notification: Omit<OrderingNotification, 'id' | 'time'>) => {
        const next: OrderingNotification = {
            id: Date.now(),
            time: new Date().toISOString(),
            ...notification,
        };
        setNotifications((prev) => [next, ...prev].slice(0, 10));
    }, []);

    const handleGoToPayment = useCallback(() => {
        if (!isOperational) {
            toast.error('Không thể thanh toán khi nhà hàng đã đóng cửa.');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Vui lòng thêm món vào giỏ hàng trước khi thanh toán.');
            return;
        }

        navigate('/payment-processing', {
            state: {
                orderNumber,
                selectedTable,
                cartItems,
                subtotal: orderSummary.subtotal,
                discount: orderSummary.discount,
                tax: orderSummary.tax,
                totalAmount: orderSummary.total,
                fromDashboard: true,
            },
        });
    }, [cartItems, isOperational, navigate, orderNumber, orderSummary.discount, orderSummary.subtotal, orderSummary.tax, orderSummary.total, selectedTable]);

    useEffect(() => {
        if (cartItems.length > 0 && !orderNumber) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timeStr = now.getTime().toString().slice(-4);
            setOrderNumber(`HD${dateStr}${timeStr}`);
            return;
        }

        if (cartItems.length === 0) {
            setOrderNumber(null);
            setSelectedTable(null);
            setCustomerName('');
            setCustomerContact('');
        }
    }, [cartItems, orderNumber]);

    useEffect(() => {
        if (location.state?.selectedTable) {
            setSelectedTable(location.state.selectedTable as string);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'F2') {
                event.preventDefault();
                if (cartItems.length > 0) {
                    handleGoToPayment();
                }
            }

            if (event.key === 'F4') {
                event.preventDefault();
                if (cartItems.length > 0) {
                    setShowClearCartDialog(true);
                }
            }

            if (event.key === 'Escape') {
                setShowMobileCart(false);
            }

            if (event.key >= '1' && event.key <= '5' && !event.ctrlKey && !event.altKey) {
                const categoryIndex = Number(event.key) - 1;
                if (categories[categoryIndex]) {
                    setActiveCategory(categories[categoryIndex].id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cartItems.length, categories, handleGoToPayment]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setDraftOrders((prev) => {
                const expired = prev.filter((order) => order.expiredAt && new Date(order.expiredAt).getTime() <= now);
                if (expired.length > 0) {
                    expired.forEach((order) => {
                        addNotification({
                            type: 'error',
                            message: `Đơn hàng bàn ${order.table} đã hết hạn`,
                            orderId: order._id,
                        });
                    });
                }
                return prev.filter((order) => !order.expiredAt || new Date(order.expiredAt).getTime() > now);
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [addNotification]);

    const currentMenuItems = useMemo(() => {
        if (activeCategory === 'all') {
            return menuItems.filter((item) => item.status !== 'unavailable');
        }

        return menuItems.filter((item) => item.category === activeCategory && item.status !== 'unavailable');
    }, [activeCategory, menuItems]);

    const handleAddToCart = (item: OrderingMenuItem) => {
        if (item.stock_quantity === 0 || item.status === 'unavailable') {
            toast.error(`${item.name} hiện đã hết hàng`);
            return;
        }

        const existingItem = cartItems.find((cartItem) => cartItem._id === item._id);
        if (existingItem) {
            toast.success(`${item.name} x${existingItem.quantity + 1}`);
        } else {
            toast.success(`Đã thêm ${item.name} vào giỏ`);
        }

        setCartItems((prevItems) => {
            if (existingItem) {
                return prevItems.map((cartItem) =>
                    cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                );
            }

            return [...prevItems, { ...item, quantity: 1, note: '' }];
        });
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
            return;
        }

        setCartItems((prevItems) => prevItems.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)));
    };

    const handleRemoveItem = (itemId: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    };

    const handleUpdateNote = (itemId: string, note: string) => {
        setCartItems((prevItems) => prevItems.map((item) => (item._id === itemId ? { ...item, note } : item)));
    };

    const handleClearCart = () => {
        setCartItems([]);
        toast.success('Đã xóa toàn bộ món trong giỏ hàng');
    };

    const handleCreateOrder = async () => {
        if (!isOperational) {
            toast.error('Không thể đặt hàng khi nhà hàng đã đóng cửa.');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Vui lòng thêm món vào giỏ hàng để tạo đơn.');
            return;
        }

        if (!selectedTable) {
            toast.error('Vui lòng chọn bàn trước khi tạo đơn.');
            return;
        }

        const resolvedCustomerName = customerName.trim();
        const resolvedCustomerContact = customerContact.trim();

        if (!user && !resolvedCustomerName) {
            toast.error('Vui lòng nhập tên khách hàng.');
            return;
        }

        if (!user && !resolvedCustomerContact) {
            toast.error('Vui lòng nhập email hoặc số điện thoại khách hàng.');
            return;
        }

        const resolvedTable = [
            { value: 'takeaway', label: 'Mang đi' },
            { value: 'delivery', label: 'Giao hàng' },
            ...tableOptions,
        ].find((option) => option.value === selectedTable)?.label ?? selectedTable;

        const now = new Date();
        const newOrder: CustomerOrder = {
            _id: `${Date.now()}`,
            orderNumber: orderNumber || undefined,
            table: resolvedTable,
            staff: 'Chưa phân công',
            status: 'pending',
            paymentStatus: 'unpaid',
            items: cartItems.map((item) => ({
                itemId: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                note: item.note,
            })),
            subtotal: orderSummary.subtotal,
            discount: orderSummary.discount,
            tax: orderSummary.tax,
            total: orderSummary.total,
            timestamp: now.toISOString(),
            createdAt: now.toISOString(),
            expiredAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
            customer: {
                customerId: user?._id,
                name: user ? (user.full_name || user.user_name || 'Khách hàng') : resolvedCustomerName,
                contact: user ? (user.email || user.phone || undefined) : resolvedCustomerContact,
            },
        };

        try {
            setIsCreatingOrder(true);
            setDraftOrders((prev) => [newOrder, ...prev]);
            addNotification({
                type: 'info',
                message: `Đã tạo đơn hàng cho ${resolvedTable}`,
                orderId: newOrder._id,
            });
            toast.success('Tạo đơn hàng thành công');
            setCartItems([]);
            setShowMobileCart(false);
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleBarcodeSearch = (barcode: string) => {
        const foundItem = menuItems.find(
            (item) => item._id.includes(barcode) || item.name.toLowerCase().includes(barcode.toLowerCase()),
        );

        if (!foundItem) {
            toast.error('Không tìm thấy sản phẩm với mã này');
            return;
        }

        handleAddToCart(foundItem);
    };

    const handleCustomerSearch = (query: string) => {
        toast.info(`Đang tìm khách hàng: ${query}`);
    };

    const totalItems = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

    const ordersCount = useMemo(() => draftOrders.length + confirmedOrders.length, [confirmedOrders.length, draftOrders.length]);

    return (
        <PublicOrderingLayout
            header={
                <Header
                    isOperational={isOperational}
                    ordersCount={ordersCount}
                    draftOrders={draftOrders}
                    confirmedOrders={confirmedOrders}
                    notifications={notifications}
                    user={user}
                    restaurantName={DEFAULT_RESTAURANT.name}
                    restaurantLogo={DEFAULT_RESTAURANT.logo}
                />
            }
            menuPanel={
                <div
                    className={`
            flex-1 bg-surface border-r border-border overflow-hidden
            ${showMobileCart ? 'hidden lg:flex' : 'flex'}
            flex-col pl-2 sm:pl-4 lg:pl-8 xl:pl-15 pr-4
          `}
                >
                    <div className="p-4 border-b border-border">
                        <h1 className="text-xl font-semibold text-foreground mb-4">Thực đơn</h1>

                        <QuickActions
                            onBarcodeSearch={handleBarcodeSearch}
                            onCustomerSearch={handleCustomerSearch}
                        />

                        <MenuCategory
                            categories={[{ id: 'all', name: 'Tất cả', icon: 'LayoutGrid' }, ...categories]}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <MenuGrid menuItems={currentMenuItems} onAddToCart={handleAddToCart} />
                    </div>
                </div>
            }
            cartPanel={
                <div
                    className={`
            w-full lg:w-96 bg-surface border-l border-border
            ${showMobileCart ? 'flex' : 'hidden lg:flex'}
            flex-col overflow-hidden
          `}
                >
                    <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                        <h2 className="text-lg font-semibold text-foreground">Đơn hàng</h2>
                        <Button variant="ghost" size="icon" onClick={() => setShowMobileCart(false)} className="lg:hidden">
                            <Icon name="X" size={20} />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <OrderCart
                            cartItems={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onUpdateNote={handleUpdateNote}
                            onClearCart={() => setShowClearCartDialog(true)}
                            orderNumber={orderNumber}
                            selectedTable={selectedTable}
                            onTableChange={setSelectedTable}
                            tableOptions={tableOptions}
                            onSummaryChange={setOrderSummary}
                            user={user}
                            customerName={customerName}
                            onCustomerNameChange={setCustomerName}
                            customerContact={customerContact}
                            onCustomerContactChange={setCustomerContact}
                        />
                    </div>

                    {cartItems.length > 0 && (
                        <div className="border-t border-border p-4 flex-shrink-0 bg-surface space-y-2">
                            <Button
                                variant="outline"
                                size="default"
                                fullWidth
                                iconName={isCreatingOrder ? 'Loader2' : 'FileText'}
                                iconPosition="left"
                                onClick={handleCreateOrder}
                                disabled={isCreatingOrder || !isOperational}
                                className={`hover-scale touch-target ${isCreatingOrder ? 'animate-pulse' : ''}`}
                            >
                                {isCreatingOrder ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
                            </Button>

                            <Button
                                variant="success"
                                size="lg"
                                fullWidth
                                iconName="CreditCard"
                                iconPosition="left"
                                onClick={handleGoToPayment}
                                disabled={!isOperational}
                                className="hover-scale touch-target"
                            >
                                Thanh toán ({vndFormatter.format(orderSummary.total)})
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                Nhấn <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">F2</kbd> để thanh toán nhanh
                            </p>
                        </div>
                    )}
                </div>
            }
            mobileCartButton={
                <div className="lg:hidden fixed bottom-4 right-4 z-1000">
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setShowMobileCart(true)}
                        className="rounded-full shadow-modal hover-scale relative"
                    >
                        <Icon name="ShoppingCart" size={24} className="mr-2" />
                        <span>Giỏ hàng ({totalItems})</span>
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </div>
            }
            clearDialog={
                <ConfirmationDialog
                    isOpen={showClearCartDialog}
                    onClose={() => setShowClearCartDialog(false)}
                    onConfirm={handleClearCart}
                    title="Xóa giỏ hàng"
                    message="Bạn có chắc chắn muốn xóa tất cả món trong giỏ hàng?"
                    confirmText="Xóa tất cả"
                    cancelText="Hủy"
                    variant="danger"
                    icon="Trash2"
                />
            }
        />
    );
};

export default PublicOrdering;
