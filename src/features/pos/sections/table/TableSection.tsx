import React from 'react';
import Button from '../../components/Button';
import TableLayout from './components/TableLayout';
import TableControlPanel from './components/TableControlPanel';
import TableAddModal from './components/TableAddModal';
import QuickActionBar from './components/QuickActionBar';
import { useTableManagement } from './hooks/useTableManagement';
import { AVAILABLE_SERVERS } from './constants';

const TableSection: React.FC = () => {
    const {
        // State
        tables,
        selectedTable,
        stats,
        // Statuses
        isEditingPositions,
        changedTableIds,
        showAddModal,
        setShowAddModal,
        isSubmittingAdd,
        isSubmittingUpdate,
        isTogglingActive,
        isRegeneratingQr,
        // Handlers
        handleStartEditingPositions,
        handleCancelEditingPositions,
        handleSavePositionChanges,
        handleAutoArrange,
        handleTableMove,
        syncTableSelection,
        handleTableStatusChange,
        handleServerAssign,
        handleAddTable,
        handleUpdateTable,
        handleToggleTableActive,
        handleRegenerateTableQr,
        handleDeleteTable,
        handleCreateOrder,
        handleViewOrder,
        handlePrintBill,
        handleCallWaiter,
    } = useTableManagement();

    return (
        <div className="relative h-full min-h-0">
            <div className="h-full min-h-0 flex flex-col bg-surface">
                <div className="border-b border-border bg-background/95 px-3 py-3 md:px-4 md:py-4 space-y-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl font-semibold text-foreground">Sơ đồ phòng ăn</h1>
                            <p className="mt-1 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                                Thống kê trực tiếp: {stats.total} bàn
                            </p>
                        </div>

                        <div className="flex items-center gap-4 overflow-x-auto pb-1 xl:pb-0 px-2 lg:flex-1 lg:mx-8">
                            {[
                                { color: 'bg-success', label: 'Trống', count: stats.available, textColor: 'text-success' },
                                { color: 'bg-warning', label: 'Có khách', count: stats.occupied, textColor: 'text-warning' },
                                { color: 'bg-error', label: 'Đã đặt', count: stats.reserved, textColor: 'text-error' },
                                { color: 'bg-primary', label: 'Dọn dẹp', count: stats.cleaning, textColor: 'text-primary' },
                            ].map(({ color, label, count }) => (
                                <div key={label} className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 min-w-[100px] border border-border bg-surface rounded-md">
                                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none">{label}</span>
                                        <span className={`text-base font-semibold text-foreground leading-none mt-1`}>{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                            {!isEditingPositions && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    iconName="Move"
                                    iconPosition="left"
                                    onClick={handleStartEditingPositions}
                                >
                                    Chỉnh vị trí
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                iconName="RefreshCcw"
                                iconPosition="left"
                                onClick={handleAutoArrange}
                                disabled={isEditingPositions}
                                title="Sắp xếp gọn các bàn trống"
                            >
                                Gom bàn trống
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                iconName="Plus"
                                iconPosition="left"
                                onClick={() => setShowAddModal(true)}
                                disabled={isEditingPositions}
                            >
                                Thêm bàn mới
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row min-w-0">
                    <div className="flex-1 min-h-0 flex min-w-0 border-r border-border">
                        <TableLayout
                            tables={tables}
                            selectedTable={selectedTable}
                            isEditingPositions={isEditingPositions}
                            changedTableIds={changedTableIds}
                            onTableSelect={syncTableSelection}
                            onTableClick={syncTableSelection}
                            onTableMove={handleTableMove}
                            onSavePositionChanges={handleSavePositionChanges}
                            onCancelEditingPositions={handleCancelEditingPositions}
                        />
                    </div>

                    <div className="hidden lg:block h-full">
                        <TableControlPanel
                            key={selectedTable?._id ?? 'none'}
                            selectedTable={selectedTable}
                            disabled={isEditingPositions}
                            isSubmittingUpdate={isSubmittingUpdate}
                            isTogglingActive={isTogglingActive}
                            isRegeneratingQr={isRegeneratingQr}
                            availableServers={AVAILABLE_SERVERS}
                            onTableStatusChange={handleTableStatusChange}
                            onServerAssign={handleServerAssign}
                            onUpdateTable={handleUpdateTable}
                            onToggleTableActive={handleToggleTableActive}
                            onRegenerateTableQr={handleRegenerateTableQr}
                            onDeleteTable={handleDeleteTable}
                        />
                    </div>
                </div>

                <QuickActionBar
                    selectedTable={selectedTable}
                    disabled={isEditingPositions}
                    onQuickStatusChange={handleTableStatusChange}
                    onCreateOrder={handleCreateOrder}
                    onViewOrder={handleViewOrder}
                    onPrintBill={handlePrintBill}
                    onCallWaiter={handleCallWaiter}
                />
            </div>

            <TableAddModal
                isOpen={showAddModal}
                isSubmitting={isSubmittingAdd}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddTable}
            />
        </div>
    );
};

export default TableSection;