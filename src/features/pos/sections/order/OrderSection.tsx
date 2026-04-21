import React from 'react';
import OrderSummaryCards from './components/OrderSummaryCards';
import OrderFilters from './components/OrderFilters';
import OrderTable from './components/OrderTable';
import OrderDetailsModal from './components/OrderDetailsModal';
import Button from '../../components/Button';
import Icon from '../../components/AppIcon';

// ─── Static mock data ────────────────────────────────────────────────────────

const isLoadingOrders = false;
const isLoadingMore = false;
const hasMore = true;
const totalFetched = 40;
const highlightedOrderId: string | null = null;
const showDetailsModal = false;
const selectedOrder = null;

const orders = [
    {
        _id: 'ord001', orderId: 'HD-001', table: 'Bàn 1',
        status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash',
        total: 104500, subtotal: 95000, tax: 9500, discount: 0,
        timestamp: new Date().toISOString(),
        items: [
            { name: 'Cà phê sữa đá', quantity: 2, price: 35000 },
            { name: 'Bánh mì thịt', quantity: 1, price: 25000 }
        ]
    },
    {
        _id: 'ord002', orderId: 'HD-002', table: 'Bàn 3',
        status: 'pending', paymentStatus: 'unpaid', paymentMethod: null,
        total: 75000, subtotal: 68000, tax: 7000, discount: 0,
        timestamp: new Date().toISOString(),
        items: [
            { name: 'Trà sữa trân châu', quantity: 3, price: 25000 }
        ]
    }
];

const filteredOrders = orders;

const filters = {
    startDate: '',
    endDate: '',
    status: 'all',
    paymentStatus: 'all',
    table: 'all',
    searchQuery: '',
    minAmount: '',
    maxAmount: ''
};

const summaryData = {
    todayRevenue: 3250000,
    revenueChange: 12.5,
    totalOrders: 28,
    ordersChange: 5,
    averageOrderValue: 116071,
    avgChange: -2.3,
    unpaidOrders: 3,
    pendingOrders: 2
};

// ─── Component ────────────────────────────────────────────────────────────────

const OrderHistory: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Lịch sử đơn hàng</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi và quản lý tất cả giao dịch của cửa hàng
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        iconName="RefreshCw"
                        iconPosition="left"
                        onClick={() => { }}
                        className="hover-scale"
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="default"
                        iconName="Plus"
                        iconPosition="left"
                        onClick={() => { }}
                        className="hover-scale"
                    >
                        Tạo đơn mới
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <OrderSummaryCards summaryData={summaryData} />

            {/* Filters */}
            <OrderFilters
                filters={filters}
                onFilterChange={() => { }}
                onExport={() => { }}
                onClearFilters={() => { }}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Hiển thị {filteredOrders.length} đơn hàng từ tổng số {orders.length} đơn
                </div>
                <div className="flex items-center space-x-2">
                    <Icon name="Filter" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        Đã áp dụng {Object.values(filters).filter(v => v && v !== 'all').length} bộ lọc
                    </span>
                </div>
            </div>

            {/* Orders Table */}
            {isLoadingOrders ? (
                <div className="text-center py-12">
                    <Icon name="Loader2" size={48} className="text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        Đang tải dữ liệu...
                    </h3>
                    <p className="text-muted-foreground">
                        Vui lòng chờ trong giây lát
                    </p>
                </div>
            ) : (
                <>
                    <OrderTable
                        orders={filteredOrders}
                        onViewDetails={() => { }}
                        onReprintReceipt={() => { }}
                        highlightedOrderId={highlightedOrderId}
                    />

                    {/* Load More Button */}
                    {!isLoadingOrders && orders.length > 0 && hasMore && (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <Button
                                variant="outline"
                                onClick={() => { }}
                                disabled={isLoadingMore}
                                iconName={isLoadingMore ? 'Loader2' : 'ChevronDown'}
                                iconPosition="right"
                                className="hover-scale"
                            >
                                {isLoadingMore ? 'Đang tải...' : 'Tải thêm đơn hàng'}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Mỗi lần tải thêm 20 đơn hàng
                            </p>
                        </div>
                    )}

                    {/* End of list message */}
                    {!isLoadingOrders && orders.length > 0 && !hasMore && (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                                <Icon name="CheckCircle2" size={16} />
                                <span>Đã tải tất cả {totalFetched} đơn hàng từ server</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isLoadingOrders && filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        Không tìm thấy đơn hàng
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {orders.length === 0
                            ? 'Chưa có đơn hàng nào trong hệ thống'
                            : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'
                        }
                    </p>
                    {orders.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => { }}
                            className="hover-scale"
                        >
                            Xóa tất cả bộ lọc
                        </Button>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={showDetailsModal}
                onClose={() => { }}
                onReprintReceipt={() => { }}
            />
        </div>
    );
};

export default OrderHistory;