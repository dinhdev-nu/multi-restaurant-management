import React, { useCallback, useMemo, useState } from 'react';
import Button from '../../components/Button';
import Icon from '@/components/AppIcon';
import { usePOSStore } from '@/stores/pos-store';
import TableLayout from './components/TableLayout';
import TableControlPanel, {
    type NewTableForm,
    type TableStats,
} from './components/TableControlPanel';
import QuickActionBar from './components/QuickActionBar';
import TableMergeModal, { type MergePayload } from './components/TableMergeModal';
import type { Table } from './components/TableCard';

interface Floor {
    id: number;
    name: string;
}

type FloorTable = Table & { floorId: number };

const AVAILABLE_SERVERS = [
    { value: 'server_a', label: 'Nguyễn Văn A' },
    { value: 'server_b', label: 'Trần Thị B' },
    { value: 'server_c', label: 'Lê Văn C' },
    { value: 'server_d', label: 'Phạm Thị D' },
];

const INITIAL_FLOORS: Floor[] = [
    { id: 1, name: 'Tầng 1' },
    { id: 2, name: 'Tầng 2' },
    { id: 3, name: 'VIP' },
];

const INITIAL_TABLES: FloorTable[] = [
    {
        _id: 'table-01',
        number: '01',
        status: 'occupied',
        shape: 'rectangular',
        capacity: 4,
        currentOccupancy: 3,
        assignedServer: 'Nguyễn Văn A',
        orderId: 'OD1250',
        x: 80,
        y: 180,
        floorId: 1,
    },
    {
        _id: 'table-02',
        number: '02',
        status: 'available',
        shape: 'rectangular',
        capacity: 4,
        currentOccupancy: 0,
        x: 240,
        y: 180,
        floorId: 1,
    },
    {
        _id: 'table-03',
        number: '03',
        status: 'reserved',
        shape: 'circular',
        capacity: 6,
        currentOccupancy: 0,
        assignedServer: 'Lê Văn C',
        x: 420,
        y: 160,
        floorId: 1,
    },
    {
        _id: 'table-04',
        number: '04',
        status: 'available',
        shape: 'rectangular',
        capacity: 2,
        currentOccupancy: 0,
        x: 620,
        y: 190,
        floorId: 1,
    },
    {
        _id: 'table-05',
        number: '05',
        status: 'cleaning',
        shape: 'rectangular',
        capacity: 4,
        currentOccupancy: 0,
        assignedServer: 'Trần Thị B',
        x: 120,
        y: 360,
        floorId: 1,
    },
    {
        _id: 'table-06',
        number: '06',
        status: 'occupied',
        shape: 'circular',
        capacity: 8,
        currentOccupancy: 7,
        assignedServer: 'Phạm Thị D',
        orderId: 'OD1251',
        x: 340,
        y: 340,
        floorId: 1,
    },
    {
        _id: 'table-07',
        number: '07',
        status: 'available',
        shape: 'rectangular',
        capacity: 4,
        currentOccupancy: 0,
        x: 560,
        y: 360,
        floorId: 1,
    },
    {
        _id: 'table-08',
        number: '08',
        status: 'occupied',
        shape: 'rectangular',
        capacity: 4,
        currentOccupancy: 4,
        assignedServer: 'Nguyễn Văn A',
        orderId: 'OD1260',
        x: 160,
        y: 170,
        floorId: 2,
    },
    {
        _id: 'table-09',
        number: '09',
        status: 'available',
        shape: 'circular',
        capacity: 2,
        currentOccupancy: 0,
        x: 360,
        y: 180,
        floorId: 2,
    },
    {
        _id: 'table-10',
        number: '10',
        status: 'reserved',
        shape: 'rectangular',
        capacity: 6,
        currentOccupancy: 0,
        x: 560,
        y: 200,
        floorId: 2,
    },
    {
        _id: 'table-vip-1',
        number: 'VIP-1',
        status: 'occupied',
        shape: 'circular',
        capacity: 10,
        currentOccupancy: 8,
        assignedServer: 'Phạm Thị D',
        orderId: 'OD1280',
        x: 220,
        y: 240,
        floorId: 3,
    },
    {
        _id: 'table-vip-2',
        number: 'VIP-2',
        status: 'available',
        shape: 'rectangular',
        capacity: 10,
        currentOccupancy: 0,
        x: 470,
        y: 240,
        floorId: 3,
    },
];

const clamp = (value: number, min: number, max: number) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

const randomOrderCode = () => `OD${Math.floor(1000 + Math.random() * 9000)}`;

const TableSection: React.FC = () => {
    const syncSelectedTable = usePOSStore(state => state.setSelectedTable);

    const [tables, setTables] = useState<FloorTable[]>(INITIAL_TABLES);
    const [floors, setFloors] = useState<Floor[]>(INITIAL_FLOORS);
    const [currentFloor, setCurrentFloor] = useState<number>(1);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isEditingPositions, setIsEditingPositions] = useState(false);
    const [changedTableIds, setChangedTableIds] = useState<Set<string>>(new Set());
    const [positionSnapshot, setPositionSnapshot] = useState<Record<string, { x: number; y: number }>>({});
    const [showMergeModal, setShowMergeModal] = useState(false);

    const visibleTables = useMemo(
        () => tables.filter(table => table.floorId === currentFloor),
        [tables, currentFloor],
    );

    const selectedTable = useMemo(
        () => visibleTables.find(table => table._id === selectedTableId) ?? null,
        [visibleTables, selectedTableId],
    );

    const stats = useMemo<TableStats>(() => {
        const total = visibleTables.length;
        const available = visibleTables.filter(table => table.status === 'available').length;
        const occupied = visibleTables.filter(table => table.status === 'occupied').length;
        const reserved = visibleTables.filter(table => table.status === 'reserved').length;
        const cleaning = visibleTables.filter(table => table.status === 'cleaning').length;

        return {
            total,
            available,
            occupied,
            reserved,
            cleaning,
        };
    }, [visibleTables]);

    const syncTableSelection = useCallback((table: Table | null) => {
        setSelectedTableId(table?._id ?? null);
        syncSelectedTable(table ? String(table.number) : null);
    }, [syncSelectedTable]);

    const updateTableById = useCallback((id: string, updater: (table: FloorTable) => FloorTable) => {
        setTables(prev => prev.map(table => (table._id === id ? updater(table) : table)));
    }, []);

    const handleTableMove = useCallback((id: string, position: { x: number; y: number }) => {
        updateTableById(id, table => ({
            ...table,
            x: position.x,
            y: position.y,
        }));

        setChangedTableIds(prev => {
            const next = new Set(prev);
            const snapshot = positionSnapshot[id];

            if (!snapshot) {
                next.add(id);
                return next;
            }

            if (snapshot.x === position.x && snapshot.y === position.y) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, [updateTableById, positionSnapshot]);

    const handleFloorChange = useCallback((floorId: number) => {
        setCurrentFloor(floorId);
        syncTableSelection(null);
        setIsEditingPositions(false);
        setChangedTableIds(new Set());
        setPositionSnapshot({});
    }, [syncTableSelection]);

    const handleAddFloor = useCallback(() => {
        const nextFloorId = floors.length > 0
            ? Math.max(...floors.map(floor => floor.id)) + 1
            : 1;

        const newFloor: Floor = {
            id: nextFloorId,
            name: `Tầng ${nextFloorId}`,
        };

        setFloors(prev => [...prev, newFloor]);
        handleFloorChange(newFloor.id);
    }, [floors, handleFloorChange]);

    const handleStartEditingPositions = useCallback(() => {
        const snapshot = Object.fromEntries(
            visibleTables.map(table => [
                table._id,
                {
                    x: table.x,
                    y: table.y,
                },
            ]),
        );

        setPositionSnapshot(snapshot);
        setChangedTableIds(new Set());
        setIsEditingPositions(true);
    }, [visibleTables]);

    const handleCancelEditingPositions = useCallback(() => {
        setTables(prev => prev.map(table => {
            if (table.floorId !== currentFloor) return table;

            const originalPosition = positionSnapshot[table._id];
            if (!originalPosition) return table;

            return {
                ...table,
                x: originalPosition.x,
                y: originalPosition.y,
            };
        }));

        setIsEditingPositions(false);
        setChangedTableIds(new Set());
        setPositionSnapshot({});
    }, [currentFloor, positionSnapshot]);

    const handleSavePositionChanges = useCallback(() => {
        setIsEditingPositions(false);
        setChangedTableIds(new Set());
        setPositionSnapshot({});
    }, []);

    const handleTableStatusChange = useCallback((id: string, status: Table['status']) => {
        updateTableById(id, table => {
            const nextOccupancy = status === 'occupied'
                ? clamp(table.currentOccupancy || 1, 1, table.capacity)
                : 0;

            const nextOrderId = status === 'occupied' ? (table.orderId ?? randomOrderCode()) : undefined;

            return {
                ...table,
                status,
                currentOccupancy: nextOccupancy,
                orderId: nextOrderId,
            };
        });
    }, [updateTableById]);

    const handleServerAssign = useCallback((id: string, serverLabel: string | null) => {
        updateTableById(id, table => ({
            ...table,
            assignedServer: serverLabel ?? undefined,
        }));
    }, [updateTableById]);

    const handleAddTable = useCallback((form: NewTableForm & { status: 'available' }) => {
        const floorTableCount = visibleTables.length;
        const fallbackX = 90 + (floorTableCount % 4) * 160;
        const fallbackY = 170 + Math.floor(floorTableCount / 4) * 130;

        const newTable: FloorTable = {
            _id: `table-${Date.now()}`,
            number: form.number,
            status: form.status,
            shape: form.shape,
            capacity: form.capacity,
            currentOccupancy: 0,
            x: form.x > 0 ? form.x : fallbackX,
            y: form.y > 0 ? form.y : fallbackY,
            floorId: currentFloor,
        };

        setTables(prev => [...prev, newTable]);
        syncTableSelection(newTable);
    }, [visibleTables.length, currentFloor, syncTableSelection]);

    const handleDeleteTable = useCallback((id: string) => {
        setTables(prev => prev.filter(table => table._id !== id));

        if (selectedTableId === id) {
            syncTableSelection(null);
        }
    }, [selectedTableId, syncTableSelection]);

    const handleCreateOrder = useCallback((id: string) => {
        updateTableById(id, table => ({
            ...table,
            status: 'occupied',
            currentOccupancy: clamp(table.currentOccupancy || 2, 1, table.capacity),
            orderId: table.orderId ?? randomOrderCode(),
        }));
    }, [updateTableById]);

    const handleViewOrder = useCallback((orderId?: string) => {
        if (!orderId) return;

        const targetTable = visibleTables.find(table => table.orderId === orderId);
        if (!targetTable) return;

        syncTableSelection(targetTable);
    }, [visibleTables, syncTableSelection]);

    const handlePrintBill = useCallback((id: string) => {
        updateTableById(id, table => ({
            ...table,
            status: 'cleaning',
            currentOccupancy: 0,
            orderId: undefined,
        }));
    }, [updateTableById]);

    const handleCallWaiter = useCallback((id: string) => {
        updateTableById(id, table => ({
            ...table,
            assignedServer: table.assignedServer ?? AVAILABLE_SERVERS[0].label,
        }));
    }, [updateTableById]);

    const handleAutoArrange = useCallback(() => {
        if (isEditingPositions) return;

        let availableIndex = 0;
        setTables(prev => prev.map(table => {
            if (table.floorId !== currentFloor || table.status !== 'available') {
                return table;
            }

            const column = availableIndex % 4;
            const row = Math.floor(availableIndex / 4);
            availableIndex += 1;

            return {
                ...table,
                x: 90 + column * 155,
                y: 180 + row * 130,
            };
        }));
    }, [isEditingPositions, currentFloor]);

    const handleOpenMergeModal = useCallback(() => {
        if (!selectedTable) return;
        setShowMergeModal(true);
    }, [selectedTable]);

    const handleCloseMergeModal = useCallback(() => {
        setShowMergeModal(false);
    }, []);

    const handleConfirmMerge = useCallback((payload: MergePayload) => {
        const targetTableIds = new Set(payload.targetTableIds);

        setTables(prev => {
            const sourceTable = prev.find(table => table._id === payload.sourceTableId);
            if (!sourceTable) return prev;

            if (payload.type === 'transfer') {
                const targetTableId = payload.targetTableIds[0];
                if (!targetTableId) return prev;

                return prev.map(table => {
                    if (table._id === sourceTable._id) {
                        return {
                            ...table,
                            status: 'available',
                            currentOccupancy: 0,
                            orderId: undefined,
                        };
                    }

                    if (table._id === targetTableId) {
                        const movedGuests = clamp(sourceTable.currentOccupancy, 1, table.capacity);

                        return {
                            ...table,
                            status: 'occupied',
                            currentOccupancy: movedGuests,
                            orderId: sourceTable.orderId ?? table.orderId ?? randomOrderCode(),
                        };
                    }

                    return table;
                });
            }

            const mergedTables = prev.filter(table => targetTableIds.has(table._id));
            const totalMergedCapacity = mergedTables.reduce((sum, table) => sum + table.capacity, sourceTable.capacity);
            const totalMergedOccupancy = mergedTables.reduce((sum, table) => sum + table.currentOccupancy, sourceTable.currentOccupancy);

            return prev.map(table => {
                if (table._id === sourceTable._id) {
                    return {
                        ...table,
                        status: 'occupied',
                        capacity: totalMergedCapacity,
                        currentOccupancy: clamp(totalMergedOccupancy, 1, totalMergedCapacity),
                        orderId: sourceTable.orderId ?? randomOrderCode(),
                    };
                }

                if (targetTableIds.has(table._id)) {
                    return {
                        ...table,
                        status: 'cleaning',
                        currentOccupancy: 0,
                        orderId: undefined,
                    };
                }

                return table;
            });
        });

        setShowMergeModal(false);
    }, []);

    const canMerge = Boolean(selectedTable && (selectedTable.status === 'occupied' || selectedTable.status === 'reserved'));

    return (
        <div className="relative h-full min-h-0">
            <div className="h-full min-h-0 flex flex-col bg-surface">
                <div className="border-b border-border bg-background/95 px-3 py-3 md:px-4 md:py-4 space-y-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl font-semibold text-foreground">Table Center</h1>
                            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                                Tập trung điều phối bàn, nhân viên phục vụ và trạng thái phòng ăn tại một nơi.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
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
                            >
                                Sắp xếp bàn trống
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                iconName="Merge"
                                iconPosition="left"
                                onClick={handleOpenMergeModal}
                                disabled={!canMerge}
                            >
                                Ghép / chuyển bàn
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {floors.map((floor) => (
                            <button
                                key={floor.id}
                                onClick={() => !isEditingPositions && handleFloorChange(floor.id)}
                                disabled={isEditingPositions}
                                className={[
                                    'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    currentFloor === floor.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
                                    isEditingPositions ? 'cursor-not-allowed opacity-60' : '',
                                ].join(' ')}
                            >
                                {floor.name}
                            </button>
                        ))}

                        <button
                            onClick={handleAddFloor}
                            disabled={isEditingPositions}
                            className={[
                                'shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors',
                                'bg-muted/70 hover:bg-muted hover:text-foreground',
                                isEditingPositions ? 'cursor-not-allowed opacity-60' : '',
                            ].join(' ')}
                            title="Thêm tầng mới"
                            aria-label="Thêm tầng mới"
                        >
                            <Icon name="Plus" size={16} />
                        </button>

                        <div className="mx-1 h-4 w-px shrink-0 bg-border" />

                        {[
                            { color: 'bg-success', label: 'Trống' },
                            { color: 'bg-warning', label: 'Có khách' },
                            { color: 'bg-error', label: 'Đã đặt' },
                            { color: 'bg-primary', label: 'Dọn dẹp' },
                        ].map(({ color, label }) => (
                            <div key={label} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                                <span className={`h-2 w-2 rounded-full ${color}`} />
                                {label}
                            </div>
                        ))}
                    </div>

                </div>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                    <div className="flex-1 min-h-0 flex">
                        <TableLayout
                            tables={visibleTables}
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
                            selectedTable={selectedTable}
                            stats={stats}
                            disabled={isEditingPositions}
                            availableServers={AVAILABLE_SERVERS}
                            onTableStatusChange={handleTableStatusChange}
                            onServerAssign={handleServerAssign}
                            onAddTable={handleAddTable}
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

            <TableMergeModal
                isOpen={showMergeModal}
                sourceTable={selectedTable}
                availableTables={visibleTables}
                onClose={handleCloseMergeModal}
                onConfirmMerge={handleConfirmMerge}
            />
        </div>
    );
};

export default TableSection;