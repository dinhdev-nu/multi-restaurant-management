import React, { useState } from 'react';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import QuickActions from './components/QuickActions';
import RecentOrders from './components/RecentOrders';
import Button from '../../components/Button';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  note: string;
}

interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'unpaid';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  stock_quantity?: number;
  status?: 'available' | 'unavailable';
  icon?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  table?: string;
  staff?: string;
  items?: OrderItem[];
  total?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  createdAt?: string;
  expiredAt?: string;
  customer?: { name: string; contact?: string };
}

interface DraftCustomerInfo {
  name: string;
}

interface MainPOSDashboardProps {
  // Menu
  categories?: Category[];
  menuItems?: MenuItem[];
  // Cart
  cartItems?: CartItem[];
  orderNumber?: string | null;
  orderSummary?: OrderSummary;
  selectedTable?: string | null;
  selectedStaff?: string | null;
  draftOrderId?: string | null;
  draftCustomerInfo?: DraftCustomerInfo | null;
  isCreatingOrder?: boolean;
  // Draft orders panel
  customerOrders?: Order[];
  // Callbacks – handlers do parent/container cung cấp
  onAddToCart?: (item: MenuItem) => void;
  onUpdateQuantity?: (id: string, qty: number) => void;
  onRemoveItem?: (id: string) => void;
  onUpdateNote?: (id: string, note: string) => void;
  onClearCart?: () => void;
  onCreateOrder?: () => void;
  onGoToPayment?: () => void;
  onTableChange?: (table: string | null) => void;
  onStaffChange?: (staff: string | null) => void;
  onSummaryChange?: (summary: OrderSummary) => void;
  onBarcodeSearch?: (barcode: string) => void;
  onCustomerSearch?: (query: string) => void;
  onConfirmOrder?: (order: Order) => void;
  onReorderDraft?: (order: Order) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MainPOSDashboard: React.FC<MainPOSDashboardProps> = ({
  categories = [],
  menuItems = [],
  cartItems = [],
  orderNumber = null,
  orderSummary = { subtotal: 0, discount: 0, tax: 0, total: 0 },
  selectedTable = null,
  selectedStaff = null,
  draftOrderId = null,
  draftCustomerInfo = null,
  isCreatingOrder = false,
  customerOrders = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
  onCreateOrder,
  onGoToPayment,
  onTableChange,
  onStaffChange,
  onSummaryChange,
  onBarcodeSearch,
  onCustomerSearch,
  onConfirmOrder,
  onReorderDraft,
}) => {
  const [showRecentOrders, setShowRecentOrders]       = useState(false);
  const [activeCategory, setActiveCategory]           = useState('all');
  const [showMobileCart, setShowMobileCart]           = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  const handleBarcodeSearch = onBarcodeSearch ?? (() => {});
  const handleCustomerSearch = onCustomerSearch ?? (() => {});
  const handleAddToCart = onAddToCart ?? (() => {});
  const handleUpdateQuantity = onUpdateQuantity ?? (() => {});
  const handleRemoveItem = onRemoveItem ?? (() => {});
  const handleUpdateNote = onUpdateNote ?? (() => {});

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(orderSummary.total);

  return (
    <>
      {/* ── Two-panel split ───────────────────────────────────────────────── */}
      <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">

        {/* ── Left Panel: Menu ─────────────────────────────────────────────── */}
        <div className={[
          'flex-1 bg-surface border-r border-border overflow-hidden flex-col',
          showMobileCart ? 'hidden lg:flex' : 'flex',
        ].join(' ')}>

          {showRecentOrders ? (
            <RecentOrders
              orders={customerOrders}
              onClose={() => setShowRecentOrders(false)}
              onConfirmOrder={onConfirmOrder}
              onReorderDraft={onReorderDraft}
            />
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-semibold text-foreground mb-4">Thực đơn</h1>

                <QuickActions
                  onBarcodeSearch={handleBarcodeSearch}
                  onCustomerSearch={handleCustomerSearch}
                  onQuickAdd={handleAddToCart}
                  onShowRecentOrders={() => setShowRecentOrders(true)}
                  isShowingRecentOrders={showRecentOrders}
                  draftOrdersCount={customerOrders.length}
                />

                <MenuCategory
                  categories={[{ id: 'all', name: 'Tất cả', icon: 'LayoutGrid' }, ...categories]}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <MenuGrid menuItems={menuItems} onAddToCart={handleAddToCart} />
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel: Cart ────────────────────────────────────────────── */}
        <div className={[
          'w-full lg:w-96 bg-surface border-l border-border flex-col overflow-hidden',
          showMobileCart ? 'flex' : 'hidden lg:flex',
        ].join(' ')}>

          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold text-foreground">Đơn hàng</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileCart(false)}
              className="lg:hidden"
            >
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
              draftOrderId={draftOrderId}
              draftCustomerInfo={draftCustomerInfo}
              selectedTable={selectedTable}
              onTableChange={onTableChange}
              selectedStaff={selectedStaff}
              onStaffChange={onStaffChange}
              onSummaryChange={onSummaryChange}
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
                onClick={onCreateOrder}
                disabled={isCreatingOrder}
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
                onClick={onGoToPayment}
                className="hover-scale touch-target"
              >
                Thanh toán ({formattedTotal})
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Nhấn{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">F2</kbd>
                {' '}để thanh toán nhanh
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Cart FAB ───────────────────────────────────────────────────── */}
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

      {/* ── Clear cart dialog ─────────────────────────────────────────────────── */}
      <ConfirmationDialog
        isOpen={showClearCartDialog}
        onClose={() => setShowClearCartDialog(false)}
        onConfirm={() => { onClearCart?.(); setShowClearCartDialog(false); }}
        title="Xóa giỏ hàng"
        message="Bạn có chắc chắn muốn xóa tất cả món trong giỏ hàng?"
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        icon="Trash2"
      />
    </>
  );
};

export default MainPOSDashboard;