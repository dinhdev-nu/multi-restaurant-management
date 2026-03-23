import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, X, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from './components/Header';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import QuickActions from './components/QuickActions';
import type { CartItem, MenuItem, Notification, Order, OrderSummary } from './types';
import {
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_DRAFT_ORDERS,
  MOCK_CONFIRMED_ORDERS,
  MOCK_USER,
} from './mockData';
import { formatPrice } from './utils';

// ─── Component ────────────────────────────────────────────────────────────────

const CustomerOrdering: React.FC = () => {
  // ── Mock static data ──────────────────────────────────────────────────────
  const isOperational:   boolean         = true;
  const categories                       = MOCK_CATEGORIES;
  const allMenuItems                     = MOCK_MENU_ITEMS;
  const draftOrders:     Order[]         = MOCK_DRAFT_ORDERS;
  const confirmedOrders: Order[]         = MOCK_CONFIRMED_ORDERS;
  const user                             = MOCK_USER;    // set to null to test guest flow
  const restaurantName                   = 'Nhà Hàng Demo';
  const notifications:   Notification[]  = [];

  // ── Local UI state ────────────────────────────────────────────────────────
  const [activeCategory,     setActiveCategory]     = useState<string>('all');
  const [cartItems,          setCartItems]          = useState<CartItem[]>([]);
  const [showMobileCart,     setShowMobileCart]     = useState<boolean>(false);
  const [showClearDialog,    setShowClearDialog]    = useState<boolean>(false);
  const [isCreatingOrder,    setIsCreatingOrder]    = useState<boolean>(false);
  const [selectedTable,      setSelectedTable]      = useState<string | null>(null);
  const [customerName,       setCustomerName]       = useState<string>('');
  const [customerContact,    setCustomerContact]    = useState<string>('');
  const [orderNumber,        setOrderNumber]        = useState<string | null>(null);
  const [orderSummary,       setOrderSummary]       = useState<OrderSummary>({ subtotal: 0, discount: 0, tax: 0, total: 0 });

  // ── Derived ───────────────────────────────────────────────────────────────

  const currentMenuItems = useMemo<MenuItem[]>(() => {
    const available = allMenuItems.filter((item) => item.status !== 'unavailable');
    if (activeCategory === 'all') return available;
    return available.filter((item) => item.category === activeCategory);
  }, [activeCategory, allMenuItems]);

  const totalItems = useMemo<number>(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  // Badge count matches what OrdersDropdown shows (filtered by expiry)
  const ordersCount = useMemo<number>(() => {
    const now = Date.now();
    const alive = (o: Order) => !o.expiredAt || new Date(o.expiredAt).getTime() >= now;
    return draftOrders.filter(alive).length + confirmedOrders.filter(alive).length;
  }, [draftOrders, confirmedOrders]);

  // ── Cart handlers ─────────────────────────────────────────────────────────

  const handleAddToCart = (item: MenuItem): void => {
    if (item.stock_quantity === 0 || item.status === 'unavailable') return;

    // Enforce stock quantity limit when defined
    const inCart = cartItems.find((c) => c._id === item._id);
    if (item.stock_quantity !== undefined && (inCart?.quantity ?? 0) >= item.stock_quantity) return;

    // Generate order number when the first new item is added
    if (!inCart && !orderNumber) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      setOrderNumber(`HD${dateStr}${now.getTime().toString().slice(-4)}`);
    }

    setCartItems((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1, note: '' }];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number): void => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      return;
    }
    setCartItems((prev) => prev.map((item) => item._id === itemId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (itemId: string): void =>
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));

  const handleUpdateNote = (itemId: string, note: string): void =>
    setCartItems((prev) => prev.map((item) => item._id === itemId ? { ...item, note } : item));

  const handleClearCart = (): void => {
    setCartItems([]);
    setOrderNumber(null);
    setSelectedTable(null);
    setShowClearDialog(false);
  };

  const handleCreateOrder = (): void => {
    if (!isOperational || !cartItems.length || !selectedTable) return;
    setIsCreatingOrder(true);
    // TODO: call API
    setTimeout(() => {
      setIsCreatingOrder(false);
      setCartItems([]);
      setOrderNumber(null);
      setSelectedTable(null);
    }, 1500);
  };

  const handleGoToPayment = (): void => {
    if (!isOperational || !cartItems.length) return;
    // TODO: navigate to payment
  };

  const handleBarcodeSearch = (barcode: string): void => {
    const found = allMenuItems.find(
      (item) => item._id.includes(barcode) || item.name.toLowerCase().includes(barcode.toLowerCase()),
    );
    if (found) handleAddToCart(found);
  };

  const handleCustomerSearch = (_query: string): void => {
    // TODO: search customer
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleGoToPayment();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, isOperational]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Header
        isOperational={isOperational}
        ordersCount={ordersCount}
        draftOrders={draftOrders}
        confirmedOrders={confirmedOrders}
        notifications={notifications}
        user={user}
        restaurantName={restaurantName}
      />

      <main className="pt-16">
        <div className="h-[calc(100vh-4rem)]  flex flex-col lg:flex-row">

          {/* ── Left panel – Menu ── */}
          <div className={`
            flex-1 bg-background border-r border-border overflow-hidden flex flex-col
            pl-2 sm:pl-4 lg:pl-8 xl:pl-16 pr-4
            ${showMobileCart ? 'hidden lg:flex' : 'flex'}
          `}>
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Thực đơn</h2>
              <QuickActions
                onBarcodeSearch={handleBarcodeSearch}
                onCustomerSearch={handleCustomerSearch}
                onQuickAdd={handleAddToCart}
              />
              <MenuCategory
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MenuGrid menuItems={currentMenuItems} onAddToCart={handleAddToCart} />
            </div>
          </div>

          {/* ── Right panel – Cart ── */}
          <div className={`
            w-full lg:w-96 bg-card border-l border-border flex flex-col overflow-hidden
            ${showMobileCart ? 'flex' : 'hidden lg:flex'}
          `}>
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Đơn hàng</h2>
              <Button
                aria-label="Đóng giỏ hàng"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowMobileCart(false)}
                className="lg:hidden"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <OrderCart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNote={handleUpdateNote}
                onClearCart={() => setShowClearDialog(true)}
                orderNumber={orderNumber}
                selectedTable={selectedTable}
                onTableChange={setSelectedTable}
                onSummaryChange={setOrderSummary}
                user={user}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerContact={customerContact}
                onCustomerContactChange={setCustomerContact}
              />
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-border p-4 flex-shrink-0 bg-card space-y-2">
                {/* Create order */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder || !isOperational}
                >
                  {isCreatingOrder
                    ? <span className="animate-spin w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full mr-2" />
                    : <FileText size={16} className="mr-2" />
                  }
                  {isCreatingOrder ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
                </Button>

                {/* Payment */}
                <Button
                  className="w-full"
                  onClick={handleGoToPayment}
                  disabled={!isOperational}
                >
                  <CreditCard size={16} className="mr-2" />
                  Thanh toán ({formatPrice(orderSummary.total)})
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Nhấn <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground font-mono text-xs border border-border">F2</kbd> để thanh toán nhanh
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile floating cart button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-[1000]">
          <Button
            onClick={() => setShowMobileCart(true)}
            className="relative rounded-full px-4 py-3 h-auto shadow-lg"
          >
            <ShoppingCart size={22} className="mr-2" />
            <span className="text-sm font-medium">Giỏ hàng ({totalItems})</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </main>

      {/* Clear cart confirmation dialog */}
      {showClearDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-foreground/50"
          onKeyDown={(e) => e.key === 'Escape' && setShowClearDialog(false)}
        >
          <div className="bg-card rounded-xl p-6 w-full max-w-sm shadow-xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <h3 id="clear-dialog-title" className="text-lg font-semibold text-foreground mb-2">Xóa giỏ hàng</h3>
            <p className="text-sm text-muted-foreground mb-6">Bạn có chắc chắn muốn xóa tất cả món trong giỏ hàng?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClearDialog(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleClearCart}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrdering;
